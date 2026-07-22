import { useState, useEffect, useCallback } from 'react';
import { Project } from '../data';
import { fetchProjects } from '../lib/publicProjects';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await fetchProjects();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { projects, setProjects, loading, reload };
}
