import { Form, Link, Button, Spinner, Alert, InputOTP, REGEXP_ONLY_DIGITS, ToastProvider, toast } from "@heroui/react";
import { CircleCheckBig, MailQuestionMark } from "lucide-react";
import { useEffect, useState } from "react"

export interface VerifyMfaScreenProps {
  onInitMfa: () => Promise<{ useAuthenticationApp: boolean; sentTo?: string }>;
  onVerify: (code: string, rememberDevice: boolean) => Promise<{ accessToken: string }>
  onComplete: (accessToken: string) => void;
}

export function VerifyMfaScreen({ onInitMfa, onVerify, onComplete }: VerifyMfaScreenProps) {
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [mfaData, setMfaData] = useState<{ useAuthenticationApp: boolean; sentTo?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    onInitMfa()
      .then((data) => {
        if (isMounted) setMfaData(data);
      })
      .catch(() => {
        if (isMounted) toast.danger("Falha ao inicializar verificação.");;
      });

    return () => { isMounted = false; };
  }, [onInitMfa]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const onSubmit = async () => {
    setIsValid(null);
    setIsVerifying(true);

    try {
      const response = await onVerify(code, true);
      setToken(response.accessToken);
      setIsValid(true);

    } catch (error) {
      setIsValid(false);
      setCode("");

    } finally {
      setIsVerifying(false);
    }
  }

  const handleResend = async () => {
    setTimeLeft(60);
    setIsValid(null);
    setCode("");

    toast.promise(onInitMfa, { error: "Falha ao enviar e-mail", loading: "Enviando e-mail...", success: "Email enviado com sucesso" })
  }

  if (!mfaData) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }

  return (<section className="min-h-screen flex flex-col items-center justify-center p-4">
    <ToastProvider maxVisibleToasts={1} placement="bottom" />
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
          onPress={() => token && onComplete(token)}
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
              {mfaData.useAuthenticationApp
                ? "Insira o código gerado pelo seu aplicativo autenticador."
                : <>Enviamos um código de 6 digitos para <br />
                  <span className="font-semibold text-text-primary">{mfaData.sentTo}</span>
                </>}
            </p>
          </div>

          <Form
            className="w-full max-w-sm mx-auto flex flex-col"
            render={(props) => <form {...props} />}
            onSubmit={(e) => { e.preventDefault(); onSubmit() }}
          >
            <div className="flex justify-center w-full mb-8">
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={code}
                onChange={setCode}
              >
                <InputOTP.Group className="flex gap-2 sm:gap-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTP.Slot
                      key={index}
                      index={index}
                      className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-text-primary bg-surface-raised border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                    />
                  ))}
                </InputOTP.Group>
              </InputOTP>
            </div>
            <Button
              type="submit"
              isDisabled={code.length < 6 || isVerifying}
              className="w-full bg-primary-color hover:bg-primary-hover text-text-inverse font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer flex justify-center items-center"
            >
              {isVerifying ? <Spinner color="current" /> : "Verificar código"}
            </Button>
          </Form>
          {!mfaData.useAuthenticationApp && (
            <div className="my-8 text-center text-sm">
              <p className="text-text-secondary">
                Não recebeu o email? {' '}
                {timeLeft > 0 ? (
                  <span>Reenviar em {timeLeft}s</span>
                ) : (
                  <Link onPress={handleResend} className="text-primary-color hover:text-primary-hover font-semibold transition-colors cursor-pointer">
                    Reenviar Agora
                  </Link>
                )}
              </p>
            </div>
          )}
        </div></>}
  </section>)
}
