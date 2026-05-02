import { ThemeProvider, Layout, NotFound, HomePage } from "@medora_web/shared";
import { BrowserRouter, Route, Routes } from "react-router";
import { TermsOfUsePage } from "./pages/TermsOfUsePage/TermsOfUsePage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage/PrivacyPolicyPage";
import LoginScreen from "./pages/LoginScreen/LoginScreen";
import {RegisterPage} from "./pages/RegisterPage/RegisterPage";


function App() {
  return (
    <>
      <ThemeProvider>
          <BrowserRouter>
          <Routes>
          <Route element={<Layout />}>
            <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
            <Route path="/login" element={<LoginScreen />} />
          </Route>
        </Routes>
          </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
