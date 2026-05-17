import { Button, Modal } from "@heroui/react";
import type { JSX } from "react";
import type { MedicalRecordDTO } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";
import { ArrowRight } from "lucide-react";
import { MedicalRecordViewer } from "../../components/RichTextEditor/RichTextEditor";

interface MedicalRecordModalProps {
    medicalRecord: MedicalRecordDTO;
}

export function MedicalRecordModal({ medicalRecord }: MedicalRecordModalProps): JSX.Element {
    return (
        <Modal>
            <Button className="col-span-1 row-span-2 my-auto hover:scale-105 transition-transform justify-self-end"> <ArrowRight /></Button>
            <Modal.Backdrop variant="opaque">
                <Modal.Container>
                    <Modal.Dialog className="w-[80%] max-w-none h-[90%] max-h-none">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading className="w-full text-center">
                                <h2 className="font-semibold text-[20px]">{medicalRecord.tipoConsulta}</h2>
                                <p className="font-semibold text-muted">{medicalRecord.date}</p>
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <MedicalRecordViewer json={medicalRecord.medicalRecord}/>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}