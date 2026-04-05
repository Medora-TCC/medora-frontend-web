import { Form, Link, Button, Spinner, Alert, InputOTP, REGEXP_ONLY_DIGITS } from "@heroui/react";
import { CircleCheckBig, MailQuestionMark } from "lucide-react";
import { useEffect, useState } from "react"

export function TelaVerificacaoEmail() {

    const [code, setCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (timeLeft < 0) {
            return;
        }

        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);

        return () => clearInterval(timer);

    }, [timeLeft]);

    const onSubmit = async () => {
        setIsValid(null);
        setIsVerifying(true);
        await new Promise((resolve) => setTimeout(resolve, 2000))
        // TODO: Logica para verificacao
        // Mockando dados
        console.log(code);
        if (code !== "123456") {
            setIsVerifying(false)
            setIsValid(false);
            setCode("");
        } else {
            setIsValid(true);
        }
    }

    const handleResend = () => {
        setTimeLeft(60);
        setIsValid(null);
        setCode("");
        // TODO: Lógica para envio de email
    }

    return (<section className="min-h-screen bg-surface-alt flex flex-col items-center justify-center p-4">
        {isValid === true ?
            (<div className="bg-surface w-full max-w-md rounded-2xl shadow-xs border border-border p-4">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-subtle text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <CircleCheckBig size={35} className="text-success-text" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">E-mail verificado</h2>
                    <p className="text-text-secondary text-sm">
                        Seu e-email <span className="font-semibold text-text-primary">user@teste.com</span> foi verificado com sucesso
                    </p>
                </div>
                <Button
                    type="button"
                    className="w-full bg-primary-color hover:bg-primary-hover text-text-inverse font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer flex justify-center items-center"
                >
                    Continuar
                </Button>
            </div>) : <>
                {isValid === false && (
                    <Alert status="danger" className="absolute top-6 w-fit p-4 transform duration-150 animate-fade-in">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title className="font-semibold text-[16px]">Código inválido</Alert.Title>
                            <Alert.Description>Por favor, tente novamente.</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}

                <div className="bg-surface w-full max-w-md rounded-2xl shadow-xs border border-border p-4">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-subtle text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <MailQuestionMark size={35} />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">Verifique seu e-mail</h2>
                        <p className="text-text-secondary text-sm">Enviamos um código de 6 digitos para <br />
                            <span className="font-semibold text-text-primary">user@teste.com</span>
                        </p>
                    </div>

                    <Form className="" render={(props) => <form {...props} />} onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
                        <div className="flex justify-between gap-2 mb-8 px-4">
                            <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={code} onChange={setCode} className="mx-auto">
                                <InputOTP.Group>
                                    <InputOTP.Slot index={0} className="w-12 h-14 text-center text-2xl font-bold text-text-primary bg-surface-raised border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all" />
                                    <InputOTP.Slot index={1} className="w-12 h-14 text-center text-2xl font-bold text-text-primary bg-surface-raised border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all" />
                                    <InputOTP.Slot index={2} className="w-12 h-14 text-center text-2xl font-bold text-text-primary bg-surface-raised border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all" />
                                    <InputOTP.Slot index={3} className="w-12 h-14 text-center text-2xl font-bold text-text-primary bg-surface-raised border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all" />
                                    <InputOTP.Slot index={4} className="w-12 h-14 text-center text-2xl font-bold text-text-primary bg-surface-raised border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all" />
                                    <InputOTP.Slot index={5} className="w-12 h-14 text-center text-2xl font-bold text-text-primary bg-surface-raised border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all" />
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
                    <div className="my-8 text-center text-sm">
                        <p className="text-text-secondary">
                            Não recebeu o email? {' '}
                            {timeLeft > 0 ?
                                (<span>Reenviar em {timeLeft}s</span>) :
                                (<Link onClick={handleResend} className="text-primary-color hover:text-primary-hover font-semibold transition-colors cursor-pointer">
                                    Reenviar Agora
                                </Link>)
                            }
                        </p>
                    </div>
                </div></>}
    </section>)
}
