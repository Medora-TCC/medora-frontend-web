import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Avatar, Button, Chip } from "@heroui/react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  MoreVertical,
  Maximize2,
  Minimize2,
  MonitorUp,
  Hand,
  Stethoscope,
  X,
  Send,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocationState {
  camOn?: boolean;
  micOn?: boolean;
  selectedCam?: string;
  selectedMic?: string;
}

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  time: string;
  self: boolean;
}

// ─── Hook: timer da consulta ──────────────────────────────────────────────────
function useCallTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Componente: vídeo de participante ────────────────────────────────────────
function ParticipantTile({
  stream,
  name,
  muted,
  camOff,
  mirrored = false,
  large = false,
}: {
  stream: MediaStream | null;
  name: string;
  muted: boolean;
  camOff: boolean;
  mirrored?: boolean;
  large?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative w-full h-full bg-[#1a1f2e] rounded-2xl overflow-hidden flex items-center justify-center group">
      {/* Vídeo */}
      {!camOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${mirrored ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className={`
              flex items-center justify-center rounded-full bg-accent/20 text-accent font-semibold select-none
              ${large ? "size-24 text-3xl" : "size-14 text-xl"}
            `}
          >
            {initials}
          </div>
          {large && (
            <span className="text-white/60 text-sm">Câmera desativada</span>
          )}
        </div>
      )}

      {/* Overlay inferior */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
        <span className="text-white text-xs font-medium truncate">{name}</span>
        {muted && (
          <div className="flex items-center justify-center size-5 rounded-full bg-danger/80">
            <MicOff size={11} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente: painel de chat ───────────────────────────────────────────────
function ChatPanel({
  messages,
  onSend,
  onClose,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const t = input.trim();
    if (!t) return;
    onSend(t);
    setInput("");
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1f2e] border-l border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white text-sm font-medium">Chat</span>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-white/30 text-xs text-center mt-8">
            Nenhuma mensagem ainda
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-0.5 ${m.self ? "items-end" : "items-start"}`}
          >
            {!m.self && (
              <span className="text-white/50 text-xs ml-1">{m.author}</span>
            )}
            <div
              className={`
                max-w-[85%] rounded-2xl px-3 py-2 text-sm
                ${m.self ? "bg-accent text-white rounded-tr-sm" : "bg-white/10 text-white/90 rounded-tl-sm"}
              `}
            >
              {m.text}
            </div>
            <span className="text-white/30 text-[10px] mx-1">{m.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Enviar mensagem…"
          className="
            flex-1 bg-white/10 text-white text-sm rounded-xl px-3 py-2
            placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent/50
          "
        />
        <button
          onClick={handleSend}
          className="flex items-center justify-center size-9 rounded-xl bg-accent hover:bg-accent/80 text-white transition-colors shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Botão de controle circular ───────────────────────────────────────────────
function ControlBtn({
  onClick,
  active = true,
  danger = false,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        title={label}
        className={`
          flex items-center justify-center size-12 rounded-full transition-all duration-200
          ${
            danger
              ? "bg-danger hover:bg-danger/80 text-white"
              : active
              ? "bg-white/15 hover:bg-white/25 text-white"
              : "bg-white/10 hover:bg-white/20 text-white/50"
          }
        `}
      >
        {children}
      </button>
      <span className="text-white/50 text-[10px] whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────
export default function SalaTeleConsulta() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const timer = useCallTimer();

  // Streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Controles
  const [camOn, setCamOn] = useState(state.camOn ?? true);
  const [micOn, setMicOn] = useState(state.micOn ?? true);
  const [handRaised, setHandRaised] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // UI
  const [sidePanel, setSidePanel] = useState<"chat" | "participants" | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      author: "Sistema",
      text: "Consulta iniciada. Bem-vindo à teleconsulta.",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      self: false,
    },
  ]);
  const [unread, setUnread] = useState(0);

  // Participante remoto simulado (em prod viria do WebRTC)
  const remoteConnected = true;
  const remoteName = "Dr. Carlos Oliveira";
  const remoteCamOn = true;

  // ── Inicializa stream local ──────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const constraints: MediaStreamConstraints = {
      video: state.selectedCam
        ? { deviceId: { exact: state.selectedCam } }
        : true,
      audio: state.selectedMic
        ? { deviceId: { exact: state.selectedMic } }
        : true,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((s) => {
        if (!active) { s.getTracks().forEach((t) => t.stop()); return; }
        // Aplica estado inicial
        s.getVideoTracks().forEach((t) => (t.enabled = camOn));
        s.getAudioTracks().forEach((t) => (t.enabled = micOn));
        setLocalStream(s);
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => { localStream?.getTracks().forEach((t) => t.stop()); };
  }, [localStream]);

  // ── Toggle câmera ────────────────────────────────────────────────────────
  function toggleCam() {
    setCamOn((v) => {
      const next = !v;
      localStream?.getVideoTracks().forEach((t) => (t.enabled = next));
      return next;
    });
  }

  // ── Toggle microfone ─────────────────────────────────────────────────────
  function toggleMic() {
    setMicOn((v) => {
      const next = !v;
      localStream?.getAudioTracks().forEach((t) => (t.enabled = next));
      return next;
    });
  }

  // ── Compartilhar tela ────────────────────────────────────────────────────
  async function toggleScreenShare() {
    if (screenSharing) {
      setScreenSharing(false);
      return;
    }
    try {
      await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenSharing(true);
    } catch {
      // usuário cancelou
    }
  }

  // ── Auto-hide dos controles ──────────────────────────────────────────────
  const resetHide = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setControlsVisible(false), 4000);
  }, []);

  useEffect(() => {
    resetHide();
    return () => { if (hideTimeout.current) clearTimeout(hideTimeout.current); };
  }, []);

  // ── Fullscreen ───────────────────────────────────────────────────────────
  function toggleFullscreen() {
    if (!fullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen((v) => !v);
  }

  // ── Chat ─────────────────────────────────────────────────────────────────
  function openChat() {
    setSidePanel((p) => (p === "chat" ? null : "chat"));
    setUnread(0);
  }

  function sendMessage(text: string) {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      author: "Você",
      text,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      self: true,
    };
    setMessages((prev) => [...prev, msg]);
  }

  // ── Encerrar ─────────────────────────────────────────────────────────────
  function encerrar() {
    localStream?.getTracks().forEach((t) => t.stop());
    navigate(`/consulta`);
  }

  return (
    <div
      className="relative flex h-screen w-screen bg-[#0f1117] overflow-hidden"
      onMouseMove={resetHide}
      onTouchStart={resetHide}
    >
      {/* ── Área principal de vídeo ──────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Header ──────────────────────────────────── */}
        <div
          className={`
            absolute top-0 left-0 right-0 z-20 flex items-center justify-between
            px-5 py-3 bg-gradient-to-b from-black/60 to-transparent
            transition-opacity duration-300
            ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-7 rounded-lg bg-accent/20">
              <Stethoscope size={14} className="text-accent" />
            </div>
            <span className="text-white text-sm font-medium">Teleconsulta</span>
            {id && (
              <Chip size="sm" variant="soft" color="default" className="text-white/50 text-[10px]">
                #{id.slice(-6)}
              </Chip>
            )}
          </div>

          <div className="flex items-center gap-3 text-white/70 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              <span>Ao vivo</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span className="font-mono">{timer}</span>
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white/50 hover:text-white transition-colors"
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* ── Vídeos ──────────────────────────────────── */}
        <div className="relative flex-1 p-3 pt-14 pb-24">
          {/* Participante remoto (tela cheia) */}
          <div className="w-full h-full">
            {remoteConnected ? (
              <ParticipantTile
                stream={null} // em prod: stream remoto WebRTC
                name={remoteName}
                muted={false}
                camOff={!remoteCamOn}
                large
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-[#1a1f2e] flex flex-col items-center justify-center gap-4">
                <div className="flex items-center justify-center size-20 rounded-full bg-white/5">
                  <Users size={32} className="text-white/30" />
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm">Aguardando o outro participante…</p>
                  <p className="text-white/30 text-xs mt-1">Compartilhe o link da consulta</p>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="size-2 rounded-full bg-accent/50 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Self-view (pip) */}
          <div className="absolute bottom-4 right-4 w-44 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 z-10">
            <ParticipantTile
              stream={localStream}
              name="Você"
              muted={!micOn}
              camOff={!camOn}
              mirrored
            />
          </div>

          {/* Hand raised indicator */}
          {handRaised && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-2 bg-warning/20 border border-warning/40 rounded-full px-4 py-1.5">
                <Hand size={14} className="text-warning" />
                <span className="text-warning text-xs font-medium">Mão levantada</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Barra de controles ───────────────────────── */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 z-20 flex items-end justify-center
            pb-5 bg-gradient-to-t from-black/70 to-transparent
            transition-opacity duration-300
            ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          <div className="flex items-center gap-3">
            <ControlBtn onClick={toggleMic} active={micOn} label={micOn ? "Silenciar" : "Ativar mic"}>
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </ControlBtn>

            <ControlBtn onClick={toggleCam} active={camOn} label={camOn ? "Desativar cam" : "Ativar cam"}>
              {camOn ? <Video size={20} /> : <VideoOff size={20} />}
            </ControlBtn>

            <ControlBtn onClick={toggleScreenShare} active={screenSharing} label={screenSharing ? "Parar exib." : "Apresentar"}>
              <MonitorUp size={20} />
            </ControlBtn>

            <ControlBtn onClick={() => setHandRaised((v) => !v)} active={handRaised} label={handRaised ? "Baixar mão" : "Levantar mão"}>
              <Hand size={20} />
            </ControlBtn>

            {/* Encerrar — destacado no centro */}
            <div className="flex flex-col items-center gap-1.5 mx-2">
              <button
                onClick={encerrar}
                className="flex items-center justify-center size-14 rounded-full bg-danger hover:bg-danger/80 text-white transition-all duration-200 shadow-lg shadow-danger/30 scale-105"
              >
                <PhoneOff size={22} />
              </button>
              <span className="text-white/50 text-[10px]">Encerrar</span>
            </div>

            <div className="relative">
              <ControlBtn
                onClick={openChat}
                active={sidePanel === "chat"}
                label="Chat"
              >
                <MessageSquare size={20} />
              </ControlBtn>
              {unread > 0 && (
                <div className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-danger flex items-center justify-center text-[10px] text-white font-bold">
                  {unread}
                </div>
              )}
            </div>

            <ControlBtn
              onClick={() => setSidePanel((p) => (p === "participants" ? null : "participants"))}
              active={sidePanel === "participants"}
              label="Participantes"
            >
              <Users size={20} />
            </ControlBtn>

            <ControlBtn onClick={() => {}} active label="Mais">
              <MoreVertical size={20} />
            </ControlBtn>
          </div>
        </div>
      </div>

      {/* ── Painel lateral ──────────────────────────────── */}
      <div
        className={`
          flex-shrink-0 transition-all duration-300 ease-in-out
          ${sidePanel ? "w-80" : "w-0 overflow-hidden"}
        `}
      >
        {sidePanel === "chat" && (
          <ChatPanel
            messages={messages}
            onSend={sendMessage}
            onClose={() => setSidePanel(null)}
          />
        )}

        {sidePanel === "participants" && (
          <div className="flex flex-col h-full bg-[#1a1f2e] border-l border-white/10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white text-sm font-medium">Participantes (2)</span>
              <button
                onClick={() => setSidePanel(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-1 p-3">
              {[
                { name: "Você", mic: micOn, cam: camOn, self: true },
                { name: remoteName, mic: true, cam: remoteCamOn, self: false },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-center size-8 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                    {p.name
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <span className="flex-1 text-white text-sm">
                    {p.name}
                    {p.self && (
                      <span className="text-white/40 text-xs ml-1">(você)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!p.mic && <MicOff size={13} className="text-danger" />}
                    {!p.cam && <VideoOff size={13} className="text-white/40" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}