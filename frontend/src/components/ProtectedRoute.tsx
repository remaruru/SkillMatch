import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: ('APPLICANT' | 'EMPLOYER' | 'ADMIN')[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboard if they try to access unauthorized route
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (user.role === 'EMPLOYER') return <Navigate to="/employer" replace />;
        return <Navigate to="/applicant" replace />;
    }

    return <Outlet />;
}
