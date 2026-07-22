import { Project, projects as fallbackProjects } from '../data';

let cachedProjects: Project[] | null = null;

export function getCachedProjects() {
  return cachedProjects ?? fallbackProjects;
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects', { headers: { Accept: 'application/json' } });
    if (!res.ok) return cachedProjects ?? fallbackProjects;

    const payload = await res.json() as { projects?: Project[] };
    if (Array.isArray(payload.projects) && payload.projects.length > 0) {
      cachedProjects = payload.projects;
      return cachedProjects;
    }
  } catch {
    return cachedProjects ?? fallbackProjects;
  }

  return cachedProjects ?? fallbackProjects;
}
