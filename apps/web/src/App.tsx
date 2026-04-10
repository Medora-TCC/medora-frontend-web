import {
  Layout,
  ThemeProvider,
  TelaVerificacaoEmail,
} from "@medora_web/shared";

function App() {
  return (
    <>
      <ThemeProvider>
        <Layout>
          <TelaVerificacaoEmail />
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default App;
