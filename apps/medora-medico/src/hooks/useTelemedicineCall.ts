import { useCallback, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { api } from "../api/services/api";

type Role = "doctor" | "patient";

// estado de câmera e microfone de um participante, trocado pelo sinal "media-state"
// (o hub só repassa o sinal; quem não conhece o tipo ignora)
export interface MediaState {
  camera: boolean;
  mic: boolean;
}

interface UseTelemedicineCallParams {
  meetingCode: string | undefined;
  token: string | null;
  role: Role | null;
  localStream: MediaStream | null;
  // o que este lado está mandando, avisado ao outro participante
  mediaState: MediaState;
}

type CallState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "failed";

interface TelemedicineCallState {
  remoteStream: MediaStream | null;
  remoteConnected: boolean;
  // o outro participante esteve na sala e saiu (fechou o app, caiu)
  remoteLeft: boolean;
  remoteMedia: MediaState;
  callState: CallState;
  error: string | null;
}

// Reaproveita o baseURL já configurado no axios do projeto.
const API_BASE = new URL(api.defaults.baseURL!).origin;
const HUB_URL = `${API_BASE}/hubs/telemedicine`;

const RECONNECT_GRACE_MS = 4000;
const MAX_AUTO_RECONNECT_ATTEMPTS = 3;

const DEFAULT_REMOTE_MEDIA: MediaState = { camera: true, mic: true };

export function useTelemedicineCall({
  meetingCode,
  token,
  role,
  localStream,
  mediaState,
}: UseTelemedicineCallParams): TelemedicineCallState & {
  hangUp: () => void;
  reconnect: () => void;
} {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [remoteLeft, setRemoteLeft] = useState(false);
  const [remoteMedia, setRemoteMedia] = useState<MediaState>(DEFAULT_REMOTE_MEDIA);
  const [callState, setCallState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [reconnectKey, setReconnectKey] = useState(0);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAttemptsRef = useRef(0);
  const makingOfferRef = useRef(false);

  const joinedRoomRef = useRef(false);
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);

  // o efeito principal lê sempre o valor atual destes, sem recriar a chamada quando mudam
  const localStreamRef = useRef(localStream);
  localStreamRef.current = localStream;
  const mediaStateRef = useRef(mediaState);
  mediaStateRef.current = mediaState;

  const hasStream = !!localStream;

  const sendMediaState = useCallback(() => {
    if (!joinedRoomRef.current) return;
    connectionRef.current
      ?.invoke("SendSignal", { type: "media-state", payload: JSON.stringify(mediaStateRef.current) })
      .catch(() => { });
  }, []);

  // trilhas que saem para o outro participante
  const outgoingTrack = useCallback((kind: "audio" | "video") => {
    return localStreamRef.current?.getTracks().find((t) => t.kind === kind) ?? null;
  }, []);

  // troca a trilha na conexão já aberta (trocar a câmera ou o microfone),
  // sem renegociar nem derrubar a chamada
  const syncSenders = useCallback(() => {
    const pc = pcRef.current;
    if (!pc) return;
    for (const transceiver of pc.getTransceivers()) {
      const kind = transceiver.receiver.track?.kind as "audio" | "video" | undefined;
      if (!kind || transceiver.direction === "recvonly" || transceiver.direction === "stopped") continue;
      const track = outgoingTrack(kind);
      if (transceiver.sender.track !== track) {
        transceiver.sender.replaceTrack(track).catch((e) => console.warn("replaceTrack falhou:", e));
      }
    }
  }, [outgoingTrack]);

  useEffect(() => {
    syncSenders();
  }, [localStream, syncSenders]);

  useEffect(() => {
    sendMediaState();
  }, [mediaState.camera, mediaState.mic, sendMediaState]);

  const hangUp = useCallback(() => {
    joinedRoomRef.current = false;
    pendingCandidatesRef.current = [];
    if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
    pcRef.current?.close();
    pcRef.current = null;
    connectionRef.current?.stop();
    connectionRef.current = null;
    setRemoteStream(null);
    setRemoteConnected(false);
    setCallState("idle");
  }, []);

  // Reconexão manual: derruba tudo e deixa o efeito principal recriar
  // a peer connection e a conexão SignalR do zero.
  const reconnect = useCallback(() => {
    autoAttemptsRef.current = 0;
    setError(null);
    setReconnectKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!meetingCode || !token || !role || !hasStream) return;

    let cancelled = false;
    let iceServers: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

    const send = (type: string, payload: unknown) =>
      connectionRef.current
        ?.invoke("SendSignal", { type, payload: JSON.stringify(payload) })
        .catch(() => { });

    async function sendOffer(pc: RTCPeerConnection, iceRestart = false) {
      if (makingOfferRef.current || pc !== pcRef.current) return;
      makingOfferRef.current = true;
      try {
        const offer = await pc.createOffer({ iceRestart });
        await pc.setLocalDescription(offer);
        await send("offer", offer);
      } finally {
        makingOfferRef.current = false;
      }
    }

    // Uma conexão de vídeo nova a cada entrada do outro participante: a antiga foi negociada
    // com o aparelho que saiu (outro DTLS) e não serve para o novo.
    function createPeer(): RTCPeerConnection {
      pcRef.current?.close();
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      const stream = localStreamRef.current;
      if (stream && stream.getAudioTracks().length === 0) {
        console.warn("[useTelemedicineCall] localStream sem trilha de áudio — o microfone não será enviado.");
      }
      for (const kind of ["audio", "video"] as const) {
        const track = outgoingTrack(kind);
        if (track && stream) pc.addTrack(track, stream);
      }

      pc.ontrack = (e) => {
        if (pc !== pcRef.current) return;
        setRemoteStream(e.streams[0]);
        setRemoteConnected(true);
      };

      pc.onicecandidate = (e) => {
        if (!e.candidate || pc !== pcRef.current) return;
        // Se ainda não entrou na sala, enfileira o candidato
        if (!joinedRoomRef.current) {
          pendingCandidatesRef.current.push(e.candidate);
          return;
        }
        send("ice-candidate", e.candidate);
      };

      function attemptAutoRecover() {
        if (pc !== pcRef.current) return;
        if (autoAttemptsRef.current >= MAX_AUTO_RECONNECT_ATTEMPTS) {
          setCallState("failed");
          setError("Não foi possível restabelecer a conexão automaticamente. Tente reconectar manualmente.");
          return;
        }
        autoAttemptsRef.current += 1;
        setCallState("reconnecting");
        if (role === "doctor") {
          sendOffer(pc, true).catch(() => setCallState("failed"));
        }
      }

      pc.oniceconnectionstatechange = () => {
        if (pc !== pcRef.current) return;
        const s = pc.iceConnectionState;

        if (s === "connected" || s === "completed") {
          autoAttemptsRef.current = 0;
          if (disconnectTimerRef.current) {
            clearTimeout(disconnectTimerRef.current);
            disconnectTimerRef.current = null;
          }
          setCallState("connected");
          return;
        }

        if (s === "disconnected") {
          setCallState("reconnecting");
          if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
          disconnectTimerRef.current = setTimeout(() => {
            if (pc.iceConnectionState === "disconnected") attemptAutoRecover();
          }, RECONNECT_GRACE_MS);
          return;
        }

        if (s === "failed") attemptAutoRecover();
      };

      return pc;
    }

    async function start() {
      joinedRoomRef.current = false;
      pendingCandidatesRef.current = [];
      setCallState("connecting");
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/api/telemedicine/ice-servers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) iceServers = await res.json();
      } catch {
        // segue só com STUN se o Open Relay falhar
      }
      if (cancelled) return;

      createPeer();

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, { accessTokenFactory: () => token ?? "" })
        .withAutomaticReconnect()
        .build();
      connectionRef.current = connection;

      connection.on("UserJoined", async (otherRole: string) => {
        setRemoteConnected(true);
        setRemoteLeft(false);
        setRemoteMedia(DEFAULT_REMOTE_MEDIA);
        sendMediaState();
        if (role === "doctor" && otherRole === "patient") {
          // o paciente entrou (ou voltou) com uma conexão nova: o médico refaz a dele e oferece
          await sendOffer(createPeer()).catch((e) => console.error("Falha ao enviar a oferta:", e));
        }
      });

      connection.on("ReceiveSignal", async (signal: { type: string; payload: string }) => {
        const pc = pcRef.current;
        if (!pc) return;
        try {
          if (signal.type === "offer") {
            await pc.setRemoteDescription(JSON.parse(signal.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await send("answer", answer);
          } else if (signal.type === "answer") {
            await pc.setRemoteDescription(JSON.parse(signal.payload));
          } else if (signal.type === "ice-candidate") {
            await pc.addIceCandidate(JSON.parse(signal.payload));
          } else if (signal.type === "media-state") {
            setRemoteMedia({ ...DEFAULT_REMOTE_MEDIA, ...JSON.parse(signal.payload) });
          }
        } catch (e) {
          console.error("Erro ao processar sinal WebRTC:", e);
        }
      });

      connection.on("UserLeft", () => {
        setRemoteConnected(false);
        setRemoteLeft(true);
        setRemoteStream(null);
        setRemoteMedia(DEFAULT_REMOTE_MEDIA);
      });

      connection.onreconnected(() => {
        connection
          .invoke("JoinRoom", meetingCode)
          .then(sendMediaState)
          .catch(() => { });
      });

      try {
        await connection.start();
        if (cancelled) return;

        // 1. Entra na sala primeiro e aguarda confirmação
        await connection.invoke("JoinRoom", meetingCode);
        joinedRoomRef.current = true;

        // 2. Descarrega os candidatos que acumularam enquanto conectava
        while (pendingCandidatesRef.current.length > 0) {
          const cand = pendingCandidatesRef.current.shift();
          if (cand) send("ice-candidate", cand);
        }
        sendMediaState();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Não foi possível conectar à sala.");
          setCallState("failed");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      joinedRoomRef.current = false;
      pendingCandidatesRef.current = [];
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
      pcRef.current?.close();
      pcRef.current = null;
      connectionRef.current?.stop();
      connectionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingCode, token, role, hasStream, reconnectKey]);

  return { remoteStream, remoteConnected, remoteLeft, remoteMedia, callState, error, hangUp, reconnect };
}
