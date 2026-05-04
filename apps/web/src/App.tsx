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
        <BrowserRouter>
          <Routes >
            <Route element={<Layout />}>
              <Route path="/" />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
