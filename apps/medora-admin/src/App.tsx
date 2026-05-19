import { NotFound, ThemeProvider } from '@medora_web/shared'
import { BrowserRouter, Route, Routes } from 'react-router'
import Dashboard from './pages/Dashboard/Dashboard'
import PatientList from './pages/PatientList/PatientList'
import PatientDetails from './pages/PatientDetails/PatientDetails'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/pacientes/:id" element={<PatientDetails />} />
          <Route path="/pacientes" element={<PatientList />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App