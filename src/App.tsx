import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import VerifyEmail from './pages/VerifyEmail';
import ProjectDetails from './pages/ProjectDetails';
import JoinProject from './pages/JoinProject';
import ProjectsPage from './pages/Projects';
import TasksPage from './pages/Tasks';
import StarredPage from './pages/Starred';
import TeamPage from './pages/Team';
import SettingsPage from './pages/Settings';
import './App.css'; 

const AppLoader = () => (
  <div className="app-loader-screen">
    <div className="app-loader-card">
      <div className="app-loader-mark">
        <img src="/logo.svg" alt="Korix Loading" className="w-12 h-12 animate-pulse" />
      </div>
      <div className="app-loader-copy">
        <h2>Korix</h2>
        <p>Restoring your workspace and session...</p>
      </div>
      <div className="app-loader-bar">
        <span></span>
      </div>
    </div>
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <AppLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <Outlet />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/projects/join" element={<JoinProject />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/starred" element={<StarredPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      {/* Catch all to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LoadingProvider>
          <AppRoutes />
        </LoadingProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
