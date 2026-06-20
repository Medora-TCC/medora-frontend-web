import { Layout, NotFound, ThemeProvider } from '@medora_web/shared'
import { BrowserRouter, Route, Routes } from 'react-router'
import MainLayout from './componentes/MainLayour'

function App() {
  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/medico" element={<MainLayout />}>
              {/* Aqui você pode adicionar as rotas específicas para o layout principal */}
            </Route>
          </Routes>

          <Route element={<Layout />}></Route>
            <Route path="/" />
            <Route path="*" element={<NotFound />} />
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
