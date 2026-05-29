import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Settings2, 
  ChevronRight, ChevronsUpDown, CheckSquare,
  LayoutDashboard, Users, Star, Bot, Sparkles, Plus, FolderKanban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsService } from '../api/projects';

export default function Sidebar() {
  const { user, logoutState } = useAuth();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string>('Workspace');
  const [projects, setProjects] = useState<any[]>([]);

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
    <aside className="w-[260px] h-screen bg-[#09090b] text-zinc-400 flex flex-col border-r border-zinc-800/50 shrink-0 select-none">
      {/* Header / Workspace Switcher */}
      <div className="p-4 pt-5">
        <button className="flex items-center w-full gap-3 p-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <img src="/logo.svg" alt="Korix" className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start flex-1 text-left overflow-hidden">
            <span className="text-sm font-semibold text-zinc-50 leading-tight">Korix</span>
            <span className="text-xs text-zinc-400 leading-tight">Enterprise</span>
          </div>
          <ChevronsUpDown size={14} className="text-zinc-500 group-hover:text-zinc-300" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-8 flex flex-col hide-scrollbar">
        
        {/* Workspace Section */}
        <div>
          <div className="text-xs font-medium text-zinc-500 mb-2 px-2">
            Workspace
          </div>
          <div className="space-y-[2px]">
            <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}>
              <LayoutDashboard size={16} />
              <span className="text-sm font-medium">Dashboards</span>
            </NavLink>
            <NavLink to="/tasks" className={({isActive}) => `flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}>
              <CheckSquare size={16} />
              <span className="text-sm font-medium">My Tasks</span>
            </NavLink>
            <NavLink to="/starred" className={({isActive}) => `flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}>
              <Star size={16} />
              <span className="text-sm font-medium">Starred</span>
            </NavLink>
            <NavLink to="/team" className={({isActive}) => `flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}>
              <Users size={16} />
              <span className="text-sm font-medium">Directory</span>
            </NavLink>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div className="text-xs font-medium text-zinc-500 mb-2 px-2 flex justify-between items-center group">
            <span>Projects</span>
            <NavLink to="/projects" className="opacity-0 group-hover:opacity-100 transition-opacity">
               <Plus size={14} className="text-zinc-400 hover:text-zinc-50" />
            </NavLink>
          </div>
          <div className="space-y-[2px]">
            <button 
              onClick={() => toggleSection('Projects')}
              className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${openSection === 'Projects' ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}
            >
              <div className="flex items-center gap-2">
                <FolderKanban size={16} />
                <span className="text-sm font-medium">Projects</span>
              </div>
              <ChevronRight size={14} className={`transition-transform duration-200 ${openSection === 'Projects' ? 'rotate-90' : ''}`} />
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
                      className={({isActive}) => `block px-2 py-1.5 rounded-md text-sm transition-colors ${isActive ? 'text-zinc-50 bg-zinc-800/50' : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/30'}`}
                    >
                      All Projects
                    </NavLink>
                    
                    {projects.slice(0, 5).map((project) => (
                      <NavLink 
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className={({isActive}) => `block px-2 py-1.5 rounded-md text-sm transition-colors ${isActive ? 'text-zinc-50 bg-zinc-800/50' : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/30'} truncate`}
                      >
                        {project.name}
                      </NavLink>
                    ))}
                    
                    {projects.length > 5 && (
                      <NavLink 
                        to="/projects"
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
          <div className="text-xs font-medium text-zinc-500 mb-2 px-2">
            Intelligence
          </div>
          <div className="space-y-[2px]">
            <div className="flex items-center gap-2 p-2 rounded-md transition-colors text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/40 cursor-pointer">
              <Bot size={16} />
              <span className="text-sm font-medium">Korix Copilot</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md transition-colors text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/40 cursor-pointer">
              <Sparkles size={16} />
              <span className="text-sm font-medium">Task Extractor</span>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <div className="space-y-[2px]">
            <NavLink to="/settings" className={({isActive}) => `flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60 text-zinc-50' : 'hover:bg-zinc-800/40 hover:text-zinc-50 text-zinc-300'}`}>
              <Settings2 size={16} />
              <span className="text-sm font-medium">Settings</span>
            </NavLink>
          </div>
        </div>

      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-zinc-800/50 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full gap-3 p-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors group"
        >
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <img src="https://github.com/shadcn.png" alt="Profile" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex flex-col items-start flex-1 text-left overflow-hidden">
            <span className="text-sm font-semibold text-zinc-50 leading-tight truncate w-full">
              {user?.name || 'shadcn'}
            </span>
            <span className="text-xs text-zinc-400 leading-tight truncate w-full">
              {user?.email || 'm@example.com'}
            </span>
          </div>
          <ChevronsUpDown size={14} className="text-zinc-500 group-hover:text-zinc-300" />
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
