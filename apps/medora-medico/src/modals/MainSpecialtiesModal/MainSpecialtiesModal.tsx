import { useEffect, useState } from "react";
import { Button, Modal, Spinner } from "@heroui/react";
import { AlertTriangle, Stethoscope } from "lucide-react";
import type { RqeItemDto } from "../../api/dtos/Doctors/DoctorRqesDto";
import { updateRqePriorities } from "../../api/services/DoctorService";

const MAX_MAIN_SPECIALTIES = 3;

interface MainSpecialtiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  rqes: RqeItemDto[];
  onSaved: () => Promise<unknown>;
}

function getInitialSelection(rqes: RqeItemDto[]): number[] {
  return rqes
    .filter((r) => r.priority !== null)
    .sort((a, b) => a.priority! - b.priority!)
    .map((r) => r.specialtyId);
}

export default function MainSpecialtiesModal({ isOpen, isLoading, onClose, rqes, onSaved }: MainSpecialtiesModalProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected(getInitialSelection(rqes));
      setErrorMessage("");
    }
  }, [isOpen, rqes]);

  const isFull = selected.length >= MAX_MAIN_SPECIALTIES;

  const toggle = (specialtyId: number) => {
    setSelected((prev) => {
      if (prev.includes(specialtyId)) return prev.filter((id) => id !== specialtyId);
      if (prev.length >= MAX_MAIN_SPECIALTIES) return prev;
      return [...prev, specialtyId];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      await updateRqePriorities({ specialtyIds: selected });
      await onSaved();
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) onClose(); }}
        isDismissable={!isSaving}
        isKeyboardDismissDisabled={isSaving}
      >
        <Modal.Container size="md" scroll="inside">
          <Modal.Dialog
            aria-labelledby="main-specialties-title"
            className="bg-surface border border-border rounded-2xl"
          >
            <Modal.CloseTrigger className="text-text-muted hover:text-text-primary" />

            <Modal.Header className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center shrink-0">
                <Stethoscope size={20} className="text-primary-color" />
              </div>
              <div>
                <h2 id="main-specialties-title" className="text-lg font-bold text-text-primary">
                  Especialidades principais
                </h2>
                <p className="text-sm text-text-secondary">
                  Escolha até {MAX_MAIN_SPECIALTIES}, na ordem de prioridade. É assim que os pacientes vão te encontrar.
                </p>
              </div>
            </Modal.Header>

            <Modal.Body className="flex flex-col gap-2">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <>
                  {rqes.length === 0 && (
                    <p className="text-sm text-text-muted text-center py-6">
                      Nenhum RQE encontrado no seu cadastro.
                    </p>
                  )}
            
                  {rqes.map((rqe) => {
                    const position = selected.indexOf(rqe.specialtyId);
                    const isSelected = position !== -1;
                    const isDisabled = !isSelected && isFull;
                
                    return (
                      <button
                        key={rqe.specialtyId}
                        type="button"
                        onClick={() => toggle(rqe.specialtyId)}
                        disabled={isDisabled || isSaving}
                        className={`flex items-center gap-3 w-full text-left p-3 rounded-xl border transition-colors
                          ${isSelected
                            ? "border-primary-color bg-primary-subtle"
                            : "border-border bg-surface-alt hover:border-border-hover"}
                          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                            ${isSelected ? "bg-primary-color text-text-inverse" : "bg-surface-raised"}`}
                        >
                          {isSelected ? `${position + 1}º` : null}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${isSelected ? "text-primary-text" : "text-text-primary"}`}>
                            {rqe.specialtyName}
                          </p>
                          <p className="text-xs text-text-muted">RQE {rqe.rqeCode}</p>
                        </div>
                      </button>
                    );
                  })}
            
                  {selected.length === 0 && rqes.length > 0 && (
                    <div className="flex items-start gap-2 p-3 mt-2 rounded-lg bg-warning-subtle text-warning-text text-xs">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <span>Enquanto você não escolher, seu perfil não aparece nas buscas dos pacientes.</span>
                    </div>
                  )}
                </>
              )}
            
              {errorMessage && (
                <div className="p-3 rounded-lg bg-danger-subtle text-danger-text text-xs">{errorMessage}</div>
              )}
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2">
              <Button variant="ghost" onPress={onClose} isDisabled={isSaving}>
                Agora não
              </Button>
              <Button variant="primary" onPress={handleSave} isDisabled={isLoading || selected.length === 0 || isSaving}>
                {isSaving ? <Spinner color="current" size="sm" /> : "Salvar"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}