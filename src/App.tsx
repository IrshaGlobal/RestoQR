import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import CustomerMenu from './pages/CustomerMenu'
import StaffDashboard from './pages/StaffDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import FoodLanding from './pages/FoodLanding'
import DeliveryPage from './pages/DeliveryPage'
import AuthGuard from './components/AuthGuard'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/food" element={<FoodLanding />} />
        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/staff" 
          element={
            <AuthGuard requiredRole="staff">
              <StaffDashboard />
            </AuthGuard>
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            <AuthGuard requiredRole="admin">
              <AdminDashboard />
            </AuthGuard>
          } 
        />
        
        {/* Catch-all: redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
