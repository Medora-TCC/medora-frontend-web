import { Button, Input, Label } from "@heroui/react";
import { ShieldPlus, Stethoscope } from "lucide-react";
import { useState } from "react";

export default function LoginScreen() {
    return (
        <div className="h-full p-10 flex items-center justify-center bg-surface">
            <div className="p-5 w-1/2 h-full flex flex-col items-center gap-15">
                <div className="flex items-center gap-2 justify-center">
                    <Stethoscope size={48} color="#2563eb" strokeWidth={1.25} />
                    <h1 className="text-primary-color text-3xl font-bold">Medora</h1>
                </div>
                <div id="login-card" className="bg-surface-alt w-full px-10 rounded h-150 flex flex-col items-center justify-evenly">
                    <div id="login-title" className="">
                        <h1 className="text-center font-bold text-2xl text-text-primary">Login</h1>
                        <p className="text-text-muted text-sm text-center">Bem-vindo de volta! Por favor entre com suas credenciais</p>
                    </div>
                    <div id="login-inputs" className="w-full h-full flex flex-col gap-20">
                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="input-type-email">Email</Label>
                            <Input className={"w-full rounded"} id="input-type-email" placeholder="jane@example.com" type="email" />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="input-type-password">Password</Label>
                            <Input className={"w-full rounded"} id="input-type-password" placeholder="••••••••" type="password" />
                        </div>
                        <a href="#" className="w-full text-right text-accent">Esqueci a senha</a>
                    </div>
                    <div id="login-submit">
                        <Button
                            size="lg"
                            className={"w-35 rounded"}
                        >Entrar</Button>
                        <p>Não tem conta? <a href="#" className="text-accent">Resgistre-se</a></p>
                    </div>
                </div>
            </div>
            <div className="bg-primary-color w-1/2 rounded h-full">
                <h1 className="">o</h1>
            </div>
        </div>
    )




}