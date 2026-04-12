import {Layout, ThemeProvider } from '@medora_web/shared'
import LoginScreen from './pages/LoginScreen/LoginScreen'

function App() {
  return (
    <>
      <ThemeProvider>
        <Layout>
          <LoginScreen/>
        </Layout>
      </ThemeProvider>
    </>
  )
}

export default App
