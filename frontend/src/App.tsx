import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './pages/LandingPage';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplicantProfile from './pages/applicant/Profile';
import ApplicantHistory from './pages/applicant/History';

import EmployerDashboard from './pages/employer/Dashboard';
import EmployerProfile from './pages/employer/Profile';
import InternshipApplicants from './pages/employer/InternshipApplicants';
import EmployerHistory from './pages/employer/History';

import AdminDashboard from './pages/admin/Dashboard';

const RootRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'EMPLOYER') return <Navigate to="/employer" replace />;
  if (user?.role === 'APPLICANT') return <Navigate to="/applicant" replace />;
  return <LandingPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Applicant Routes */}
          <Route element={<ProtectedRoute allowedRoles={['APPLICANT']} />}>
            <Route element={<Layout />}>
              <Route path="/applicant" element={<ApplicantDashboard />} />
              <Route path="/applicant/history" element={<ApplicantHistory />} />
              <Route path="/applicant/profile" element={<ApplicantProfile />} />
            </Route>
          </Route>

          {/* Employer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYER']} />}>
            <Route element={<Layout />}>
              <Route path="/employer" element={<EmployerDashboard />} />
              <Route path="/employer/history" element={<EmployerHistory />} />
              <Route path="/employer/internships/:id/applicants" element={<InternshipApplicants />} />
              <Route path="/employer/profile" element={<EmployerProfile />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
