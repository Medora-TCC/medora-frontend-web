import { useRef, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { AlertTriangle, Camera, Mail, Stethoscope, Trash2 } from "lucide-react";
import { useMainLayout } from "../../components/MainLayout/mainLayoutContext";
import { deleteMyPhoto, uploadMyPhoto } from "../../api/services/ProfilePhotoService";
import { PHOTO_INPUT_ACCEPT, prepareProfilePhoto } from "../../utils/profilePhotoImage";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

type PhotoAction = "idle" | "uploading" | "confirmRemove" | "removing";

export default function AccountHeader() {
  const { doctorRqes, photoUrl, setPhoto } = useMainLayout();

  const fileInput = useRef<HTMLInputElement>(null);
  const [action, setAction] = useState<PhotoAction>("idle");
  const [photoError, setPhotoError] = useState("");

  if (!doctorRqes) {
    return <div className="h-24 rounded-2xl bg-surface-alt border border-divider animate-pulse" />;
  }

  const mainSpecialty = [...doctorRqes.rqes]
    .filter((r) => r.priority !== null)
    .sort((a, b) => a.priority! - b.priority!)[0]?.specialtyName;

  const isBusy = action === "uploading" || action === "removing";

  const choosePhoto = () => {
    setPhotoError("");
    fileInput.current?.click();
  };

  const handleFile = async (file: File | undefined) => {
    // limpa a escolha para que escolher o mesmo arquivo de novo dispare o onChange
    if (fileInput.current) fileInput.current.value = "";
    if (!file) return;

    setAction("uploading");
    setPhotoError("");
    try {
      const photo = await prepareProfilePhoto(file);
      await uploadMyPhoto(photo);
      setPhoto(photo);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Não foi possível enviar a foto.");
    } finally {
      setAction("idle");
    }
  };

  const removePhoto = async () => {
    setAction("removing");
    setPhotoError("");
    try {
      await deleteMyPhoto();
      setPhoto(null);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Não foi possível remover a foto.");
    } finally {
      setAction("idle");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-divider bg-surface-alt">
      <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-r from-primary-subtle to-transparent" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={choosePhoto}
            disabled={isBusy}
            aria-label={photoUrl ? "Trocar foto" : "Adicionar foto"}
            className="group relative h-16 w-16 shrink-0 rounded-full bg-primary-color text-text-inverse flex items-center justify-center text-xl font-bold ring-4 ring-surface-alt overflow-hidden cursor-pointer disabled:cursor-wait"
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Sua foto de perfil" className="h-full w-full object-cover" />
            ) : (
              getInitials(doctorRqes.doctorName)
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
              <Camera size={20} />
            </span>
            {isBusy && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55">
                <Spinner size="sm" color="current" />
              </span>
            )}
          </button>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-text-primary truncate">{doctorRqes.doctorName}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <Stethoscope size={14} />
                {mainSpecialty ?? "Sem especialidade principal"}
              </span>
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <Mail size={14} />
                <span className="truncate">{doctorRqes.email}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          {action === "confirmRemove" ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Remover a foto?</span>
              <Button size="sm" variant="ghost" onPress={() => setAction("idle")}>Não</Button>
              <Button size="sm" variant="danger" onPress={removePhoto}>Remover</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onPress={choosePhoto} isDisabled={isBusy}>
                <Camera size={14} />
                {photoUrl ? "Trocar foto" : "Adicionar foto"}
              </Button>
              {photoUrl && (
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => setAction("confirmRemove")}
                  isDisabled={isBusy}
                  aria-label="Remover foto"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          )}
          <p className="text-[11px] text-text-muted">JPG, PNG ou WEBP. A foto aparece para os pacientes no app.</p>
          {photoError && (
            <p className="text-xs text-danger-text flex items-center gap-1.5">
              <AlertTriangle size={13} /> {photoError}
            </p>
          )}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept={PHOTO_INPUT_ACCEPT}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
