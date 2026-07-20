import { supabase, isSupabaseConfigured } from './supabaseClient';
import { uploadImageToCloudinary } from './cloudinary';
import { Project, projects as fallbackProjects } from '../data';

interface ProjectRow {
  id: string;
  slug: string;
  title_ro: string;
  title_en: string;
  location: string;
  event_date: string;
  cover_image_url: string;
  gallery_image_urls: string[];
  description_ro: string;
  description_en: string;
  featured: boolean;
  sort_order: number;
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    titleRo: row.title_ro,
    titleEn: row.title_en,
    location: row.location,
    date: row.event_date,
    coverImage: row.cover_image_url,
    gallery: row.gallery_image_urls ?? [],
    descriptionRo: row.description_ro,
    descriptionEn: row.description_en,
    featured: row.featured,
    sortOrder: row.sort_order,
  };
}

function projectToRow(project: Partial<Project>): Partial<ProjectRow> {
  const row: Partial<ProjectRow> = {};
  if (project.slug !== undefined) row.slug = project.slug;
  if (project.titleRo !== undefined) row.title_ro = project.titleRo;
  if (project.titleEn !== undefined) row.title_en = project.titleEn;
  if (project.location !== undefined) row.location = project.location;
  if (project.date !== undefined) row.event_date = project.date;
  if (project.coverImage !== undefined) row.cover_image_url = project.coverImage;
  if (project.gallery !== undefined) row.gallery_image_urls = project.gallery;
  if (project.descriptionRo !== undefined) row.description_ro = project.descriptionRo;
  if (project.descriptionEn !== undefined) row.description_en = project.descriptionEn;
  if (project.featured !== undefined) row.featured = project.featured;
  if (project.sortOrder !== undefined) row.sort_order = project.sortOrder;
  return row;
}

export async function fetchProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured) return fallbackProjects;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[projects] Eroare la citirea din Supabase, folosesc datele placeholder locale:', error.message);
    return fallbackProjects;
  }
  if (!data || data.length === 0) return fallbackProjects;

  return (data as ProjectRow[]).map(rowToProject);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `project-${Date.now()}`;
}

export async function createProject(): Promise<Project> {
  const slug = slugify(`proiect-nou-${Date.now()}`);
  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug,
      title_ro: 'Proiect Nou',
      title_en: 'New Project',
      location: 'Locație',
      event_date: 'Dată',
      cover_image_url: 'https://images.unsplash.com/photo-1518118014377-ceac5b906f0e?q=80&w=2070&auto=format&fit=crop',
      gallery_image_urls: [],
      description_ro: 'Descrierea proiectului vine aici.',
      description_en: 'Project description goes here.',
      featured: false,
      sort_order: 9999,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToProject(data as ProjectRow);
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<void> {
  const row = projectToRow(patch);
  const { error } = await supabase.from('projects').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderProjects(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('projects').update({ sort_order: index }).eq('id', id)
    )
  );
}

export async function uploadProjectImage(file: File): Promise<string> {
  return uploadImageToCloudinary(file);
}
