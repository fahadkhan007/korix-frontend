import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Briefcase, CheckCircle, Clock, AlertTriangle, CircleDot, Activity } from 'lucide-react';
import { projectsService } from '../api/projects';
import { authService } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    if (localStorage.getItem('pending_invite_token')) {
      window.location.href = '/projects/join';
      return;
    }
    const fetch = async () => {
      try {
        const data = await projectsService.getProjects();
        setProjects(data.projects || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      setResendStatus('Email sent!');
    } catch (e: any) {
      setResendStatus(e.response?.data?.message || 'Failed');
    } finally {
      setResending(false);
    }
  };

  const stats = [
    { title: 'Active Projects', value: String(projects.length), icon: <Briefcase size={16} className="text-[#8b949e]" /> },
    { title: 'Tasks Completed', value: '0', icon: <CheckCircle size={16} className="text-[#3fb950]" /> },
    { title: 'Hours Tracked', value: '0h', icon: <Clock size={16} className="text-[#8b949e]" /> },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="flex-1 overflow-y-auto bg-[#0d1117] hide-scrollbar">
          <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
            
            {/* Header Section */}
            <div className="pb-4 border-b border-[#30363d]">
              <h1 className="text-2xl font-semibold text-[#f0f6fc]">
                Good to see you, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-[#8b949e] text-sm mt-1">
                Here's what's happening across your workspace today.
              </p>
            </div>

            {/* Verification Banner */}
            {!user?.isVerified && (
              <div className="flex items-center justify-between bg-[rgba(187,128,9,0.1)] border border-[rgba(187,128,9,0.4)] p-4 rounded-md">
                <div className="flex items-center gap-2 text-[#d29922] text-sm">
                  <AlertTriangle size={16} />
                  <span><strong className="font-semibold">Email not verified.</strong> Please check your inbox or spam folder to verify your account.</span>
                </div>
                <button 
                  className="px-3 py-1.5 text-xs font-semibold text-[#d29922] bg-[rgba(187,128,9,0.1)] hover:bg-[rgba(187,128,9,0.2)] border border-[#bb8009] rounded-md transition-colors disabled:opacity-50"
                  onClick={handleResend} 
                  disabled={resending}
                >
                  {resending ? 'Sending…' : resendStatus || 'Resend verification email'}
                </button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-md p-4 hover:border-[#8b949e] transition-colors cursor-default">
                  <div className="flex items-center gap-2 text-[#8b949e] mb-2">
                    {stat.icon}
                    <span className="text-xs font-medium">{stat.title}</span>
                  </div>
                  <div className="text-2xl font-semibold text-[#f0f6fc]">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Layout (2/3 Projects, 1/3 Activity) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column (Projects) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#f0f6fc]">Your Projects</h2>
                  <Link to="/projects" className="text-sm text-[#58a6ff] hover:underline">
                    View all
                  </Link>
                </div>
                
                <div className="bg-[#0d1117] border border-[#30363d] rounded-md overflow-hidden">
                  {loading ? (
                    <div className="p-8 text-center text-[#8b949e] text-sm border-b border-[#30363d]">Loading projects…</div>
                  ) : projects.length === 0 ? (
                    <div className="p-8 text-center text-[#8b949e] text-sm">
                      No projects yet. Hit <strong className="text-[#c9d1d9]">New Project</strong> to create one.
                    </div>
                  ) : (
                    projects.slice(0, 6).map((project, idx) => (
                      <div 
                        key={project.id} 
                        className={`flex items-start justify-between p-4 hover:bg-[#161b22] transition-colors ${idx !== Math.min(projects.length, 6) - 1 ? 'border-b border-[#30363d]' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-[#21262d] border border-[#30363d] text-[#8b949e] flex items-center justify-center font-semibold text-xs shrink-0">
                            {project.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link to={`/projects/${project.id}`} className="text-[#58a6ff] font-semibold text-base hover:underline">
                              {project.name}
                            </Link>
                            <div className="text-xs text-[#8b949e] mt-1 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <CircleDot size={12} className="text-[#8b949e]" /> Created {new Date(project.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Link to={`/projects/${project.id}`} className="text-xs font-medium bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
                            View
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column (Activity Feed) */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-lg font-semibold text-[#f0f6fc]">Recent Activity</h2>
                <div className="border border-[#30363d] rounded-md bg-[#0d1117] p-4">
                  <div className="space-y-4">
                    <div className="relative flex gap-3">
                      <div className="absolute left-[11px] top-6 bottom-[-20px] w-[2px] bg-[#30363d]" />
                      <div className="relative w-6 h-6 bg-[#21262d] border border-[#30363d] rounded-full flex items-center justify-center shrink-0 z-10">
                        <Activity size={12} className="text-[#58a6ff]" />
                      </div>
                      <div className="flex flex-col pb-2">
                        <div className="text-sm text-[#c9d1d9]">
                          Welcome to <strong className="text-[#f0f6fc] font-semibold">Korix</strong>!
                        </div>
                        <span className="text-xs text-[#8b949e] mt-1">Just now</span>
                      </div>
                    </div>

                    {projects.slice(0, 3).map((p, index) => (
                      <div key={p.id} className="relative flex gap-3">
                        {index !== Math.min(projects.length, 3) - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-[-20px] w-[2px] bg-[#30363d]" />
                        )}
                        <div className="relative w-6 h-6 bg-[#21262d] border border-[#30363d] rounded-full flex items-center justify-center shrink-0 z-10">
                          <CheckCircle size={12} className="text-[#3fb950]" />
                        </div>
                        <div className="flex flex-col pb-2">
                          <div className="text-sm text-[#c9d1d9]">
                            Project <strong className="text-[#f0f6fc] font-semibold">{p.name}</strong> created
                          </div>
                          <span className="text-xs text-[#8b949e] mt-1">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Link to="/projects" className="text-xs font-medium text-[#8b949e] hover:text-[#58a6ff] transition-colors flex items-center gap-1">
                      View all projects →
                    </Link>
                  </div>
                </div>
              </div>

            </div>
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
  );
}
