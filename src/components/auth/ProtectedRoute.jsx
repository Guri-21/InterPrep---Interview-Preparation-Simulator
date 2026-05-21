import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import Spinner from '@/components/ui/Spinner.jsx';

/**
 * Route guard. Redirects unauthenticated users to /login, and (optionally)
 * non-admins to /dashboard for admin-only routes.
 *
 *   <Route element={<ProtectedRoute />}>           // any authenticated user
 *   <Route element={<ProtectedRoute admin />}>     // admin-only
 */
export default function ProtectedRoute({ admin = false, children }) {
  const { status, isAdmin } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Spinner label="Restoring session…" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (admin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children || null;
}
