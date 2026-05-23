import React, { useState, useEffect, useRef } from 'react';
import { Home, LayoutDashboard, CheckSquare, Users, Settings, Inbox, Sparkles, Search, ArrowUpRight, Bot, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardMockup() {
  const fullText = "@KorixAI analyze recent task blockages on Frontend.";
  const [typedText, setTypedText] = useState("");
  const [chatState, setChatState] = useState<'idle' | 'typing' | 'sent' | 'responding' | 'done'>('idle');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatState]);

  useEffect(() => {
    if (chatState === 'idle') {
       const t = setTimeout(() => setChatState('typing'), 1000);
       return () => clearTimeout(t);
    }
    if (chatState === 'typing') {
       let i = 0;
       const interval = setInterval(() => {
          setTypedText(fullText.slice(0, i+1));
          i++;
          if (i === fullText.length) {
             clearInterval(interval);
             setTimeout(() => setChatState('sent'), 600);
          }
       }, 40);
       return () => clearInterval(interval);
    }
    if (chatState === 'sent') {
       const t = setTimeout(() => setChatState('responding'), 1000);
       return () => clearTimeout(t);
    }
    if (chatState === 'responding') {
       const t = setTimeout(() => {
          setChatState('done');
          setTimeout(() => {
              setChatState('idle');
              setTypedText('');
          }, 6000); 
       }, 1500);
       return () => clearTimeout(t);
    }
  }, [chatState, fullText]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-10 overflow-hidden" style={{ perspective: '2000px' }}>
      <div className="flex items-center justify-center transform scale-[0.3] sm:scale-[0.45] md:scale-75 lg:scale-90 xl:scale-100 origin-center transition-transform duration-500 w-[1200px] shrink-0">
        <div 
          className="w-full h-[680px] bg-[#0A0A0A] border border-white/10 rounded-2xl flex overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.15)] transition-transform duration-700 ease-out hover:rotate-y-[-5deg] hover:rotate-x-[2deg]"
          style={{ transform: 'rotateY(-15deg) rotateX(5deg)' }}
        >
          {/* Sidebar */}
          <div className="w-64 border-r border-white/5 bg-black/40 flex flex-col p-4 shrink-0">
          <div className="flex items-center gap-2 px-2 py-3 mb-6">
            <img src="/logo.svg" alt="Korix" className="w-6 h-6" />
            <span className="text-white font-bold tracking-tight text-lg">Korix</span>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-neutral-300 focus:outline-none focus:border-white/20"
              disabled
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 rounded px-1.5 py-0.5 text-[10px] text-neutral-400">/</div>
          </div>

          <nav className="flex flex-col gap-1 mb-8">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-white cursor-pointer">
              <Home size={16} />
              <span className="text-sm font-medium">Overview</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <LayoutDashboard size={16} />
              <span className="text-sm font-medium">Projects</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <CheckSquare size={16} />
              <span className="text-sm font-medium">Tasks</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <Users size={16} />
              <span className="text-sm font-medium">Team</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer group">
              <Sparkles size={16} className="text-indigo-400 group-hover:text-indigo-300" />
              <span className="text-sm font-medium text-indigo-200 group-hover:text-indigo-100">AI Agents</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <Inbox size={16} />
              <span className="text-sm font-medium">Inbox</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer mt-4">
              <Settings size={16} />
              <span className="text-sm font-medium">Settings</span>
            </div>
          </nav>

          <div className="mt-auto">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-3 mb-3">Workspaces</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-white/5 cursor-pointer group">
                 <div className="flex items-center gap-2 text-sm text-neutral-400 group-hover:text-neutral-200">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                   Frontend Revamp
                 </div>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-white/5 cursor-pointer group">
                 <div className="flex items-center gap-2 text-sm text-neutral-400 group-hover:text-neutral-200">
                   <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]"></div>
                   Backend API
                 </div>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-white/5 cursor-pointer group">
                 <div className="flex items-center gap-2 text-sm text-neutral-400 group-hover:text-neutral-200">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                   AI Integration
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-[#111] to-[#050505] p-10 overflow-hidden relative">
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'}}></div>

          <header className="mb-10 relative z-10">
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-sm text-neutral-400">Visualize your project momentum and AI activity</p>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-10 relative z-10">
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 backdrop-blur-sm">
              <div className="text-sm text-neutral-400 mb-2">Active Projects</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-white tracking-tight">12</div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                  <ArrowUpRight size={14} />
                  <span>3</span>
                </div>
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 backdrop-blur-sm">
              <div className="text-sm text-neutral-400 mb-2">Tasks Completed</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-white tracking-tight">1,430</div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                  <ArrowUpRight size={14} />
                  <span>15%</span>
                </div>
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-sm text-indigo-300 mb-2 flex items-center gap-1.5 font-medium">
                  <Sparkles size={14} /> AI Actions Executed
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-white tracking-tight">845</div>
                  <div className="flex items-center gap-1 text-indigo-400 text-sm font-medium">
                    <ArrowUpRight size={14} />
                    <span>32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-5 gap-6 relative z-10 flex-1 min-h-0">
            {/* Task Velocity Chart */}
            <div className="col-span-2 bg-black/40 border border-white/5 rounded-xl p-6 flex flex-col backdrop-blur-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Task Velocity</h3>
                <p className="text-xs text-neutral-400">Weekly completed tasks overview</p>
              </div>
              <div className="flex-1 flex items-end gap-3 pt-6 relative">
                 {/* Chart grid lines */}
                 <div className="absolute inset-x-0 bottom-0 top-6 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-t border-white/10 w-full"></div>
                    <div className="border-t border-white/10 w-full"></div>
                    <div className="border-t border-white/10 w-full"></div>
                    <div className="border-t border-white/10 w-full"></div>
                 </div>

                {[45, 65, 40, 85, 55, 90, 75].map((height, i) => (
                  <div key={i} className="flex-1 rounded-t relative group cursor-pointer hover:bg-white/5 transition-colors h-full flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:from-indigo-500 group-hover:to-indigo-300" 
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            {/* KorixAI Live Feed */}
            <div className="col-span-3 bg-black/40 border border-white/5 rounded-xl p-6 flex flex-col relative overflow-hidden backdrop-blur-sm group hover:bg-white/5 transition-colors">
               {/* Decorative glow - only shows faintly on hover now */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               
               <div className="mb-4 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Bot size={18} className="text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">KorixAI Feed</h3>
                </div>
                <p className="text-xs text-indigo-200/50">Live agent interactions</p>
              </div>

              <div ref={chatContainerRef} className="flex-1 flex flex-col gap-4 relative z-10 overflow-y-auto pr-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                 <AnimatePresence>
                   {(chatState === 'sent' || chatState === 'responding' || chatState === 'done') && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }} 
                       animate={{ opacity: 1, y: 0 }} 
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="flex gap-3"
                     >
                       <div className="w-7 h-7 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">U</div>
                       <div className="bg-white/5 border border-white/5 rounded-lg rounded-tl-none p-3 text-xs text-neutral-300 leading-relaxed shadow-sm">
                         <span className="text-indigo-400 font-medium">@KorixAI</span> analyze recent task blockages on Frontend.
                       </div>
                     </motion.div>
                   )}
                   
                   {(chatState === 'done') && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }} 
                       animate={{ opacity: 1, y: 0 }} 
                       className="flex gap-3"
                     >
                       <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(79,70,229,0.5)]">
                         <Sparkles size={12} className="text-white" />
                       </div>
                       <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg rounded-tl-none p-3 text-xs text-indigo-100/90 leading-relaxed shadow-sm">
                         <p className="mb-2">I've identified 3 tasks blocked by missing design assets.</p>
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }} 
                           animate={{ opacity: 1, height: 'auto' }} 
                           transition={{ delay: 0.5 }}
                           className="bg-black/40 rounded p-2 border border-indigo-500/20 mb-2 overflow-hidden"
                         >
                           <div className="text-emerald-400 font-medium mb-1 flex items-center gap-1"><CheckSquare size={10} /> Action Executed</div>
                           <p className="text-[10px] text-neutral-400">Automatically pinged the Design Team channel for missing SVG exports.</p>
                         </motion.div>
                         <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                            Anything else I can help with?
                         </motion.p>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
              
              <div className="mt-3 pt-3 border-t border-white/5 relative z-10">
                {(chatState === 'idle' || chatState === 'typing') ? (
                  <div className="bg-black/50 border border-white/10 rounded-lg py-2 px-3 flex items-center gap-2">
                     <span className="text-xs text-neutral-300 flex-1 h-4 flex items-center">
                        {typedText}
                        {chatState === 'typing' && <span className="w-1.5 h-3 bg-indigo-400 animate-pulse ml-0.5"></span>}
                     </span>
                     <Send size={14} className={chatState === 'typing' && typedText.length > 5 ? 'text-indigo-400' : 'text-neutral-600'} />
                  </div>
                ) : (
                  <div className="bg-black/50 border border-white/10 rounded-lg py-2 px-3 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                     <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">
                       {chatState === 'responding' ? 'Agent typing...' : 'Agent standing by'}
                     </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </div>
  );
}
