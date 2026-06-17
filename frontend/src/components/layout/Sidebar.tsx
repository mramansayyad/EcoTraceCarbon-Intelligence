import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '../../store/uiStore';
import { 
  LayoutDashboard, 
  PlusCircle, 
  BrainCircuit, 
  Target, 
  Users, 
  Download, 
  X,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Log Activity', path: '/dashboard/log', icon: <PlusCircle className="h-5 w-5" /> },
    { name: 'AI Insights', path: '/dashboard/insights', icon: <BrainCircuit className="h-5 w-5" /> },
    { name: 'Goals & Targets', path: '/dashboard/goals', icon: <Target className="h-5 w-5" /> },
    { name: 'Leaderboard', path: '/dashboard/community', icon: <Users className="h-5 w-5" /> },
    { name: 'Export Reports', path: '/dashboard/export', icon: <Download className="h-5 w-5" /> }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-bg-base/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-bg-surface border-r border-border-color pt-20 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 right-5 lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-bg-elevated cursor-pointer"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        <nav className="flex flex-col gap-1.5 px-4">
          <span className="px-3 text-xxs font-mono uppercase tracking-widest font-semibold text-text-muted mb-2">
            Main Menu
          </span>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent-green/10 text-accent-green border-l-4 border-accent-green pl-3'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border-l-4 border-transparent'
                }`}
              >
                <span className={isActive ? 'text-accent-green' : 'text-text-muted group-hover:text-text-secondary transition-colors'}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="mt-8 px-4 py-4 rounded-xl border border-accent-green/20 bg-bg-elevated/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1.5 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="h-12 w-12 text-accent-lime" />
            </div>
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent-lime" />
              Gemini Personal AI
            </h4>
            <p className="text-xxs text-text-muted mt-1 leading-normal">
              Your carbon footprint answers are just a tap away on the AI Insights tab.
            </p>
          </div>
        </nav>
      </aside>
    </>
  );
};
