import {
  Layout,
  NotFound,
  ThemeProvider
} from "@medora_web/shared";
import { BrowserRouter, Route, Routes } from "react-router";


function App() {
  return (
    <>
      <ThemeProvider>
        <Layout>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<h1></h1>}/>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default App;
