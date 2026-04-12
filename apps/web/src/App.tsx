import { Teste, ThemeProvider } from '@medora_web/shared'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import LoginScreen from './pages/LoginScreen/LoginScreen'

function App() {
  return (
    <>
      <ThemeProvider>
        <Teste/>
        <LoginScreen/>
      </ThemeProvider>
    </>
  )
}

export default App
