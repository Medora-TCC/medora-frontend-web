import { Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { Activity, Stethoscope } from "lucide-react";
import { Carousel } from "@medora_web/shared";
import type React from "react";
import { useNavigate } from "react-router";

export default function LoginScreen() {

    const navigate = useNavigate();

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate('/medico/')
    }

    return (
        <div className="flex flex-col md:flex-row w-full max-w-7xl h-fit md:h-[90vh] bg-surface rounded-2xl shadow-2xl overflow-hidden m-4 border border-border mx-auto">
            <div className="bg-primary-color w-1/2 h-full p-15 flex-col items-center gap-5 hidden md:flex">
                <div id="login-panel-title" className="flex gap-2 h-full items-center justify-center">
                    <Stethoscope size={100} color="#ffffff" strokeWidth={1.75} />
                    <h1 className="font-bold text-4xl text-center text-white">Portal do Médico</h1>
                </div>
                <div id="login-panel-content" className="h-full flex flex-col gap-5 justify-evenly">
                    <p className="text-white text-center text-2xl">Acesse suas consultas, teleconsultas e prontuários em um único ambiente. <span className="font-bold">Seguro, fácil e rápido</span></p>
                    <div>

                        <Carousel
                            autoplayMs={20000}
                            bordered={false}
                            showControls
                            showProgress
                            showNav

                        >
                            <div className="p-8">
                                <h2>IMAGEM DO DASHBOARD</h2>
                                <p>IMAGEM</p>
                            </div>

                            <div className="p-8">
                                <h2>IMAGEM DO AGENDADOR DE CONSULTAS</h2>
                                <p>IMAGEM</p>
                            </div>

                            <div className="p-8">
                                <h2>IMAGEM DA TELECONSULTA</h2>
                                <p>IMAGEM</p>
                            </div>

                        </Carousel>

                    </div>
                </div>
            </div>
            <div className="md:w-1/2 flex flex-col h-full items-center">
                <div className="flex items-center gap-2 mt-20 justify-center">
                    <Activity size={48} color="#2563eb" strokeWidth={1.25} />
                    <h1 className="text-primary-color text-3xl font-bold">Medora</h1>
                </div>
                <div id="login-card" className="md:w-3/4 px-10 py-10 md:h-3/4 flex flex-col gap-5 items-center justify-center">
                    <div id="login-title" className="space-y-2">
                        <h1 className="text-center font-bold text-2xl text-primary-text ">Login</h1>
                        <p className="text-text-secondary text-sm text-center">Bem-vindo de volta! Por favor entre com suas credenciais</p>
                    </div>
                    <Form className="w-full flex flex-col gap-5" onSubmit={onSubmit}>
                        <TextField className="flex flex-col gap-1 w-full" name="email" type="email">
                            <Label className="text-text-muted ">Email</Label>
                            <Input className={"rounded-xl"} placeholder="" type="email" />
                            <FieldError>Insira um email válido</FieldError>
                        </TextField>
                        <TextField className="flex flex-col gap-1 w-full" name="senha" type="password">
                            <Label className="text-text-muted ">Senha</Label>
                            <Input className={"rounded-xl"} id="input-type-email" placeholder="" type="password" />
                            <FieldError>Insira um email válido</FieldError>
                        </TextField>
                        <div className="flex flex-col items-center gap-5 mt-5">
                            <Button
                                size="lg"
                                className={"w-45 rounded-xl"}
                                type="submit"
                            >
                                Entrar
                            </Button>
                            <a href="#" className="w-full text-[14px] text-center text-accent pr-1">Esqueci a senha</a>
                        </div>

                    </Form>

                </div>
                <div id="login-submit" className="flex flex-col items-center justify-center mt-5 gap-2">

                    <p className="text-text-muted text-[14px]">Não tem conta? <a href="/cadastro/" className="text-accent">Registre-se</a></p>
                </div>
            </div>
        </div>
    )




}