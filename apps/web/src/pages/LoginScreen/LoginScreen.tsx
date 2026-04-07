import { Button, Input, Label } from "@heroui/react";
import { ShieldPlus, Stethoscope } from "lucide-react";
import { useState } from "react";

export default function LoginScreen() {
    return (
        <div className="h-[calc(100vh-24px)] w-full p-5 flex items-center justify-center bg-surface">
            <div className="md:w-1/2 flex flex-col h-full items-center">
                <div className="flex items-center gap-2 my-4 justify-center">
                    <ShieldPlus size={48} color="#2563eb" strokeWidth={1.25} />
                    <h1 className="text-primary-color text-3xl font-bold">Medora</h1>
                </div>
                <div id="login-card" className="bg-surface-alt md:w-3/4 px-10 py-10 rounded md:h-3/4 flex flex-col gap-5 items-center justify-center">
                    <div id="login-title" className="space-y-2">
                        <h1 className="text-center font-bold text-2xl text-text-primary">Login</h1>
                        <p className="text-text-muted text-sm text-center">Bem-vindo de volta! Por favor entre com suas credenciais</p>
                    </div>
                    <div id="login-inputs" className="w-full flex flex-col gap-5">
                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="input-type-email" className="text-text-muted ">Email</Label>
                            <Input className={"rounded"} id="input-type-email" placeholder="" type="email" />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="input-type-password" className="text-text-muted">Senha</Label>
                            <Input className={"rounded"} id="input-type-password" placeholder="" type="password" />
                        </div>
                        <a href="#" className="w-full text-[14px] text-right text-accent pr-1">Esqueci a senha</a>
                    </div>
                    <div id="login-submit" className="flex flex-col items-center justify-center mt-5 gap-2">
                        <Button
                            size="lg"
                            className={"w-35 rounded"}
                        >Entrar</Button>
                        <p className="text-text-muted text-[14px]">Não tem conta? <a href="#" className="text-accent">Registre-se</a></p>
                    </div>
                </div>
            </div>
            <div className="bg-primary-color w-1/2 rounded h-full p-15 flex-col items-center gap-5 hidden md:flex">
                <div id="login-panel-title" className="flex gap-2 h-full items-center justify-center">
                    <Stethoscope size={100} color="#ffffff" strokeWidth={1.75}  />
                    <h1 className="font-bold text-4xl text-center text-white">Portal do Médico</h1>
                </div>
                <div id="login-panel-content" className="h-full">
                    <p className="text-white text-center">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Qui voluptate et, iure adipisci, dolorem autem asperiores consequatur veritatis consectetur voluptatibus esse, quis molestias. Architecto alias perferendis non veritatis quos sunt!</p>
                </div>
            </div>
        </div>
    )




}