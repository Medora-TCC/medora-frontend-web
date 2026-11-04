import { Button, Modal } from "@heroui/react";
import type { JSX, ReactNode } from "react";
import type { MedicalRecordDTO } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";
import { MedicalRecordViewer } from "../../components/RichTextEditor/RichTextEditor";

interface MedicalRecordModalProps {
  medicalRecord: MedicalRecordDTO;
  /** Conteúdo do gatilho: o item inteiro da linha do tempo vira o botão que abre o modal. */
  children: ReactNode;
}

export function MedicalRecordModal({ medicalRecord, children }: MedicalRecordModalProps): JSX.Element {
  return (
    <Modal>
      <Button
        variant="ghost"
        className="h-auto min-h-0 w-full justify-start rounded-md px-2 py-1.5 text-left"
        aria-label={`Abrir ${medicalRecord.tipoConsulta} de ${medicalRecord.date}`}
      >
        {children}
      </Button>
      <Modal.Backdrop variant="opaque">
        <Modal.Container>
          <Modal.Dialog className="h-[90%] max-h-none w-[80%] max-w-none">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="w-full text-center">
                <h2 className="text-[20px] font-semibold">{medicalRecord.tipoConsulta}</h2>
                <p className="font-semibold text-muted">{medicalRecord.date}</p>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <MedicalRecordViewer json={medicalRecord.medicalRecord} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}