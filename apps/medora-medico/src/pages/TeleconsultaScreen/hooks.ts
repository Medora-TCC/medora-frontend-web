import { useCallback, useEffect, useRef, useState } from "react";

type FlowStep =
  | "validating"
  | "consent"
  | "acquiring-media"
  | "connecting"
  | "in-call"
  | "ended"
  | "error";

interface ConsultaInfo {
  id: string;
  pacienteId: string;
  horario: string;
  duracao: number; //REMINDER - ver como  isso será tratado na base
}

interface ValidationError {
  status: number;
  message: string;
}


export function useConsultaValidation(consultaId: string, authToken: string) {
  const [step, setStep] = useState<FlowStep>("validating");
  const [consulta, setConsulta] = useState<ConsultaInfo | null>(null);
  const [error, setError] = useState<ValidationError | null>(null);

  useEffect(() => {
    async function validate() {
      try {
        const meRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!meRes.ok) {
          const data = await meRes.json();
          setError({ status: meRes.status, message: data.error });
          setStep("error");
          return;
        }
        const medico = await meRes.json();

        // [2] Valida médico + consulta  [3] Valida horário
        const consultaRes = await fetch(`/api/consultas/${consultaId}/validar`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-medico-id": medico.id,
          },
        });
        if (!consultaRes.ok) {
          const data = await consultaRes.json();
          setError({ status: consultaRes.status, message: data.error });
          setStep("error");
          return;
        }
        const { consulta: c } = await consultaRes.json();
        setConsulta(c);

        // [4] Exibe termo de consentimento
        setStep("consent");
      } catch {
        setError({ status: 0, message: "Falha de conexão com o servidor." });
        setStep("error");
      }
    }
    validate();
  }, [consultaId, authToken]);

  return { step, setStep, consulta, error };
}

export function useWebRTC(enabled: boolean, consultaId: string) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [callState, setCallState] = useState<RTCPeerConnectionState>("new");
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    async function startCall() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams[0])
          remoteVideoRef.current.srcObject = e.streams[0];
      };
      pc.onconnectionstatechange = () => setCallState(pc.connectionState);
      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          await fetch("/api/signaling/ice-candidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consultaId, candidate: e.candidate.toJSON() }),
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const answerRes = await fetch("/api/signaling/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultaId, ...offer }),
      });
      const answer = await answerRes.json();
      await pc.setRemoteDescription(answer);
    }

    startCall().catch(console.error);

    return () => {
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled, consultaId]);

  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMicMuted((v) => !v);
  }, []);

  const toggleCam = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setCamOff((v) => !v);
  }, []);

  const hangUp = useCallback(() => {
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  return {
    localVideoRef,
    remoteVideoRef,
    callState,
    micMuted,
    camOff,
    toggleMic,
    toggleCam,
    hangUp,
  };
}