import {
  Layout,
  Teste,
  ThemeProvider
} from "@medora_web/shared";


function App() {
  return (
    <>
      <ThemeProvider>
        <Layout>
          <Teste />
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default App;
