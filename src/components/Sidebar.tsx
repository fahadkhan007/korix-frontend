import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Settings2, 
  ChevronRight, ChevronsUpDown, CheckSquare,
  LayoutDashboard, Users, Star, Bot, Plus, FolderKanban, LogOut,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsService } from '../api/projects';

const ProjectNavItem = ({ project, isCollapsed }: { project: any, isCollapsed: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const [subProjects, setSubProjects] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!expanded && !loaded) {
      const data = await projectsService.getSubProjects(project.id);
      setSubProjects(data.subProjects || []);
      setLoaded(true);
    }
    setExpanded(!expanded);
  };

  return (
    <div>
      <div className="group relative flex items-center rounded-md transition-colors hover:bg-zinc-800/30">
        <NavLink 
          to={`/projects/${project.id}`}
          end
          className={({isActive}) => `flex-1 block ${isCollapsed ? 'text-center' : 'px-2'} py-1.5 text-sm transition-colors ${isActive ? 'text-zinc-50 bg-zinc-800/50 rounded-md' : 'text-zinc-400 hover:text-zinc-50'} truncate ${!isCollapsed ? 'pr-8' : ''}`}
        >
          {isCollapsed ? project.name.charAt(0).toUpperCase() : project.name}
        </NavLink>
        {!isCollapsed && (
          <button 
            onClick={toggle}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-sm text-zinc-600 hover:text-zinc-300 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {!isCollapsed && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-4 py-1 space-y-[2px] border-l border-zinc-800 ml-3 mt-1">
              {loaded && subProjects.length === 0 ? (
                <div className="px-2 py-1 text-xs text-zinc-600">No sub-projects</div>
              ) : (
                subProjects.map(sub => (
                  <NavLink 
                    key={sub.id}
                    to={`/projects/${sub.id}`}
                    className={({isActive}) => `block px-2 py-1.5 rounded-md text-xs transition-colors ${isActive ? 'text-zinc-50 bg-zinc-800/50' : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/30'} truncate`}
                  >
                    {sub.name}
                  </NavLink>
                ))
              )}
              {!loaded && <div className="px-2 py-1 text-xs text-zinc-600">Loading…</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Sidebar() {
  const { user, logoutState } = useAuth();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string>('Workspace');
  const [projects, setProjects] = useState<any[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsService.getProjects();
        setProjects(data.projects || []);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleLogout = async () => {
    await logoutState();
    navigate('/login');
  };

  const toggleSection = (title: string) => {
    setOpenSection(prev => prev === title ? '' : title);
  };

  return (
    <aside className={`${isCollapsed ? 'w-[72px]' : 'w-[260px]'} transition-all duration-300 h-screen bg-[#09090b] text-zinc-400 flex flex-col border-r border-zinc-800/50 shrink-0 select-none relative`}>
      
      {/* Header / Workspace Switcher */}
      <div className="p-4 pt-5">
        {!isCollapsed ? (
          <div className="flex items-center w-full gap-3 p-1.5 rounded-lg group overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <img src="/logo.svg" alt="Korix" className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start flex-1 text-left overflow-hidden">
              <span className="text-sm font-semibold text-zinc-50 leading-tight truncate w-full">Korix</span>
              <span className="text-xs text-zinc-400 leading-tight truncate w-full">Enterprise</span>
            </div>
            <button 
              onClick={toggleCollapse}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mx-auto">
              <img src="/logo.svg" alt="Korix" className="w-5 h-5" />
            </div>
            <button 
              onClick={toggleCollapse}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-8 flex flex-col hide-scrollbar">
        
        {/* Workspace Section */}
        <div>
          {!isCollapsed && (
            <div className="text-xs font-medium text-zinc-500 mb-2 px-2">
              Workspace
            </div>
          )}
          <div className="space-y-[2px]">
            <NavLink to="/dashboard" className={({isActive}) => `flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}>
              <LayoutDashboard size={16} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium truncate">Dashboards</span>}
            </NavLink>
            <NavLink to="/tasks" className={({isActive}) => `flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}>
              <CheckSquare size={16} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium truncate">My Tasks</span>}
            </NavLink>
            <NavLink to="/starred" className={({isActive}) => `flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}>
              <Star size={16} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium truncate">Starred</span>}
            </NavLink>
            <NavLink to="/team" className={({isActive}) => `flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}>
              <Users size={16} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium truncate">Members</span>}
            </NavLink>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          {!isCollapsed && (
            <div className="text-xs font-medium text-zinc-500 mb-2 px-2 flex justify-between items-center group">
              <span>Projects</span>
              <NavLink to="/projects" className="opacity-0 group-hover:opacity-100 transition-opacity">
                 <Plus size={14} className="text-zinc-400 hover:text-zinc-50" />
              </NavLink>
            </div>
          )}
          <div className="space-y-[2px]">
            <button 
              onClick={() => !isCollapsed && toggleSection('Projects')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-md transition-colors ${openSection === 'Projects' && !isCollapsed ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}
              title={isCollapsed ? 'Projects' : undefined}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
                <FolderKanban size={16} className="shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium truncate">Projects</span>}
              </div>
              {!isCollapsed && <ChevronRight size={14} className={`transition-transform duration-200 shrink-0 ${openSection === 'Projects' ? 'rotate-90' : ''}`} />}
            </button>
            <AnimatePresence>
              {openSection === 'Projects' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-9 pr-2 py-1 space-y-[2px] border-l border-zinc-800 ml-4 mt-1">
                    <NavLink 
                      to="/projects"
                      end
                      className={({isActive}) => `block px-2 py-1.5 rounded-md text-sm transition-colors ${isActive ? 'text-zinc-50 bg-zinc-800/50' : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/30'}`}
                    >
                      All Projects
                    </NavLink>
                    
                    {projects.slice(0, 5).map((project) => (
                      <ProjectNavItem key={project.id} project={project} isCollapsed={isCollapsed} />
                    ))}
                    
                    {projects.length > 5 && (
                      <NavLink 
                        to="/projects"
                        end
                        className="block px-2 py-1.5 rounded-md text-sm transition-colors text-zinc-500 hover:text-zinc-50 hover:bg-zinc-800/30"
                      >
                        View all {projects.length} projects
                      </NavLink>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* AI Features Section */}
        <div>
          {!isCollapsed && (
            <div className="text-xs font-medium text-zinc-500 mb-2 px-2">
              Intelligence
            </div>
          )}
          <div className="space-y-[2px]">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} p-2 rounded-md transition-colors text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/40 cursor-pointer`} title={isCollapsed ? 'Korix Copilot' : undefined}>
              <Bot size={16} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium truncate">Korix Copilot</span>}
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="mt-auto pt-8">
          <NavLink 
            to="/settings" 
            className={({isActive}) => `flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings2 size={16} className="shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium truncate">Settings</span>}
          </NavLink>
        </div>

      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-zinc-800/50 mt-auto flex flex-col gap-3">
        
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'w-full gap-3 px-1.5'}`}>
          <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden text-xs font-semibold text-zinc-300 mx-auto">
            {getInitials(user?.name)}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col items-start flex-1 text-left overflow-hidden">
              <span className="text-sm font-semibold text-zinc-50 leading-tight truncate w-full">
                {user?.name || 'User'}
              </span>
              <span className="text-xs text-zinc-400 leading-tight truncate w-full">
                {user?.email || ''}
              </span>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleLogout}
          className={`flex items-center justify-center w-full ${isCollapsed ? '' : 'gap-2'} p-2 rounded-md bg-zinc-800/30 hover:bg-[#f85149]/10 text-zinc-400 hover:text-[#f85149] transition-colors text-sm font-medium border border-transparent hover:border-[#f85149]/30`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={14} className="shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
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
    </aside>
  );
}
