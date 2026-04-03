import { useState } from "react";
import { Password } from 'primereact/password';

export default function TelaLogin() {
    const [value, setValue] = useState('');
    return (
        <div className="w-full flex justify-center items-center h-full ">
            <div className="bg-surface w-1/2">
                <h1 className="text-primary text-3xl">Login</h1>
                <div className="w-50">
                    <div className="card flex flex-col justify-content-center">
                        <label htmlFor="password">Password</label>
                        <Password
                            inputId="password" 
                            value={value} 
                            onChange={(e) => setValue(e.target.value)} 
                            feedback={false} 
                            toggleMask />
                    </div>
                </div>
            </div>
        </div>
    )
}


