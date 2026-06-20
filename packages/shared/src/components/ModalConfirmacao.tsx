import { Button, Modal } from "@heroui/react";

interface ModalConfirmacaoProps {
    onConfirm: () => void;
    disabled: boolean;
    texto: string;
    textoBotao: string;
}

export function ModalConfirmacao({ onConfirm, disabled, texto, textoBotao }: ModalConfirmacaoProps) {
    return (
        <Modal>
            <Button isDisabled={disabled} className="bg-primary disabled:bg-primary-disabled hover:bg-primary-hover text-inverse cursor-pointer px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm">{textoBotao}</Button>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="bg-surface">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading className="text-1.5xl font-semibold text-text-primary">{texto}</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button className="w-full text-text-inverse" onClick={(e) => { e.preventDefault; onConfirm() }} slot="close">
                                Continuar
                            </Button>
                            <Button variant="danger-soft" className="w-full" slot="close">
                                Cancelar
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}