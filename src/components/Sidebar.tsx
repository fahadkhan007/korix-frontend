import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Settings, LogOut, Grid, Star, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { logoutState } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutState();
    navigate('/login');
  };

  return (
    <aside className="jira-sidebar">
      <div className="jira-sidebar-header">
        <div className="jira-logo flex items-center gap-2">
          <img src="/logo.svg" alt="Korix Logo" className="w-6 h-6" />
          <span className="jira-logo-text font-semibold text-lg">Korix</span>
        </div>
      </div>

      <nav className="jira-sidebar-nav">
        <div className="jira-nav-group">
          <NavLink to="/dashboard" className={({ isActive }) => `jira-nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboards</span>
          </NavLink>
        </div>

        <div className="jira-nav-section">
          <span className="jira-nav-section-label">Projects <Plus size={14} className="jira-nav-action" /></span>
          <NavLink to="/projects" className={({ isActive }) => `jira-nav-link sub-link ${isActive ? 'active' : ''}`}>
             <span className="jira-proj-avatar">K</span>
             <span>All Projects</span>
          </NavLink>
        </div>

        <div className="jira-nav-section">
          <span className="jira-nav-section-label">Your Work</span>
          <NavLink to="/tasks" className={({ isActive }) => `jira-nav-link sub-link ${isActive ? 'active' : ''}`}>
             <CheckSquare size={16} />
             <span>Tasks</span>
          </NavLink>
          <NavLink to="/starred" className={({ isActive }) => `jira-nav-link sub-link ${isActive ? 'active' : ''}`}>
             <Star size={16} />
             <span>Starred</span>
          </NavLink>
        </div>

        <div className="jira-nav-section">
          <span className="jira-nav-section-label">Teams</span>
          <NavLink to="/team" className={({ isActive }) => `jira-nav-link sub-link ${isActive ? 'active' : ''}`}>
             <Users size={16} />
             <span>Directory</span>
          </NavLink>
        </div>
      </nav>

      <div className="jira-sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `jira-nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <button className="jira-nav-link logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
