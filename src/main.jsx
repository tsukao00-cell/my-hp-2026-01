import React, { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ArrowUpRight, MoveRight, Zap, RefreshCw, Instagram, Twitter, Menu, X, 
  ChevronRight, ChevronDown, Mail, ShieldCheck, Loader2, Maximize2, Compass, 
  Moon, Sun, Cookie, ArrowUp
} from 'lucide-react';

/**
 * Life & Conditioning - Premium Performance Coaching
 * 塚越 貴男 (Takao Tsukakoshi) Official Landing Page
 * [Vercel & SEO Optimized Edition]
 */

// --- 1. Context & Theme Provider ---
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const getSafeStorage = (key, fallback) => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key) || fallback;
      }
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
    return fallback;
  };

  useEffect(() => {
    const savedTheme = getSafeStorage('theme', 'light');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!localStorage.getItem('theme') && systemPrefersDark)) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- 2. SEO Management (Enhanced for Vercel) ---
const SEO = () => {
  const siteName = "塚越 貴男 | Life & Conditioning";
  const jobTitle = "パフォーマンスコーチ / Wellness Strategist";
  const fullTitle = `${siteName} - ${jobTitle}`;
  const description = "身体構造を最適化し、人生のパフォーマンスを向上させるコンディショニング。東京都内を中心にパーソナルセッションを提供。";
  const url = "https://t-conditioning-design.com";
  const ogImage = "https://t-conditioning-design.com/og-image.jpg";

  useEffect(() => {
    document.documentElement.lang = "ja";
    document.title = fullTitle;

    const setMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('description', description);
    setMetaTag('keywords', 'コンディショニング, 塚越貴男, パフォーマンスコーチ, Wellness Strategist, パーソナルトレーニング, 東京, 経営者, アスリート');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    setMetaTag('og:title', siteName, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:site_name', siteName, true);

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', siteName);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "塚越 貴男",
      "alternateName": "Takao Tsukakoshi",
      "jobTitle": "Performance Coach / Wellness Strategist",
      "description": description,
      "url": url,
      "image": ogImage,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Tokyo",
        "addressCountry": "JP"
      },
      "knowsAbout": ["Conditioning", "Bio-Logic Analysis", "Wellness Strategy"],
      "brand": {
        "@type": "Brand",
        "name": "Life & Conditioning"
      }
    };

    let scriptElement = document.getElementById('json-ld-seo');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = 'json-ld-seo';
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }
    scriptElement.innerHTML = JSON.stringify(structuredData);
  }, [fullTitle, siteName, description, url]);

  return null;
};

// --- 3. UI Components ---
const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
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
  
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [honeypotValue, setHoneypotValue] = useState('');
  const lastSubmitTime = useRef(0);

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

  const articles = useMemo(() => [
    { id: 1, title: "「整える」ことから始める、ハイパフォーマンスの作り方", platform: "note", date: "2024.03.10", image: "https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=800" },
    { id: 2, title: "The Art of Reciprocal Conditioning: Why balance matters.", platform: "Medium", date: "2024.02.22", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" },
    { id: 3, title: "経営者が「筋トレ」よりも「ストレッチ」を優先すべき3つの理由", platform: "note", date: "2024.01.15", image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=800" },
  ], []);

  const faqs = useMemo(() => [
    { q: "体験セッションの内容は？", a: "まずは60分のカウンセリングと身体評価を行い、現在の課題を明確にします。その後、残りの30分で実際に身体の変化を体感いただく調整を行います。" },
    { q: "出張対応エリアを教えてください。", a: "東京都23区内を中心に活動しています。ご自宅やオフィスへの出張が可能です。その他のエリアについても随時ご相談ください。" },
    { q: "運動不足ですが、大丈夫ですか？", a: "全く問題ありません。私のメソッドは「整える」ことに重点を置いています。あなたの現在の状態に合わせて無理のない範囲からスタートします。" }
  ], []);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = window.pageYOffset || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(height > 0 ? (winScroll / height) * 100 : 0);
      setScrolled(winScroll > 50);
      setShowBackToTop(winScroll > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = useCallback((id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = scrolled ? 70 : 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, [scrolled]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (honeypotValue) return;
    const errors = { name: '', email: '', message: '' };
    let isValid = true;
    if (!formState.name.trim()) { errors.name = 'お名前を入力してください'; isValid = false; }
    if (!formState.email.includes('@')) { errors.email = '有効なメールアドレスを入力してください'; isValid = false; }
    if (!formState.message.trim()) { errors.message = 'ご相談内容を入力してください'; isValid = false; }
    setFormErrors(errors);
    if (!isValid) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitStatus('success');
    setFormState({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 font-sans antialiased selection:bg-[#C97E6C] selection:text-white transition-colors duration-500">
      <SEO />
      <div className="fixed top-0 left-0 w-full h-1 z-[110] bg-stone-100/50 dark:bg-stone-900/50">
        <div className="h-full bg-[#C97E6C] transition-all duration-300 ease-out shadow-[0_0_10px_#C97E6C]" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tighter uppercase text-stone-900 dark:text-white group-hover:text-[#C97E6C] transition-colors">L&C.</span>
            <div className="w-1.5 h-1.5 bg-[#C97E6C] rounded-full group-hover:scale-150 transition-transform"></div>
          </button>
          <nav className="hidden md:flex items-center gap-10">
            {['methods', 'profile', 'pricing', 'articles', 'faq', 'contact'].map((item) => (
              <button key={item} onClick={() => scrollTo(item)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 hover:text-[#C97E6C] transition-all relative group">
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#C97E6C] transition-all group-hover:w-full"></span>
              </button>
            ))}
            <div className="w-px h-4 bg-stone-200 dark:bg-stone-800 mx-2"></div>
            <button onClick={toggleTheme} aria-label="Theme" className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-[#C97E6C] transition-all">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative min-h-screen flex items-center pt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <FadeIn>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-12 h-px bg-[#C97E6C]"></span>
                  <p className="text-xs font-bold uppercase tracking-[0.5em] text-[#C97E6C]">trainer / Wellness Strategist</p>
                </div>
                <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.85] mb-8 text-stone-900 dark:text-white">Refine Your <br /><span className="text-[#C97E6C]">Potential.</span></h1>
                <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 mb-12 max-w-xl leading-relaxed">
                  身体構造の最適化から始まる、本質的なパフォーマンス向上。<br />
                  「鍛える」の前に「整える」という、勝者のための選択。
                </p>
                <div className="flex flex-wrap gap-6 items-center">
                  <button onClick={() => scrollTo('contact')} className="px-10 py-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold hover:bg-[#C97E6C] transition-all flex items-center gap-3">セッションを予約 <ArrowUpRight className="w-5 h-5" /></button>
                </div>
              </FadeIn>
            </div>
            <div className="lg:col-span-5">
              <FadeIn delay={200}>
                <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative z-10 group">
                  <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200" alt="Training" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Methods */}
        <section id="methods" className="py-32 bg-stone-50 dark:bg-stone-900/30">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-4 gap-8">
              {methods.map((method, i) => (
                <FadeIn key={method.id} delay={i * 100} className={`p-10 rounded-[3rem] border ${method.isAccent ? 'bg-[#C97E6C] text-white border-[#C97E6C]' : 'bg-white dark:bg-stone-900 border-stone-100'}`}>
                  <h4 className="text-2xl font-bold mb-4">{method.title}</h4>
                  <p className="text-sm opacity-80">{method.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 bg-white dark:bg-stone-950 border-t border-stone-100 text-center">
        <p className="text-3xl font-black tracking-tighter uppercase mb-4">L&C.</p>
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.5em]">© Takao Tsukakoshi / Conditioning Design.</p>
      </footer>
    </div>
  );
};

// --- 5. 起動スイッチ (ここがないと画面が表示されません) ---
const App = () => (<ThemeProvider><MainContent /></ThemeProvider>);
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}