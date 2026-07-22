import { AuthProvider } from '../context/AuthContext';
import Login from './Login';

export default function LoginRoute() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}
