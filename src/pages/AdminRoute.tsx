import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import Admin from './Admin';

export default function AdminRoute() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    </AuthProvider>
  );
}
