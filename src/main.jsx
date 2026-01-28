import React, { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ArrowUpRight, MoveRight, Zap, RefreshCw, Instagram, Twitter, Menu, X, 
  ChevronRight, ChevronDown, Mail, ShieldCheck, Loader2, Maximize2, Compass, 
  Moon, Sun, Cookie, ArrowUp
} from 'lucide-react';

// --- 1. Context & Theme Provider ---
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

// --- 2. SEO (あなたの設定を反映) ---
const SEO = () => {
  useEffect(() => {
    document.title = "塚越 貴男 | Life & Conditioning";
  }, []);
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

// --- 4. あなたのメインコンテンツ ---
const MainContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
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

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 transition-colors duration-500">
      <SEO />
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/90 dark:bg-stone-950/90 py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span className="text-2xl font-black tracking-tighter uppercase">L&C.</span>
          <button onClick={toggleTheme} className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-900">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main>
        <section className="relative min-h-screen flex items-center pt-20 px-6 max-w-7xl mx-auto">
          <FadeIn>
            <h1 className="text-6xl md:text-[7.5rem] font-black tracking-tighter leading-none mb-8">Refine Your <br /><span className="text-[#C97E6C]">Potential.</span></h1>
            <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 mb-12 max-w-xl">
              15年以上のキャリアを基盤とした身体資産の最適化。 <br />
              Ci-Vision と Ciメソッド を世界へ。
            </p>
          </FadeIn>
        </section>

        <section className="py-32 bg-stone-50 dark:bg-stone-900/30">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
            {methods.map(m => (
              <div key={m.id} className="p-10 rounded-[3rem] border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
                <h4 className="text-xl font-bold mb-4">{m.title}</h4>
                <p className="text-sm opacity-60">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-24 text-center border-t border-stone-100 dark:border-stone-800">
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">© Takao Tsukakoshi / Conditioning Design 2026</p>
      </footer>
    </div>
  );
};

// --- 5. 起動スイッチ (ここが漏れると真っ白になります) ---
const App = () => (<ThemeProvider><MainContent /></ThemeProvider>);
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}