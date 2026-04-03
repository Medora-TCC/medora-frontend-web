import {Button, Input, Teste, ThemeProvider } from '@medora_web/shared'

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
      <h1 className="text-2xl font-bold">Teste do Design System</h1>

      {/* 2. Use o componente Button com os estados que criamos! */}
      <Button>Botão Normal</Button>
      
      <Button isLoading={true}>Botão Carregando</Button>
      
      <Button disabled={true}>Botão Desativado</Button>
      <Input label="Nome" id="nome" />
    </div>
  )
}

export default App
