import { Button, Modal, Spinner } from "@heroui/react";
import type { IConsultaDetailed } from "@medora_web/shared";
import { useEffect, useState } from "react";
import { FindConsultaDetailedById } from "./Consulta";
import { canEnter } from "./ConsultaHelpers";
import EnterConsultaButton from "../../components/Consulta/EnterConsultaButton";


interface ConsultaModalProps {
  id: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}


export default function ConsultaModal({ id, isOpen, onOpenChange }: ConsultaModalProps) {
  const [currentConsulta, setCurrentConsulta] = useState<IConsultaDetailed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoinable, setIsJoinable] = useState<boolean>(false);

  useEffect(() => {
    if (!id || !isOpen) return;

    setLoading(true);
    setError(null);
    setCurrentConsulta(null); // limpa dados da consulta anterior
    setIsJoinable(false)
  

    FindConsultaDetailedById(id)
      .then((consulta) => {
      setCurrentConsulta(consulta);
      setIsJoinable(canEnter(consulta)); // ← usa o valor fresh, não o state
    })
      .catch((e) => setError(e.message))
      .finally(() => {
        setLoading(false)  
      });
  }, [id, isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Detalhes da Consulta</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              {loading && (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              )}

              {error && (
                <p className="text-danger text-sm text-center py-4">{error}</p>
              )}

              {currentConsulta && !loading && (
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm text-default-500">Paciente</p>
                    <p className="font-medium">{currentConsulta.pacienteNome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Data</p>
                    <p className="font-medium">{currentConsulta.dataHorario}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Status</p>
                    <p className="font-medium">{currentConsulta.status}</p>
                  </div>
                  {/* adicione mais campos conforme seu objeto */}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer>
              <EnterConsultaButton
              isJoinable={isJoinable}
              id={currentConsulta?.id ?? ""}
              />
              <Button onPress={() => onOpenChange(false)}>Fechar</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}