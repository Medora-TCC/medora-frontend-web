import { useEffect, useRef, useState } from "react";
import { Button, Input } from "@heroui/react";
import { UserCircle, Camera, X, UploadCloud } from "lucide-react";

interface AvatarUploadProps {
  value: string;
  name: string;
  isEditing: boolean;
  onChange: (image: string) => void;
}

export default function AvatarUpload({ value, name, isEditing, onChange }: Readonly<AvatarUploadProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const avatarContent = value ? (
    <img src={value} alt={name} className="w-full h-full object-cover" />
  ) : (
    <UserCircle className="text-text-muted" size={40} />
  );

  return (
    <>
      {isEditing ? (
        <button
          type="button"
          aria-label="Trocar foto"
          onClick={() => setIsModalOpen(true)}
          className="relative w-16 h-16 rounded-full overflow-hidden border border-divider bg-surface-alt flex items-center justify-center cursor-pointer group"
        >
          {avatarContent}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={20} />
          </div>
        </button>
      ) : (
        <div className="w-16 h-16 rounded-full overflow-hidden border border-divider bg-surface-alt flex items-center justify-center">
          {avatarContent}
        </div>
      )}

      {isModalOpen && (
        <PhotoDialog
          current={value}
          name={name}
          onClose={() => setIsModalOpen(false)}
          onConfirm={(img) => {
            onChange(img);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function PhotoDialog({
  current,
  name,
  onClose,
  onConfirm,
}: Readonly<{
  current: string;
  name: string;
  onClose: () => void;
  onConfirm: (image: string) => void;
}>) {
  const [draft, setDraft] = useState(current);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft(reader.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      if (item) readFile(item.getAsFile() ?? undefined);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-2xl border border-divider shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Trocar foto</h2>
          <Button isIconOnly variant="ghost" onPress={onClose} aria-label="Fechar">
            <X size={18} />
          </Button>
        </div>

        <div className="flex justify-center">
          <div className="w-28 h-28 rounded-full overflow-hidden border border-divider bg-surface-alt flex items-center justify-center">
            {draft ? (
              <img src={draft} alt={name} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="text-text-muted" size={56} />
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            readFile(e.dataTransfer.files?.[0]);
          }}
          className="w-full border-2 border-dashed border-divider rounded-xl p-6 flex flex-col items-center gap-2 text-text-muted hover:border-primary-color transition-colors"
        >
          <UploadCloud size={28} />
          <span className="text-sm text-center">Arraste uma imagem, clique para escolher, ou cole (Ctrl+V)</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => readFile(e.target.files?.[0])}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted font-bold uppercase">Ou envie uma URL</label>
          <Input
            placeholder="https://..."
            value={draft.startsWith("data:") ? "" : draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onPress={onClose}>Cancelar</Button>
          <Button className="bg-primary-color text-white font-bold" onPress={() => onConfirm(draft)}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
