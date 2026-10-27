import { Layout, NotFound, ThemeProvider } from '@medora_web/shared'
import { BrowserRouter, Route, Routes } from 'react-router'
import MainLayout from './components/MainLayout/MainLayout'
import AdminLoginScreen from './pages/LoginScreen/LoginScreen'
import Dashboard from './pages/Dashboard/Dashboard'
import WorkerLogs from './pages/WorkerLogs/WorkerLogs'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import ConfigPage from './pages/ConfigPage/ConfigPage'
import UserManagementPage from './pages/ManageUsers/ManageUsers'
import PayoutsPage from './pages/Payouts/PayoutsPage'
import MfaPage from './pages/MfaPage/MfaPage'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (

    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AdminLoginScreen />} />
            <Route path="/mfa" element={<MfaPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<MainLayout />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
                <Route path="/admin/config" element={<ConfigPage />} />
                <Route path="/admin/manage-users" element={<UserManagementPage />} />
                <Route path="/admin/logs" element={<WorkerLogs />} />
                <Route path="/admin/payouts" element={<PayoutsPage />} />
              </Route>
            </Route>
            <Route element={<Layout />}>

            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>

  )
}

export default App
