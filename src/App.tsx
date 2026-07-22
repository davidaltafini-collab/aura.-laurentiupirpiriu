import { ReactNode, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FloatingAboutButton from './components/FloatingAboutButton';
import LocaleLayout from './components/LocaleLayout';
import BrandedRouteLoader from './components/BrandedRouteLoader';
import { loadAboutMe, loadAdminRoute, loadArchive, loadLoginRoute, loadProjectDetails } from './lib/routePreloads';

const AboutMe = lazy(loadAboutMe);
const Archive = lazy(loadArchive);
const ProjectDetails = lazy(loadProjectDetails);
const AdminRoute = lazy(loadAdminRoute);
const LoginRoute = lazy(loadLoginRoute);

function LazyFallback() {
  return <BrandedRouteLoader />;
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
