import ConsultaScreen from './pages/ConsultaScreen/ConsultaScreen';
import { ThemeProvider, Layout, NotFound, ServerErrorPage, ConnectionErrorPage } from "@medora_web/shared";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
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
import TeleConsultaConfig from './pages/TeleconsultaScreen/TeleConsultaConfig';
import SalaTeleConsulta from './pages/TeleconsultaScreen/SalaTeleconsulta';
import { PrescriptionPage } from './pages/PrescriptionPage/PrescriptionPage';
import { SignaturePage } from './pages/SignaturePage/SignaturePage';
import { TeleconsultaLayout } from './pages/TeleconsultaScreen/TeleconsultaLayout';
import FinancialManagement from './pages/FinancialManagementPage/FinancialManagement';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import MfaPage from './pages/MfaPage/MfaPage';
import VerifyEmailPage from './pages/VerifyEmailPage/VerifyEmailPage';
import BackupLoginPage from './pages/BackupLoginPage/BackupLoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import AccountLayout from './pages/AccountPage/AccountLayout';
import PersonalDataSection from './pages/AccountPage/sections/PersonalDataSection';
import ProfessionalDataSection from './pages/AccountPage/sections/ProfessionalDataSection';
import SecuritySection from './pages/AccountPage/sections/SecuritySection';

function App() {
  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/medico" element={<MainLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="disponibilidade" element={<AvailabilityPage />} />
                  <Route path="agenda" element={<AvailabilityHistorical />} />
                  <Route path="consulta" element={<ConsultaScreen />} />
                  <Route path="prontuario" element={<MedicalRecordPage />} />
                  <Route path="prescricao" element={<PrescriptionPage />} />
                  <Route path="assinatura" element={<SignaturePage />} />
                  <Route path="financeiro" element={<FinancialManagement />} />

                  <Route path="conta" element={<AccountLayout />}>
                    <Route index element={<Navigate to="dados-pessoais" replace />} />
                    <Route path="dados-pessoais" element={<PersonalDataSection />} />
                    <Route path="dados-profissionais" element={<ProfessionalDataSection />} />
                    <Route path="seguranca" element={<SecuritySection />} />
                  </Route>

                  <Route path="perfil" element={<Navigate to="/medico/conta/dados-pessoais" replace />} />
                  <Route path="configuracoes" element={<Navigate to="/medico/conta/seguranca" replace />} />

                  <Route path="teleconsulta" element={<TeleconsultaLayout />}>
                    <Route path=":id/pre-sala" element={<TeleConsultaConfig />} />
                    <Route path=":id/sala" element={<SalaTeleConsulta />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<Layout />}>
                <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
                <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/cadastro" element={<RegisterPage />} />
                <Route path="/esqueci-a-senha" element={<ForgotPasswordPage />} />
                <Route path="/mfa" element={<MfaPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/backup-code" element={<BackupLoginPage />} />
                <Route path="/trocar-senha" element={<ResetPasswordPage />} />
                <Route path="/server-error" element={<ServerErrorPage />} />
                <Route path="/connection-error" element={<ConnectionErrorPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;