// hooks/useTelemedicineCall.ts
import { useCallback, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

type Role = "doctor" | "patient";

interface UseTelemedicineCallParams {
  meetingCode: string | undefined;
  token: string | null;
  role: Role | null;
  localStream: MediaStream | null; // já criado pela tela, com camOn/micOn aplicados
}

interface TelemedicineCallState {
  remoteStream: MediaStream | null;
  remoteConnected: boolean;
  callState: "idle" | "connecting" | "connected" | "disconnected" | "failed";
  error: string | null;
}

// TODO: ajuste para a env var real do projeto (ex: import.meta.env.VITE_API_BASE_URL)
const API_BASE = import.meta.env.VITE_API_URL;
const HUB_URL = `${API_BASE}/hubs/telemedicine`;

export function useTelemedicineCall({
  meetingCode,
  token,
  role,
  localStream,
}: UseTelemedicineCallParams): TelemedicineCallState & { hangUp: () => void } {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [callState, setCallState] = useState<TelemedicineCallState["callState"]>("idle");
  const [error, setError] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const hangUp = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    connectionRef.current?.stop();
    connectionRef.current = null;
    setRemoteStream(null);
    setRemoteConnected(false);
    setCallState("idle");
  }, []);

  useEffect(() => {
    // só inicia quando temos tudo que precisamos
    if (!meetingCode || !token || !role || !localStream) return;

    let cancelled = false;

    async function start() {
      setCallState("connecting");
      setError(null);

      // 1. Credenciais ICE (Open Relay)
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

      // 2. PeerConnection
      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      pc.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
        setRemoteConnected(true);
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          setCallState("connected");
        } else if (pc.iceConnectionState === "failed") {
          setCallState("failed");
          setError("Falha na conexão. Verifique sua rede.");
        } else if (pc.iceConnectionState === "disconnected") {
          setCallState("disconnected");
        }
      };

      // 3. SignalR
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build();
      connectionRef.current = connection;

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          connection
            .invoke("SendSignal", { type: "ice-candidate", payload: JSON.stringify(e.candidate) })
            .catch(() => {});
        }
      };

      async function createAndSendOffer() {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await connection.invoke("SendSignal", { type: "offer", payload: JSON.stringify(offer) });
      }

      connection.on("UserJoined", async (otherRole: string) => {
        setRemoteConnected(true);
        // quem está entrando por último dispara a offer (sempre o médico, no seu fluxo)
        if (role === "doctor" && otherRole === "patient") {
          await createAndSendOffer();
        }
      });

      connection.on("ReceiveSignal", async (signal: { type: string; payload: string }) => {
        try {
          if (signal.type === "offer") {
            await pc.setRemoteDescription(JSON.parse(signal.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await connection.invoke("SendSignal", { type: "answer", payload: JSON.stringify(answer) });
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
      pcRef.current?.close();
      pcRef.current = null;
      connectionRef.current?.stop();
      connectionRef.current = null;
    };
  }, [meetingCode, token, role, localStream]);

  return { remoteStream, remoteConnected, callState, error, hangUp };
}