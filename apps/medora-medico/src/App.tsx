import ConsultaScreen from './pages/ConsultaScreen/ConsultaScreen';
import { ThemeProvider, Layout, NotFound, ServerErrorPage, ConnectionErrorPage, ForgotPassword, VerifyEmailScreen } from "@medora_web/shared";
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
import { PrescriptionPage } from './pages/PrescriptionPage/PrescriptionPage';
import { SignaturePage } from './pages/SignaturePage/SignaturePage';
import { TeleconsultaLayout } from './pages/TeleconsultaScreen/TeleconsultaLayout';
import ResetPassword from '../../../packages/shared/src/pages/ResetPassword/ResetPassword';


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
                <Route path="prescricao" element={<PrescriptionPage />} />
                <Route path="assinatura" element={<SignaturePage />} />
                <Route path="perfil" element={<ProfessionalProfilePage />} />
                <Route path="teleconsulta" element={<TeleconsultaLayout />}>
                  <Route path=":id/pre-sala" element={<TeleConsultaConfig />} />
                  <Route path=":id/sala"     element={<SalaTeleConsulta />} />
                </Route>
                {/* <Route path='teleconsulta/:id/sala' element={<SalaTeleConsulta/>} /> */}
              </Route>

              <Route element={<Layout />}>
                  <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
                  <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
                  <Route path="/login" element={<LoginScreen />} />
                  <Route path="/cadastro" element={<RegisterPage />} />
                  <Route path='/esqueci-a-senha' element={<ForgotPassword/>}/>
                  <Route path='/verificar-email' element={<VerifyEmailScreen/>}/>
                  <Route path='/trocar-senha' element={<ResetPassword/>} />
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
