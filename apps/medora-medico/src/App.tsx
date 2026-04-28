import { ThemeProvider, Layout, NotFound } from '@medora_web/shared'
import { BrowserRouter, Route, Routes } from 'react-router';
import { TeleconsultaScreen } from './pages/TeleconsultaScreen/TeleconsultaScreen';

function App() {
  return (
    <>
    <ThemeProvider>
        <Layout>
          <BrowserRouter>
            <Routes>
              <Route path="/"/>
              <Route path="*" element={<NotFound />} />
              <Route path="teleconsulta" element={<TeleconsultaScreen/>} />
            </Routes>
          </BrowserRouter>
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default App;