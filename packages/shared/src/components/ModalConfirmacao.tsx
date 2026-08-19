import { Button, Modal } from "@heroui/react";

const ButtonVariant = ["primary", "danger"] as const;

type ButtonVariant = typeof ButtonVariant[number];

interface ModalConfirmacaoProps {
    onConfirm: () => void;
    disabled: boolean;
    texto: string;
    textoBotao: string;
    variant?: ButtonVariant;
}

export function ModalConfirmacao({ onConfirm, disabled, texto, textoBotao, variant = "primary" }: ModalConfirmacaoProps) {
    return (
        <Modal>
            <Button variant={variant} isDisabled={disabled}>{textoBotao}</Button>
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
                            <Button size="sm" className="w-full text-text-inverse" onClick={(e) => { e.preventDefault; onConfirm() }} slot="close">
                                Sim
                            </Button>
                            <Button variant="danger-soft" className="w-full" slot="close">
                                Não
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}