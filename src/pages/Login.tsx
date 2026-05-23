import { Auth, type AuthView } from '../components/ui/auth-form-1';
import { DottedSurface } from '../components/ui/dotted-surface';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleNavigate = (view: AuthView) => {
    if (view === "sign-up") {
      navigate('/register');
    } else if (view === "sign-in") {
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <DottedSurface />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/5 backdrop-blur-md"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="relative z-10 w-full px-4 pt-24 pb-16 flex-1 flex items-center justify-center">
        <Auth defaultView="sign-in" onNavigate={handleNavigate} />
      </div>

      {/* Simple Footer */}
      <footer className="relative z-20 w-full py-8 border-t border-white/5 bg-black flex flex-col items-center justify-center mt-auto">
        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer mb-2">
          <img src="/logo.svg" alt="Korix" className="w-4 h-4 grayscale" />
          <span className="text-white font-bold tracking-tight text-xs">Korix</span>
        </div>
        <p className="text-xs text-neutral-600 font-medium tracking-wide">
          © {new Date().getFullYear()} Korix. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
