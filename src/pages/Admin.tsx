import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, Reorder, useDragControls } from 'motion/react';
import { Trash2, Plus, LogOut, Star, GripVertical, Save, Mail, Loader2, CheckCircle2, Circle, Undo } from 'lucide-react';
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

function ProjectReorderItem({
  project,
  isSelected,
  onSelect,
  onToggleFeatured,
  onDragEnd,
}: {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFeatured: (e: React.MouseEvent, project: Project) => void;
  onDragEnd: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={project}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.05, boxShadow: '0px 20px 40px rgba(0,0,0,0.1)', zIndex: 50, backgroundColor: '#ffffff', borderRadius: '2rem' }}
      onClick={onSelect}
      className={`text-left px-6 py-5 rounded-[2rem] transition-all duration-300 flex items-center gap-4 cursor-pointer select-none relative ${
        isSelected
          ? 'bg-black text-white shadow-xl scale-[1.02]'
          : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
      }`}
    >
      <div className="flex-1">
        <div className="font-semibold text-lg">{project.titleRo}</div>
        <div className="text-sm mt-1 text-gray-400">{project.location}</div>
      </div>
      <div className="flex flex-col gap-2 items-center text-gray-400">
        <button onClick={(e) => onToggleFeatured(e, project)} className={`hover:text-yellow-500 transition-colors ${project.featured ? 'text-yellow-400' : ''}`}>
          <Star size={18} fill={project.featured ? 'currentColor' : 'none'} />
        </button>
        {/* touch-action:none e obligatoriu aici. Fără el, pe telefon browserul
            interpretează gestul ca scroll de pagină și îl fură din mijlocul
            drag-ului — de acolo venea reordonarea glitch-uită pe mobil.
            Zona de atingere e mărită (p-3) ca să fie prinsă ușor cu degetul. */}
        <div
          className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 p-3 -m-1 touch-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical size={20} />
        </div>
      </div>
    </Reorder.Item>
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
// Orice modificare (editare text, upload, ștergere de poze) atinge doar draft-ul
// local; nimic nu ajunge în baza de date până la Salvează. Așa există un singur
// punct de commit (Save) și unul de anulare (Revert), fără confirmări per-acțiune.
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

  // Selecție de poze (doar UI): indici în draft.gallery. Indici, nu URL-uri,
  // pentru că galeria poate conține aceeași poză de două ori. `lastClicked` e
  // ancora pentru selecția cu Shift (interval), ca în file explorer.
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [lastClicked, setLastClicked] = useState<number | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

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
    setLastClicked(null);
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
    setLastClicked(null);
  };

  // Auto-save la părăsire. Ref-ul ține mereu ultima stare, ca handler-ul de
  // cleanup (care rulează la unmount) să nu prindă o valoare veche.
  const autoSaveRef = useRef({ dirty: false, commit: commitDraft });
  autoSaveRef.current = { dirty: isDirty, commit: commitDraft };
  useEffect(() => {
    // Se declanșează când tot panoul de admin se demontează (logout, navigare
    // în altă pagină a site-ului). Fetch-ul pornit aici se termină în fundal
    // chiar dacă componenta dispare.
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !selectedProject) return;
    setUploadingGallery(true);
    setUploadProgress({ done: 0, total: files.length });
    const uploaded: string[] = [];
    try {
      // Secvențial, nu în paralel: pozele mari (compresie + upload) ar sufoca
      // rețeaua telefonului dacă am porni zeci deodată.
      for (const file of files) {
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
      // Pozele urcate cu succes intră în draft (staged), chiar dacă una a eșuat
      // la mijloc — nu pierdem munca deja făcută. Se scriu în DB la Salvează.
      if (uploaded.length > 0) {
        setDraft(d => ({ ...d, gallery: [...uploaded, ...d.gallery] }));
      }
      setUploadingGallery(false);
      setUploadProgress({ done: 0, total: 0 });
      e.target.value = '';
    }
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

  // Selecție de poze în stil Apple Photos: click pe poză o comută; Shift+click
  // selectează tot intervalul de la ultima poză atinsă până la cea curentă.
  const togglePhoto = (index: number, shiftKey: boolean) => {
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      if (shiftKey && lastClicked !== null) {
        const from = Math.min(lastClicked, index);
        const to = Math.max(lastClicked, index);
        for (let k = from; k <= to; k++) next.add(k);
      } else if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
    setLastClicked(index);
  };

  const clearSelection = () => {
    setSelectedPhotos(new Set());
    setLastClicked(null);
  };

  // Doar scoate pozele din draft (staged). Se aplică în DB abia la Salvează.
  const removeSelectedPhotos = () => {
    setDraft(d => ({ ...d, gallery: d.gallery.filter((_, i) => !selectedPhotos.has(i)) }));
    clearSelection();
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

  // onReorder se declanșează de zeci de ori în timpul unui singur drag. Varianta
  // veche scria în baza de date la FIECARE declanșare: zeci de seturi de update-uri
  // paralele care se suprapuneau, iar un răspuns întârziat de la o poziție
  // intermediară suprascria ordinea mai nouă. De acolo venea „una în locul
  // celeilalte". Acum starea locală se mișcă fluid, iar baza de date se scrie
  // o singură dată, la finalul gestului.
  const handleReorder = (newOrder: Project[]) => {
    setProjects(newOrder);
  };

  const persistOrder = async () => {
    setSavingOrder(true);
    try {
      await reorderProjects(projects.map(p => p.id));
    } catch (err) {
      console.error('[admin] Salvarea ordinii a eșuat:', err);
      alert('Nu am putut salva ordinea proiectelor. Se reîncarcă ordinea din baza de date.');
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

  return (
    <div className="min-h-svh font-sans bg-[#f8f8f7] selection:bg-black selection:text-white pb-20">
      {/* Nav */}
      <nav className="p-4 md:p-10 flex justify-between items-center bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <Link to="/" className="font-display font-bold text-xl md:text-2xl tracking-tighter">
          AURA. <span className="text-gray-400 font-light tracking-normal text-lg md:text-xl ml-2">Workspace</span>
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
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">{lead.name}</h3>
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
              <Reorder.Group axis="y" values={projects} onReorder={handleReorder} className="flex flex-col gap-3 mb-6">
                {projects.map(project => (
                  <ProjectReorderItem
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectId === project.id}
                    onSelect={() => trySelect(project.id)}
                    onToggleFeatured={toggleFeatured}
                    onDragEnd={persistOrder}
                  />
                ))}
              </Reorder.Group>
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
                      <input
                        type="text"
                        value={draft.date}
                        onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
                      />
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
                            <Plus size={20} /> Adaugă poze în galerie
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

                {/* Gallery Grid — click pe poză o selectează (Shift = interval) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {draft.gallery.map((img, i) => {
                    const isSelected = selectedPhotos.has(i);
                    return (
                      <div
                        key={`${img}-${i}`}
                        onClick={(e) => togglePhoto(i, e.shiftKey)}
                        className={`group relative aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer select-none ${
                          isSelected ? 'ring-4 ring-black scale-[0.98]' : ''
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Galerie ${i}`}
                          className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}
                        />
                        {/* Cerc gol / bifă plină, stil Apple Photos. Pe desktop
                            apare la hover; pe touch (fără hover) e mereu vizibil,
                            ca să se știe că pozele sunt selectabile. */}
                        <div
                          className={`absolute top-4 right-4 z-10 transition-all duration-300 ${
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
                        <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? 'bg-black/20' : 'bg-black/0 group-hover:bg-black/10'}`} />
                      </div>
                    );
                  })}
                  {draft.gallery.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-300">
                      Nicio poză în galeria acestui proiect. Adaugă una mai sus.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
