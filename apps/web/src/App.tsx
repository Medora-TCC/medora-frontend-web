import { Teste, ThemeProvider } from '@medora_web/shared'
import TelaLogin from './pages/TelaLogin/TelaLogin'

function App() {
  return (
    <>
      <ThemeProvider>
        <Teste/>
        <TelaLogin/>
      </ThemeProvider>
    </>
  )
}

export default App
