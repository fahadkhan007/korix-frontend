import { useState, useEffect } from 'react';
import { Bell, Search, Plus, User, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import { projectsService } from '../api/projects';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import socket from '../socket/socket';
import Modal from './Modal';
import './Header.css';

interface Notification {
  id: string;
  projectId: string;
  projectName: string;
  conversationId: string;
  senderName: string;
  content: string;
  createdAt: string | Date;
}

export default function Header() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const handleNotification = (notif: Notification) => {
      setNotifications(prev => [notif, ...prev].slice(0, 50)); // Keep last 50
      setUnreadCount(prev => prev + 1);
    };
    
    socket.on('notification', handleNotification);
    
    return () => {
      socket.off('notification', handleNotification);
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await projectsService.createProject({ name: form.name.trim(), description: form.description.trim() });
      setIsModalOpen(false);
      setForm({ name: '', description: '' });
      navigate(`/projects/${res.project.id}`);
    } catch (err: any) {
      console.error('Failed to create project', err);
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const rows = [
    { icon: <User size={16} />,        label: 'Full Name',    value: user?.name || '—' },
    { icon: <Mail size={16} />,        label: 'Email',        value: user?.email || '—' },
    { icon: <ShieldCheck size={16} />, label: 'Verification', value: user?.isVerified ? 'Verified ✓' : 'Not verified' },
  ];

  return (
    <>
      <header className="jira-header">
        <div className="header-left">
          {/* We moved page title out of header, header is purely global nav in Jira */}
        </div>

        <div className="header-center">
          <div className="jira-search-bar">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Type / to search" className="search-input" />
          </div>
          <button className="btn btn-primary-blue" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Create</span>
          </button>
        </div>

        <div className="header-right">
          <button className="btn btn-glass">
            <span style={{ fontSize: '0.85rem' }}>See plans</span>
          </button>
          <div className="header-icon-group relative">
            <div className="relative">
              <button 
                className="icon-btn relative" 
                aria-label="Notifications" 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setUnreadCount(0); }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-[6px] right-[6px] w-2 h-2 bg-[#f85149] rounded-full ring-2 ring-[#010409]"></span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d1117] border border-[#30363d] rounded-md shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px]">
                    <div className="px-4 py-3 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[#f0f6fc]">Notifications</h4>
                      {notifications.length > 0 && (
                        <button className="text-xs text-[#58a6ff] hover:underline" onClick={() => setNotifications([])}>Clear all</button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto hide-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-[#8b949e]">
                          No new notifications.
                        </div>
                      ) : (
                        notifications.map((notif, idx) => (
                          <div 
                            key={notif.id || idx} 
                            className="p-3 border-b border-[#30363d]/50 hover:bg-[#161b22] transition-colors cursor-pointer flex flex-col gap-1"
                            onClick={() => {
                              setIsNotifOpen(false);
                              navigate(`/projects/${notif.projectId}`);
                            }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-sm font-semibold text-[#f0f6fc]">{notif.senderName}</span>
                              <span className="text-[10px] text-[#8b949e] shrink-0">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <span className="text-xs text-[#58a6ff] truncate">{notif.projectName}</span>
                            <p className="text-xs text-[#8b949e] line-clamp-2 mt-1">{notif.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <button className="icon-btn" aria-label="Help"><Search size={18} /> {/* Using search as placeholder for ? */}</button>
            <div className="relative">
              <div className="header-avatar cursor-pointer hover:ring-2 hover:ring-[#8b949e] transition-all" title={user?.name || 'Profile'} onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}>
                {getInitials(user?.name)}
              </div>
              
              {isSettingsModalOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSettingsModalOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-[#0d1117] border border-[#30363d] rounded-md shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
                      <h4 className="text-sm font-semibold text-[#f0f6fc]">{user?.name}</h4>
                      <p className="text-xs text-[#8b949e] truncate">{user?.email}</p>
                    </div>
                    <div className="flex flex-col">
                      {rows.map((row, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 ${i < rows.length - 1 ? 'border-b border-[#30363d]/50' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className="text-[#8b949e] w-4 shrink-0 flex justify-center">{row.icon}</div>
                            <span className="text-sm text-[#8b949e]">{row.label}</span>
                          </div>
                          <span className={`text-xs font-medium ${row.label === 'Verification' && !user?.isVerified ? 'text-[#d29922]' : 'text-[#f0f6fc]'}`}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {!user?.isVerified && (
                      <div className="p-3 bg-[#d29922]/10 border-t border-[#d29922]/30 flex items-start gap-2">
                        <AlertCircle size={14} className="text-[#d29922] mt-0.5 shrink-0" />
                        <span className="text-xs text-[#d29922]">
                          Unverified email. Check your inbox.
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create project">
        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Project Name *</label>
            <input 
              className="input-field" 
              placeholder="e.g. Website Redesign" 
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required 
              autoFocus 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea 
              className="input-field" 
              placeholder="Optional details" 
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} 
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={loading}>
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
