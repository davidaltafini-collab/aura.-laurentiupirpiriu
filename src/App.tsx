import { ReactNode, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FloatingAboutButton from './components/FloatingAboutButton';
import LocaleLayout from './components/LocaleLayout';

const AboutMe = lazy(() => import('./pages/AboutMe'));
const Archive = lazy(() => import('./pages/Archive'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const AdminRoute = lazy(() => import('./pages/AdminRoute'));
const LoginRoute = lazy(() => import('./pages/LoginRoute'));

function LazyFallback() {
  return <div className="min-h-svh" />;
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LazyFallback />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LocaleLayout locale="en" />}>
          <Route index element={<Home />} />
          <Route path="about" element={<LazyPage><AboutMe /></LazyPage>} />
          <Route path="archive" element={<LazyPage><Archive /></LazyPage>} />
          <Route path="project/:id" element={<LazyPage><ProjectDetails /></LazyPage>} />
        </Route>
        <Route path="/en" element={<LocaleLayout locale="en" />}>
          <Route index element={<Home />} />
          <Route path="about" element={<LazyPage><AboutMe /></LazyPage>} />
          <Route path="archive" element={<LazyPage><Archive /></LazyPage>} />
          <Route path="project/:id" element={<LazyPage><ProjectDetails /></LazyPage>} />
        </Route>
        <Route path="/ro" element={<LocaleLayout locale="ro" />}>
          <Route index element={<Home />} />
          <Route path="about" element={<LazyPage><AboutMe /></LazyPage>} />
          <Route path="archive" element={<LazyPage><Archive /></LazyPage>} />
          <Route path="project/:id" element={<LazyPage><ProjectDetails /></LazyPage>} />
        </Route>
        <Route path="/admin" element={<LazyPage><AdminRoute /></LazyPage>} />
        <Route path="/login" element={<LazyPage><LoginRoute /></LazyPage>} />
      </Routes>
      <FloatingAboutButton />
    </Router>
  );
}
