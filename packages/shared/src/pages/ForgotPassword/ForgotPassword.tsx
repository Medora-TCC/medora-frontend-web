import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { Activity, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function ForgotPassword() {
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("../verificar-email");
  };

  return (
    <div className="h-[calc(100vh-24px)] w-full p-5 flex items-center justify-center bg-surface">
      <div className="absolute top-0 left-0 m-5">
        <a href="login">
          <ArrowLeft />
        </a>
      </div>
      <div className="md:w-1/2 flex flex-col h-full items-center">
        <div className="flex items-center gap-2 my-4 justify-center">
          <Activity size={48} className="text-accent" strokeWidth={1.25} />
          <h1 className="text-primary-color text-3xl font-bold">Medora</h1>
        </div>
        <div
          id="fpassword-card"
          className="bg-surface-alt md:w-3/4 px-10 py-10 rounded-xl md:h-1/2 flex flex-col items-center justify-evenly shadow-2xl"
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
              <Form className="w-full flex flex-col gap-5" onSubmit={onSubmit}>
                <TextField
                  className="flex flex-col gap-1 w-full"
                  name="email"
                  type="email"
                  isRequired
                >
                  <Label className="text-text-muted ">Email</Label>
                  <Input className={"rounded-xl"} placeholder="" type="email" />
                  <FieldError>
                    {({ validationDetails }) =>
                    validationDetails.valueMissing
                        ? "Email é obrigatório"
                        : "Insira um email válido"
                    }
                </FieldError>
                </TextField>
                <div className="w-full flex flex-col items-center gap-5 mt-5">
                  <Button size="lg" className={"w-45 rounded-xl"} type="submit">
                    Recuperar Senha
                  </Button>
                </div>
              </Form>
            </div>
          </div>
          <div
            id="fpassword-submit"
            className="flex flex-col items-center justify-center mt-5 gap-2"
          >
            {/* <Button
              size="lg"
              className={"w-35 rounded-xl"}
              onPress={(e) => {
                e.continuePropagation?.();
                handleSend(navigate);
              }}
            >
              Recuperar Senha
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
