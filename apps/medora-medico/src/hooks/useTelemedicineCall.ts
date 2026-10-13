import { useCallback, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { api } from "../api/services/api";

type Role = "doctor" | "patient";

interface UseTelemedicineCallParams {
  meetingCode: string | undefined;
  token: string | null;
  role: Role | null;
  localStream: MediaStream | null;
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
  callState: CallState;
  error: string | null;
}

// Reaproveita o baseURL já configurado no axios do projeto.
const API_BASE = "https://localhost:7069";
const HUB_URL = `${API_BASE}/hubs/telemedicine`;

const RECONNECT_GRACE_MS = 4000;
const MAX_AUTO_RECONNECT_ATTEMPTS = 3;

export function useTelemedicineCall({
  meetingCode,
  token,
  role,
  localStream,
}: UseTelemedicineCallParams): TelemedicineCallState & {
  hangUp: () => void;
  reconnect: () => void;
} {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [callState, setCallState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [reconnectKey, setReconnectKey] = useState(0);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAttemptsRef = useRef(0);
  const makingOfferRef = useRef(false);

  const hangUp = useCallback(() => {
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
    if (!meetingCode || !token || !role || !localStream) return;

    let cancelled = false;

    async function start() {
      setCallState("connecting");
      setError(null);

      let iceServers: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
      try {
        const res = await fetch(`${API_BASE}/api/telemedicine/ice-servers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) iceServers = await res.json();
      } catch {
        // segue só com STUN se o Open Relay falhar
      }
      if (cancelled) return;

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      const audioTracks = localStream?.getAudioTracks();
      if (audioTracks?.length === 0) {
        console.warn(
          "[useTelemedicineCall] localStream sem trilha de áudio — o microfone não será enviado."
        );
      }
      localStream?.getTracks().forEach((track) => pc.addTrack(track, localStream));

      pc.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
        setRemoteConnected(true);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          connectionRef.current
            ?.invoke("SendSignal", {
              type: "ice-candidate",
              payload: JSON.stringify(e.candidate),
            })
            .catch(() => {});
        }
      };

      async function sendOffer(iceRestart = false) {
        if (makingOfferRef.current) return;
        makingOfferRef.current = true;
        try {
          const offer = await pc.createOffer({ iceRestart });
          await pc.setLocalDescription(offer);
          await connectionRef.current?.invoke("SendSignal", {
            type: "offer",
            payload: JSON.stringify(offer),
          });
        } finally {
          makingOfferRef.current = false;
        }
      }

      // Renegociação automática (necessária para restartIce e para
      // qualquer mudança futura de trilhas). Só o médico oferece.
      if (role === "doctor") {
        pc.onnegotiationneeded = () => {
          sendOffer().catch((e) => console.error("Falha ao renegociar:", e));
        };
      }

      function attemptAutoRecover() {
        if (autoAttemptsRef.current >= MAX_AUTO_RECONNECT_ATTEMPTS) {
          setCallState("failed");
          setError(
            "Não foi possível restabelecer a conexão automaticamente. Tente reconectar manualmente."
          );
          return;
        }
        autoAttemptsRef.current += 1;
        setCallState("reconnecting");
        if (role === "doctor") {
          sendOffer(true).catch(() => setCallState("failed"));
        }
      }

      pc.oniceconnectionstatechange = () => {
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

        if (s === "failed") {
          attemptAutoRecover();
        }
      };

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, { accessTokenFactory: () => token ?? ""})
        .withAutomaticReconnect()
        .build();
      connectionRef.current = connection;

      connection.on("UserJoined", async (otherRole: string) => {
        setRemoteConnected(true);
        if (role === "doctor" && otherRole === "patient") {
          await sendOffer();
        }
      });

      connection.on("ReceiveSignal", async (signal: { type: string; payload: string }) => {
        try {
          if (signal.type === "offer") {
            await pc.setRemoteDescription(JSON.parse(signal.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await connection.invoke("SendSignal", {
              type: "answer",
              payload: JSON.stringify(answer),
            });
          } else if (signal.type === "answer") {
            await pc.setRemoteDescription(JSON.parse(signal.payload));
          } else if (signal.type === "ice-candidate") {
            await pc.addIceCandidate(JSON.parse(signal.payload));
          }
        } catch (e) {
          console.error("Erro ao processar sinal WebRTC:", e);
        }
      });

      connection.on("UserLeft", () => {
        setRemoteConnected(false);
        setRemoteStream(null);
      });

      connection.onreconnected(() => {
        connection.invoke("JoinRoom", meetingCode).catch(() => {});
      });

      try {
        await connection.start();
        if (cancelled) return;
        await connection.invoke("JoinRoom", meetingCode);
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
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
      pcRef.current?.close();
      pcRef.current = null;
      connectionRef.current?.stop();
      connectionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingCode, token, role, localStream, reconnectKey]);

  return { remoteStream, remoteConnected, callState, error, hangUp, reconnect };
}