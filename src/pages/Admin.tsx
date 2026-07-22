import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, Plus, LogOut, Star, GripVertical, Save, Mail, Loader2, CheckCircle2, Circle, Undo } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Project } from '../data';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import {
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  uploadProjectImage,
} from '../lib/projects';
import { compressImage } from '../lib/imageCompress';
import { fetchLeads, updateLeadStatus, Lead } from '../lib/leads';
import BrandLockup from '../components/BrandLockup';
import { scrollToPageTop } from '../lib/scroll';

// ─── Selector de dată: lună (RO) + an ────────────────────────────────────────
// Câmpul `date` e un text afișat direct pe site (ex. „Septembrie 2026"), nu o
// dată calendaristică precisă. Un `type="date"` ar sparge formatul și datele
// existente, deci folosim două select-uri care produc exact același string.
const RO_MONTHS = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 4 + i);

function parseProjectDate(value: string): { month: string; year: string } {
  const match = value.trim().match(/^(\p{L}+)\s+(\d{4})$/u);
  if (match && RO_MONTHS.includes(match[1])) return { month: match[1], year: match[2] };
  return { month: '', year: '' };
}

function ProjectReorderItem({
  project,
  isSelected,
  onSelect,
  onToggleFeatured,
}: {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFeatured: (e: React.MouseEvent, project: Project) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`text-left px-6 py-5 rounded-[2rem] transition-colors duration-300 flex items-center gap-4 cursor-pointer select-none relative ${
        isSelected
          ? 'bg-black text-white shadow-xl'
          : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
      } ${isDragging ? 'opacity-80 shadow-2xl' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-lg truncate">{project.titleRo}</div>
        <div className="text-sm mt-1 text-gray-400 truncate">{project.location}</div>
      </div>
      <div className="flex flex-col gap-2 items-center text-gray-400">
        <button onClick={(e) => onToggleFeatured(e, project)} className={`hover:text-yellow-500 transition-colors ${project.featured ? 'text-yellow-400' : ''}`}>
          <Star size={18} fill={project.featured ? 'currentColor' : 'none'} />
        </button>
        {/* Mânerul de drag. `touch-none` blochează scroll-ul doar când degetul e
            pe mâner (zonă mică), ca reordonarea să fie fluidă pe telefon. */}
        <div
          className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 p-3 -m-1 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </div>
      </div>
    </div>
  );
}

function SortableGalleryItem({
  img,
  index,
  isSelected,
  onToggle,
}: {
  img: string;
  index: number;
  isSelected: boolean;
  onToggle: (e: React.MouseEvent, index: number, img: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  // Toată poza e trasabilă (drag) ȘI selectabilă (click). Pe touch, TouchSensor
  // are delay: swipe = scroll, apăsare lungă = mută poza, tap = selectează.
  // Copiii au pointer-events-none ca tap-ul/drag-ul să lovească mereu tile-ul.
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => onToggle(e, index, img)}
      className={`group relative aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer select-none ${
        isSelected ? 'ring-4 ring-black scale-[0.98]' : ''
      } ${isDragging ? 'opacity-50 shadow-2xl' : ''}`}
    >
      <img
        src={img}
        alt={`Galerie ${index}`}
        className={`w-full h-full object-cover transition-transform duration-500 pointer-events-none ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}
      />
      {/* Cerc gol / bifă plină, stil Apple Photos. Pe desktop apare la hover; pe
          touch (fără hover) e mereu vizibil, ca să se știe că pozele sunt selectabile. */}
      <div
        className={`absolute top-4 right-4 z-10 transition-all duration-300 pointer-events-none ${
          isSelected
            ? 'opacity-100 scale-100'
            : 'opacity-100 scale-100 md:opacity-0 md:scale-75 md:group-hover:opacity-100 md:group-hover:scale-100'
        }`}
      >
        {isSelected ? (
          <div className="bg-white rounded-full shadow-lg">
            <CheckCircle2 size={32} className="fill-black text-white" />
          </div>
        ) : (
          <div className="bg-black/20 text-white rounded-full backdrop-blur-sm border-2 border-white/50">
            <Circle size={28} />
          </div>
        )}
      </div>
      <div className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${isSelected ? 'bg-black/20' : 'bg-black/0 group-hover:bg-black/10'}`} />
    </div>
  );
}

const emptyDraft = {
  titleRo: '',
  titleEn: '',
  location: '',
  date: '',
  descriptionRo: '',
  descriptionEn: '',
  coverImage: '',
  gallery: [] as string[],
};
type Draft = typeof emptyDraft;

// Toate câmpurile unui proiect trăiesc acum în draft: text, copertă ȘI galerie.
// Orice modificare (editare text, upload, ștergere, reordonare de poze) atinge
// doar draft-ul local; nimic nu ajunge în baza de date până la Salvează. Așa
// există un singur punct de commit (Save) și unul de anulare (Revert).
function draftFromProject(p: Project): Draft {
  return {
    titleRo: p.titleRo,
    titleEn: p.titleEn,
    location: p.location,
    date: p.date,
    descriptionRo: p.descriptionRo,
    descriptionEn: p.descriptionEn,
    coverImage: p.coverImage,
    gallery: [...p.gallery],
  };
}

export default function Admin() {
  const { projects, setProjects, loading, reload } = useProjects();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'leads'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [savingOrder, setSavingOrder] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  // Selecție de poze (doar UI), pe URL — supraviețuiește reordonării, spre
  // deosebire de indici. `lastClickedIndex` e ancora pentru selecția cu Shift.
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  // Mouse: drag imediat după 5px. Touch: delay 200ms (swipe = scroll, apăsare
  // lungă = drag), deci nu blocăm scroll-ul galeriei pe telefon.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
    if (!loading && projects.length > 0 && !projects.find(p => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, loading, selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  useEffect(() => {
    // Selecția aparține proiectului curent — se golește la schimbare.
    setSelectedPhotos(new Set());
    setLastClickedIndex(null);
    if (selectedProject) {
      setDraft(draftFromProject(selectedProject));
    }
  }, [selectedProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDirty = useMemo(() => {
    if (!selectedProject) return false;
    return (
      draft.titleRo !== selectedProject.titleRo ||
      draft.titleEn !== selectedProject.titleEn ||
      draft.location !== selectedProject.location ||
      draft.date !== selectedProject.date ||
      draft.descriptionRo !== selectedProject.descriptionRo ||
      draft.descriptionEn !== selectedProject.descriptionEn ||
      draft.coverImage !== selectedProject.coverImage ||
      draft.gallery.length !== selectedProject.gallery.length ||
      draft.gallery.some((url, i) => url !== selectedProject.gallery[i])
    );
  }, [draft, selectedProject]);

  useEffect(() => {
    if (activeTab === 'leads') {
      setLeadsLoading(true);
      fetchLeads().then(data => {
        setLeads(data);
        setLeadsLoading(false);
      });
    }
  }, [activeTab]);

  // Semnalează overlay-ul de drop când se trag fișiere din Explorer peste pagină.
  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) setIsDraggingFiles(true);
    };
    window.addEventListener('dragenter', onDragEnter);
    return () => window.removeEventListener('dragenter', onDragEnter);
  }, []);

  // Scrie tot draft-ul (text + copertă + galerie) într-un singur update.
  const commitDraft = useCallback(async () => {
    if (!selectedProject) return;
    await updateProject(selectedProject.id, {
      titleRo: draft.titleRo,
      titleEn: draft.titleEn,
      location: draft.location,
      date: draft.date,
      descriptionRo: draft.descriptionRo,
      descriptionEn: draft.descriptionEn,
      coverImage: draft.coverImage,
      gallery: draft.gallery,
    });
  }, [draft, selectedProject]);

  const handleSave = async (): Promise<boolean> => {
    if (!isDirty) return true;
    setSaving(true);
    try {
      await commitDraft();
      await reload();
      return true;
    } catch (err) {
      alert('Nu am putut salva modificările. Încearcă din nou.');
      console.error('[admin] salvare:', err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    if (selectedProject) setDraft(draftFromProject(selectedProject));
    setSelectedPhotos(new Set());
    setLastClickedIndex(null);
  };

  // Auto-save la părăsire. Ref-ul ține mereu ultima stare, ca handler-ul de
  // cleanup (care rulează la unmount) să nu prindă o valoare veche.
  const autoSaveRef = useRef({ dirty: false, commit: commitDraft });
  autoSaveRef.current = { dirty: isDirty, commit: commitDraft };
  useEffect(() => {
    return () => {
      if (autoSaveRef.current.dirty) {
        autoSaveRef.current.commit().catch(err => console.error('[admin] auto-save la ieșire:', err));
      }
    };
  }, []);

  const trySelect = async (id: string) => {
    if (id === selectedProjectId) return;
    // Fără confirmare: părăsirea proiectului cu modificări nesalvate le salvează.
    // Dacă salvarea eșuează, rămânem pe proiect ca să nu pierdem modificările.
    if (isDirty && !(await handleSave())) return;
    setSelectedProjectId(id);
  };

  // Compresie (doar dacă e necesar) + upload real Cloudinary, secvențial.
  // Pozele urcate cu succes intră în draft (staged) — se scriu la Salvează.
  const uploadFiles = async (files: File[]) => {
    const images = files.filter(f => f.type.startsWith('image/'));
    if (images.length === 0 || !selectedProject) return;
    setUploadingGallery(true);
    setUploadProgress({ done: 0, total: images.length });
    const uploaded: string[] = [];
    try {
      for (const file of images) {
        const compressed = await compressImage(file);
        const url = await uploadProjectImage(compressed);
        uploaded.push(url);
        setUploadProgress(p => ({ ...p, done: p.done + 1 }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Upload-ul pozelor a eșuat.\n\n${msg}`);
      console.error('[admin] upload galerie:', err);
    } finally {
      if (uploaded.length > 0) {
        setDraft(d => ({ ...d, gallery: [...uploaded, ...d.gallery] }));
      }
      setUploadingGallery(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await uploadFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;
    setUploadingCover(true);
    try {
      const compressed = await compressImage(file);
      const url = await uploadProjectImage(compressed);
      setDraft(d => ({ ...d, coverImage: url })); // staged, se scrie la Salvează
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Upload-ul copertei a eșuat.\n\n${msg}`);
      console.error('[admin] upload copertă:', err);
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  // Click pe poză o comută; Shift+click selectează tot intervalul de la ultima
  // poză atinsă până la cea curentă (ca în file explorer).
  const togglePhoto = (e: React.MouseEvent, index: number, img: string) => {
    e.stopPropagation();
    if (e.shiftKey && lastClickedIndex !== null) {
      const from = Math.min(lastClickedIndex, index);
      const to = Math.max(lastClickedIndex, index);
      const range = draft.gallery.slice(from, to + 1);
      setSelectedPhotos(prev => new Set([...prev, ...range]));
    } else {
      setSelectedPhotos(prev => {
        const next = new Set(prev);
        if (next.has(img)) next.delete(img);
        else next.add(img);
        return next;
      });
      setLastClickedIndex(index);
    }
  };

  const clearSelection = () => {
    setSelectedPhotos(new Set());
    setLastClickedIndex(null);
  };

  // Doar scoate pozele din draft (staged). Se aplică în DB abia la Salvează.
  const removeSelectedPhotos = () => {
    setDraft(d => ({ ...d, gallery: d.gallery.filter(url => !selectedPhotos.has(url)) }));
    clearSelection();
  };

  // Reordonare poze în galerie (staged) — se salvează la Salvează.
  const handleGalleryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDraft(d => {
      const oldIndex = d.gallery.indexOf(active.id as string);
      const newIndex = d.gallery.indexOf(over.id as string);
      if (oldIndex < 0 || newIndex < 0) return d;
      return { ...d, gallery: arrayMove(d.gallery, oldIndex, newIndex) };
    });
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (!confirm('Sigur vrei să ștergi acest proiect? Se șterge definitiv, cu tot cu galerie.')) return;
    await deleteProject(selectedProject.id);
    setSelectedProjectId('');
    await reload();
  };

  const handleCreateProject = async () => {
    // Salvează proiectul curent înainte de a-l părăsi; nu continua dacă eșuează.
    if (isDirty && !(await handleSave())) return;
    const project = await createProject();
    await reload();
    setSelectedProjectId(project.id);
  };

  const toggleFeatured = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    await updateProject(project.id, { featured: !project.featured });
    await reload();
  };

  // Reordonarea proiectelor se scrie în DB imediat (e o proprietate a listei,
  // nu a draft-ului unui proiect). O singură scriere, la finalul gestului.
  const handleProjectDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex(p => p.id === active.id);
    const newIndex = projects.findIndex(p => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrder = arrayMove(projects, oldIndex, newIndex);
    setProjects(newOrder);
    setSavingOrder(true);
    try {
      await reorderProjects(newOrder.map(p => p.id));
    } catch (err) {
      console.error('[admin] Salvarea ordinii a eșuat:', err);
      alert('Nu am putut salva ordinea proiectelor. Se reîncarcă din baza de date.');
      await reload();
    } finally {
      setSavingOrder(false);
    }
  };

  const handleMarkLead = async (lead: Lead, status: string) => {
    setLeads(prev => prev.map(l => (l.id === lead.id ? { ...l, status } : l)));
    try {
      await updateLeadStatus(lead.id, status);
    } catch (err) {
      console.error(err);
    }
  };

  const draftDate = parseProjectDate(draft.date);
  const setDatePart = (part: 'month' | 'year', value: string) => {
    const next = { ...draftDate, [part]: value };
    setDraft(d => ({ ...d, date: [next.month, next.year].filter(Boolean).join(' ') }));
  };

  return (
    <div className="min-h-svh font-sans bg-[#f8f8f7] selection:bg-black selection:text-white pb-20">
      {/* Overlay drag & drop fișiere — apare când tragi poze din Explorer */}
      {isDraggingFiles && activeTab === 'projects' && selectedProject && (
        <div
          className="fixed inset-0 z-[100] bg-white/70 backdrop-blur-sm flex items-center justify-center"
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => { e.preventDefault(); setIsDraggingFiles(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFiles(false);
            uploadFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="pointer-events-none flex flex-col items-center gap-4 bg-white px-10 py-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h2 className="text-gray-800 text-2xl md:text-3xl font-display font-bold tracking-tight">
              Lasă pozele aici
            </h2>
          </motion.div>
        </div>
      )}

      {/* Nav */}
      <nav className="p-4 md:p-10 flex justify-between items-center bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <Link to="/" onClick={scrollToPageTop} className="min-w-0 hover:opacity-70 transition-opacity">
          <BrandLockup
            className="max-sm:flex-col max-sm:items-start max-sm:gap-0.5"
            markClassName="text-xl md:text-2xl"
            signatureClassName="text-sm md:text-xl"
            suffix={<span className="text-gray-400 font-display font-light tracking-normal text-lg md:text-xl">Workspace</span>}
          />
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide uppercase text-gray-500 hover:text-black transition-colors"
        >
          <LogOut size={16} /> <span className="hidden sm:inline">Ieși din admin</span><span className="sm:hidden">Ieși</span>
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 flex gap-3">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-3 rounded-full font-medium text-sm transition-colors ${activeTab === 'projects' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:text-black'}`}
        >
          Proiecte
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-6 py-3 rounded-full font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'leads' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:text-black'}`}
        >
          <Mail size={16} /> Cereri
          {leads.filter(l => l.status === 'new').length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {leads.filter(l => l.status === 'new').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'leads' ? (
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8">
          {leadsLoading ? (
            <div className="py-24 text-center text-gray-400">Se încarcă...</div>
          ) : leads.length === 0 ? (
            <div className="py-24 text-center text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-300">
              Nicio cerere primită încă.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {leads.map(lead => (
                <div key={lead.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      {lead.imageUrl && (
                        <a href={lead.imageUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                          <img src={lead.imageUrl} alt="Poză trimisă" className="w-full h-full object-cover" />
                        </a>
                      )}
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-lg">{lead.name}</h3>
                          {lead.kind === 'photo' && (
                            <span className="text-xs uppercase tracking-wide bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">Poză</span>
                          )}
                          {lead.status === 'new' && (
                            <span className="text-xs uppercase tracking-wide bg-red-50 text-red-500 px-2 py-1 rounded-full font-medium">Nou</span>
                          )}
                        </div>
                        <a href={`mailto:${lead.email}`} className="text-sm text-gray-500 hover:text-black">{lead.email}</a>
                        {lead.phone && <span className="text-sm text-gray-500 ml-3">{lead.phone}</span>}
                        {lead.eventDate && <p className="text-sm text-gray-400 mt-1">Data eveniment: {lead.eventDate}</p>}
                        {lead.message && <p className="text-gray-700 mt-3 max-w-xl">{lead.message}</p>}
                        <p className="text-xs text-gray-400 mt-3">{new Date(lead.createdAt).toLocaleString('ro-RO')}</p>
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2 shrink-0">
                      {lead.status !== 'contacted' && (
                        <button
                          onClick={() => handleMarkLead(lead, 'contacted')}
                          className="text-xs uppercase tracking-wide bg-gray-100 hover:bg-black hover:text-white px-4 py-2 rounded-full font-medium transition-colors"
                        >
                          Marchează contactat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              Proiecte
              {savingOrder && (
                <span className="flex items-center gap-1.5 text-gray-400 normal-case tracking-normal font-medium">
                  <Loader2 size={14} className="animate-spin" /> se salvează ordinea
                </span>
              )}
            </h3>
            {loading ? (
              <div className="py-12 text-center text-gray-400">Se încarcă...</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
                <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-3 mb-6">
                    {projects.map(project => (
                      <ProjectReorderItem
                        key={project.id}
                        project={project}
                        isSelected={selectedProjectId === project.id}
                        onSelect={() => trySelect(project.id)}
                        onToggleFeatured={toggleFeatured}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            <button
              onClick={handleCreateProject}
              className="w-full bg-white border border-dashed border-gray-300 text-gray-500 hover:text-black hover:border-black px-6 py-4 rounded-[2rem] font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={18} /> Adaugă proiect nou
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {selectedProject && (
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                  <div>
                    <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter">{draft.titleRo}</h2>
                    <p className="text-gray-500 mt-2 text-lg">Editează detaliile și galeria proiectului</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={handleRevert}
                      disabled={!isDirty || saving}
                      title="Anulează toate modificările nesalvate"
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-full font-medium flex items-center gap-2 transition-colors flex-1 md:flex-none justify-center"
                    >
                      <Undo size={18} /> Revert
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!isDirty || saving}
                      className="bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-full font-medium flex items-center gap-2 transition-colors flex-1 md:flex-none justify-center"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      {saving ? 'Se salvează...' : 'Salvează'}
                    </button>
                    <button
                      onClick={handleDeleteProject}
                      className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-5 py-3 rounded-full font-medium flex items-center gap-2 transition-colors flex-1 md:flex-none justify-center"
                    >
                      <Trash2 size={18} /> Șterge
                    </button>
                  </div>
                </div>

                {/* Edit Details Form */}
                <div className="mb-10 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <h3 className="font-bold text-xl mb-6">Detalii proiect</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Titlu (Română)</label>
                      <input
                        type="text"
                        value={draft.titleRo}
                        onChange={e => setDraft(d => ({ ...d, titleRo: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Title (English)</label>
                      <input
                        type="text"
                        value={draft.titleEn}
                        onChange={e => setDraft(d => ({ ...d, titleEn: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Locație</label>
                      <input
                        type="text"
                        value={draft.location}
                        onChange={e => setDraft(d => ({ ...d, location: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Dată</label>
                      <div className="flex gap-3">
                        <select
                          value={draftDate.month}
                          onChange={e => setDatePart('month', e.target.value)}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
                        >
                          <option value="">Luna</option>
                          {RO_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select
                          value={draftDate.year}
                          onChange={e => setDatePart('year', e.target.value)}
                          className="w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
                        >
                          <option value="">An</option>
                          {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Copertă</label>
                    <div className="flex gap-4 items-center">
                      {draft.coverImage && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                          <img src={draft.coverImage} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label className="flex-1 bg-gray-50 border border-gray-200 border-dashed rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center h-16">
                        <span className="text-gray-500 text-sm font-medium">
                          {uploadingCover ? 'Se încarcă...' : 'Încarcă copertă'}
                        </span>
                        <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Descriere (Română)</label>
                      <textarea
                        value={draft.descriptionRo}
                        onChange={e => setDraft(d => ({ ...d, descriptionRo: e.target.value }))}
                        rows={4}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Description (English)</label>
                      <textarea
                        value={draft.descriptionEn}
                        onChange={e => setDraft(d => ({ ...d, descriptionEn: e.target.value }))}
                        rows={4}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Add Photo Form & Selection Actions */}
                <div className="mb-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                  <div className="flex-1 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 w-full">
                    <label className={`bg-gray-50 border border-gray-200 border-dashed rounded-full px-6 py-4 w-full flex items-center justify-center transition-colors ${uploadingGallery ? 'opacity-60 cursor-default' : 'cursor-pointer hover:bg-gray-100'}`}>
                      <span className="text-gray-500 font-medium flex items-center gap-2">
                        {uploadingGallery ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            Se încarcă {uploadProgress.done}/{uploadProgress.total}...
                          </>
                        ) : (
                          <>
                            <Plus size={20} /> Adaugă poze <span className="hidden sm:inline">— sau trage-le aici</span>
                          </>
                        )}
                      </span>
                      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploadingGallery} className="hidden" />
                    </label>
                  </div>

                  {/* Apare doar când sunt poze selectate. Ștergerea doar le scoate
                      din draft; se aplică în DB abia la Salvează. */}
                  {selectedPhotos.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 whitespace-nowrap"
                    >
                      <span className="font-medium text-gray-600">{selectedPhotos.size} selectate</span>
                      <button
                        onClick={removeSelectedPhotos}
                        className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-6 py-4 rounded-full font-medium flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={18} /> Șterge selectate
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Gallery Grid — tap = selectează, apăsare lungă / drag = reordonează */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGalleryDragEnd}>
                  <SortableContext items={draft.gallery} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {draft.gallery.map((img, i) => (
                        <SortableGalleryItem
                          key={img}
                          img={img}
                          index={i}
                          isSelected={selectedPhotos.has(img)}
                          onToggle={togglePhoto}
                        />
                      ))}
                      {draft.gallery.length === 0 && (
                        <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-300">
                          Nicio poză în galeria acestui proiect. Adaugă una mai sus.
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
