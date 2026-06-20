import { Layout, NotFound, ThemeProvider } from '@medora_web/shared'
import { BrowserRouter, Route, Routes } from 'react-router'
import MainLayout from './componentes/MainLayour'
import AdminLoginScreen from './pages/LoginScreen/LoginScreen' 
import Dashboard from './pages/Dashboard/Dashboard'
import WorkerLogs from './pages/WorkerLogs/WorkerLogs' 
import ProfilePage from './pages/ProfilePage/ProfilePage'
import ConfigPage from './pages/ConfigPage/ConfigPage'
import UserManagementPage from './pages/ManageUsers/ManageUsers'

function App() {
  return (

    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLoginScreen />} />
          <Route path="/admin" element={<MainLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/admin/config" element={<ConfigPage />} />
            <Route path="/admin/manage-users" element={<UserManagementPage />} />
            </Route>
          <Route element={<Layout />}>

          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/admin/logs" element={<WorkerLogs />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>

  )
}

export default App