import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, User, AlertCircle } from 'lucide-react';
import './Dashboard.css';

export default function SettingsPage() {
  const { user } = useAuth();

  const rows = [
    { icon: <User size={16} />,        label: 'Full Name',    value: user?.name || '—' },
    { icon: <Mail size={16} />,        label: 'Email',        value: user?.email || '—' },
    { icon: <ShieldCheck size={16} />, label: 'Verification', value: user?.isVerified ? 'Verified ✓' : 'Not verified' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="flex-1 overflow-y-auto bg-[#0d1117] hide-scrollbar">
          <div className="max-w-[600px] p-4 md:p-8 space-y-6">
            
            <div className="flex items-center gap-2 pb-4 border-b border-[#30363d]">
              <h1 className="text-xl font-semibold text-[#f0f6fc]">Account Details</h1>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] rounded-md">
              <div className="flex flex-col">
                {rows.map((row, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 ${i < rows.length - 1 ? 'border-b border-[#30363d]' : ''}`}>
                    <div className="text-[#8b949e] w-5 shrink-0 flex justify-center">{row.icon}</div>
                    <span className="text-sm text-[#8b949e] w-28 shrink-0">{row.label}</span>
                    <span className={`text-sm font-medium ${row.label === 'Verification' && !user?.isVerified ? 'text-[#d29922]' : 'text-[#f0f6fc]'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {!user?.isVerified && (
              <div className="flex items-center gap-3 p-4 bg-[#d29922]/10 border border-[#d29922]/30 rounded-md mt-6">
                <AlertCircle size={16} className="text-[#d29922]" />
                <span className="text-sm text-[#d29922]">
                  Your email is not verified. Check your inbox to unlock all features.
                </span>
              </div>
            )}
            
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
