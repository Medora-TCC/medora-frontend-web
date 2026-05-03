import ConsultaScreen from './pages/ConsultasScreen/ConsultaScreen';
import { ThemeProvider, Layout, NotFound} from "@medora_web/shared";
import { BrowserRouter, Route, Routes } from "react-router";
import { TermsOfUsePage } from "./pages/TermsOfUsePage/TermsOfUsePage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage/PrivacyPolicyPage";
import LoginScreen from "./pages/LoginScreen/LoginScreen";
import {RegisterPage} from "./pages/RegisterPage/RegisterPage";
import { HomePage } from "./pages/HomePage/HomePage";
import AvailabilityPage from "./pages/AvailabilityPage/AvailabilityPage";
import MainLayout from "./components/MainLayout/MainLayout";
import { AvailabilityHistorical } from "./pages/AvailabilityPage/AvailabilityHistorical";

function App() {
  return (
    <>
      <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/agenda" element={< AvailabilityPage />} />
                <Route path="/agenda/historico" element={< AvailabilityHistorical />} />
         
                <Route path="consulta" element={<ConsultaScreen/>} />
              </Route>

              <Route element={<Layout />}>
                  <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
                  <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/login" element={<LoginScreen />} />
                  <Route path="/cadastro" element={<RegisterPage />} />
                  <Route path="/" element={< HomePage  />} />
              </Route>
              
             </Routes>
          </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
