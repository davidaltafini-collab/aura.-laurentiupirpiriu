import { Project, projects as fallbackProjects } from '../data';

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects', { headers: { Accept: 'application/json' } });
    if (!res.ok) return fallbackProjects;

    const payload = await res.json() as { projects?: Project[] };
    if (Array.isArray(payload.projects) && payload.projects.length > 0) {
      return payload.projects;
    }
  } catch {
    return fallbackProjects;
  }

  return fallbackProjects;
}
