import React from 'react';
import { Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border-color bg-bg-surface py-8 px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Leaf className="h-5 w-5 text-accent-green" />
        <span className="text-sm font-bold text-text-primary">EcoTrace</span>
        <span className="text-xs text-text-muted">© {new Date().getFullYear()}. Know your impact. Own your future.</span>
      </div>
      <div className="flex items-center gap-6 text-xs text-text-muted">
        <a href="#" className="hover:text-accent-green transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-accent-green transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-accent-green transition-colors">Methodology</a>
      </div>
    </footer>
  );
};
