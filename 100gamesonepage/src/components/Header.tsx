import React from 'react';
import { Search, Gamepad2, TrendingUp, Sparkles, X } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';

interface HeaderProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  setDebouncedSearch: (query: string) => void;
  categories: string[];
}

const CATEGORY_MAP: Record<string, string> = {
  'All': 'الكل',
  'Action': 'أكشن',
  'Racing': 'سباق',
  'Puzzle': 'ألغاز',
  'Arcade': 'أركيد',
  'Sports': 'رياضة',
  'Adventure': 'مغامرة',
  'Girl': 'بنات',
  'Shooting': 'رماية',
  'Driving': 'قيادة',
  'Multiplayer': 'جماعية',
  'Strategy': 'استراتيجية',
  'Simulation': 'محاكاة'
};

export const Header: React.FC<HeaderProps> = ({ 
  activeCategory, 
  onCategoryChange, 
  searchQuery, 
  onSearchChange,
  setDebouncedSearch,
  categories
}) => {
  return (
    <header className="sticky top-0 z-40 bg-cyber-black/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-electric-purple rounded-xl flex items-center justify-center shadow-lg shadow-electric-purple/20">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">
                100games<span className="text-electric-purple">onepage</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  2,431 Players Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-8 relative group hidden md:block">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-white/20 group-focus-within:text-electric-purple transition-colors" />
              <input 
                type="text"
                placeholder="ابحث عن ألعابك المفضلة..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setDebouncedSearch(searchQuery)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-electric-purple/50 focus:bg-white/10 transition-all placeholder:text-white/20"
              />
              <div className="absolute right-2 flex items-center gap-2">
                {searchQuery && (
                  <button 
                    onClick={() => onSearchChange('')}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white/40 hover:text-white" />
                  </button>
                )}
                <button 
                  onClick={() => setDebouncedSearch(searchQuery)}
                  className="px-3 py-1.5 bg-electric-purple/20 hover:bg-electric-purple text-electric-purple hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all border border-electric-purple/30"
                >
                  بحث
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-white/60">
              <a href="#" className="hover:text-electric-purple transition-colors flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Trending
              </a>
              <a href="#" className="hover:text-electric-purple transition-colors flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> New Games
              </a>
            </nav>
            <div className="h-6 w-px bg-white/10 hidden lg:block" />
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-6 py-2 bg-electric-purple text-white rounded-full text-xs font-black uppercase italic hover:bg-electric-purple/80 transition-all shadow-lg shadow-electric-purple/20 active:scale-95"
            >
              Play Now
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="relative group md:hidden">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-white/20 group-focus-within:text-electric-purple transition-colors" />
            <input 
              type="text"
              placeholder="ابحث عن ألعابك المفضلة..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setDebouncedSearch(searchQuery)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-electric-purple/50 focus:bg-white/10 transition-all placeholder:text-white/20"
            />
            <div className="absolute right-2 flex items-center gap-2">
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white/40 hover:text-white" />
                </button>
              )}
              <button 
                onClick={() => setDebouncedSearch(searchQuery)}
                className="px-3 py-1.5 bg-electric-purple/20 hover:bg-electric-purple text-electric-purple hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all border border-electric-purple/30"
              >
                بحث
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap border transition-all",
                activeCategory === cat
                  ? "bg-electric-purple border-electric-purple text-white shadow-lg shadow-electric-purple/20"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
              )}
            >
              {CATEGORY_MAP[cat] || cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
