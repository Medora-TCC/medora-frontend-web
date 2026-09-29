import { Alert, Button, Form, Input, Spinner } from "@heroui/react";
import { CircleCheckBig, MailQuestionMark } from "lucide-react";
import { JSX, useState } from "react";

interface BackupLoginProps {
  handleVerify: (code: string) => Promise<{ accessToken: string }>;
  handleComplete: (accessToken: string) => void;
}

export function BackupLogin({ handleVerify, handleComplete }: BackupLoginProps): JSX.Element {

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const onSubmit = async () => {
    setIsValid(null);
    setIsVerifying(true);

    try {
      const response = await handleVerify(code);
      setToken(response.accessToken);
      setIsValid(true);

    } catch (error) {
      setIsValid(false);
      setCode("");

    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-4">
      {isValid === true ?
        (<div className="bg-surface w-full max-w-md rounded-2xl shadow-xs border border-border p-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-subtle text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CircleCheckBig size={35} className="text-success-text" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Verificado com sucesso</h2>
            <p className="text-text-secondary text-sm">
              Sua identidade foi confirmada.
            </p>
          </div>
          <Button
            type="button"
            className="w-full bg-primary-color hover:bg-primary-hover text-text-inverse font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer flex justify-center items-center"
            onPress={() => token && handleComplete(token)}
          >
            Continuar
          </Button>
        </div>
        ) : <>
          {isValid === false && (
            <Alert status="danger" className="absolute top-6 w-fit p-4 transform duration-150 animate-fade-in">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title className="font-semibold text-[16px]">Código inválido</Alert.Title>
                <Alert.Description>Por favor, tente novamente.</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xs border border-border p-2 sm:p-4">
            <div className="text-center mb-8 mt-2">
              <div className="w-16 h-16 bg-primary-subtle text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MailQuestionMark size={35} />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Verifique sua identidade</h2>
              <p className="text-text-secondary text-sm">
                Insira o código de backup
                <span className="font-bold block">Atenção! Ao utilizar um dos códigos de backup, o acesso será autorizado apenas para esta seção e o código deixará de ser válido</span>
              </p>
            </div>

            <Form
              className="w-full max-w-sm mx-auto flex flex-col"
              render={(props) => <form {...props} />}
              onSubmit={(e) => { e.preventDefault(); onSubmit() }}
            >
              <div className="flex justify-center w-full mb-8">
                <Input
                  type="text"
                  variant="secondary"
                  className="w-full"
                  min={16}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Digite seu código"
                />
              </div>
              <Button
                type="submit"
                isDisabled={code.length < 16 || isVerifying}
                className="w-full bg-primary-color hover:bg-primary-hover text-text-inverse font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer flex justify-center items-center"
              >
                {isVerifying ? <Spinner color="current" /> : "Verificar código"}
              </Button>
            </Form>
          </div></>}

    </section>
  );
}