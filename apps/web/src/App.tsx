import { Teste, ThemeProvider } from '@medora_web/shared'
import { RegisterPage } from './pages/RegiterPage/RegisterPage'
import {  ToastProvider } from "@heroui/react";

function App() {
  return (
    <>
      <ThemeProvider>
        <Teste/>
        <RegisterPage/>
        <ToastProvider />
      </ThemeProvider>
    </>
  )
}

export default App
