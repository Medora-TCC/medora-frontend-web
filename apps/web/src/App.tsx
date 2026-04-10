import { Layout, Teste, ThemeProvider } from '@medora_web/shared'
import { RegisterPage } from './pages/RegiterPage/RegisterPage'


function App() {
  return (
    <>
      <ThemeProvider>
        <Layout>|
        <Teste/>
        <RegisterPage/>
        </Layout>
      </ThemeProvider>
    </>
  )
}

export default App
