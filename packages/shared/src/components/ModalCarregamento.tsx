import { Modal, Spinner } from "@heroui/react";

interface ModalCarregamentoProps {
  isLoading: boolean;
  texto: string
}

export function ModalCarregamento({isLoading, texto} : ModalCarregamentoProps) {
  return (
  <Modal>
    <Modal.Backdrop
      isOpen={isLoading}
      isDismissable={false}
      isKeyboardDismissDisabled
      variant="blur"
    >
      <Modal.Container>
        <Modal.Dialog aria-label="Carregando">
          <Modal.Body className="flex flex-col items-center justify-center gap-3 py-8">
            <Spinner />
            <span>{texto}</span>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>)
}