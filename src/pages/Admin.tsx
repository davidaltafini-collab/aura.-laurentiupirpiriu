import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, Reorder, useDragControls } from 'motion/react';
import { Trash2, Plus, LogOut, Star, GripVertical, Save, Mail, Loader2 } from 'lucide-react';
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
import { fetchLeads, updateLeadStatus, Lead } from '../lib/leads';

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
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={project}
      dragListener={false}
      dragControls={dragControls}
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
        <div
          className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 p-2 -m-2"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical size={16} />
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
};
type Draft = typeof emptyDraft;

export default function Admin() {
  const { projects, setProjects, loading, reload } = useProjects();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'leads'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

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
    if (selectedProject) {
      setDraft({
        titleRo: selectedProject.titleRo,
        titleEn: selectedProject.titleEn,
        location: selectedProject.location,
        date: selectedProject.date,
        descriptionRo: selectedProject.descriptionRo,
        descriptionEn: selectedProject.descriptionEn,
      });
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
      draft.descriptionEn !== selectedProject.descriptionEn
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

  const trySelect = (id: string) => {
    if (isDirty && !confirm('Ai modificări nesalvate la acest proiect. Renunți la ele?')) return;
    setSelectedProjectId(id);
  };

  const handleSaveDraft = async () => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      await updateProject(selectedProject.id, draft);
      await reload();
    } catch (err) {
      alert('Nu am putut salva modificările. Încearcă din nou.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;
    setUploadingGallery(true);
    try {
      const url = await uploadProjectImage(file);
      await updateProject(selectedProject.id, { gallery: [url, ...selectedProject.gallery] });
      await reload();
    } catch (err) {
      alert('Upload-ul pozei a eșuat. Încearcă din nou.');
      console.error(err);
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;
    setUploadingCover(true);
    try {
      const url = await uploadProjectImage(file);
      await updateProject(selectedProject.id, { coverImage: url });
      await reload();
    } catch (err) {
      alert('Upload-ul copertei a eșuat. Încearcă din nou.');
      console.error(err);
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!selectedProject) return;
    await updateProject(selectedProject.id, { gallery: selectedProject.gallery.filter(url => url !== photoUrl) });
    await reload();
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (!confirm('Sigur vrei să ștergi acest proiect?')) return;
    await deleteProject(selectedProject.id);
    setSelectedProjectId('');
    await reload();
  };

  const handleCreateProject = async () => {
    const project = await createProject();
    await reload();
    setSelectedProjectId(project.id);
  };

  const toggleFeatured = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    await updateProject(project.id, { featured: !project.featured });
    await reload();
  };

  const handleReorder = async (newOrder: Project[]) => {
    setProjects(newOrder);
    await reorderProjects(newOrder.map(p => p.id));
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
    <div className="min-h-screen font-sans bg-[#f8f8f7] selection:bg-black selection:text-white pb-20">
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
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Proiecte</h3>
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
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveDraft}
                      disabled={!isDirty || saving}
                      className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-colors"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      {saving ? 'Se salvează...' : isDirty ? 'Salvează modificările' : 'Salvat'}
                    </button>
                    <button
                      onClick={handleDeleteProject}
                      className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-colors"
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
                      {selectedProject.coverImage && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                          <img src={selectedProject.coverImage} className="w-full h-full object-cover" />
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

                {/* Add Photo Form */}
                <div className="mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                  <label className="flex-1 bg-gray-50 border border-gray-200 border-dashed rounded-full px-6 py-4 w-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-gray-500 font-medium flex items-center gap-2">
                      <Plus size={20} /> {uploadingGallery ? 'Se încarcă...' : 'Adaugă poză în galerie'}
                    </span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingGallery} className="hidden" />
                  </label>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {selectedProject.gallery.map((img, i) => (
                    <div key={i} className="group relative aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      <img src={img} alt={`Galerie ${i}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleDeletePhoto(img)}
                          className="bg-white text-red-500 p-4 rounded-full hover:bg-red-500 hover:text-white hover:scale-110 transition-all shadow-lg"
                          title="Șterge poza"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedProject.gallery.length === 0 && (
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
