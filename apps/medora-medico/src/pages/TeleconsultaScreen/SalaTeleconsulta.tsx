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
  Ellipsis,
  ChevronDown,
  CircleAlert,
} from "lucide-react";
import type { IConsultaTeleConsultaPayload } from "@medora_web/shared";
import { MedicalRecordPanel } from "../MedicalRecordPage/MedicalRecordPanel";
import { useTelemedicineCall } from "../../hooks/useTelemedicineCall";
import { AuthContext } from "../../contexts/AuthContext";
import { PrescricaoDaConsulta } from "../PrescriptionPage/PrescriptionPage";
import AppointmentsService from "../../api/services/Appointments";
import { FindConsultaDetailedByMeetingCode } from "../../api/services/Appointment";
import { errorMessage } from "../../api/errors";

// ─── Types ────────────────────────────────────────────────────────────────────
// O appointmentId NÃO vem mais do state da navegação: é buscado pelo meetingCode da URL
// (ver `carregarConsulta`). O state só traz preferências de mídia e o nome (usado até a consulta carregar).
interface LocationState {
  patientName?: string;
  camOn?: boolean;
  micOn?: boolean;
  selectedCam?: string;
  selectedMic?: string;
}

type SidePanel = "prontuario" | "receita" | null;
type MediaKind = "video" | "audio";

// Intervalo entre tentativas de reconexão quando a conexão cai
const RECONNECT_INTERVAL_S = 15;

interface DeviceInfo {
  deviceId: string;
  label: string;
}

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
  kind: MediaKind,
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

  // O <video> fica SEMPRE montado: o srcObject é ligado uma vez e o áudio do
  // participante remoto sai por este elemento mesmo com a câmera desligada.
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
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        disabled={disabled}
        title={label}
        className={`
          flex items-center justify-center size-11 rounded-full transition-all duration-200
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

// ─── Select de dispositivo (menu "Mais") ──────────────────────────────────────
function DeviceMenuSelect({
  label,
  icon,
  devices,
  value,
  onChange,
  disabled,
  busy,
}: {
  label: string;
  icon: React.ReactNode;
  devices: DeviceInfo[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
        {icon}
        <span>{label}</span>
        {busy && <span className="text-[10px] opacity-70">Trocando…</span>}
      </div>
      <div className="relative">
        <select
          value={devices.some((d) => d.deviceId === value) ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || busy || devices.length === 0}
          className="
            w-full appearance-none rounded-lg border border-ring bg-surface-overlay
            px-3 py-2 pr-8 text-sm text-text-primary
            focus:outline-none focus:ring-2 focus:ring-accent/40
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          {devices.length === 0 && (
            <option value="">Nenhum dispositivo encontrado</option>
          )}
          {devices.length > 0 && !devices.some((d) => d.deviceId === value) && (
            <option value="" disabled>
              Selecione…
            </option>
          )}
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Dispositivo ${d.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────
export default function SalaTeleConsulta() {
  // `id` da rota = meetingCode da teleconsulta
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

  const timer = useCallTimer();

  const mountedRef = useRef(true);
  const screenStreamRef = useRef<MediaStream | null>(null);
  // Tracks reais da chamada. O MediaStream (localStream) é remontado a partir
  // delas quando o dispositivo troca, sem parar a track que continua em uso.
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);

  // ── Dados da consulta (buscados pelo meetingCode) ─────────────────────────
  // O appointmentId vêm daqui, não do state da navegação.
  // Se a busca falhar, o erro é exibido na sala (banner + painéis) com opção de tentar de novo.
  const [consulta, setConsulta] = useState<IConsultaTeleConsultaPayload | null>(null);
  const [erroConsulta, setErroConsulta] = useState<string | null>(null);

  const carregarConsulta = useCallback(async () => {
    if (!id) {
      setErroConsulta("Código da consulta não encontrado na URL.");
      return;
    }
    setErroConsulta(null);
    try {
      const data = await FindConsultaDetailedByMeetingCode(id);
      if (!mountedRef.current) return;
      console.log('Consulta carregada:', data);
      setConsulta(data);
    } catch (e) {
      if (!mountedRef.current) return;
      setConsulta(null);
      setErroConsulta(errorMessage(e, "Não foi possível carregar a consulta."));
    }
  }, [id]);

  useEffect(() => {
    void carregarConsulta();
  }, [carregarConsulta]);

  // ATENÇÃO: nomes dos campos do payload (`appointmentId`, `patientName`) são uma suposição;
  // se o `IConsultaTeleConsultaPayload` usar outros nomes, ajuste só estas duas linhas.
  const appointmentId = consulta?.id;

  console.log(
    "Appointment encontrado: " + appointmentId
  );
  
  const remoteName = state.patientName ?? "Paciente";
  /* TODO: Hub ainda não propaga estado de câmera do remoto */
  const remoteCamOn = true;

  // Mensagem mostrada nos painéis enquanto não há appointmentId
  const semConsultaMsg = erroConsulta
    ? `Não foi possível carregar a consulta: ${erroConsulta}`
    : "Carregando consulta…";

  const [camOn, setCamOn] = useState(state.camOn ?? true);
  const [micOn, setMicOn] = useState(state.micOn ?? true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Menu "Mais"
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [mics, setMics] = useState<DeviceInfo[]>([]);
  const [activeCamId, setActiveCamId] = useState("");
  const [activeMicId, setActiveMicId] = useState("");
  const [switching, setSwitching] = useState<MediaKind | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  // Enquanto painel ou menu estiverem abertos, os controles não somem
  const keepControlsRef = useRef(false);
  keepControlsRef.current = sidePanel !== null || menuOpen;

  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const hasVideo = (localStream?.getVideoTracks().length ?? 0) > 0;
  const hasAudio = (localStream?.getAudioTracks().length ?? 0) > 0;

  // ── Reconexão automática: 15s entre uma tentativa e outra ─────────────────
  const reconnectRef = useRef(reconnect);
  reconnectRef.current = reconnect;
  const [retryIn, setRetryIn] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Contagem regressiva: reinicia sempre que a chamada entra em "failed"
  useEffect(() => {
    if (callState !== "failed") {
      setRetryIn(null);
      return;
    }
    setRetryIn(RECONNECT_INTERVAL_S);
    const iv = setInterval(
      () => setRetryIn((s) => (s === null ? null : Math.max(0, s - 1))),
      1000,
    );
    return () => clearInterval(iv);
  }, [callState]);

  // Ao zerar: tenta reconectar e já arma os próximos 15s (vale também se o
  // hook permanecer em "failed" durante a tentativa)
  useEffect(() => {
    if (callState === "failed" && retryIn === 0) {
      setAttempts((n) => n + 1);
      setRetryIn(RECONNECT_INTERVAL_S);
      reconnectRef.current();
    }
  }, [callState, retryIn]);

  // Conectou de novo: zera o histórico de tentativas
  useEffect(() => {
    if (remoteConnected && callState !== "failed" && callState !== "reconnecting") {
      setAttempts(0);
    }
  }, [remoteConnected, callState]);

  // ── Flag de montagem ──────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Layout em tela única: impede scroll da página por trás da sala ────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Lista de dispositivos ─────────────────────────────────────────────────
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (!mountedRef.current) return;
      setCameras(
        devices
          .filter((d) => d.kind === "videoinput" && d.deviceId)
          .map((d) => ({ deviceId: d.deviceId, label: d.label })),
      );
      setMics(
        devices
          .filter((d) => d.kind === "audioinput" && d.deviceId)
          .map((d) => ({ deviceId: d.deviceId, label: d.label })),
      );
    } catch {
      // mantém as listas atuais
    }
  }, []);

  useEffect(() => {
    const md = navigator.mediaDevices;
    if (!md?.addEventListener) return;
    const onChange = () => void refreshDevices();
    md.addEventListener("devicechange", onChange);
    return () => md.removeEventListener("devicechange", onChange);
  }, [refreshDevices]);

  // Remonta o MediaStream a partir das tracks atuais
  const rebuildStream = useCallback(() => {
    const tracks = [videoTrackRef.current, audioTrackRef.current].filter(
      (t): t is MediaStreamTrack => t !== null,
    );
    setLocalStream(tracks.length ? new MediaStream(tracks) : null);
  }, []);

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

      videoTrackRef.current = video;
      audioTrackRef.current = audio;
      setActiveCamId(video?.getSettings().deviceId ?? "");
      setActiveMicId(audio?.getSettings().deviceId ?? "");

      if (!video) setCamOn(false);
      if (!audio) setMicOn(false);

      if (tracks.length === 0) {
        setMediaError("Não foi possível acessar a câmera nem o microfone.");
      } else {
        if (!video || !audio) {
          setMediaError(
            !video
              ? "Câmera indisponível — você entrou apenas com áudio."
              : "Microfone indisponível — você entrou apenas com vídeo.",
          );
        }
        rebuildStream();
      }
      // Com permissão concedida, as labels já vêm preenchidas
      void refreshDevices();
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Libera câmera, microfone e tela ao desmontar
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      videoTrackRef.current?.stop();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      audioTrackRef.current?.stop();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      stopStream(screenStreamRef.current);
    };
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

  // ── Troca de dispositivo (menu "Mais") ────────────────────────────────────
  // IMPORTANTE: isto cria um novo MediaStream. O useTelemedicineCall precisa
  // reagir à mudança de `localStream` trocando a track no peer
  // (RTCRtpSender.replaceTrack); se ele só lê o stream na conexão inicial, o
  // participante remoto continuará recebendo o dispositivo antigo.
  async function changeDevice(kind: MediaKind, deviceId: string) {
    if (!deviceId || switching) return;
    const ref = kind === "video" ? videoTrackRef : audioTrackRef;
    if (ref.current?.getSettings().deviceId === deviceId) return;

    setSwitching(kind);
    setDeviceError(null);

    // Libera o dispositivo atual antes: algumas câmeras (mobile) não abrem em paralelo
    const prevId = ref.current?.getSettings().deviceId;
    ref.current?.stop();

    let track = await openTrack(kind, deviceId);
    let failed = track === null;
    if (!track && prevId && prevId !== deviceId) {
      track = await openTrack(kind, prevId); // tenta voltar ao anterior
    }

    if (!mountedRef.current) {
      track?.stop();
      return;
    }

    ref.current = track;
    const newId = track?.getSettings().deviceId ?? "";
    if (kind === "video") {
      setActiveCamId(newId);
      if (!track) setCamOn(false);
    } else {
      setActiveMicId(newId);
      if (!track) setMicOn(false);
    }
    if (failed || !track) {
      setDeviceError(
        kind === "video"
          ? "Não foi possível usar essa câmera."
          : "Não foi possível usar esse microfone.",
      );
    }

    rebuildStream(); // o efeito de camOn/micOn reaplica `enabled` no novo stream
    setSwitching(null);
    void refreshDevices();
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
      screen.getVideoTracks()[0]?.addEventListener("ended", () => {
        screenStreamRef.current = null;
        setScreenSharing(false);
      });
      setScreenSharing(true);
    } catch {
      // usuário cancelou
    }
  }

  // ── Auto-hide dos controles (não esconde com painel/menu aberto) ──────────
  const resetHide = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (keepControlsRef.current) return;
      setControlsVisible(false);
    }, 4000);
  }, []);

  useEffect(() => {
    resetHide();
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [resetHide]);

  // ── Menu "Mais": fecha ao clicar fora ou com Esc ──────────────────────────
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    resetHide();
  }, [resetHide]);

  useEffect(() => {
    if (!menuOpen) return;
    void refreshDevices();

    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu, refreshDevices]);

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
    videoTrackRef.current?.stop();
    audioTrackRef.current?.stop();
    stopStream(screenStreamRef.current);
    navigate(`../../consulta`);
  }

  function encerrar() {
    // sem o id da consulta (ainda carregando ou falhou) não dá para concluir, só sair;
    // o motivo já está visível no banner de erro da sala
    if (!appointmentId) {
      sair();
      return;
    }
    setErroEncerrar(null);
    encerrarModal.open();
  }

  async function concluirESair() {
    if (!appointmentId) return;

    setConcluindo(true);
    setErroEncerrar(null);
    try {
      await AppointmentsService.changeAppointmentStatus(
        appointmentId,
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
    // `fixed inset-0` ocupa exatamente a viewport: a sala nunca gera scroll,
    // independente de header/padding do layout pai (antes era h-dvh dentro do
    // layout, que somava com a altura do header e estourava a tela).
    <div
      className="fixed inset-0 z-40 flex bg-surface overflow-hidden"
      onMouseMove={resetHide}
      onTouchStart={resetHide}
    >
      {/* `relative` faz a barra de controles centralizar na coluna do vídeo,
          com ou sem painel lateral */}
      <div className="relative flex-1 flex flex-col min-w-0 min-h-0">
        <div
          className={`
            relative z-20 flex shrink-0 items-center justify-between
            py-3 px-3
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

        {/* Área de vídeo: ocupa só o espaço que sobra (flex-1 + min-h-0) e
            reserva embaixo (pb-28) a altura da barra de controles */}
        <div className="relative flex-1 min-h-0 p-3 pb-28">
          {/* Avisos (mídia indisponível e falha ao carregar a consulta) */}
          {(mediaError || erroConsulta) && (
            <div className="absolute top-3 left-3 z-30 flex max-w-[min(32rem,calc(100%-1.5rem))] flex-col items-start gap-2">
              {mediaError && (
                <div className="flex items-center gap-2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                  <span className="size-2 rounded-full bg-warning" />
                  {mediaError}
                </div>
              )}

              {erroConsulta && (
                <div
                  role="alert"
                  className="flex items-center gap-3 rounded-xl bg-danger/90 px-3 py-2 text-xs text-white shadow-lg"
                >
                  <CircleAlert size={14} className="shrink-0" />
                  <span>
                    Não foi possível carregar os dados da consulta. Prontuário, receita e
                    conclusão estão indisponíveis. {erroConsulta}
                  </span>
                  <button
                    onClick={() => void carregarConsulta()}
                    className="shrink-0 cursor-pointer rounded-md border border-white/40 px-2 py-1 font-medium hover:bg-white/10"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Banner de reconexão */}
          {(callState === "reconnecting" || callState === "failed") && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 bg-black/70 text-white text-sm px-4 py-2 rounded-full">
                {callState === "reconnecting" ? (
                  <>
                    <span className="size-2 rounded-full bg-warning animate-pulse" />
                    Reconectando…
                  </>
                ) : (
                  <>
                    <span className="size-2 rounded-full bg-danger" />
                    Conexão perdida. Nova tentativa em{" "}
                    <span className="font-mono tabular-nums">
                      {retryIn ?? RECONNECT_INTERVAL_S}s
                    </span>
                  </>
                )}
              </div>

              {/* Aparece quando pelo menos uma tentativa já falhou */}
              {callState === "failed" && attempts > 0 && (
                <div
                  role="alert"
                  className="bg-danger/90 text-white text-xs px-4 py-2 rounded-full shadow-lg"
                >
                  Não foi possível se conectar ao paciente.
                </div>
              )}
            </div>
          )}

          <div className="relative w-full h-full">
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

            {/* Self-view dentro da área de vídeo (não invade a barra de controles) */}
            <div className="absolute bottom-3 right-3 w-40 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 z-10">
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
        </div>

        <div
          className={`
            absolute bottom-4 left-1/2 -translate-x-1/2 z-20
            flex items-center justify-center
            bg-surface max-w-full shadow-2xl rounded-2xl p-3
            transition-opacity duration-300
            ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          <div className="flex items-center gap-2 sm:gap-3">
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

            <div className="flex flex-col items-center gap-1 mx-1">
              <button
                onClick={encerrar}
                className="flex cursor-pointer items-center justify-center size-12 rounded-full bg-danger hover:bg-danger/80 text-white transition-all duration-200 shadow-lg shadow-danger/30"
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

            {/* Mais: configurações de câmera e microfone */}
            <div ref={menuRef} className="relative">
              <ControlBtn
                onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
                active={menuOpen}
                label="Mais"
              >
                <Ellipsis size={20} />
              </ControlBtn>

              {menuOpen && (
                <div
                  role="dialog"
                  aria-label="Configurações de câmera e microfone"
                  className="absolute bottom-full right-0 mb-4 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-ring bg-surface p-4 shadow-2xl flex flex-col gap-4 z-30"
                >
                  <p className="text-sm font-semibold text-text-primary">
                    Configurações
                  </p>

                  <DeviceMenuSelect
                    label="Câmera"
                    icon={<Video size={14} />}
                    devices={cameras}
                    value={activeCamId}
                    onChange={(v) => void changeDevice("video", v)}
                    busy={switching === "video"}
                    disabled={switching !== null}
                  />

                  <DeviceMenuSelect
                    label="Microfone"
                    icon={<Mic size={14} />}
                    devices={mics}
                    value={activeMicId}
                    onChange={(v) => void changeDevice("audio", v)}
                    busy={switching === "audio"}
                    disabled={switching !== null}
                  />

                  {deviceError && (
                    <p className="text-xs text-danger">{deviceError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Painel lateral: largura por style inline e conteúdo com scroll interno
          (o scroll fica DENTRO do painel, nunca na página) */}
      <div
        aria-hidden={!sidePanel}
        style={{ width: sidePanel ? "50%" : 0 }}
        className="shrink-0 h-full overflow-hidden transition-[width] duration-300 ease-in-out"
      >
        {sidePanel === "prontuario" && (
          <div className="h-full">
            {state.appointmentId ? (
              <MedicalRecordPanel key={state.appointmentId} appointmentId={state.appointmentId} />
            ) : (
              <p className="p-6 text-text-secondary">{semConsultaMsg}</p>
            )}
          </div>
        )}
        {sidePanel === "receita" && (
          <div className="h-full w-full overflow-y-auto border-l border-ring flex justify-center items-center bg-surface-overlay">
            {appointmentId ? (
              <PrescricaoDaConsulta
                appointmentId={appointmentId}
                patientName={remoteName}
                onAbrirProntuario={() => setSidePanel("prontuario")}
                onCancelar={() => setSidePanel(null)}
              />
            ) : (
              <p className="p-6 text-text-secondary">{semConsultaMsg}</p>
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