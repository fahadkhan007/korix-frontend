import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Plus, FolderKanban, ExternalLink, Calendar } from 'lucide-react';
import { projectsService } from '../api/projects';
import './Projects.css';

type ProjectSummary = { id: string; name: string; description?: string | null; createdAt: string; };

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await projectsService.getProjects();
      setProjects(data.projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setCreating(true); setError('');
    try {
      const res = await projectsService.createProject({ name: form.name.trim(), description: form.description });
      setShowForm(false);
      setForm({ name: '', description: '' });
      navigate(`/projects/${res.project.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="flex-1 overflow-y-auto bg-[#0d1117] hide-scrollbar">
          <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">

            {/* Create Project Inline Form */}
            {showForm && (
              <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#30363d] mb-4">
                  <h3 className="text-lg font-semibold text-[#f0f6fc]">Create New Project</h3>
                  <button className="text-[#8b949e] hover:text-[#c9d1d9] text-sm font-medium transition-colors" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
                </div>
                <form onSubmit={handleCreate} className="max-w-xl space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#c9d1d9]">Project Name *</label>
                    <input className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]" placeholder="e.g. Marketing Redesign" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#c9d1d9]">Description (optional)</label>
                    <textarea className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]" rows={2} placeholder="What's this project about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  {error && <div className="text-xs text-[#f85149] bg-[rgba(248,81,73,0.1)] border border-[#f85149]/40 p-2 rounded-md">{error}</div>}
                  <div className="pt-2">
                    <button type="submit" className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-[rgba(240,246,252,0.1)]" disabled={creating}>
                      <Plus size={16} />{creating ? 'Creating…' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Header Section */}
            <div className="flex items-center justify-between pb-4 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <FolderKanban size={20} className="text-[#8b949e]" />
                <h1 className="text-xl font-semibold text-[#f0f6fc]">All Projects ({projects.length})</h1>
              </div>
              {!showForm && (
                <button className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-[rgba(240,246,252,0.1)]" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> New Project
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 text-sm text-[#8b949e]">Loading projects…</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center border border-dashed border-[#30363d] rounded-md bg-[#0d1117]">
                <FolderKanban size={36} className="text-[#8b949e] mb-3 opacity-50" />
                <p className="text-sm text-[#8b949e] mb-4">No projects yet.</p>
                <button className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-[rgba(240,246,252,0.1)]" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> Create your first project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="block">
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4 hover:border-[#8b949e] transition-colors h-full flex flex-col group">
                      
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#c9d1d9] shrink-0">
                          <FolderKanban size={20} />
                        </div>
                        <ExternalLink size={16} className="text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors" />
                      </div>
                      
                      <h4 className="font-semibold text-[#f0f6fc] text-base mb-1">{project.name}</h4>
                      <p className="text-sm text-[#8b949e] line-clamp-2 mb-4 flex-1">
                        {project.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-[#8b949e] pt-3 border-t border-[#30363d]/50 mt-auto">
                        <Calendar size={14} />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>
        </div>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
}
