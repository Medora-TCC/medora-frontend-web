import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import type { IConsulta } from "@medora_web/shared"

import { useConsultaValidation, useWebRTC } from "./hooks"

type FlowStep =
  | "validating"
  | "consent"
  | "acquiring-media"
  | "connecting"
  | "in-call"
  | "ended"
  | "error";


interface ValidationError {
  status: number;
  message: string;
}


// ─── Icons ────────────────────────────────────────────────────────────────────

const IconMic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 23h8" />
  </svg>
);

const IconMicOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
    <path d="M17 16.95A7 7 0 015 12v-2M19 12a7 7 0 01-.11 1.23M12 19v3M8 23h8" />
  </svg>
);

const IconCamera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a1 1 0 011-1h11a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" />
  </svg>
);

const IconCameraOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16l4.586 4.586A1 1 0 0022 20V8l-6 4V7a1 1 0 00-1-1H5m-2 0a1 1 0 00-1 1v10a1 1 0 001 1h12M3 3l18 18" />
  </svg>
);

const IconPhoneOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 013.92 2H7a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
);

const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconAlertCircle = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ─── Sub-components ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div
      className="w-8 h-8 rounded-full border-2 border-white/10 border-t-blue-400 animate-spin"
      aria-label="carregando"
    />
  );
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
      <Spinner />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

function ErrorScreen({
  error,
  onBack,
}: {
  error: ValidationError;
  onBack: () => void;
}) {
  const label =
    error.status === 401 ? "Sessão inválida" :
    error.status === 403 ? "Acesso negado" :
    error.status === 404 ? "Consulta não encontrada" :
    error.status === 409 ? "Fora do horário permitido" :
    "Erro inesperado";

  return (
    <div className="flex items-center justify-center w-full h-full p-6">
      <div className="flex flex-col items-center gap-4 bg-slate-900 border border-red-500/20 rounded-2xl p-8 max-w-sm w-full text-center">
        <span className="text-red-400">
          <IconAlertCircle />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium text-slate-100">{label}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error.message}</p>
        </div>
        <button
          onClick={onBack}
          className="mt-2 text-sm text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          ← Voltar ao painel
        </button>
      </div>
    </div>
  );
}

function ConsentScreen({
  consulta,
  onAccept,
}: {
  consulta: IConsulta;
  onAccept: () => void;
}) {
  const horarioFmt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(consulta.dataHorario));

  const metaRows = [
    { label: "Paciente", value: consulta.pacienteId },
    { label: "Data e hora", value: horarioFmt }
  ];

  return (
    <div className="flex items-center justify-center w-full h-full p-6 overflow-y-auto">
      <div className="flex flex-col gap-5 bg-slate-900 border border-slate-700/60 rounded-2xl p-6 max-w-md w-full">

        {/* Header */}
        <div className="flex items-center gap-2.5 text-blue-300">
          <IconShield />
          <span className="text-sm font-medium tracking-wide">Termo de consentimento</span>
        </div>

        {/* Dados da consulta */}
        <div className="flex flex-col gap-2.5 bg-slate-950/60 rounded-xl p-4 border border-slate-800">
          {metaRows.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-baseline gap-4 text-sm">
              <span className="text-slate-500 shrink-0">{label}</span>
              <span className="text-slate-200 font-medium text-right">{value}</span>
            </div>
          ))}
        </div>

        {/* Texto do termo */}
        <div className="text-sm text-slate-400 leading-relaxed">
          <p className="mb-3">
            Esta sessão de teleconsulta será conduzida por meio de conexão de vídeo
            criptografada. Ao prosseguir, você declara:
          </p>
          <ul className="flex flex-col gap-2 pl-4 list-disc marker:text-slate-600">
            <li>
              Estar em ambiente adequado, seguro e com privacidade suficiente para
              a realização da consulta.
            </li>
            <li>
              Ter ciência de que a gravação desta sessão é vedada por ambas as
              partes, salvo consentimento mútuo expresso.
            </li>
            <li>
              Concordar com o armazenamento de dados de conexão conforme a LGPD
              e as normas do CFM sobre telemedicina.
            </li>
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={onAccept}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all cursor-pointer"
        >
          Aceitar e iniciar consulta
        </button>
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  active = true,
  variant = "default",
  label,
  "aria-label": ariaLabel,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  variant?: "default" | "hangup";
  label: string;
  "aria-label": string;
  children: React.ReactNode;
}) {
  if (variant === "hangup") {
    return (
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="flex flex-col items-center gap-1 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white text-[11px] font-medium transition-all cursor-pointer"
      >
        {children}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "flex flex-col items-center gap-1 px-4 py-2.5 rounded-full border text-[11px] font-medium transition-all active:scale-95 cursor-pointer",
        active
          ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"
          : "bg-red-500/15 border-red-500/30 text-red-300 hover:bg-red-500/20",
      ].join(" ")}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function CallControls({
  micMuted,
  camOff,
  onToggleMic,
  onToggleCam,
  onHangUp,
}: {
  micMuted: boolean;
  camOff: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onHangUp: () => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label="controles da chamada"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-white/[0.08] rounded-full px-4 py-2.5"
    >
      <ControlButton
        onClick={onToggleMic}
        active={!micMuted}
        label={micMuted ? "Mic off" : "Mic"}
        aria-label={micMuted ? "ativar microfone" : "silenciar microfone"}
      >
        {micMuted ? <IconMicOff /> : <IconMic />}
      </ControlButton>

      <ControlButton
        onClick={onToggleCam}
        active={!camOff}
        label={camOff ? "Cam off" : "Câmera"}
        aria-label={camOff ? "ativar câmera" : "desativar câmera"}
      >
        {camOff ? <IconCameraOff /> : <IconCamera />}
      </ControlButton>

      <ControlButton
        onClick={onHangUp}
        variant="hangup"
        label="Encerrar"
        aria-label="encerrar chamada"
      >
        <IconPhoneOff />
      </ControlButton>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface SalaConsultaProps {
  /** Usado apenas em testes — em produção vem de useParams */
  consultaId?: string;
  token?: string;
}

export function SalaTeleconsulta({
  consultaId: propId,
  token: propToken,
}: SalaConsultaProps) {
  const params = useParams<{ consultaId: string }>();
  const navigate = useNavigate();

  const consultaId = propId ?? params.consultaId ?? "";
  // Em produção, substitua pelo seu contexto de auth (Zustand, Context API, etc.)
  const token = propToken ?? localStorage.getItem("jwt") ?? "";

  const { step, setStep, consulta, error } = useConsultaValidation(
    consultaId,
    token
  );

  const callEnabled =
    step === "connecting" ||
    step === "in-call" ||
    step === "acquiring-media";

  const {
    localVideoRef,
    remoteVideoRef,
    callState,
    micMuted,
    camOff,
    toggleMic,
    toggleCam,
    hangUp,
  } = useWebRTC(callEnabled, consultaId);

  // Avança para "in-call" quando a conexão WebRTC for estabelecida
  useEffect(() => {
    if (callState === "connected") setStep("in-call");
  }, [callState, setStep]);

  function handleAcceptConsent() {
    setStep("acquiring-media");
    setTimeout(() => setStep("connecting"), 200);
  }

  function handleHangUp() {
    hangUp();
    setStep("ended");
  }

  const connectionLabel: Partial<Record<RTCPeerConnectionState, string>> = {
    new: "Inicializando…",
    connecting: "Conectando ao paciente…",
    disconnected: "Conexão perdida",
    failed: "Falha na conexão",
  };

  return (
    <main className="w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden text-slate-100">

      {/* ── Validando ──────────────────────────────────────── */}
      {step === "validating" && (
        <LoadingScreen message="Validando sessão e consulta…" />
      )}

      {/* ── Erro ───────────────────────────────────────────── */}
      {step === "error" && error && (
        <ErrorScreen error={error} onBack={() => navigate("/painel")} />
      )}

      {/* ── Termo de consentimento ──────────────────────────── */}
      {/* {step === "consent" && consulta && (
        <ConsentScreen consulta={consulta} onAccept={handleAcceptConsent} />
      )} */}

      {/* ── Adquirindo mídia ────────────────────────────────── */}
      {step === "acquiring-media" && (
        <LoadingScreen message="Solicitando permissão de câmera e microfone…" />
      )}

      {/* ── Conectando / Em chamada ─────────────────────────── */}
      {(step === "connecting" || step === "in-call") && (
        <div className="relative w-full h-full bg-black">

          {/* Vídeo remoto — tela cheia */}
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            aria-label="vídeo do paciente"
          />

          {/* Overlay enquanto conecta */}
          {step === "connecting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/70 backdrop-blur-sm">
              <Spinner />
              <span className="text-sm text-slate-300">
                {connectionLabel[callState] ?? "Conectando…"}
              </span>
            </div>
          )}

          {/* PiP — vídeo local */}
          <video
            ref={localVideoRef}
            className="absolute top-5 right-5 w-44 sm:w-52 aspect-video object-cover rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
            autoPlay
            playsInline
            muted
            aria-label="seu vídeo"
          />

          {/* Badge nome do paciente */}
          {consulta && (
            <div className="absolute bottom-24 left-5 bg-black/50 backdrop-blur-sm text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-white/10">
              {consulta.pacienteId}
            </div>
          )}

          {/* Controles */}
          <CallControls
            micMuted={micMuted}
            camOff={camOff}
            onToggleMic={toggleMic}
            onToggleCam={toggleCam}
            onHangUp={handleHangUp}
          />
        </div>
      )}

      {/* ── Encerrado ───────────────────────────────────────── */}
      {step === "ended" && (
        <div className="flex items-center justify-center w-full h-full p-6">
          <div className="flex flex-col items-center gap-4 bg-slate-900 border border-slate-700/60 rounded-2xl p-8 max-w-sm w-full text-center">
            <span className="text-emerald-400">
              <IconCheckCircle />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-medium text-slate-100">
                Consulta encerrada
              </h2>
              <p className="text-sm text-slate-400">
                A sessão foi finalizada com sucesso.
              </p>
            </div>
            <button
              onClick={() => navigate("/painel")}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all cursor-pointer"
            >
              Voltar ao painel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default SalaTeleconsulta;