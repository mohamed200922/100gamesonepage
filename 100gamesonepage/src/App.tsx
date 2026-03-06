import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Gamepad2, Play, Maximize2, Loader2, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Game } from './types';

const FEED_BASE_URL = 'https://gamemonetize.com/feed.php?format=0';
const REFERRER_URL = 'https://100gamesonepage.netlify.app';

const AdSpace = ({ type }: { type: 'horizontal' | 'vertical' | 'square' }) => (
  <div className={`bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 overflow-hidden ${
    type === 'horizontal' ? 'w-full h-24 mb-8' : 
    type === 'vertical' ? 'w-full h-[600px]' : 
    'aspect-square w-full'
  }`}>
    <div className="flex items-center gap-2 text-white/20 mb-2">
      <Info className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Advertisement</span>
    </div>
    <div className="text-white/10 text-xs font-mono">AD_SPACE_{type.toUpperCase()}</div>
  </div>
);

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const gameContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchGames = useCallback(async (pageNum: number) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(`${FEED_BASE_URL}&page=${pageNum}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setGames(prev => {
          if (pageNum === 1) return data;
          const existingUrls = new Set(prev.map(g => g.url));
          const newGames = data.filter((g: Game) => !existingUrls.has(g.url));
          return [...prev, ...newGames];
        });
        if (pageNum === 1 && !selectedGame) {
          setSelectedGame(data[0]);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedGame]);

  useEffect(() => {
    fetchGames(1);
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage(prev => {
            const next = prev + 1;
            fetchGames(next);
            return next;
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loading, fetchGames]);

  const categories = useMemo(() => {
    const cats = new Set(games.map(g => g.category));
    return ['All', ...Array.from(cats)].sort();
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
      const matchesSearch = game.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [games, activeCategory, debouncedSearch]);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setIsPlaying(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;

    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const getEmbedUrl = (url: string) => {
    return `${url}?gd_sdk_referrer_url=${REFERRER_URL}`;
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white font-sans selection:bg-electric-purple selection:text-white">
      <Header 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        setDebouncedSearch={setDebouncedSearch}
        categories={categories}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Top Ad Banner */}
        <AdSpace type="horizontal" />

        {/* Main Game Container */}
        {selectedGame && (
          <section className="mb-12">
            <div 
              ref={gameContainerRef}
              className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video bg-black shadow-2xl shadow-electric-purple/20 group"
            >
              {!isPlaying ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                  <img 
                    src={selectedGame.thumb} 
                    alt={selectedGame.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 backdrop-blur-[1px]" />
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(true)}
                    className="relative z-20 w-24 h-24 bg-electric-purple rounded-full flex items-center justify-center shadow-2xl shadow-electric-purple/50 group/play"
                  >
                    <Play className="w-10 h-10 fill-current text-white ml-1" />
                  </motion.button>
                  <p className="relative z-20 mt-6 text-xl font-black uppercase italic tracking-widest text-white drop-shadow-lg animate-pulse">
                    اضغط للبدء
                  </p>
                </div>
              ) : (
                <>
                  <iframe
                    src={getEmbedUrl(selectedGame.url)}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={selectedGame.title}
                  />
                  <button 
                    onClick={toggleFullscreen}
                    className="absolute bottom-6 right-6 z-30 p-3 bg-black/60 hover:bg-electric-purple text-white rounded-xl backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                    title="Full Screen"
                  >
                    <Maximize2 className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            <div className="mt-8 text-center">
              <h1 className="text-4xl md:text-6xl font-black uppercase italic mb-4 tracking-tighter">
                {selectedGame.title}
              </h1>
              <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                {selectedGame.description}
              </p>
            </div>
          </section>
        )}

        {/* Games Grid */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              {debouncedSearch ? `نتائج البحث عن: ${debouncedSearch}` : activeCategory !== 'All' ? `ألعاب ${activeCategory}` : 'جميع الألعاب'}
            </h2>
            <div className="h-px flex-1 bg-white/10 mx-8" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-electric-purple animate-spin" />
              <p className="text-white/40 font-bold uppercase tracking-widest animate-pulse">جاري تحميل الألعاب...</p>
            </div>
          ) : filteredGames.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredGames.map((game, idx) => (
                    <motion.article 
                      key={`${game.title}-${game.category}-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (idx % 10) * 0.05 }}
                      onClick={() => handleGameSelect(game)}
                      className={`relative rounded-2xl overflow-hidden border cursor-pointer transition-all group ${
                        selectedGame?.title === game.title ? 'border-electric-purple ring-2 ring-electric-purple/20' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img 
                          src={game.thumb} 
                          alt={game.title} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-4 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                          <h3 className="font-bold text-sm uppercase italic line-clamp-2 leading-tight mb-1 group-hover:text-electric-purple transition-colors">{game.title}</h3>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{game.category}</span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
                
                {/* Load More Trigger */}
                <div ref={loadMoreRef} className="mt-12 flex justify-center py-8">
                  {loadingMore && (
                    <div className="flex items-center gap-3 text-white/40 font-bold uppercase tracking-widest">
                      <Loader2 className="w-6 h-6 animate-spin text-electric-purple" />
                      جاري تحميل المزيد...
                    </div>
                  )}
                  {!hasMore && games.length > 0 && (
                    <p className="text-white/20 font-bold uppercase tracking-widest">لقد وصلت إلى نهاية القائمة</p>
                  )}
                </div>
              </div>

              {/* Sidebar Ad */}
              <aside className="hidden lg:block w-80 shrink-0">
                <div className="sticky top-32 space-y-8">
                  <AdSpace type="vertical" />
                  <AdSpace type="square" />
                </div>
              </aside>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/40 text-xl font-bold uppercase italic">لم يتم العثور على ألعاب تطابق بحثك.</p>
            </div>
          )}
        </section>
      </main>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-electric-purple text-white rounded-full flex items-center justify-center shadow-2xl shadow-electric-purple/40 hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 md:px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-electric-purple rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-black tracking-tighter uppercase italic">
              100games<span className="text-electric-purple">onepage</span>
            </h2>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-white/40">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
          <p className="text-[10px] font-mono text-white/20">© 2026 100GAMESONEPAGE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
