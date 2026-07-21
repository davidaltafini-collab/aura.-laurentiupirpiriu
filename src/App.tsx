import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProjectDetails from './pages/ProjectDetails';
import AboutMe from './pages/AboutMe';
import Archive from './pages/Archive';
import FloatingAboutButton from './components/FloatingAboutButton';
import ProtectedRoute from './components/ProtectedRoute';
import LocaleLayout from './components/LocaleLayout';
import { AuthProvider } from './context/AuthContext';

// Încărcate lazy: sunt unelte interne (folosite doar de Laurentiu), nu are
// rost să umfle bundle-ul public descărcat de fiecare vizitator.
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));

function LazyFallback() {
  return <div className="min-h-svh" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LocaleLayout locale="ro" />}>
            <Route index element={<Home />} />
            <Route path="about" element={<AboutMe />} />
            <Route path="archive" element={<Archive />} />
            <Route path="project/:id" element={<ProjectDetails />} />
          </Route>
          <Route path="/en" element={<LocaleLayout locale="en" />}>
            <Route index element={<Home />} />
            <Route path="about" element={<AboutMe />} />
            <Route path="archive" element={<Archive />} />
            <Route path="project/:id" element={<ProjectDetails />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LazyFallback />}>
                  <Admin />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<LazyFallback />}>
                <Login />
              </Suspense>
            }
          />
        </Routes>
        <FloatingAboutButton />
      </Router>
    </AuthProvider>
  );
}
