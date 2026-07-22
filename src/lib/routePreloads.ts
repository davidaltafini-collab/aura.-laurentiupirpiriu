import { Project } from '../data';

let aboutMePromise: Promise<typeof import('../pages/AboutMe')> | null = null;
let archivePromise: Promise<typeof import('../pages/Archive')> | null = null;
let projectDetailsPromise: Promise<typeof import('../pages/ProjectDetails')> | null = null;
let adminRoutePromise: Promise<typeof import('../pages/AdminRoute')> | null = null;
let loginRoutePromise: Promise<typeof import('../pages/LoginRoute')> | null = null;
const imagePreloads = new Map<string, Promise<void>>();

export function loadAboutMe() {
  aboutMePromise ??= import('../pages/AboutMe').catch(error => {
    aboutMePromise = null;
    throw error;
  });
  return aboutMePromise;
}

export function loadArchive() {
  archivePromise ??= import('../pages/Archive').catch(error => {
    archivePromise = null;
    throw error;
  });
  return archivePromise;
}

export function loadProjectDetails() {
  projectDetailsPromise ??= import('../pages/ProjectDetails').catch(error => {
    projectDetailsPromise = null;
    throw error;
  });
  return projectDetailsPromise;
}

export function loadAdminRoute() {
  adminRoutePromise ??= import('../pages/AdminRoute').catch(error => {
    adminRoutePromise = null;
    throw error;
  });
  return adminRoutePromise;
}

export function loadLoginRoute() {
  loginRoutePromise ??= import('../pages/LoginRoute').catch(error => {
    loginRoutePromise = null;
    throw error;
  });
  return loginRoutePromise;
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

export function preloadImage(src: string) {
  if (typeof window === 'undefined' || !src) return Promise.resolve();

  const existing = imagePreloads.get(src);
  if (existing) return existing;

  const promise = new Promise<void>(resolve => {
    const image = new Image();
    const done = () => resolve();

    image.decoding = 'async';
    image.onload = () => {
      if ('decode' in image) {
        image.decode().catch(() => undefined).then(done);
      } else {
        done();
      }
    };
    image.onerror = done;
    image.src = src;

    if (image.complete) done();
  });

  imagePreloads.set(src, promise);
  return promise;
}

export function preloadProjectAssets(project: Project) {
  void loadProjectDetails();
  void preloadImage(project.coverImage);
  project.gallery.slice(0, 2).forEach(src => void preloadImage(src));
}

export function warmPublicRoutes(delay = 3000) {
  if (typeof window === 'undefined') return () => {};

  const timers: number[] = [];
  let idleId: number | null = null;
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

  schedule(() => {
    idleId = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(warm, { timeout: 1200 })
      : null;

    if (idleId === null) warm();
  }, delay);

  return () => {
    if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId);
    timers.forEach(id => window.clearTimeout(id));
  };
}
