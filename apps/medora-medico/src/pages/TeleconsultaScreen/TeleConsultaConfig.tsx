import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Button, Card, Chip, Spinner } from "@heroui/react";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Video,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useTeleconsultaGuard } from "./guard/TeleconsultaGuardContext";
import { teleconsultaGuard } from "./guard/teleconsultaGuard";

// ─── Types ────────────────────────────────────────────────────────────────────
type PermissionState = "idle" | "requesting" | "granted" | "denied" | "error";
type MediaKind = "video" | "audio";

interface DeviceInfo {
  deviceId: string;
  label: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function errorName(reason: unknown): string {
  return typeof reason === "object" && reason !== null && "name" in reason
    ? String((reason as { name: unknown }).name)
    : "";
}

function classifyError(reason: unknown): PermissionState {
  const name = errorName(reason);
  return name === "NotAllowedError" || name === "SecurityError"
    ? "denied"
    : "error";
}

function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((t) => t.stop());
}

// Abre o dispositivo escolhido; se ele sumiu (desplugado, id antigo), cai para o padrão.
async function openStream(kind: MediaKind, deviceId: string) {
  try {
    return await navigator.mediaDevices.getUserMedia({
      [kind]: { deviceId: { exact: deviceId } },
    });
  } catch (e) {
    const name = errorName(e);
    if (name === "OverconstrainedError" || name === "NotFoundError") {
      return navigator.mediaDevices.getUserMedia({ [kind]: true });
    }
    throw e;
  }
}

// Gerencia o ciclo de vida de um stream: abre quando habilitado e SEMPRE
// para as tracks no cleanup (troca de dispositivo, desligar, desmontar).
function useMediaStream(
  kind: MediaKind,
  deviceId: string,
  enabled: boolean,
  onFail: () => void,
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;

  useEffect(() => {
    if (!enabled || !deviceId) {
      setStream(null);
      return;
    }
    let active = true;
    let current: MediaStream | null = null;

    openStream(kind, deviceId)
      .then((s) => {
        if (!active) {
          stopStream(s);
          return;
        }
        current = s;
        setStream(s);
      })
      .catch(() => {
        if (active) onFailRef.current();
      });

    return () => {
      active = false;
      stopStream(current);
      setStream(null);
    };
  }, [kind, deviceId, enabled]);

  return stream;
}

// ─── DeviceSelect ─────────────────────────────────────────────────────────────
function DeviceSelect({
  devices,
  selected,
  onChange,
  disabled,
}: {
  devices: DeviceInfo[];
  selected: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="
          w-full appearance-none rounded border border-divider
          bg-surface-secondary px-3 py-2 pr-8 text-sm text-fg
          focus:outline-none focus:ring-2 focus:ring-accent/40
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        {devices.length === 0 && (
          <option value="">Nenhum dispositivo encontrado</option>
        )}
        {devices.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || `Dispositivo ${d.deviceId.slice(0, 6)}`}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted"
      />
    </div>
  );
}

// ─── PermissionBadge ──────────────────────────────────────────────────────────
function PermissionBadge({ state }: { state: PermissionState }) {
  if (state === "idle" || state === "requesting")
    return (
      <Chip size="sm" color="accent" variant="soft">
        {state === "requesting" ? "Solicitando…" : "Aguardando"}
      </Chip>
    );
  if (state === "granted")
    return (
      <Chip size="sm" color="success" variant="soft">
        <CheckCircle size={12} className="mr-1" /> Permitido
      </Chip>
    );
  return (
    <Chip size="sm" color="danger" variant="soft">
      <AlertTriangle size={12} className="mr-1" />{" "}
      {state === "denied" ? "Bloqueado" : "Indisponível"}
    </Chip>
  );
}

// ─── MicLevelBar ──────────────────────────────────────────────────────────────
function MicLevelBar({ stream }: { stream: MediaStream | null }) {
  const [level, setLevel] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!stream) {
      setLevel(0);
      return;
    }
    const ctx = new AudioContext();
    // Alguns navegadores iniciam o AudioContext "suspended"
    void ctx.resume().catch(() => {});
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setLevel(Math.min(100, (avg / 128) * 100));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      source.disconnect();
      void ctx.close().catch(() => {});
    };
  }, [stream]);

  return (
    <div className="flex items-end gap-0.5 h-6">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{ height: `${40 + (i / 20) * 60}%` }}
          className={`w-1.5 rounded transition-colors duration-75 ${
            level > (i / 20) * 100 ? "bg-success" : "bg-surface-tertiary"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Status da conexão ────────────────────────────────────────────────────────
type CheckState = "pending" | "ok" | "warn" | "fail";

interface StatusCheck {
  label: string;
  state: CheckState;
  detail: string;
}

interface StatusSummary {
  tone: CheckState;
  title: string;
  text: string;
}

const TONE_CLASSES: Record<CheckState, string> = {
  pending: "border-ring",
  ok: "border-success/30 bg-success/5",
  warn: "border-warning/30 bg-warning/5",
  fail: "border-danger/30 bg-danger/5",
};

function CheckIcon({ state, size = 16 }: { state: CheckState; size?: number }) {
  if (state === "pending") return <Spinner size="sm" />;
  if (state === "ok")
    return <CheckCircle size={size} className="text-success shrink-0" />;
  return (
    <AlertTriangle
      size={size}
      className={`shrink-0 ${state === "warn" ? "text-warning" : "text-danger"}`}
    />
  );
}

function ConnectionStatus({
  summary,
  checks,
}: {
  summary: StatusSummary;
  checks: StatusCheck[];
}) {
  return (
    <Card className={`border ${TONE_CLASSES[summary.tone]}`}>
      <Card.Content className="flex flex-col gap-3 p-4">
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3"
        >
          <CheckIcon state={summary.tone} size={22} />
          <div className="flex flex-col">
            <p className="text-sm font-medium text-fg">{summary.title}</p>
            <p className="text-xs text-fg-muted">{summary.text}</p>
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {checks.map((c) => (
            <li
              key={c.label}
              className="flex items-center gap-2 rounded border border-divider bg-surface-secondary px-3 py-2"
            >
              <CheckIcon state={c.state} />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-fg truncate">
                  {c.label}
                </span>
                <span className="text-[11px] text-fg-muted truncate">
                  {c.detail}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  );
}

// Acompanha a conexão com a internet (eventos online/offline do navegador)
function useOnlineStatus() {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TeleConsultaConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // ── 1. Guard — primeiro hook, sempre ─────────────────────────────────────
  const { state, tentar } = useTeleconsultaGuard();

  // ── 2. Estado local ───────────────────────────────────────────────────────
  // O painel manda qual é a consulta; repassamos para a sala, onde o prontuário precisa dela.
  const consultaState = (location.state ?? {}) as {
    appointmentId?: number;
    patientName?: string;
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const mountedRef = useRef(true);

  const [camPerm, setCamPerm] = useState<PermissionState>("idle");
  const [micPerm, setMicPerm] = useState<PermissionState>("idle");
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [mics, setMics] = useState<DeviceInfo[]>([]);
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // REMINDER: BUG ESTRANHO — atualmente funciona se conectar ambos e daí entrar
  // na sala; caso contrário dá erro "Unknown ufrag (08f4771d)". Isso acontece na
  // sinalização/WebRTC da sala (não nesta tela): vale investigar se o peer remoto
  // recebe candidates/answer de uma sessão anterior.

  // ── 3. Guard: dispara ao montar e reseta ao desmontar ─────────────────────
  // Mesmo efeito para tentar + reset: no StrictMode (dev) o ciclo
  // montar → desmontar → montar continua consistente.
  useEffect(() => {
    if (!id) return;
    tentar(id);
    return () => {
      teleconsultaGuard.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── 4. Flag de montagem (evita setState após desmontar) ───────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── 5. Lista de dispositivos ──────────────────────────────────────────────
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (!mountedRef.current) return;

      // Sem permissão o navegador devolve deviceId vazio — não serve para seleção
      const cams = devices
        .filter((d) => d.kind === "videoinput" && d.deviceId)
        .map((d) => ({ deviceId: d.deviceId, label: d.label }));
      const micsArr = devices
        .filter((d) => d.kind === "audioinput" && d.deviceId)
        .map((d) => ({ deviceId: d.deviceId, label: d.label }));

      setCameras(cams);
      setMics(micsArr);
      // Mantém a seleção atual se o dispositivo ainda existir
      setSelectedCam((prev) =>
        cams.some((d) => d.deviceId === prev) ? prev : (cams[0]?.deviceId ?? ""),
      );
      setSelectedMic((prev) =>
        micsArr.some((d) => d.deviceId === prev)
          ? prev
          : (micsArr[0]?.deviceId ?? ""),
      );
    } catch {
      // enumerateDevices falhou: mantém listas como estão
    }
  }, []);

  // ── 6. Solicitar permissões (câmera e microfone separadamente) ────────────
  const requestPermissions = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      // Contexto inseguro (http) ou navegador sem suporte
      setCamPerm("error");
      setMicPerm("error");
      return;
    }

    setCamPerm("requesting");
    setMicPerm("requesting");

    const [camResult, micResult] = await Promise.allSettled([
      navigator.mediaDevices.getUserMedia({ video: true }),
      navigator.mediaDevices.getUserMedia({ audio: true }),
    ]);

    // Aqui só queremos a permissão; os streams reais são abertos depois
    if (camResult.status === "fulfilled") stopStream(camResult.value);
    if (micResult.status === "fulfilled") stopStream(micResult.value);

    if (!mountedRef.current) return;

    setCamPerm(
      camResult.status === "fulfilled" ? "granted" : classifyError(camResult.reason),
    );
    setMicPerm(
      micResult.status === "fulfilled" ? "granted" : classifyError(micResult.reason),
    );

    // A label dos dispositivos só vem preenchida depois de pelo menos uma
    // permissão concedida.
    await refreshDevices();
  }, [refreshDevices]);

  useEffect(() => {
    void requestPermissions();
  }, [requestPermissions]);

  // Atualiza a lista quando um dispositivo é conectado/removido
  useEffect(() => {
    const md = navigator.mediaDevices;
    if (!md?.addEventListener) return;
    const onChange = () => void refreshDevices();
    md.addEventListener("devicechange", onChange);
    return () => md.removeEventListener("devicechange", onChange);
  }, [refreshDevices]);

  // ── 7. Streams de vídeo e áudio (cleanup automático no hook) ──────────────
  const videoStream = useMediaStream(
    "video",
    selectedCam,
    camOn && camPerm === "granted",
    () => setCamPerm("error"),
  );
  const audioStream = useMediaStream(
    "audio",
    selectedMic,
    micOn && micPerm === "granted",
    () => setMicPerm("error"),
  );

  // ── 8. Bind do vídeo ao elemento <video> ──────────────────────────────────
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = videoStream;
    if (videoStream) el.play().catch(() => {});
  }, [videoStream]);

  // ── 8b. Conexão com a internet ────────────────────────────────────────────
  const online = useOnlineStatus();

  // ── 9. Early return do guard — SEMPRE após todos os hooks ─────────────────
  if (state.fase === "acesso_negado") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded bg-red-500/10 border border-red-500/20">
          <span className="text-red-400 text-xl">✕</span>
        </div>
        <p className="text-white font-semibold">Acesso negado</p>
        <p className="text-zinc-500 text-sm">
          {state.motivo === "ACESSO_NAO_AUTORIZADO"
            ? "Você não tem permissão para esta consulta."
            : "Esta consulta não existe ou foi encerrada."}
        </p>
        <Button size="sm" onPress={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────
  const prontoPeloGuard = state.fase === "liberado";
  // Permite entrar com apenas áudio ou apenas vídeo (consulta parcial),
  // desde que ao menos um dos dois tenha sido liberado.
  const temMidia = camPerm === "granted" || micPerm === "granted";
  const pronto = prontoPeloGuard && temMidia && online;
  const permProblema = [camPerm, micPerm].some(
    (p) => p === "denied" || p === "error",
  );
  const aguardandoPermissao = camPerm === "requesting" || micPerm === "requesting";

  function handleEntrar() {
    if (!prontoPeloGuard) return; // segurança extra
    stopStream(videoStream);
    stopStream(audioStream);
    navigate(`../${id}/sala`, {
      state: {
        ...consultaState,
        // Nunca informa "ligado" para um dispositivo sem permissão
        camOn: camOn && camPerm === "granted",
        micOn: micOn && micPerm === "granted",
        selectedCam,
        selectedMic,
      },
    });
  }

  // ── Status da conexão (aparece antes de entrar na sala) ───────────────────
  function mediaCheck(
    label: string,
    perm: PermissionState,
    on: boolean,
    stream: MediaStream | null,
  ): StatusCheck {
    if (perm === "idle" || perm === "requesting")
      return { label, state: "pending", detail: "Solicitando permissão…" };
    if (perm === "denied") return { label, state: "warn", detail: "Bloqueado" };
    if (perm === "error") return { label, state: "warn", detail: "Indisponível" };
    if (!on) return { label, state: "ok", detail: "Desativado" };
    // Só considera "ok" quando o stream realmente abriu
    return stream
      ? { label, state: "ok", detail: "Funcionando" }
      : { label, state: "pending", detail: "Iniciando…" };
  }

  const checks: StatusCheck[] = [
    {
      label: "Internet",
      state: online ? "ok" : "fail",
      detail: online ? "Conectado" : "Sem conexão",
    },
    mediaCheck("Câmera", camPerm, camOn, videoStream),
    mediaCheck("Microfone", micPerm, micOn, audioStream),
  ];

  // O guard não aparece como item (quem chegou aqui já tem acesso), mas o
  // botão só libera quando ele termina; então conta como "verificando".
  const algumPendente =
    checks.some((c) => c.state === "pending") || !prontoPeloGuard;
  const entraParcial =
    temMidia && (camPerm !== "granted" || micPerm !== "granted");

  let summary: StatusSummary;
  if (!online) {
    summary = {
      tone: "fail",
      title: "Sem conexão com a internet",
      text: "Verifique sua rede para entrar na consulta.",
    };
  } else if (algumPendente) {
    summary = {
      tone: "pending",
      title: "Verificando conexão…",
      text: "Testando internet, câmera e microfone.",
    };
  } else if (!temMidia) {
    summary = {
      tone: "warn",
      title: "Câmera e microfone indisponíveis",
      text: "Libere ao menos um dos dois para entrar na consulta.",
    };
  } else {
    summary = {
      tone: entraParcial ? "warn" : "ok",
      title: "Conexão estabelecida",
      text: entraParcial
        ? `Tudo certo para entrar, mas ${
            camPerm !== "granted" ? "sem câmera" : "sem microfone"
          }.`
        : "Tudo certo para entrar na consulta.",
    };
  }

  return (
    <div className="min-h-full bg-surface flex items-start justify-center p-4">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Configurar dispositivos
          </h1>
          <p className="text-sm text-fg-muted mt-1 mb-3">
            Verifique câmera e microfone antes de entrar na teleconsulta
          </p>
          {permProblema && (
            <Card className="border-warning/30 bg-warning/5">
              <Card.Content className="flex flex-row items-center justify-center gap-5 p-2">
                <AlertTriangle size={24} className="text-warning shrink-0" />
                <div className="text-sm text-start flex flex-col">
                  <p className="font-medium text-fg">Permissões necessárias</p>
                  <p className="text-fg-muted mt-0.5">
                    {camPerm === "denied" || micPerm === "denied"
                      ? "Clique no ícone de cadeado na barra de endereço e permita o acesso à câmera e/ou microfone, depois tente novamente."
                      : "Não foi possível acessar um dos dispositivos. Verifique se ele está conectado e não está sendo usado por outro programa."}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="border-ring shrink-0"
                  onPress={() => void requestPermissions()}
                  isDisabled={aguardandoPermissao}
                >
                  <RefreshCw size={14} /> Tentar novamente
                </Button>
              </Card.Content>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Câmera */}
          <Card className="overflow-hidden border border-ring shadow-2xl">
            <div className="relative aspect-video bg-surface-raised flex items-center justify-center">
              {camOn && camPerm === "granted" ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-2xl h-full object-cover scale-x-[-1]"
                  />
                  {!videoStream && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Spinner size="md" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-secondary">
                  <CameraOff size={32} strokeWidth={1.25} />
                  <span className="text-xs">
                    {camPerm === "denied"
                      ? "Câmera bloqueada"
                      : camPerm === "error"
                        ? "Câmera indisponível"
                        : camPerm === "requesting"
                          ? "Aguardando permissão…"
                          : "Câmera desativada"}
                  </span>
                </div>
              )}
              {camOn && videoStream && (
                <div className="absolute top-2 right-2">
                  <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                    <span className="size-1.5 rounded-full bg-success animate-pulse" />{" "}
                    Ao vivo
                  </span>
                </div>
              )}
            </div>
            <Card.Content className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-fg-muted" />
                  <span className="text-sm font-medium">Câmera</span>
                  <PermissionBadge state={camPerm} />
                </div>
                <Button
                  size="sm"
                  onPress={() => setCamOn((v) => !v)}
                  isDisabled={camPerm !== "granted"}
                >
                  {camOn ? <Camera size={14} /> : <CameraOff size={14} />}
                  {camOn ? "Ativa" : "Inativa"}
                </Button>
              </div>
              <DeviceSelect
                devices={cameras}
                selected={selectedCam}
                onChange={setSelectedCam}
                disabled={camPerm !== "granted" || !camOn}
              />
            </Card.Content>
          </Card>

          {/* Microfone */}
          <Card className="border border-ring shadow-2xl">
            <Card.Content className="flex flex-col gap-4 p-4 h-full">
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                <div
                  className={`flex size-16 items-center justify-center rounded transition-colors ${
                    micOn && audioStream
                      ? "bg-success/10 text-success"
                      : "bg-surface-secondary text-fg-muted"
                  }`}
                >
                  {micOn && micPerm === "granted" ? (
                    <Mic size={28} strokeWidth={1.5} />
                  ) : (
                    <MicOff size={28} strokeWidth={1.5} />
                  )}
                </div>
                <p className="text-sm text-fg-muted text-center">
                  {micPerm === "requesting"
                    ? "Aguardando permissão do microfone…"
                    : micPerm === "denied"
                      ? "Microfone bloqueado. Verifique as permissões do navegador."
                      : micPerm === "error"
                        ? "Microfone indisponível. Verifique se está conectado."
                        : micOn && audioStream
                          ? "Fale algo para testar o microfone"
                          : "Microfone desativado"}
                </p>
                <MicLevelBar stream={micOn ? audioStream : null} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic size={16} className="text-fg-muted" />
                  <span className="text-sm font-medium">Microfone</span>
                  <PermissionBadge state={micPerm} />
                </div>
                <Button
                  size="sm"
                  onPress={() => setMicOn((v) => !v)}
                  isDisabled={micPerm !== "granted"}
                >
                  {micOn ? <Mic size={14} /> : <MicOff size={14} />}
                  {micOn ? "Ativo" : "Inativo"}
                </Button>
              </div>
              <DeviceSelect
                devices={mics}
                selected={selectedMic}
                onChange={setSelectedMic}
                disabled={micPerm !== "granted" || !micOn}
              />
            </Card.Content>
          </Card>
        </div>

        <ConnectionStatus summary={summary} checks={checks} />

        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center justify-start">
            <Button
              variant="ghost"
              onPress={() => navigate(-1)}
              className="border-ring"
            >
              <ArrowLeft size={16} /> Voltar
            </Button>
          </div>

          <div className="flex justify-center items-center flex-col gap-2">
            <Button size="lg" onPress={handleEntrar} isDisabled={!pronto}>
              <Video size={18} /> Entrar na consulta
            </Button>
          </div>

          {/* Coluna vazia para manter o botão central alinhado */}
          <div />
        </div>
      </div>
    </div>
  );
}