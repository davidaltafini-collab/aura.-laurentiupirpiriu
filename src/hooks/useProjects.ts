import { useState, useEffect, useCallback } from 'react';
import { Project } from '../data';
import { fetchProjects, getCachedProjects } from '../lib/publicProjects';

interface UseProjectsOptions {
  immediateFallback?: boolean;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { immediateFallback = false } = options;
  const [projects, setProjects] = useState<Project[]>(() => immediateFallback ? getCachedProjects() : []);
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
