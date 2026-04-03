import { Input } from "@medora_web/shared";

export default function TelaLogin(){
    return(
        <div className="w-full flex justify-center items-center h-full ">
            <div className="bg-surface w-1/2">
                <h1 className="text-primary text-3xl">Login</h1>
                <div className="w-50">
                    <Input label="Email"/>
                    <Input label="Senha"/>
                </div>
            </div>
        </div>
    )
}