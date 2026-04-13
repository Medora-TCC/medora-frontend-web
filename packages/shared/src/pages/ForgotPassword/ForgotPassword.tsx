import { Button, Input, Label } from "@heroui/react";
import { ShieldPlus } from "lucide-react";

export default function ForgotPassword() {
  return (
    <div className="h-[calc(100vh-24px)] w-full p-5 flex items-center justify-center bg-surface">
      <div className="md:w-1/2 flex flex-col h-full items-center">
        <div className="flex items-center gap-2 my-4 justify-center">
          <ShieldPlus size={48} color="#2563eb" strokeWidth={1.25} />
          <h1 className="text-primary-color text-3xl font-bold">Medora</h1>
        </div>
        <div
          id="fpassword-card"
          className="bg-surface-alt md:w-3/4 px-10 py-10 rounded-xl md:h-1/2 flex flex-col items-center justify-evenly shadow-xl"
        >
          <div id="fpassword-title" className="space-y-2">
            <h1 className="text-center font-bold text-2xl text-text-primary">
              Recuperação de Senha
            </h1>
            <p className="text-text-muted text-sm text-center">
              Digite o email associado a sua conta.
            </p>
          </div>
          <div id="fpassword-inputs" className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="input-type-email" className="text-text-muted ">
                Email
              </Label>
              <Input
                className={"rounded-xl"}
                id="input-type-email"
                placeholder=""
                type="email"
              />
            </div>
          </div>
          <div
            id="fpassword-submit"
            className="flex flex-col items-center justify-center mt-5 gap-2"
          >
            <Button size="lg" className={"w-35 rounded-xl"}>
              Recuperar Senha
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
