// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import HistoryPage from './pages/HistoryPage'
import UploadDetailPage from './pages/UploadDetailPage'
import PricingPage from './pages/PricingPage'
import ProfilePage from './pages/ProfilePage'

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicOnlyRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      {/* Private — inside app layout */}
      <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="/upload" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<UploadPage />} />
        <Route path=":uploadId" element={<UploadDetailPage />} />
      </Route>
      <Route path="/history" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<HistoryPage />} />
      </Route>
      <Route path="/profile" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
