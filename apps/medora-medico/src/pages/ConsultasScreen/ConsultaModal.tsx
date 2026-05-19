import { Button, Modal, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";

interface Consulta {
  id: number;
  paciente: string;
  data: string;
  diagnostico: string;
  // adicione os campos do seu objeto aqui
}

interface ConsultaModalProps {
  id: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsultaModal({ id, isOpen, onOpenChange }: ConsultaModalProps) {
  const [data, setData] = useState<Consulta | null>(null);
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
                    <p className="font-medium">{data.paciente}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Data</p>
                    <p className="font-medium">{data.data}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Diagnóstico</p>
                    <p className="font-medium">{data.diagnostico}</p>
                  </div>
                  {/* adicione mais campos conforme seu objeto */}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer>
              {({ close }) => (
                <Button onPress={close}>Fechar</Button>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}