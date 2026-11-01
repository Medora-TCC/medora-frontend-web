import { useEffect, useRef, useState, useCallback, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Button, Chip, Modal, useOverlayState } from "@heroui/react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Maximize2,
  Minimize2,
  MonitorUp,
  Stethoscope,
  Clock,
  ClipboardClock,
  FileUser,
} from "lucide-react";
import { MedicalRecordComponent } from "../MedicalRecordPage/MedicalRecordComponent";
import { useTelemedicineCall } from "../../hooks/useTelemedicineCall";
import { AuthContext } from "../../contexts/AuthContext";
import { PrescricaoDaConsulta } from "../PrescriptionPage/PrescriptionPage";
import AppointmentsService from "../../api/services/Appointments";
import { errorMessage } from "../../api/errors";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocationState {
  appointmentId?: number;
  patientName?: string;
  camOn?: boolean;
  micOn?: boolean;
  selectedCam?: string;
  selectedMic?: string;
}

type SidePanel = "prontuario" | "receita" | null;

// ─── Helpers de mídia ─────────────────────────────────────────────────────────
function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((t) => t.stop());
}

function errorName(e: unknown): string {
  return typeof e === "object" && e !== null && "name" in e
    ? String((e as { name: unknown }).name)
    : "";
}

// Abre UM tipo de mídia (câmera ou mic) de forma independente: se um falhar
// (sem permissão, sem dispositivo) o outro continua funcionando.
async function openTrack(
  kind: "video" | "audio",
  deviceId?: string,
): Promise<MediaStreamTrack | null> {
  const get = async (constraints: MediaStreamConstraints) =>
    (await navigator.mediaDevices.getUserMedia(constraints)).getTracks()[0] ??
    null;

  try {
    if (deviceId) {
      try {
        return await get({ [kind]: { deviceId: { exact: deviceId } } });
      } catch (e) {
        const n = errorName(e);
        // Dispositivo escolhido sumiu: cai para o padrão
        if (n !== "OverconstrainedError" && n !== "NotFoundError") throw e;
      }
    }
    return await get({ [kind]: true });
  } catch {
    return null;
  }
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
  isLocal = false,
}: {
  stream: MediaStream | null;
  name: string;
  muted: boolean;
  camOff: boolean;
  mirrored?: boolean;
  large?: boolean;
  isLocal?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // O <video> fica SEMPRE montado. Antes ele era desmontado com a câmera
  // desligada, e ao religar o novo elemento nascia sem srcObject (o efeito
  // dependia só de `stream`) — por isso a câmera "não abria mais". Além disso,
  // no participante remoto o áudio sai por esse elemento.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = stream;
    if (!stream) return;

    // Se o navegador bloquear o áudio sem interação, mostra botão para liberar
    el.play()
      .then(() => setAudioBlocked(false))
      .catch(() => {
        if (!isLocal) setAudioBlocked(true);
      });
  }, [stream, isLocal]);

  function unlockAudio() {
    videoRef.current
      ?.play()
      .then(() => setAudioBlocked(false))
      .catch(() => {});
  }

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const showVideo = !camOff && !!stream;

  return (
    <div className="relative w-full h-full bg-surface-overlay rounded-2xl overflow-hidden group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        // Só o self-view fica mudo — evita eco. O remoto precisa tocar o áudio.
        muted={isLocal}
        className={`absolute inset-0 w-full h-full object-cover ${
          mirrored ? "scale-x-[-1]" : ""
        } ${showVideo ? "" : "invisible"}`}
      />

      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
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

      {audioBlocked && (
        <button
          onClick={unlockAudio}
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm gap-2"
        >
          <Mic size={16} /> Toque para ativar o áudio
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between">
        <span
          className={`text-xs font-medium truncate ${name === "Você" ? "text-white" : "text-text-primary"}`}
        >
          {name}
        </span>
        {muted && (
          <div className="flex items-center justify-center size-5 rounded-full bg-danger/80">
            <MicOff size={11} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Botão de controle circular ───────────────────────────────────────────────
function ControlBtn({
  onClick,
  active = true,
  disabled = false,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        disabled={disabled}
        title={label}
        className={`
          flex items-center justify-center size-12 rounded-full transition-all duration-200
          disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
          ${
            active
              ? "bg-surface-overlay hover:bg-text-muted/25 text-text-primary"
              : "bg-surface-overlay hover:bg-text-muted/20 text-text-secondary/75"
          }
        `}
      >
        {children}
      </button>
      <span className="text-text-secondary text-[10px] whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────
export default function SalaTeleConsulta() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const { accessToken } = useContext(AuthContext);
  const role = "doctor";

  const {
    remoteStream,
    remoteConnected,
    callState,
    hangUp,
    reconnect,
  } = useTelemedicineCall({
    meetingCode: id,
    token: accessToken,
    role: role,
    localStream: localStream,
  });

  /* TODO: nome real do paciente — buscar via API da consulta */
  const remoteName = state.patientName ?? "Paciente";
  /* TODO: Hub ainda não propaga estado de câmera do remoto */
  const remoteCamOn = true;

  const timer = useCallTimer();

  const screenStreamRef = useRef<MediaStream | null>(null);

  const [camOn, setCamOn] = useState(state.camOn ?? true);
  const [micOn, setMicOn] = useState(state.micOn ?? true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const sidePanelRef = useRef<SidePanel>(null);
  sidePanelRef.current = sidePanel;

  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const hasVideo = (localStream?.getVideoTracks().length ?? 0) > 0;
  const hasAudio = (localStream?.getAudioTracks().length ?? 0) > 0;

  // ── Inicializa stream local (câmera e mic de forma independente) ──────────
  useEffect(() => {
    let active = true;

    Promise.all([
      openTrack("video", state.selectedCam),
      openTrack("audio", state.selectedMic),
    ]).then(([video, audio]) => {
      const tracks = [video, audio].filter(
        (t): t is MediaStreamTrack => t !== null,
      );
      if (!active) {
        tracks.forEach((t) => t.stop());
        return;
      }

      if (!video) setCamOn(false);
      if (!audio) setMicOn(false);

      if (tracks.length === 0) {
        setMediaError("Não foi possível acessar a câmera nem o microfone.");
        return;
      }
      if (!video || !audio) {
        setMediaError(
          !video
            ? "Câmera indisponível — você entrou apenas com áudio."
            : "Microfone indisponível — você entrou apenas com vídeo.",
        );
      }
      setLocalStream(new MediaStream(tracks));
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Para as tracks ao trocar de stream e ao desmontar
  useEffect(() => {
    return () => stopStream(localStream);
  }, [localStream]);

  useEffect(() => {
    return () => stopStream(screenStreamRef.current);
  }, []);

  // ── Aplica camOn/micOn nas tracks (sem efeito colateral dentro de setState) ─
  useEffect(() => {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = camOn));
  }, [localStream, camOn]);

  useEffect(() => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = micOn));
  }, [localStream, micOn]);

  function toggleCam() {
    if (hasVideo) setCamOn((v) => !v);
  }

  function toggleMic() {
    if (hasAudio) setMicOn((v) => !v);
  }

  // TODO: o stream de tela ainda NÃO é enviado ao participante remoto nem
  // exibido localmente; falta publicá-lo no useTelemedicineCall (replaceTrack
  // ou nova track no peer connection).
  async function toggleScreenShare() {
    if (screenSharing) {
      stopStream(screenStreamRef.current);
      screenStreamRef.current = null;
      setScreenSharing(false);
      return;
    }
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screen;
      // "Parar compartilhamento" na barra do navegador encerra a track sem passar pelo botão
      screen.getVideoTracks()[0]?.addEventListener("ended", () => {
        screenStreamRef.current = null;
        setScreenSharing(false);
      });
      setScreenSharing(true);
    } catch {
      // usuário cancelou
    }
  }

  // ── Auto-hide dos controles (não esconde com painel aberto) ───────────────
  const resetHide = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (sidePanelRef.current) return;
      setControlsVisible(false);
    }, 4000);
  }, []);

  useEffect(() => {
    resetHide();
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [resetHide]);

  // ── Tela cheia (sincroniza com o estado real do navegador) ────────────────
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  function togglePanel(panel: Exclude<SidePanel, null>) {
    setSidePanel((p) => (p === panel ? null : panel));
    setControlsVisible(true);
  }

  // ── Encerrar ─────────────────────────────────────────────────────────────
  const encerrarModal = useOverlayState();
  const [concluindo, setConcluindo] = useState(false);
  const [erroEncerrar, setErroEncerrar] = useState<string | null>(null);

  function sair() {
    hangUp();
    stopStream(localStream);
    stopStream(screenStreamRef.current);
    navigate(`../../consulta`);
  }

  function encerrar() {
    // sem o id da consulta não dá para concluir, só sair
    if (!state.appointmentId) {
      sair();
      return;
    }
    setErroEncerrar(null);
    encerrarModal.open();
  }

  async function concluirESair() {
    if (!state.appointmentId) return;

    setConcluindo(true);
    setErroEncerrar(null);
    try {
      await AppointmentsService.changeAppointmentStatus(
        state.appointmentId,
        "Completed",
      );
    } catch (e) {
      setErroEncerrar(errorMessage(e, "Erro ao concluir a consulta."));
      setConcluindo(false);
      return;
    }
    sair();
  }

  return (
    <div
      className="relative flex h-dvh w-full bg-surface overflow-hidden"
      onMouseMove={resetHide}
      onTouchStart={resetHide}
    >
      {/* `relative` aqui faz a barra de controles centralizar na coluna do
          vídeo, com ou sem painel lateral (antes usava um offset fixo de 480px
          que só funcionava em telas de 1920px) */}
      <div className="relative flex-1 flex flex-col min-w-0 min-h-0">
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

        <div className="relative flex-1 p-3 pb-24 min-h-0">
          {/* Aviso de mídia indisponível */}
          {mediaError && (
            <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
              <span className="size-2 rounded-full bg-warning" />
              {mediaError}
            </div>
          )}

          {/* Banner de reconexão */}
          {(callState === "reconnecting" || callState === "failed") && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/70 text-white text-sm px-4 py-2 rounded-full">
              {callState === "reconnecting" ? (
                <>
                  <span className="size-2 rounded-full bg-warning animate-pulse" />
                  Reconectando…
                </>
              ) : (
                <>
                  <span className="size-2 rounded-full bg-danger" />
                  Conexão perdida.
                  <button onClick={reconnect} className="underline font-medium hover:text-accent">
                    Reconectar
                  </button>
                </>
              )}
            </div>
          )}

          <div className="w-full h-full">
            {remoteConnected ? (
              <ParticipantTile
                stream={remoteStream}
                name={remoteName}
                muted={false}
                camOff={!remoteCamOn}
                large
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-surface flex flex-col items-center justify-center gap-4">
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

          <div className="absolute bottom-4 right-4 w-44 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 z-10">
            <ParticipantTile
              stream={localStream}
              name="Você"
              muted={!micOn}
              camOff={!camOn}
              mirrored
              isLocal
            />
          </div>
        </div>

        <div
          className={`
            absolute bottom-6 left-1/2 -translate-x-1/2 z-20
            flex items-center justify-center
            bg-surface max-w-full shadow-2xl rounded-2xl p-3
            transition-opacity duration-300
            ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          <div className="flex items-center gap-3">
            <ControlBtn
              onClick={toggleMic}
              active={micOn}
              disabled={!hasAudio}
              label={micOn ? "Silenciar" : "Ativar mic"}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </ControlBtn>

            <ControlBtn
              onClick={toggleCam}
              active={camOn}
              disabled={!hasVideo}
              label={camOn ? "Desativar cam" : "Ativar cam"}
            >
              {camOn ? <Video size={20} /> : <VideoOff size={20} />}
            </ControlBtn>

            <ControlBtn
              onClick={toggleScreenShare}
              active={screenSharing}
              label={screenSharing ? "Parar exib." : "Apresentar"}
            >
              <MonitorUp size={20} />
            </ControlBtn>

            <div className="flex flex-col items-center gap-1.5 mx-2">
              <button
                onClick={encerrar}
                className="flex cursor-pointer items-center justify-center size-14 rounded-full bg-danger hover:bg-danger/80 text-white transition-all duration-200 shadow-lg shadow-danger/30 scale-105"
              >
                <PhoneOff size={22} />
              </button>
              <span className="text-text-primary text-[10px]">Encerrar</span>
            </div>

            <ControlBtn
              onClick={() => togglePanel("prontuario")}
              active={sidePanel === "prontuario"}
              label="Prontuário"
            >
              <ClipboardClock size={20} />
            </ControlBtn>

            <ControlBtn
              onClick={() => togglePanel("receita")}
              active={sidePanel === "receita"}
              label="Prescrição"
            >
              <FileUser size={20} />
            </ControlBtn>
          </div>
        </div>
      </div>

      {/* Painel lateral: largura por style inline (não depende de classe
          dinâmica) e conteúdo rolável, já que o root tem overflow-hidden */}
      <div
        aria-hidden={!sidePanel}
        style={{ width: sidePanel ? "50%" : 0 }}
        className="shrink-0 h-full overflow-hidden transition-[width] duration-300 ease-in-out"
      >
        {sidePanel === "prontuario" && (
          <div className="h-full w-full overflow-y-auto border-l border-ring bg-surface">
            {state.appointmentId ? (
              <MedicalRecordComponent appointmentId={state.appointmentId} />
            ) : (
              <p className="p-6 text-text-secondary">
                Abra a teleconsulta pelo painel para escrever o prontuário.
              </p>
            )}
          </div>
        )}
        {sidePanel === "receita" && (
          <div className="h-full w-full overflow-y-auto border-l border-ring flex justify-center items-center bg-surface-overlay">
            {state.appointmentId ? (
              <PrescricaoDaConsulta
                appointmentId={state.appointmentId}
                patientName={state.patientName}
                onAbrirProntuario={() => setSidePanel("prontuario")}
                onCancelar={() => setSidePanel(null)}
              />
            ) : (
              <p className="p-6 text-text-secondary">
                Abra a teleconsulta pelo painel para emitir a receita.
              </p>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={encerrarModal.isOpen} onOpenChange={encerrarModal.setOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="bg-surface">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading className="text-lg font-semibold text-text-primary">Encerrar teleconsulta</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="space-y-3">
                <p className="text-sm text-text-secondary">
                  Concluir a consulta marca o atendimento como realizado. Se só precisa sair e voltar depois, saia sem concluir.
                </p>
                {erroEncerrar && <p className="text-sm text-danger">{erroEncerrar}</p>}
              </Modal.Body>
              <Modal.Footer className="flex gap-2">
                <Button variant="secondary" className="w-full" isDisabled={concluindo} onPress={sair}>
                  Sair sem concluir
                </Button>
                <Button variant="primary" className="w-full" isDisabled={concluindo} onPress={concluirESair}>
                  {concluindo ? "Concluindo…" : "Concluir e sair"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}