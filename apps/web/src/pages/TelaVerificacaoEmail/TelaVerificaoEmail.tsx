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
    }

    const onSubmit = () => { }

    const handleResend = () => {
        setTimeLeft(60);
    }

    return <div></div>
}