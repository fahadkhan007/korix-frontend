import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Users, Shield, Eye, User } from 'lucide-react';
import { projectsService } from '../api/projects';
import './Dashboard.css';

type TeamMember = { id: string; name: string | null; email: string; role: string; projectName: string; projectId: string; };

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ADMIN:  { label: 'Admin',  color: '#A5B4FC', icon: <Shield size={11} /> },
  MEMBER: { label: 'Member', color: 'var(--accent-green)', icon: <User size={11} /> },
  VIEWER: { label: 'Viewer', color: 'var(--text-tertiary)', icon: <Eye size={11} /> },
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const pd = await projectsService.getProjects();
        const projects = pd.projects || [];
        const details = await Promise.all(
          projects.map(async (p: any) => {
            const d = await projectsService.getProjectById(p.id);
            return { ...d.project, id: p.id, name: p.name };
          })
        );
        const flat = details.flatMap((project: any) =>
          (project.members || []).map((m: any) => ({
            id: `${project.id}-${m.user.id}`,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
            projectName: project.name,
            projectId: project.id,
          }))
        );
        setMembers(flat);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Deduplicate by email for the "people" view
  const people = Array.from(
    members.reduce((map, m) => {
      if (!map.has(m.email)) map.set(m.email, { ...m, projects: [{ name: m.projectName, id: m.projectId, role: m.role }] });
      else map.get(m.email).projects.push({ name: m.projectName, id: m.projectId, role: m.role });
      return map;
    }, new Map<string, any>()).values()
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="flex-1 overflow-y-auto bg-[#0d1117] hide-scrollbar">
          <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
            
            <div className="flex items-center gap-2 pb-4 border-b border-[#30363d]">
              <Users size={20} className="text-[#8b949e]" />
              <h1 className="text-xl font-semibold text-[#f0f6fc]">People ({people.length})</h1>
            </div>

            {loading ? (
              <div className="text-center py-8 text-sm text-[#8b949e]">Loading team…</div>
            ) : people.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#8b949e]">No team members yet. Invite from a project page.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {people.map(person => {
                  const initials = (person.name || person.email).charAt(0).toUpperCase();
                  return (
                    <div key={person.email} className="bg-[#0d1117] border border-[#30363d] rounded-md p-4 hover:border-[#8b949e] transition-colors flex flex-col gap-4">
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center text-sm font-semibold text-[#c9d1d9] shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-[#f0f6fc] truncate">
                            {person.name || 'Unnamed'}
                          </div>
                          <div className="text-xs text-[#8b949e] truncate">
                            {person.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-3 border-t border-[#30363d]/50">
                        {person.projects.map((proj: any) => {
                          const rc = ROLE_CONFIG[proj.role] || ROLE_CONFIG.MEMBER;
                          return (
                            <div key={proj.id} className="flex items-center justify-between gap-2">
                              <span className="text-xs text-[#8b949e] truncate">
                                {proj.name}
                              </span>
                              <span style={{ color: rc.color, background: `${rc.color}15` }} className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                                {rc.icon}
                                {rc.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
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
