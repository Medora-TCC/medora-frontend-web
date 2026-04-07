import { Teste, ThemeProvider } from '@medora_web/shared'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'

function App() {
  return (
    <>
      <ThemeProvider>
        <Teste/>
        <ForgotPassword/>
      </ThemeProvider>
    </>
  )
}

export default App
