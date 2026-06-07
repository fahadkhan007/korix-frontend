import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { CheckSquare, Circle, Clock, AlertTriangle, CheckCircle2, User, Calendar } from 'lucide-react';
import { projectsService } from '../api/projects';
import { tasksService, type TaskItem } from '../api/tasks';
import './Tasks.css';

type TaskWithProject = TaskItem & { projectName: string };

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  TODO:        { label: 'To Do',      color: 'var(--text-tertiary)',  icon: <Circle size={14} /> },
  IN_PROGRESS: { label: 'In Progress',color: 'var(--accent-blue)',    icon: <Clock size={14} /> },
  IN_REVIEW:   { label: 'In Review',  color: 'var(--accent-amber)',   icon: <AlertTriangle size={14} /> },
  DONE:        { label: 'Done',       color: 'var(--accent-green)',   icon: <CheckCircle2 size={14} /> },
};

const PRIORITY_CONFIG: Record<string, { color: string }> = {
  URGENT: { color: 'var(--accent-red)' },
  HIGH:   { color: 'var(--accent-amber)' },
  MEDIUM: { color: '#A5B4FC' },
  LOW:    { color: 'var(--text-tertiary)' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const pd = await projectsService.getProjects();
        const projects = pd.projects || [];
        const groups = await Promise.all(
          projects.map(async (p: any) => {
            const td = await tasksService.getTasks(p.id);
            return (td.tasks || []).map((t: TaskItem) => ({ ...t, projectName: p.name }));
          })
        );
        setTasks(groups.flat());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);
  const statuses = ['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="flex-1 overflow-y-auto bg-[#0d1117] hide-scrollbar">
          <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <CheckSquare size={20} className="text-[#8b949e]" />
                <h1 className="text-xl font-semibold text-[#f0f6fc]">All Tasks ({filtered.length})</h1>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 border-b border-[#30363d] pb-2">
              {statuses.map(s => (
                <button 
                  key={s} 
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === s ? 'bg-[#1f6feb]/10 text-[#58a6ff] border border-[#1f6feb]/30' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] border border-transparent'}`}
                  onClick={() => setFilter(s)}
                >
                  {s === 'ALL' ? 'All Tasks' : STATUS_CONFIG[s]?.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-sm text-[#8b949e]">Gathering your tasks…</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center border border-dashed border-[#30363d] rounded-md bg-[#0d1117]">
                  <CheckSquare size={36} className="text-[#8b949e] mb-3 opacity-50" />
                  <p className="text-sm text-[#8b949e]">No tasks found. Take a break!</p>
                </div>
              ) : (
                filtered.map(task => {
                  const sc = STATUS_CONFIG[task.status];
                  const pc = PRIORITY_CONFIG[task.priority];
                  return (
                    <div key={task.id} className="bg-[#0d1117] border border-[#30363d] rounded-md p-4 hover:border-[#8b949e] transition-colors">
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <span style={{ color: sc?.color }}>{sc?.icon}</span>
                          <span className="text-base font-semibold text-[#f0f6fc]">{task.title}</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded border border-[#30363d] bg-[#161b22]" style={{ color: pc?.color }}>
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-sm text-[#8b949e] line-clamp-2 mb-4 pl-7">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-[#8b949e] pl-7">
                        <Link to={`/projects/${task.projectId}`} className="text-[#58a6ff] hover:underline font-medium">
                          {task.projectName}
                        </Link>
                        
                        <div className="flex items-center gap-1.5 border-l border-[#30363d] pl-4">
                          <User size={12} />
                          <span>{task.assignee?.name || task.assignee?.email || 'Unassigned'}</span>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 border-l border-[#30363d] pl-4">
                            <Calendar size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
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
