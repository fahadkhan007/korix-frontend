import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ChatPanel from '../components/Chat/ChatPanel';
import { FolderKanban, Users, Plus, UserPlus, CheckSquare, Trash2, MessageSquare } from 'lucide-react';
import { projectsService } from '../api/projects';
import { tasksService, type TaskItem, type TaskPriority, type TaskStatus } from '../api/tasks';
import './Dashboard.css'; // Reuse Dashboard UI containers
import '../components/Chat/ChatPanel.css';

const taskStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const taskPriorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

type ProjectMember = {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [subProjects, setSubProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [addingSubProject, setAddingSubProject] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selfRole, setSelfRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat' | 'subprojects' | 'members'>('tasks');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TaskPriority,
    status: 'TODO' as TaskStatus,
    dueDate: '',
    assigneeId: '',
  });

  const members: ProjectMember[] = project?.members || [];
  const canManageTasks = selfRole === 'ADMIN' || selfRole === 'MEMBER';

  const loadTasks = async (currentProjectId: string) => {
    try {
      setTasksLoading(true);
      const taskData = await tasksService.getTasks(currentProjectId);
      setTasks(taskData.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      try {
        const projData = await projectsService.getProjectById(projectId);
        setProject(projData.project || projData);

        const roleData = await projectsService.getSelfRole(projectId);
        setSelfRole(roleData.role);

        const subData = await projectsService.getSubProjects(projectId);
        setSubProjects(subData.subProjects || []);

        await loadTasks(projectId);
      } catch (err) {
        console.error('Failed to load project details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const handleCreateSubProject = async () => {
    const name = window.prompt('Enter Sub-Project Name:');
    if (!name || !projectId) return;

    setAddingSubProject(true);
    try {
      await projectsService.createSubProject(projectId, { name, description: 'New sub project' });
      // Refresh sub-projects
      const subData = await projectsService.getSubProjects(projectId);
      setSubProjects(subData.subProjects || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create sub-project');
    } finally {
      setAddingSubProject(false);
    }
  };

  const handleAddMember = async () => {
    const email = window.prompt('Enter User Email to add:');
    if (!email || !projectId) return;

    const role = window.prompt('Enter Role (ADMIN, MEMBER, VIEWER):', 'MEMBER') as any;
    if (!['ADMIN', 'MEMBER', 'VIEWER'].includes(role)) return alert('Invalid role');

    setAddingMember(true);
    try {
      await projectsService.addMember(projectId, { email, role });
      alert('Invitation sent successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setTaskSubmitting(true);
    setTaskError('');
    try {
      const response = await tasksService.createTask(projectId, {
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate || undefined,
        assigneeId: newTask.assigneeId || null,
      });

      setTasks((current) => [response.task, ...current]);
      setNewTask({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: '',
        assigneeId: '',
      });
      setShowTaskForm(false);
    } catch (err: any) {
      setTaskError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleTaskFieldChange = async (
    taskId: string,
    updates: Partial<Pick<TaskItem, 'status' | 'priority' | 'assigneeId'>>
  ) => {
    if (!projectId) return;

    try {
      const response = await tasksService.updateTask(projectId, taskId, updates);
      setTasks((current) => current.map((task) => (task.id === taskId ? response.task : task)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!projectId) return;

    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;

    try {
      await tasksService.deleteTask(projectId, taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-container dashboard-container">
          {loading ? (
            <p>Loading project details...</p>
          ) : !project ? (
            <p>Project not found or access denied.</p>
          ) : (
            <>
              {/* Project Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', margin: 0 }}>{project.name}</h1>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{project.description || 'No description'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {selfRole === 'ADMIN' && (
                    <button className="btn btn-outline" onClick={handleAddMember} disabled={addingMember}>
                      <UserPlus size={16} /> <span>{addingMember ? 'Adding...' : 'Add Member'}</span>
                    </button>
                  )}
                  {selfRole === 'ADMIN' && (
                    <button className="btn btn-accent" onClick={handleCreateSubProject} disabled={addingSubProject}>
                      <Plus size={16} /> <span>{addingSubProject ? 'Creating...' : 'New Sub-Project'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Bar */}
              <div className="tab-bar">
                <button
                  className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tasks')}
                >
                  <CheckSquare size={15} style={{ display: 'inline', marginRight: 6 }} />
                  Tasks
                </button>
                <button
                  className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageSquare size={15} style={{ display: 'inline', marginRight: 6 }} />
                  Chat
                </button>
                <button
                  className={`tab-btn ${activeTab === 'subprojects' ? 'active' : ''}`}
                  onClick={() => setActiveTab('subprojects')}
                >
                  <FolderKanban size={15} style={{ display: 'inline', marginRight: 6 }} />
                  Sub-Projects
                </button>
                <button
                  className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                  onClick={() => setActiveTab('members')}
                >
                  <Users size={15} style={{ display: 'inline', marginRight: 6 }} />
                  Members
                </button>
              </div>

              {/* Tab Content */}
              <div className="dashboard-grid">

                {/* ── TASKS TAB ── */}
                {activeTab === 'tasks' && <section className="card section-card">
                  <div className="section-header">
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckSquare size={20} /> Tasks
                    </h3>
                    {canManageTasks && (
                      <button
                        type="button"
                        className="btn btn-accent btn-sm"
                        onClick={() => {
                          setTaskError('');
                          setShowTaskForm((current) => !current);
                        }}
                      >
                        <Plus size={16} />
                        <span>{showTaskForm ? 'Close Form' : 'Assign Task'}</span>
                      </button>
                    )}
                  </div>

                  {canManageTasks && showTaskForm && (
                    <form onSubmit={handleCreateTask} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask((current) => ({ ...current, title: e.target.value }))}
                        required
                      />
                      <textarea
                        className="input-field"
                        placeholder="Task description"
                        value={newTask.description}
                        onChange={(e) => setNewTask((current) => ({ ...current, description: e.target.value }))}
                        rows={3}
                        style={{ resize: 'vertical', minHeight: '96px' }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                        <select
                          className="input-field"
                          value={newTask.priority}
                          onChange={(e) => setNewTask((current) => ({ ...current, priority: e.target.value as TaskPriority }))}
                        >
                          {taskPriorities.map((priority) => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                        <select
                          className="input-field"
                          value={newTask.status}
                          onChange={(e) => setNewTask((current) => ({ ...current, status: e.target.value as TaskStatus }))}
                        >
                          {taskStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <select
                          className="input-field"
                          value={newTask.assigneeId}
                          onChange={(e) => setNewTask((current) => ({ ...current, assigneeId: e.target.value }))}
                        >
                          <option value="">Unassigned</option>
                          {members.map((member) => (
                            <option key={member.user.id} value={member.user.id}>
                              {member.user.name || member.user.email}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          className="input-field"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask((current) => ({ ...current, dueDate: e.target.value }))}
                        />
                      </div>
                      {taskError && <div className="error-message">{taskError}</div>}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setTaskError('');
                            setShowTaskForm(false);
                          }}
                          disabled={taskSubmitting}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-accent" disabled={taskSubmitting}>
                          <Plus size={16} /> <span>{taskSubmitting ? 'Creating...' : 'Create Task'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="projects-list">
                    {tasksLoading ? (
                      <p>Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                      <p>No tasks yet. Create the first one for this project.</p>
                    ) : (
                      tasks.map((task) => (
                        <div key={task.id} className="project-item" style={{ alignItems: 'stretch', gap: '1rem' }}>
                          <div className="project-info" style={{ alignItems: 'flex-start', flex: 1 }}>
                            <div>
                              <h4 className="project-name" style={{ marginBottom: '0.35rem' }}>{task.title}</h4>
                              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {task.description || 'No description'}
                              </p>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                              <span className="status-badge status-in-progress">{task.priority}</span>
                              <span className="status-badge status-planning">{task.status.replaceAll('_', ' ')}</span>
                            </div>
                            <div className="project-meta" style={{ marginTop: '0.75rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                              <span className="meta-text">Assignee: {task.assignee?.name || task.assignee?.email || 'Unassigned'}</span>
                              <span className="meta-text">Reporter: {task.reporter?.name || task.reporter?.email}</span>
                              <span className="meta-text">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                            </div>
                          </div>

                          {canManageTasks && (
                            <div style={{ display: 'grid', gap: '0.6rem', minWidth: '210px' }}>
                              <select
                                className="input-field"
                                value={task.status}
                                onChange={(e) => handleTaskFieldChange(task.id, { status: e.target.value as TaskStatus })}
                              >
                                {taskStatuses.map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                              <select
                                className="input-field"
                                value={task.priority}
                                onChange={(e) => handleTaskFieldChange(task.id, { priority: e.target.value as TaskPriority })}
                              >
                                {taskPriorities.map((priority) => (
                                  <option key={priority} value={priority}>{priority}</option>
                                ))}
                              </select>
                              <select
                                className="input-field"
                                value={task.assigneeId || ''}
                                onChange={(e) => handleTaskFieldChange(task.id, { assigneeId: e.target.value || null })}
                              >
                                <option value="">Unassigned</option>
                                {members.map((member) => (
                                  <option key={member.user.id} value={member.user.id}>
                                    {member.user.name || member.user.email}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handleDeleteTask(task.id)}
                                style={{ justifyContent: 'center' }}
                              >
                                <Trash2 size={16} /> <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>}

                {/* ── SUB-PROJECTS TAB ── */}
                {activeTab === 'subprojects' && <section className="card section-card">
                  <div className="section-header">
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FolderKanban size={20} /> Sub-Projects
                    </h3>
                  </div>
                  <div className="projects-list">
                    {subProjects.length === 0 ? (
                      <p>No sub-projects exists.</p>
                    ) : (
                      subProjects.map((sub, idx) => (
                        <div key={idx} className="project-item">
                          <div className="project-info">
                            <h4 className="project-name">
                              <Link to={`/projects/${sub.id}`} style={{ textDecoration: 'none', color: 'var(--color-navy)' }}>
                                {sub.name}
                              </Link>
                            </h4>
                            <span className="status-badge status-planning">Planning</span>
                          </div>
                          <div className="project-meta">
                            <span className="meta-text">{sub.description || 'No description'}</span>
                            <span className="meta-text">{new Date(sub.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>}

                {/* ── MEMBERS TAB ── */}
                {activeTab === 'members' && <section className="card section-card">
                  <div className="section-header">
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={20} /> Members
                    </h3>
                  </div>
                  <div className="projects-list">
                    {project.members && project.members.length > 0 ? (
                      project.members.map((member: any) => (
                        <div key={member.id} className="project-item">
                          <div className="project-info">
                            <h4 className="project-name" style={{ margin: 0 }}>{member.user.name || 'Unknown User'}</h4>
                            <span className="status-badge status-in-progress" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                              {member.role}
                            </span>
                          </div>
                          <div className="project-meta">
                            <span className="meta-text">{member.user.email}</span>
                            <span className="meta-text">Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        No members found. Add new team members to collaborate.
                      </p>
                    )}
                  </div>
                </section>}

                {/* ── CHAT TAB ── */}
                {activeTab === 'chat' && <ChatPanel projectId={project.id} />}

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
