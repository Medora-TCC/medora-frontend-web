import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Chip } from "@heroui/react";
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
  Stethoscope,
  X,
  Send,
  Clock,
  ClipboardClock,
} from "lucide-react";
import { MedicalRecordComponent } from "../MedicalRecordPage/MedicalRecordComponent";

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
    <div className="relative w-full h-full bg-surface-overlay rounded-2xl overflow-hidden flex items-center justify-center group">
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
              flex items-center justify-center rounded-full bg-accent-soft text-accent font-semibold select-none
              ${large ? "size-24 text-3xl" : "size-14 text-xl"}
            `}
          >
            {initials}
          </div>
          {large && (
            <span className="text-text-secondary text-sm">Câmera desativada</span>
          )}
        </div>
      )}

      {/* Overlay inferior */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between">
        <span className="text-text-primary text-xs font-medium truncate">{name}</span>
        {muted && (
          <div className="flex items-center justify-center size-5 rounded-full bg-danger/80">
            <MicOff size={11} className="text-text-primary" />
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
    <div className="flex flex-col h-full bg-surface border-l border-ring">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ring">
        <span className="text-text-primary text-sm font-medium">Chat</span>
        <button
          onClick={onClose}
          className="text-text-primary hover:text-text-muted transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-text-secondary text-xs text-center mt-8">
            Nenhuma mensagem ainda
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-0.5 ${m.self ? "items-end" : "items-start"}`}
          >
            {!m.self && (
              <span className="text-text-secondary text-xs ml-1">{m.author}</span>
            )}
            <div
              className={`
                max-w-[85%] rounded-2xl px-3 py-2 text-sm
                ${m.self ? "bg-accent text-text-primary rounded-tr-sm" : "bg-surface-overlay text-text-primary rounded-tl-sm"}
              `}
            >
              {m.text}
            </div>
            <span className="text-text-secondary text-[10px] mx-1">{m.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-ring flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Enviar mensagem…"
          className="
            flex-1 bg-surface-overlay text-text-primary text-sm rounded-xl px-3 py-2
            placeholder:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50
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
          ${danger
            ? "bg-danger hover:bg-danger/80 text-text-secondary"
            : active
              ? "bg-surface-overlay hover:bg-text-muted/25 text-text-primary"
              : "bg-surface-overlay hover:bg-text-muted/20 text-text-secondary/75"
          }
        `}
      >
        {children}
      </button>
      <span className="text-secondary text-[10px] whitespace-nowrap">{label}</span>
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
  const [screenSharing, setScreenSharing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // UI
  const [sidePanel, setSidePanel] = useState<"chat" | "prontuario" | null>(null);
  // const [sidePanelSize, setSidePanelSize] = useState<"normal" | "large" | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      author: "Sistema",
      text: "Consulta iniciada. Bem-vindo à teleconsulta. ",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      self: false,
    },
    {
      id: "2",
      author: "Sistema",
      text: "É estritamente proibido o envio de preescrições via este chat. Utilize o módulo de receitas para preescrever medicamentos. Duvidas? Saiba Mais",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      self: false,
    },
  ]);
  const [unread, setUnread] = useState(0);

  // Participante remoto simulado (em prod viria do WebRTC)
  const remoteConnected = true;
  const remoteName = "Carlos Oliveira";
  const remoteCamOn = true;

  // ── Inicializa stream local ──────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    console.log(error);
    
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

  // ── Prontuario ─────────────────────────────────────────────────────────────────
  function openProntuario() {
    setSidePanel((p) => (p === "prontuario" ? null : "prontuario"));
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
    navigate(`../../consulta`);
  }

  // Define a classe de posicionamento baseada no painel ativo
  let positionClass = "left-1/2 -translate-x-1/2"; // Padrão fechado

  if (sidePanel === "chat") {
    positionClass = "left-[calc(50%-160px)] -translate-x-1/2"; // Ajuste o valor do chat aqui
  } else if (sidePanel === "prontuario") {
    positionClass = "left-[calc(50%-480px)] -translate-x-1/2"; // Ajuste o valor do prontuário aqui (ex: se for maior)
  }

  let sidePanelWidth = "w-0 overflow-hidden"

  if (sidePanel === "chat") {
    sidePanelWidth = "w-80"; // Ajuste o valor do chat aqui
  } else if (sidePanel === "prontuario") {
    sidePanelWidth = "w-1/2"; // Ajuste o valor do prontuário aqui (ex: se for maior)
  }

  return (
    <div
      className="relative flex h-full w-full bg-surface overflow-hidden"
      onMouseMove={resetHide}
      onTouchStart={resetHide}
    >
      {/* ── Área principal de vídeo ──────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Header ──────────────────────────────────── */}
        <div
          className={`
            relative z-20 flex items-center justify-between
            py-5 px-3
            transition-opacity duration-300
            ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-7 rounded-lg bg-accent-soft">
              <Stethoscope size={14} className="text-accent" />
            </div>
            <span className="text-text-primary text-sm font-medium">Teleconsulta</span>
            {id && (
              <Chip size="sm" variant="soft" color="default" className="text-text-secondary text-[10px]">
                #{id.slice(-6)}
              </Chip>
            )}
          </div>

          <div className="flex items-center gap-3 text-text-secondary text-xs">
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
            className="text-text-primary hover:text-text-primary transition-colors"
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

        </div>

        {/* ── Barra de controles ───────────────────────── */}
        <div
          className={`
            absolute bottom-6 z-20 
            flex items-center justify-center
            bg-surface max-w-full shadow-2xl rounded-2xl p-3
            transition-opacity duration-300
            ${positionClass}
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

            {/* Encerrar — destacado no centro */}
            <div className="flex flex-col items-center gap-1.5 mx-2">
              <button
                onClick={encerrar}
                className="flex items-center justify-center size-14 rounded-full bg-danger hover:bg-danger/80 text-white transition-all duration-200 shadow-lg shadow-danger/30 scale-105"
              >
                <PhoneOff size={22} />
              </button>
              <span className="text-text-primary text-[10px]">Encerrar</span>
            </div>

            <ControlBtn
              onClick={openProntuario}
              active={sidePanel === "prontuario"}
              label="Prontuário"
            >
              <ClipboardClock  size={20} />
            </ControlBtn>

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

            <ControlBtn onClick={() => { }} active label="Mais">
              <MoreVertical size={20} />
            </ControlBtn>
          </div>
        </div>
      </div>

      {/* ── Painel lateral ──────────────────────────────── */}
      <div
        className={`
          shrink-0 transition-all duration-300 ease-in-out
          ${sidePanelWidth}
        `}
      >
        {sidePanel === "chat" && (
          <ChatPanel
            messages={messages}
            onSend={sendMessage}
            onClose={() => setSidePanel(null)}
          />
        )}
        {sidePanel === "prontuario" && (
          <div className="h-full">
            <MedicalRecordComponent setError={setError}/>
          </div>
        )}
      </div>
    </div>
  );
}