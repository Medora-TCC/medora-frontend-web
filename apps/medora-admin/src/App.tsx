import { NotFound, ThemeProvider } from '@medora_web/shared'
import { BrowserRouter, Route, Routes } from 'react-router'
import Dashboard from './pages/Dashboard/Dashboard'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Renderiza o Dashboard direto na página inicial sem travar no Layout antigo */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Mantém a rota de página não encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App