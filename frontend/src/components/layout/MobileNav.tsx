import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, BrainCircuit, Users } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const items = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Log', path: '/dashboard/log', icon: <PlusCircle className="h-6 w-6 text-accent-green" /> },
    { name: 'AI Advice', path: '/dashboard/insights', icon: <BrainCircuit className="h-5 w-5" /> },
    { name: 'Social', path: '/dashboard/community', icon: <Users className="h-5 w-5" /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border-color bg-bg-surface/90 backdrop-blur-md flex items-center justify-around py-2 shadow-2xl">
      {items.map((item) => {
        const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path));
        
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 text-xxs font-medium transition-colors ${
              isActive ? 'text-accent-green' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span className={isActive ? 'text-accent-green' : 'text-text-muted'}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
