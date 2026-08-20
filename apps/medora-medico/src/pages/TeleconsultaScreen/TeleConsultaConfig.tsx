import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useTeleconsultaGuard } from "./guard/TeleconsultaGuardContext";
import { teleconsultaGuard } from "./guard/teleconsultaGuard";

// ─── Types ────────────────────────────────────────────────────────────────────
type PermissionState = "idle" | "requesting" | "granted" | "denied" | "error";

interface DeviceInfo {
  deviceId: string;
  label: string;
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
      <AlertTriangle size={12} className="mr-1" /> Bloqueado
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
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    ctx.createMediaStreamSource(stream).connect(analyser);
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
      ctx.close();
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TeleConsultaConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── 1. Guard — primeiro hook, sempre ─────────────────────────────────────
  const { state, tentar } = useTeleconsultaGuard();
  const [termoAceitoGuard, setTermoAceitoGuard] = useState<boolean | null>(
    null,
  );

  // ── 2. Estado local ───────────────────────────────────────────────────────
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [camPerm, setCamPerm] = useState<PermissionState>("idle");
  const [micPerm, setMicPerm] = useState<PermissionState>("idle");
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [mics, setMics] = useState<DeviceInfo[]>([]);
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const guardIniciado = useRef(false);

  useEffect(() => {
    if (id && !guardIniciado.current) {
      guardIniciado.current = true;
      tentar(id);
    }

    if (state.fase !== "termos_pendentes") {
      setTermoAceitoGuard(true);
    }
  }, []);

  useEffect(() => {
    console.log("fase: " + state.fase);

    if (state.fase === "termos_pendentes" || state.fase === "idle") {
      setTermoAceitoGuard(false);
    } else {
      setTermoAceitoGuard(true);
    }
  }, [state.fase]);

  useEffect(() => {
    return () => {
      teleconsultaGuard.reset();
      guardIniciado.current = false;
    };
  }, []);

  // ── 5. Solicitar permissões de mídia ──────────────────────────────────────
  async function requestPermissions() {
    setCamPerm("requesting");
    setMicPerm("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((t) => t.stop());
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices
        .filter((d) => d.kind === "videoinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label }));
      const micsArr = devices
        .filter((d) => d.kind === "audioinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label }));
      setCameras(cams);
      setMics(micsArr);
      setSelectedCam(cams[0]?.deviceId ?? "");
      setSelectedMic(micsArr[0]?.deviceId ?? "");
      setCamPerm("granted");
      setMicPerm("granted");
    } catch (e: unknown) {
      const denied = e instanceof Error && e.name === "NotAllowedError";
      setCamPerm(denied ? "denied" : "error");
      setMicPerm(denied ? "denied" : "error");
    }
  }

  useEffect(() => {
    requestPermissions();
  }, []);

  // ── 6. Stream de vídeo ────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedCam || camPerm !== "granted") return;
    let active = true;
    videoStream?.getTracks().forEach((t) => t.stop());
    if (!camOn) {
      setVideoStream(null);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { deviceId: { exact: selectedCam } } })
      .then((s) => {
        if (!active) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setVideoStream(s);
      })
      .catch(() => setCamPerm("error"));
    return () => {
      active = false;
    };
  }, [selectedCam, camOn, camPerm]);

  // ── 7. Stream de áudio ────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedMic || micPerm !== "granted") return;
    let active = true;
    audioStream?.getTracks().forEach((t) => t.stop());
    if (!micOn) {
      setAudioStream(null);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: { deviceId: { exact: selectedMic } } })
      .then((s) => {
        if (!active) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setAudioStream(s);
      })
      .catch(() => setMicPerm("error"));
    return () => {
      active = false;
    };
  }, [selectedMic, micOn, micPerm]);

  // ── 8. Bind vídeo ao elemento <video> ─────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = videoStream;
  }, [videoStream]);

  // ── 9. Cleanup de streams ao desmontar ───────────────────────────────────
  useEffect(() => {
    return () => {
      videoStream?.getTracks().forEach((t) => t.stop());
      audioStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── 10. Early returns do guard — SEMPRE após todos os hooks ───────────────

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
  const pronto =
    prontoPeloGuard && (camPerm === "granted" || micPerm === "granted");

  function handleEntrar() {
    if (!prontoPeloGuard) return; // segurança extra
    videoStream?.getTracks().forEach((t) => t.stop());
    audioStream?.getTracks().forEach((t) => t.stop());
    navigate(`../${id}/sala`, {
      state: { camOn, micOn, selectedCam, selectedMic },
    });
  }

  function handleReOpenTermsModal() {
    if (id) {
      tentar(id);
    }
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
          {(camPerm === "denied" || micPerm === "denied") && (
            <Card className="border-warning/30 bg-warning/5 ">
              <Card.Content className="flex flex-row items-center justify-center gap-5 p-1">
                <AlertTriangle
                  size={24}
                  className="text-warning mt-0.5 shrink-0"
                />
                <div className="text-sm text-start flex flex-col">
                  <p className="font-medium text-fg">Permissões necessárias</p>
                  <p className="text-fg-muted mt-0.5">
                    Clique no ícone de cadeado na barra de endereço e permita o
                    acesso à câmera e/ou microfone, depois recarregue a página.
                  </p>
                </div>
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
          <Card className=" border border-ring shadow-2xl">
            <Card.Content className="flex flex-col gap-4 p-4 h-full">
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                <div
                  className={`flex size-16 items-center justify-center rounded transition-colors ${micOn && audioStream ? "bg-success/10 text-success" : "bg-surface-secondary text-fg-muted"}`}
                >
                  {micOn ? (
                    <Mic size={28} strokeWidth={1.5} />
                  ) : (
                    <MicOff size={28} strokeWidth={1.5} />
                  )}
                </div>
                <p className="text-sm text-secondary text-center">
                  {micPerm === "requesting"
                    ? "Aguardando permissão do microfone…"
                    : micPerm === "denied"
                      ? "Microfone bloqueado. Verifique as permissões do navegador."
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

        <div className="grid grid-cols-3">
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              onPress={() => navigate(-1)}
              className="border-ring"
            >
              {" "}
              <ArrowLeft /> Voltar
            </Button>
          </div>

          <div className="flex justify-center items-center flex-col gap-2">
            {!pronto && (
              <p className="text-text-secondary text-sm">
                Aguardando permissões.
              </p>
            )}
            <Button size="lg" onPress={handleEntrar} isDisabled={!pronto}>
              <Video size={18} /> Entrar na consulta
            </Button>
          </div>

          <div className="flex items-center justify-center">
            {!termoAceitoGuard && (
              <Button size="lg" onPress={handleReOpenTermsModal}>
                <FileText size={18} /> Termos
              </Button>
            )}
          </div>

          <div className=""></div>
        </div>
      </div>
    </div>
  );
}
