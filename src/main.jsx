import React, { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from 'react';
import { createRoot } from 'react-dom/client'; // 起動に必要
import { 
  ArrowUpRight, MoveRight, Zap, RefreshCw, Instagram, Twitter, Menu, X, 
  ChevronRight, ChevronDown, Mail, ShieldCheck, Loader2, Maximize2, Compass, 
  Moon, Sun, Cookie, ArrowUp
} from 'lucide-react';

/**
 * Life & Conditioning - Premium Performance Coaching
 * 塚越 貴男 (Takao Tsukakoshi) Official Landing Page
 */

// --- 1. Context & Theme Provider ---
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const getSafeStorage = (key, fallback) => {
    try { if (typeof window !== 'undefined') return localStorage.getItem(key) || fallback; } 
    catch (e) { console.warn("Storage access denied:", e); }
    return fallback;
  };
  useEffect(() => {
    const savedTheme = getSafeStorage('theme', 'light');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!localStorage.getItem('theme') && systemPrefersDark)) setTheme('dark');
  }, []);
  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

// --- 2. SEO Management ---
const SEO = () => {
  const siteName = "塚越 貴男 | Life & Conditioning";
  const jobTitle = "パフォーマンスコーチ / Wellness Strategist";
  const fullTitle = `${siteName} - ${jobTitle}`;
  const description = "身体構造を最適化し、人生のパフォーマンスを向上させるコンディショニング。";
  useEffect(() => {
    document.documentElement.lang = "ja";
    document.title = fullTitle;
  }, [fullTitle]);
  return null;
};

// --- 3. UI Components ---
const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

// --- 4. Main Application ---
const MainContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const stats = useMemo(() => [
    { label: "Experience", value: "15", suffix: "Years+" },
    { label: "Annual Sessions", value: "1,200", suffix: "+" },
    { label: "Strategy", value: "Custom", suffix: "Tailored" }
  ], []);

  const methods = useMemo(() => [
    { id: "analysis", icon: Compass, title: "Bio-Logic Analysis", desc: "個々の骨格・神経のクセをミリ単位で解析。現状の『不均衡』を数値化し、改善への地図を描きます。" },
    { id: "stretch", icon: Maximize2, title: "Active Conditioning", desc: "筋肉の緊張を解くだけでなく、関節の可動域を『正しく使いこなせる』状態へと再編します。" },
    { id: "performance", icon: Zap, title: "Dynamic Training", desc: "整った土台の上で、最小限の努力で最大のパワーを生む動作を習得。ビジネスや競技に直結するキレを定着させます。", isAccent: true },
    { id: "recovery", icon: RefreshCw, title: "Cyclic Recovery", desc: "疲労を『投資』に変える。24時間の代謝サイクルを最適化し、常にエネルギーに満ちた状態を維持します。" }
  ], []);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = window.pageYOffset;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(height > 0 ? (winScroll / height) * 100 : 0);
      setScrolled(winScroll > 50);
      setShowBackToTop(winScroll > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 transition-colors duration-500">
      <SEO />
      <div className="fixed top-0 left-0 w-full h-1 z-[110] bg-stone-100/50">
        <div className="h-full bg-[#C97E6C]" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-2xl font-black tracking-tighter uppercase">L&C.</button>
          <nav className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">
            {['methods', 'profile', 'pricing', 'contact'].map(item => (
              <button key={item} onClick={() => scrollTo(item)} className="hover:text-[#C97E6C]">{item}</button>
            ))}
            <button onClick={toggleTheme} className="p-2 rounded-2xl bg-stone-100 dark:bg-stone-900">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex items-center pt-20 px-6 max-w-7xl mx-auto">
          <FadeIn className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6"><span className="w-12 h-px bg-[#C97E6C]"></span><p className="text-xs font-bold uppercase tracking-[0.5em] text-[#C97E6C]">Performance Coach</p></div>
              <h1 className="text-6xl md:text-[6rem] font-black tracking-tighter leading-[0.85] mb-8">Refine Your <br /><span className="text-[#C97E6C]">Potential.</span></h1>
              <p className="text-xl text-stone-600 dark:text-stone-400 mb-12 max-w-xl">
                15年以上のキャリアを基盤とした身体資産の最適化。<br />「鍛える」の前に「整える」という、勝者のための選択。
              </p>
              <button onClick={() => scrollTo('contact')} className="px-10 py-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold hover:bg-[#C97E6C] transition-all flex items-center gap-3">セッションを予約 <ArrowUpRight className="w-5 h-5" /></button>
            </div>
            <div className="rounded-[4rem] overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
              <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200" alt="Training" className="w-full h-full object-cover" />
            </div>
          </FadeIn>
        </section>

        {/* Methods */}
        <section id="methods" className="py-32 bg-stone-50 dark:bg-stone-900/30">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {methods.map(m => (
              <FadeIn key={m.id} className={`p-10 rounded-[3rem] border ${m.isAccent ? 'bg-[#C97E6C] text-white border-[#C97E6C]' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800'}`}>
                <h4 className="text-2xl font-bold mb-4">{m.title}</h4>
                <p className="text-sm opacity-80 leading-relaxed">{m.desc}</p>
              </FadeIn>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-24 text-center border-t border-stone-100 dark:border-stone-800">
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">© Takao Tsukakoshi / Conditioning Design 2026</p>
      </footer>

      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`fixed bottom-8 right-8 p-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl shadow-2xl transition-all duration-500 ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}><ArrowUp className="w-6 h-6" /></button>
    </div>
  );
};

// --- 5. 起動スイッチ (ここが最重要！) ---
const App = () => (<ThemeProvider><MainContent /></ThemeProvider>);
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}