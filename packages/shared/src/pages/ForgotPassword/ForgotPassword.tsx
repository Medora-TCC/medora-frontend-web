import { useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { Activity, AlertCircle, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";

interface ForgotPasswordProps {
  handleSend: (email: string) => Promise<void>;
}

export function ForgotPassword({ handleSend }: ForgotPasswordProps) {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      setIsLoading(true);
      await handleSend(email);
      navigate("/trocar-senha");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ocorreu um erro ao tentar recuperar a senha. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-24px)] w-full p-5 flex items-center justify-center bg-surface">
      <div className="absolute top-0 left-0 m-5">
        <Link to="/login" className="text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft />
        </Link>
      </div>

      <div className="md:w-1/2 flex flex-col h-full items-center">
        <div className="flex items-center gap-2 my-4 justify-center">
          <Activity size={48} className="text-accent" strokeWidth={1.25} />
          <h1 className="text-primary-color text-3xl font-bold">Medora</h1>
        </div>

        <div
          id="fpassword-card"
          className="bg-surface-alt md:w-3/4 px-10 py-10 rounded-xl flex flex-col items-center gap-6 shadow-2xl"
        >
          <div id="fpassword-title" className="space-y-2 text-center">
            <h1 className="font-bold text-2xl text-text-primary">
              Recuperação de Senha
            </h1>
            <p className="text-text-muted text-sm">
              Digite o email associado à sua conta.
            </p>
          </div>

          {/* Banner de erro da API */}
          {errorMessage && (
            <div className="w-full flex items-center gap-2 p-3 text-sm rounded-lg bg-danger/10 border border-danger/20 text-danger animate-in fade-in duration-200">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div id="fpassword-inputs" className="w-full">
            <Form className="w-full flex flex-col gap-5" onSubmit={onSubmit}>
              <TextField
                className="flex flex-col gap-1 w-full"
                name="email"
                type="email"
                isRequired
                isDisabled={isLoading}
                isInvalid={Boolean(errorMessage)}
              >
                <Label className="text-text-muted text-sm">Email</Label>
                <Input
                  className="rounded-xl"
                  placeholder="exemplo@medora.com"
                  type="email"
                  onChange={() => errorMessage && setErrorMessage(null)}
                />
                <FieldError>
                  {({ validationDetails }) =>
                    validationDetails.valueMissing
                      ? "Email é obrigatório"
                      : "Insira um email válido"
                  }
                </FieldError>
              </TextField>

              <div className="w-full flex flex-col items-center gap-5 mt-3">
                <Button
                  size="lg"
                  className="w-full md:w-48 rounded-xl"
                  type="submit"
                  isDisabled={isLoading}
                >
                  Recuperar Senha
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}