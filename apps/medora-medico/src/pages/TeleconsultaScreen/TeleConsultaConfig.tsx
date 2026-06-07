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
} from "lucide-react";
import { useTeleconsultaGuard } from "./guard/TeleconsultaGuardContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type PermissionState = "idle" | "requesting" | "granted" | "denied" | "error";

interface DeviceInfo {
  deviceId: string;
  label: string;
}

// ─── Select simples (sem depender do heroui Select) ───────────────────────────
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
          w-full appearance-none rounded-xl border border-divider
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

// ─── Badge de permissão ───────────────────────────────────────────────────────
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

// ─── Visualizador de volume do mic ────────────────────────────────────────────
function MicLevelBar({ stream }: { stream: MediaStream | null }) {
  const [level, setLevel] = useState(0);
  const rafRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream) {
      setLevel(0);
      return;
    }
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    ctxRef.current = ctx;
    analyserRef.current = analyser;

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

  const bars = 20;
  return (
    <div className="flex items-end gap-0.5 h-6">
      {Array.from({ length: bars }).map((_, i) => {
        const threshold = (i / bars) * 100;
        const active = level > threshold;
        return (
          <div
            key={i}
            style={{ height: `${40 + (i / bars) * 60}%` }}
            className={`w-1.5 rounded-sm transition-colors duration-75 ${
              active ? "bg-success" : "bg-surface-tertiary"
            }`}
          />
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TeleConsultaConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Streams
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Permissões
  const [camPerm, setCamPerm] = useState<PermissionState>("idle");
  const [micPerm, setMicPerm] = useState<PermissionState>("idle");

  // Dispositivos
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [mics, setMics] = useState<DeviceInfo[]>([]);
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedMic, setSelectedMic] = useState("");

  // Toggles
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // ── Solicitar permissões e listar devices ──────────────────────────────────
  async function requestPermissions() {
    setCamPerm("requesting");
    setMicPerm("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      // Para apenas listar os devices — streams individuais são criados depois
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
      const msg = e instanceof Error ? e.name : "";
      const denied = msg === "NotAllowedError";
      setCamPerm(denied ? "denied" : "error");
      setMicPerm(denied ? "denied" : "error");
    }
  }

  // Inicializa permissões ao montar
  useEffect(() => {
    requestPermissions();
  }, []);

  // ── Atualiza stream de vídeo ao trocar câmera ──────────────────────────────
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
        if (!active) { s.getTracks().forEach((t) => t.stop()); return; }
        setVideoStream(s);
      })
      .catch(() => setCamPerm("error"));

    return () => { active = false; };
  }, [selectedCam, camOn, camPerm]);

  // ── Atualiza stream de áudio ao trocar mic ─────────────────────────────────
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
        if (!active) { s.getTracks().forEach((t) => t.stop()); return; }
        setAudioStream(s);
      })
      .catch(() => setMicPerm("error"));

    return () => { active = false; };
  }, [selectedMic, micOn, micPerm]);

  // ── Exibe vídeo no elemento <video> ───────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  // ── Cleanup ao desmontar ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      videoStream?.getTracks().forEach((t) => t.stop());
      audioStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const { tentar } = useTeleconsultaGuard()

  function handleEntrar() {
    // Para os streams de preview — a sala vai criar os próprios
    videoStream?.getTracks().forEach((t) => t.stop());
    audioStream?.getTracks().forEach((t) => t.stop());
    tentar(id!)
  }

  const pronto = camPerm === "granted" || micPerm === "granted";

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-3xl flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Configurar dispositivos
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            Verifique câmera e microfone antes de entrar na teleconsulta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ── Preview da câmera ──────────────────────────── */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {camOn && camPerm === "granted" ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {!videoStream && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Spinner size="md" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-fg-muted">
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

              {/* Badge no canto */}
              {camOn && videoStream && (
                <div className="absolute top-2 right-2">
                  <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                    <span className="size-1.5 rounded-full bg-success animate-pulse" />
                    Ao vivo
                  </span>
                </div>
              )}
            </div>

            <Card.Content className="flex flex-col gap-3 p-4">
              {/* Toggle câmera */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-fg-muted" />
                  <span className="text-sm font-medium">Câmera</span>
                  <PermissionBadge state={camPerm} />
                </div>
                <Button
                  size="sm"
                //   variant={camOn ? "outline" : "soft"}
                //   color={camOn ? "default" : "danger"}
                  onPress={() => setCamOn((v) => !v)}
                  isDisabled={camPerm !== "granted"}
                >
                  {camOn ? <Camera size={14} /> : <CameraOff size={14} />}
                  {camOn ? "Ativa" : "Inativa"}
                </Button>
              </div>

              {/* Select câmera */}
              <DeviceSelect
                devices={cameras}
                selected={selectedCam}
                onChange={setSelectedCam}
                disabled={camPerm !== "granted" || !camOn}
              />
            </Card.Content>
          </Card>

          {/* ── Configuração do mic ─────────────────────── */}
          <Card>
            <Card.Content className="flex flex-col gap-4 p-4 h-full">
              {/* Ícone decorativo */}
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                <div
                  className={`
                    flex size-16 items-center justify-center rounded-2xl transition-colors
                    ${micOn && audioStream ? "bg-success/10 text-success" : "bg-surface-secondary text-fg-muted"}
                  `}
                >
                  {micOn ? (
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
                    : micOn && audioStream
                    ? "Fale algo para testar o microfone"
                    : "Microfone desativado"}
                </p>

                {/* Nível de volume */}
                <MicLevelBar stream={micOn ? audioStream : null} />
              </div>

              {/* Toggle mic */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic size={16} className="text-fg-muted" />
                  <span className="text-sm font-medium">Microfone</span>
                  <PermissionBadge state={micPerm} />
                </div>
                <Button
                  size="sm"
                //   variant={micOn ? "outline" : "soft"}
                //   color={micOn ? "default" : "danger"}
                  onPress={() => setMicOn((v) => !v)}
                  isDisabled={micPerm !== "granted"}
                >
                  {micOn ? <Mic size={14} /> : <MicOff size={14} />}
                  {micOn ? "Ativo" : "Inativo"}
                </Button>
              </div>

              {/* Select mic */}
              <DeviceSelect
                devices={mics}
                selected={selectedMic}
                onChange={setSelectedMic}
                disabled={micPerm !== "granted" || !micOn}
              />
            </Card.Content>
          </Card>
        </div>

        {/* ── Aviso de permissão negada ──────────────────── */}
        {(camPerm === "denied" || micPerm === "denied") && (
          <Card className="border-warning/30 bg-warning/5">
            <Card.Content className="flex items-start gap-3 p-4">
              <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-fg">Permissões necessárias</p>
                <p className="text-fg-muted mt-0.5">
                  Clique no ícone de cadeado na barra de endereço do navegador e
                  permita o acesso à câmera e/ou microfone, depois recarregue a
                  página.
                </p>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* ── Ações ─────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onPress={() => navigate(-1)}
          >
            Voltar
          </Button>

          <Button
            // color="accent"
            size="lg"
            onPress={handleEntrar}
            isDisabled={!pronto}
          >
            <Video size={18} />
            Entrar na consulta
          </Button>
        </div>
      </div>
    </div>
  );
}