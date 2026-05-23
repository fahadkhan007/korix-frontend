import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SparklesCore } from '@/components/ui/sparkles';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { DashboardMockup } from '@/components/home/DashboardMockup';
import './Home.css';

export default function Home() {
  return (
    <div className="home-layout bg-black">
      {/* Public Header - keeping the existing nav */}
      <header className="home-header relative z-30 bg-transparent border-none flex items-center justify-between p-6">
        <div className="home-brand flex items-center gap-3">
          <img src="/logo.svg" alt="Korix" className="w-8 h-8" />
          <span className="brand-text text-white text-2xl tracking-tight font-bold">Korix</span>
        </div>
        <nav className="home-nav flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">Sign In</Link>
          <Link to="/register" className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-400/20 transition-all duration-300">
            Get Started
            <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      {/* Hero Section with Sparkles */}
      <main className="flex-1 w-full bg-black flex flex-col items-center justify-center overflow-hidden pt-20 pb-32">
        <motion.h1 
          initial={{ opacity: 0.1, textShadow: "0px 0px 0px rgba(255,255,255,0)" }}
          animate={{ 
            opacity: [0.1, 0.9, 0.1, 1, 0.4, 1],
            textShadow: [
              "0px 0px 0px rgba(255,255,255,0)",
              "0px 0px 30px rgba(255,255,255,0.8)",
              "0px 0px 0px rgba(255,255,255,0)",
              "0px 0px 40px rgba(255,255,255,0.9)",
              "0px 0px 15px rgba(255,255,255,0.3)",
              "0px 0px 0px rgba(255,255,255,0)" // Settles at normal brightness, no crazy glow
            ]
          }}
          transition={{ 
            duration: 1.5, 
            times: [0, 0.15, 0.25, 0.5, 0.65, 1],
            ease: "linear",
            delay: 0.2
          }}
          className="md:text-7xl text-5xl lg:text-9xl font-bold text-center text-white relative z-20 tracking-tighter"
        >
          Korix
        </motion.h1>
        <div className="w-full max-w-[40rem] h-40 relative">
          {/* Gradients */}
          <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-20 md:inset-x-60 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute inset-x-20 md:inset-x-60 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px w-1/4" />

          {/* Core component */}
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />

          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)] md:[mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="relative z-20 flex flex-col items-center px-4 -mt-4"
        >
          <p className="text-center text-lg md:text-xl text-neutral-400 max-w-2xl text-balance font-light leading-relaxed">
            The AI-native workspace that seamlessly integrates task management, intelligent agents, and real-time collaboration. Automate the busywork and let your team focus on shipping.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-8 py-3.5 text-base rounded-full font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] border border-blue-400/20 transition-all duration-300 hover:scale-[1.02]">
              Start Building Free
            </Link>
            <button onClick={() => document.getElementById('demo-dashboard')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white px-8 py-3.5 text-base rounded-full font-medium border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              View Demo
            </button>
          </div>
        </motion.div>
      </main>

      {/* Demo Dashboard Section */}
      <section id="demo-dashboard" className="relative w-full min-h-[120vh] bg-black flex flex-col items-center overflow-hidden border-t border-white/5 pt-32 pb-20">
        <DottedSurface className="absolute inset-0 size-full opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            aria-hidden="true"
            className="absolute top-1/3 left-1/2 w-[1000px] h-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)] blur-[60px]"
          />
        </div>

        {/* Section Header Text */}
        <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mb-12">
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-6 text-balance">
            Project management reimagined
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl text-balance font-light leading-relaxed">
            Korix intelligently organizes your workflow, aligns your team, and automates repetitive tasks, giving you the power to focus on what matters most.
          </p>
          <Link to="/register" className="bg-white text-black hover:bg-neutral-200 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Start Building
          </Link>
        </div>
        
        {/* Dashboard Mockup Component */}
        <div className="relative z-10 w-full flex-1 flex items-start justify-center mt-10">
          <DashboardMockup />
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="relative z-20 w-full py-8 border-t border-white/5 bg-black flex flex-col items-center justify-center">
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
