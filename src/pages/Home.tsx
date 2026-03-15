
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Activity, Shield, Layers } from 'lucide-react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-layout">
      {/* Public Header */}
      <header className="home-header">
        <div className="home-brand">
          <Sparkles size={24} color="var(--accent-blue)" />
          <span className="brand-text">Korix <span className="text-gradient">AI</span></span>
        </div>
        <nav className="home-nav">
          <Link to="/login" className="nav-link">Sign In</Link>
          <Link to="/register" className="btn btn-primary">
            Get Started
            <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="home-main">
        <section className="hero-section">
          <div className="hero-badge">V2 Now Available</div>
          <h1 className="hero-title">
            The intelligent hub for your <span className="text-gradient">Projects</span>.
          </h1>
          <p className="hero-subtitle">
            Orchestrate tasks, align teams, and execute seamlessly with the minimalist platform built for modern engineering. No clutter, just momentum.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary hero-btn">
              Start Building Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline hero-btn">
              View Demo
            </Link>
          </div>
        </section>

        {/* Features Preview */}
        <section className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Layers size={24} /></div>
            <h3>Unlimited Sub-Projects</h3>
            <p>Break down monolithic architectures into manageable sprints. Nest projects infinitely to match your workflow.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Activity size={24} /></div>
            <h3>Real-time Tracking</h3>
            <p>Instantly visualize team velocity via intuitive progress metrics and an automated dashboard timeline.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield size={24} /></div>
            <h3>Granular Access Control</h3>
            <p>Admin, Member, and Viewer roles keep your codebase insights secure while fostering collaboration.</p>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="home-footer">
        <p>© {new Date().getFullYear()} Korix AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
