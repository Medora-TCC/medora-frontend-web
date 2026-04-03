import { useEffect, useRef, useState } from "react"

export function TelaVerificacaoEmail() {
    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (timeLeft < 0) {
            return;
        }

        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);

        return () => clearInterval(timer);

    }, [timeLeft]);

    const handleChange = (index: number, value: string) => {

        if (!/^[0-9]*$/.test(value)) {
            return;
        }

        const newCode = [...code];
        newCode[index] = value.substring(value.length - 1);
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === "Ctrl+V") {

        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {

        e.preventDefault();

        var data = e.clipboardData.getData("text");
        var formatedData = data.replace(/\D/g, '').substring(0, 6);

        if (!formatedData) {
            return;
        };

        const newCode = ['', '', '', '', '', '']

        formatedData.split('').forEach((char, i) => {
            newCode[i] = char;
        })

        setCode(newCode)

        const nextFocusIndex = formatedData.length < 6 ? formatedData.length : 5;
        inputRefs.current[nextFocusIndex]?.focus();
    }

    const onSubmit = () => { }

    const handleResend = () => {
        setTimeLeft(60);
    }

    return <section className="min-h-screen bg-surface-alt flex flex-col items-center justify-center p-4">
        <div className="bg-surface w-full max-w-md rounded-2xl shadow-xs border border-border p-4">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-subtle text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    Icone de email
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Verifique seu e-mail</h2>
                <p className="text-text-secondary text-sm">Enviamos um código de 6 digitos para <br />
                    <span className="font-semibold text-text-primary">user@teste.com</span>
                </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(), onSubmit() }}>
                <div className="flex justify-between gap-2 mb-8 px-4 ">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            // @ts-ignore
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="w-12 h-14 text-center text-2xl font-bold text-text-primary bg-surface-raised border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                            disabled={isVerifying}
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={code.join('').length < 6 || isVerifying}
                    className="w-full bg-primary hover:bg-primary-hover text-text-inverse font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isVerifying ? (
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    ) : ("Verificar Código")}
                </button>
            </form>

            <div className="mt-8 text-center text-sm">
                <p className="text-text-secondary">
                    Não recebeu o e-mail?{' '}
                    {timeLeft > 0 ?
                        (<span>Reenviar em {timeLeft}s</span>) :
                        (<button onClick={handleResend} className="text-primary hover:text-primary-hover font-semibold transition-colors cursor-pointer">
                            Reenviar agora
                        </button>)}
                </p>
            </div>
        </div>
    </section>
}