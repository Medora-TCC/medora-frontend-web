import { Button, Modal } from "@heroui/react";

interface ModalConfirmacaoProps {
    onConfirm: () => void;
    texto: string;
}

export function ModalConfirmacao({ onConfirm, texto }: ModalConfirmacaoProps) {
    return (
        <Modal>
            <Button className="bg-accent hover:bg-accent-hover text-white cursor-pointer px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-soft focus:ring-offset-2 focus:ring-offset-gray-50">Salvar</Button>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="bg-surface">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading className="text-1.5xl font-semibold">{texto}</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button className="w-full" onClick={(e) => { e.preventDefault; onConfirm() }} slot="close">
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