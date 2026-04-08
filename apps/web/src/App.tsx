import { Teste, ThemeProvider } from '@medora_web/shared'
import { RegisterPage } from './pages/RegiterPage/RegisterPage'

function App() {
  return (
    <>
      <ThemeProvider>
        <Teste/>
        <RegisterPage/>
      </ThemeProvider>
    </>
  )
}

export default App
