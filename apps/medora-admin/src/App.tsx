import { Layout, NotFound, ThemeProvider } from '@medora_web/shared'
import { BrowserRouter, Route, Routes } from 'react-router'
import MainLayout from './componentes/MainLayour'
import UserManagementPage from './pages/ManageUsers/ManageUsers'

function App() {
  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<MainLayout />}>
              <Route path="manage-users" element={<UserManagementPage />} />
            </Route>
          
          <Route element={<Layout />}>
            <Route path="/" />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
