import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Star } from 'lucide-react';
import './Projects.css'; // Reuse container styles

export default function StarredPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="flex-1 overflow-y-auto bg-[#0d1117] hide-scrollbar">
          <div className="max-w-[1200px] mx-auto p-4 md:p-8">
            <div className="flex flex-col items-center justify-center text-center py-24 min-h-[60vh] border border-dashed border-[#30363d] rounded-md bg-[#0d1117]">
              <div className="w-16 h-16 bg-[#d29922]/10 rounded-full flex items-center justify-center mb-6">
                <Star size={32} className="text-[#d29922]" />
              </div>
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-2">No starred items</h3>
              <p className="text-sm text-[#8b949e] max-w-md mx-auto leading-relaxed">
                You haven't starred any projects or tasks yet. Click the star icon on important items to keep them easily accessible here.
              </p>
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
