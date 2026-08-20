import { Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { Activity } from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router";

export default function AdminLoginScreen() {

    const navigate = useNavigate();

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate('/admin/')
    }

    return (
        <div className="h-[calc(100vh-24px)] w-full p-5 flex items-center justify-center bg-surface">
            <div className="md:w-1/2 flex flex-col h-full items-center">
                <div className="flex items-center gap-2 my-4 justify-center">
                    <Activity size={48} color="#2563eb" strokeWidth={1.25} />
                    <h1 className="text-primary-color text-3xl font-bold">Medora</h1>
                </div>
                
                <div id="login-card" className="bg-surface-alt md:w-3/4 px-10 py-10 shadow-xl rounded-xl md:h-3/4 flex flex-col gap-5 items-center justify-center">
                    <div id="login-title" className="space-y-2">
                        <h1 className="text-center font-bold text-2xl text-text-primary">Acesso Restrito</h1>
                        <p className="text-text-muted text-sm text-center">Painel administrativo. Insira suas credenciais para continuar.</p>
                    </div>
                    
                    <Form className="w-full flex flex-col gap-5" onSubmit={onSubmit}>
                        <TextField className="flex flex-col gap-1 w-full" name="email" type="email">
                            <Label className="text-text-muted">Email Corporativo</Label>
                            <Input className={"rounded-xl"} placeholder="admin@medora.com.br" type="email" />
                            <FieldError>Insira um email válido</FieldError>
                        </TextField>
                        
                        <TextField className="flex flex-col gap-1 w-full" name="senha" type="password">
                            <Label className="text-text-muted">Senha de Acesso</Label>
                            <Input className={"rounded-xl"} id="input-type-email" placeholder="••••••••" type="password" />
                            <FieldError>Insira uma senha válida</FieldError>
                        </TextField>
                        
                        <div className="flex flex-col items-center gap-5 mt-5">
                            <Button
                                size="lg"
                                className={"w-45 rounded-xl bg-primary-color text-white font-bold"}
                                type="submit"
                            >
                                Entrar no Painel
                            </Button>
                            <a href="#" className="w-full text-[14px] text-center text-accent pr-1">Esqueci a senha</a>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
}