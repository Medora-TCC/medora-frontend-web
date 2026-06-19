import { Layout, NotFound, ThemeProvider } from '@medora_web/shared'
import { BrowserRouter, Route, Routes } from 'react-router'
import AdminLoginScreen from './pages/LoginScreen/LoginScreen' 
import Dashboard from './pages/Dashboard/Dashboard'
import WorkerLogs from './pages/WorkerLogs/WorkerLogs' 
import ProfilePage from './pages/ProfilePage/ProfilePage'
import ConfigPage from './pages/ConfigPage/ConfigPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLoginScreen />} />
          <Route element={<Layout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/logs" element={<WorkerLogs />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/admin/config" element={<ConfigPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App