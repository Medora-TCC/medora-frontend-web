import { Layout, ThemeProvider } from '@medora_web/shared'
import { TelaVerificacaoEmail } from './pages/TelaVerificacaoEmail/TelaVerificaoEmail'

function App() {
  return (
    <>
      <ThemeProvider>
        <Layout>
          <TelaVerificacaoEmail />
        </Layout>
      </ThemeProvider>
    </>
  )
}

export default App
