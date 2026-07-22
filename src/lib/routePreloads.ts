export function loadAboutMe() {
  return import('../pages/AboutMe');
}

export function loadArchive() {
  return import('../pages/Archive');
}

export function loadProjectDetails() {
  return import('../pages/ProjectDetails');
}

export function loadAdminRoute() {
  return import('../pages/AdminRoute');
}

export function loadLoginRoute() {
  return import('../pages/LoginRoute');
}

export function preloadAboutMe() {
  void loadAboutMe();
}

export function preloadArchive() {
  void loadArchive();
}

export function preloadProjectDetails() {
  void loadProjectDetails();
}

export function warmPublicRoutes() {
  if (typeof window === 'undefined') return () => {};

  const timers: number[] = [];
  const idleWindow = window as typeof window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  const schedule = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timers.push(id);
  };

  const warm = () => {
    preloadProjectDetails();
    schedule(preloadArchive, 700);
    schedule(preloadAboutMe, 1300);
  };

  const idleId = idleWindow.requestIdleCallback
    ? idleWindow.requestIdleCallback(warm, { timeout: 1200 })
    : null;

  if (idleId === null) schedule(warm, 450);

  return () => {
    if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId);
    timers.forEach(id => window.clearTimeout(id));
  };
}
