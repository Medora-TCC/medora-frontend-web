import { Button, Modal, Spinner } from "@heroui/react";
import type { IConsulta } from "@medora_web/shared";
import { useEffect, useState } from "react";


interface ConsultaModalProps {
  id: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConsultaModal({ id, isOpen, onOpenChange }: ConsultaModalProps) {
  const [data, setData] = useState<IConsulta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !isOpen) return;

    setLoading(true);
    setError(null);
    setData(null); // limpa dados da consulta anterior

    fetch(`/consultas/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao buscar consulta");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop variant="blur">
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

              {data && !loading && (
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm text-default-500">Paciente</p>
                    <p className="font-medium">{data.pacienteNome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Data</p>
                    <p className="font-medium">{data.dataHorario}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Status</p>
                    <p className="font-medium">{data.status}</p>
                  </div>
                  {/* adicione mais campos conforme seu objeto */}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button onPress={() => onOpenChange(false)}>Fechar</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}