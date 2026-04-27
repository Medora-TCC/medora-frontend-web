import { ThemeProvider, Layout, NotFound } from "@medora_web/shared";
import { BrowserRouter, Route, Routes } from "react-router";
import { TermsOfUsePage } from "./pages/TermsOfUsePage/TermsOfUsePage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage/PrivacyPolicyPage";

function App() {
  return (
    <>
      <ThemeProvider>
        <Layout>
          <BrowserRouter>
            <Routes>
              <Route path="/" />
              <Route path="termos-de-uso" element={<TermsOfUsePage />} />
              <Route path="politica-de-privacidade" element={<PrivacyPolicyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default App;
