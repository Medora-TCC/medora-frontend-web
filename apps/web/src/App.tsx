import {
  Layout,
  Maintenance,
  ThemeProvider
} from "@medora_web/shared";


function App() {
  return (
    <>
      <ThemeProvider>
        <Layout>
            <Maintenance/>
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default App;
