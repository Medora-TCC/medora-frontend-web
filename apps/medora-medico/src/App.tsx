import ConsultaScreen from './pages/ConsultaScreen/ConsultaScreen';
import { ThemeProvider, Layout, NotFound, ServerErrorPage, ConnectionErrorPage } from "@medora_web/shared";
import { BrowserRouter, Route, Routes } from "react-router";
import { TermsOfUsePage } from "./pages/TermsOfUsePage/TermsOfUsePage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage/PrivacyPolicyPage";
import LoginScreen from "./pages/LoginScreen/LoginScreen";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import { HomePage } from "./pages/HomePage/HomePage";
import AvailabilityPage from "./pages/AvailabilityPage/AvailabilityPage";
import MainLayout from "./components/MainLayout/MainLayout";
import { AvailabilityHistorical } from "./pages/AvailabilityPage/AvailabilitySchedule";
import { MedicalRecordPage } from "./pages/MedicalRecordPage/MedicalRecordPage";
import ProfessionalProfilePage from "./pages/ProfessionalProfilePage/ProfessionalProfilePage";
import TeleConsultaConfig from './pages/TeleconsultaScreen/TeleConsultaConfig';
import SalaTeleConsulta from './pages/TeleconsultaScreen/SalaTeleconsulta';
import ConfigPage from './pages/ConfigPage/ConfigPage';

function App() {
  return (
    <>
      <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/medico" element={<MainLayout />}>
                <Route path="disponibilidade" element={< AvailabilityPage />} />
                <Route path="agenda" element={< AvailabilityHistorical />} />
                
                <Route path="configuracoes" element={<ConfigPage />} />
         
                <Route path="consulta" element={<ConsultaScreen/>} />
                <Route path="" element={<Dashboard />} />
                <Route path="prontuario" element={<MedicalRecordPage />} />
                <Route path="perfil" element={<ProfessionalProfilePage />} />

                <Route path='teleconsulta/:id/pre-sala' element={<TeleConsultaConfig/>} />
                <Route path='teleconsulta/:id/sala' element={<SalaTeleConsulta/>} />
              </Route>

              <Route element={<Layout />}>
                  <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
                  <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
                  <Route path="/login" element={<LoginScreen />} />
                  <Route path="/cadastro" element={<RegisterPage />} />
                  <Route path="/server-error" element={<ServerErrorPage />}/>
                  <Route path="/connection-error" element={<ConnectionErrorPage />}/>
                  <Route path="/" element={< HomePage  />} />
                  <Route path="*" element={<NotFound />} />
                  
              </Route>
             </Routes>
          </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
