import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, staffOnly = false }) => {
  const { user, isStaff } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  if (staffOnly && !isStaff(user)) {
    // Redirect to dashboard if user doesn't have staff access
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;