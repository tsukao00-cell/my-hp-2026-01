import React, { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from 'react';
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
  // チェックリストに基づいた設定
  const siteName = "塚越 貴男 | Life & Conditioning";
  const jobTitle = "パフォーマンスコーチ / Wellness Strategist";
  const fullTitle = `${siteName} - ${jobTitle}`;
  const description = "身体構造を最適化し、人生のパフォーマンスを向上させるコンディショニング。東京都内を中心にパーソナルセッションを提供。";
  const url = "https://t-conditioning-design.com"; // あなたの独自ドメイン
  const ogImage = "https://t-conditioning-design.com/og-image.jpg"; // 実際の画像パス

  useEffect(() => {
    // 言語設定の強制
    document.documentElement.lang = "ja";
    
    // タイトルの設定
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

    // 基本メタタグ
    setMetaTag('description', description);
    setMetaTag('keywords', 'コンディショニング, 塚越貴男, パフォーマンスコーチ, Wellness Strategist, パーソナルトレーニング, 東京, 経営者, アスリート');

    // Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // OGP (Social)
    setMetaTag('og:title', siteName, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:site_name', siteName, true);

    // X (Twitter)
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', siteName);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // JSON-LD (Google Structured Data)
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
    lastSubmitTime.current = Date.now();
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
          <div className="flex md:hidden items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-stone-500">{theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-stone-900 dark:text-white">{isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
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
                  身体構造の最適化から始まる、<br />本質的なパフォーマンス向上。<br className="hidden md:block" />
                  「鍛える」の前に「整える」という、勝者のための選択。
                </p>
                <div className="flex flex-wrap gap-6 items-center">
                  <button onClick={() => scrollTo('contact')} className="px-10 py-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold hover:bg-[#C97E6C] dark:hover:bg-[#C97E6C] dark:hover:text-white transition-all shadow-2xl flex items-center gap-3">セッションを予約 <ArrowUpRight className="w-5 h-5" /></button>
                  <button onClick={() => scrollTo('methods')} className="group flex items-center gap-4 px-8 py-5 font-bold hover:text-[#C97E6C] transition-colors">Our Method <MoveRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></button>
                </div>
              </FadeIn>
            </div>
            <div className="lg:col-span-5">
              <FadeIn delay={200}>
                <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative z-10 group">
                  {/* Hero Image (No lazy loading for LCP improvement) */}
                  <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200" alt="塚越貴男によるコンディショニング風景" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Methods Section */}
        <section id="methods" className="py-32 relative overflow-hidden bg-stone-50 dark:bg-stone-900/30">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <FadeIn className="mb-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-[#C97E6C] mb-4">The System</h2>
                  <h3 className="text-4xl md:text-7xl font-black tracking-tighter text-stone-900 dark:text-white leading-none">Conditioning Logic.</h3>
                </div>
                <p className="max-w-md text-stone-500 dark:text-stone-400 border-l border-stone-200 dark:border-stone-800 pl-6 leading-relaxed">
                  単なる筋力トレーニングではない。解剖学的な解析を基軸に、身体の『構造』そのものをアップデートする独自の4ステップ・サイクル。
                </p>
              </div>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {methods.map((method, i) => (
                <FadeIn key={method.id} delay={i * 100} className={`group p-10 rounded-[3rem] border transition-all duration-700 ${method.isAccent ? 'bg-[#C97E6C] border-[#C97E6C] text-white shadow-2xl shadow-[#C97E6C]/30' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 hover:border-[#C97E6C]/30'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all group-hover:-translate-y-2 ${method.isAccent ? 'bg-white/20' : 'bg-stone-50 dark:bg-stone-800'}`}>
                    <method.icon className={`w-6 h-6 ${method.isAccent ? 'text-white' : 'text-[#C97E6C]'}`} />
                  </div>
                  <h4 className="text-2xl font-bold mb-4 tracking-tight">{method.title}</h4>
                  <p className={`text-sm leading-relaxed ${method.isAccent ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'}`}>{method.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Profile Section */}
        <section id="profile" className="py-40 bg-white dark:bg-[#0c0a09] relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-8 space-y-12">
                <FadeIn>
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C97E6C] block">Wellness Strategist Profile</span>
                    <h3 className="text-5xl md:text-6xl font-black tracking-tighter text-stone-900 dark:text-white leading-tight">塚越 貴男 <span className="text-stone-300 dark:text-stone-800 mx-4 font-thin">/</span> <span className="text-2xl md:text-3xl font-light text-stone-500 tracking-normal align-middle">Takao Tsukakoshi</span></h3>
                  </div>
                </FadeIn>
                <FadeIn delay={100}>
                  <div className="max-w-2xl space-y-8">
                    <p className="text-xl md:text-2xl text-stone-700 dark:text-stone-300 font-medium leading-relaxed tracking-tight italic">
                      「身体を、人生の加速を阻むボトルネックにしない。それが、私が提供する真のウェルネス戦略です。」
                    </p>
                    <div className="h-px w-20 bg-[#C97E6C]/40"></div>
                    <div className="space-y-6 text-stone-500 dark:text-stone-400 leading-relaxed text-lg text-justify">
                      <p>
                        プロアスリートが全盛期の輝きを保ち続けるために。経営者が極限のプレッシャー下で瞬時の決断を下し続けるために。15年以上のキャリアを通じ、私は常に『結果』を求められる人々の傍らに立ってきました。
                      </p>
                      <p>
                        単にトレーニングを教えるのではなく、一人ひとりの人生の目的に合わせ、いかに身体という資産を最適化（コンディショニング）するか。私はトレーナーとしてだけでなく、あなたの人生を加速させる『ウェルネス・ストラテジスト』でありたいと考えています。
                      </p>
                    </div>
                  </div>
                </FadeIn>
                <FadeIn delay={200}>
                  <div className="flex flex-wrap gap-x-16 gap-y-8 pt-8">
                    {stats.map((stat, i) => (
                      <div key={i} className="group">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 transition-colors group-hover:text-[#C97E6C]">{stat.label}</p>
                        <p className="text-3xl font-black text-stone-900 dark:text-white">{stat.value}<span className="text-sm font-bold text-[#C97E6C] ml-1">{stat.suffix}</span></p>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              </div>
              <div className="lg:col-span-4 lg:sticky lg:top-32">
                <FadeIn delay={300}>
                  <div className="relative group max-w-[320px] mx-auto lg:ml-auto lg:mr-0">
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 relative z-10">
                      {/* Sub-image (Lazy loading added) */}
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" alt="塚越貴男のポートレート" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 border-b-2 border-r-2 border-[#C97E6C]/30 rounded-br-3xl -z-10 transition-transform duration-700 group-hover:translate-x-2 group-hover:translate-y-2"></div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 bg-stone-50 dark:bg-stone-900/40">
          <div className="max-w-5xl mx-auto px-6">
            <FadeIn className="text-center mb-20"><h2 className="text-xs font-bold uppercase tracking-[0.5em] text-stone-400 mb-4">Investment</h2><h3 className="text-4xl md:text-7xl font-black tracking-tighter text-stone-900 dark:text-white leading-none">Value for Life.</h3></FadeIn>
            <div className="grid md:grid-cols-2 gap-10">
              <FadeIn className="p-12 rounded-[4rem] bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:shadow-2xl transition-all group">
                <span className="inline-block px-5 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Trial Session</span>
                <h4 className="text-4xl font-bold mb-2">90min Experience</h4>
                <p className="text-stone-500 mb-10 leading-relaxed">現状の身体評価から改善の地図を提示。Wellness Strategyの第一歩を体感ください。</p>
                <div className="text-5xl font-black mb-12 flex items-baseline gap-2">¥22,000 <span className="text-sm font-normal text-stone-400 tracking-normal">(tax inc.)</span></div>
                <button onClick={() => scrollTo('contact')} className="w-full py-6 rounded-full border-2 border-stone-900 dark:border-white font-bold group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-stone-900 transition-all flex items-center justify-center gap-3">体験を予約する <ChevronRight className="w-4 h-4" /></button>
              </FadeIn>
              <FadeIn delay={150} className="p-12 rounded-[4rem] bg-stone-900 text-white border-4 border-[#C97E6C] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-8 right-8 text-[#C97E6C] opacity-30"><ShieldCheck className="w-12 h-12" /></div>
                <span className="inline-block px-5 py-2 bg-[#C97E6C] rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Premium Membership</span>
                <h4 className="text-4xl font-bold mb-2">Custom Plan</h4>
                <p className="text-white/60 mb-10 leading-relaxed">月4回〜の継続。あなたの人生のパートナーとして、身体とマインドをデザインし続けます。</p>
                <div className="text-5xl font-black mb-12">Customized</div>
                <button onClick={() => scrollTo('contact')} className="w-full py-6 rounded-full bg-[#C97E6C] text-white font-bold hover:bg-[#b06a5a] transition-all shadow-xl flex items-center justify-center gap-3">詳細をお問い合わせ <ChevronRight className="w-4 h-4" /></button>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section id="articles" className="py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <FadeIn><h2 className="text-xs font-bold uppercase tracking-[0.5em] text-[#C97E6C] mb-4">Latest Insights</h2><h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">Journal.</h3></FadeIn>
              <FadeIn delay={100}><button className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-stone-500 hover:text-[#C97E6C] transition-colors group">View All Articles <MoveRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></button></FadeIn>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {articles.map((article, i) => (
                <FadeIn key={article.id} delay={i * 100} className="group cursor-pointer">
                  <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-8 relative shadow-lg">
                    {/* Lazy loading added */}
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                    <div className="absolute top-6 left-6 bg-white/95 dark:bg-black/80 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#C97E6C] backdrop-blur-md">{article.platform}</div>
                  </div>
                  <p className="text-[10px] font-bold text-stone-400 mb-3 tracking-widest">{article.date.replace(/\./g, ' / ')}</p>
                  <h4 className="text-2xl font-bold leading-tight group-hover:text-[#C97E6C] transition-colors mb-4">{article.title}</h4>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 bg-stone-50 dark:bg-stone-900/40">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-20"><h2 className="text-xs font-bold uppercase tracking-[0.5em] text-stone-400 mb-4">Help Center</h2><h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">FAQ.</h3></FadeIn>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <FadeIn key={i} delay={i * 50}>
                  <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 cursor-pointer transition-all" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div className="p-8 flex justify-between items-center gap-4">
                      <h4 className="text-xl font-bold tracking-tight">{faq.q}</h4>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${openFaq === i ? 'bg-[#C97E6C] text-white rotate-180' : 'bg-stone-50 dark:bg-stone-800 text-stone-400'}`}><ChevronDown className="w-5 h-5" /></div>
                    </div>
                    {openFaq === i && <div className="px-8 pb-8 text-stone-500 dark:text-stone-400 leading-relaxed animate-in fade-in slide-in-from-top-4 duration-500">{faq.a}</div>}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 bg-stone-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#C97E6C]/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20">
              <FadeIn>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">Get in <br /> <span className="text-[#C97E6C]">Touch.</span></h2>
                <p className="text-stone-400 text-xl leading-relaxed mb-12 max-w-sm">身体のアップデートに関するご相談を。通常24時間以内にご返信いたします。</p>
                <div className="flex items-center gap-6 group cursor-pointer" onClick={() => window.location.href='mailto:info@t-conditioning.com'}>
                  <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center group-hover:border-[#C97E6C] transition-all"><Mail className="w-5 h-5 text-[#C97E6C]" /></div>
                  <div><p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Email Address</p><p className="text-lg font-bold group-hover:text-[#C97E6C] transition-colors">info@t-conditioning.com</p></div>
                </div>
              </FadeIn>
              <FadeIn delay={200}>
                <form onSubmit={handleFormSubmit} className="space-y-8 bg-stone-900/50 p-10 md:p-14 rounded-[4rem] border border-stone-800 backdrop-blur-sm shadow-2xl relative" noValidate>
                  <div className="hidden" aria-hidden="true">
                    <input type="text" value={honeypotValue} onChange={(e) => setHoneypotValue(e.target.value)} tabIndex="-1" autoComplete="off" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">Full Name</label>
                    <input type="text" value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} className={`w-full bg-transparent border-b ${formErrors.name ? 'border-red-500' : 'border-stone-800'} focus:border-[#C97E6C] py-4 outline-none transition-all text-xl`} placeholder="お名前" />
                    {formErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">Email Address</label>
                    <input type="email" value={formState.email} onChange={(e) => setFormState({...formState, email: e.target.value})} className={`w-full bg-transparent border-b ${formErrors.email ? 'border-red-500' : 'border-stone-800'} focus:border-[#C97E6C] py-4 outline-none transition-all text-xl`} placeholder="メールアドレス" />
                    {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">Message</label>
                    <textarea rows={4} value={formState.message} onChange={(e) => setFormState({...formState, message: e.target.value})} className={`w-full bg-transparent border-b ${formErrors.message ? 'border-red-500' : 'border-stone-800'} focus:border-[#C97E6C] py-4 outline-none transition-all text-xl resize-none`} placeholder="ご相談内容" />
                    {formErrors.message && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-8 bg-[#C97E6C] text-white rounded-full font-black text-2xl hover:bg-[#b06a5a] transition-all disabled:opacity-50 flex items-center justify-center gap-4">{isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : 'SEND MESSAGE'}</button>
                  {submitStatus === 'success' && <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-[2rem] text-center text-green-400">送信完了。折り返しご連絡いたします。</div>}
                </form>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="text-center md:text-left"><p className="text-3xl font-black tracking-tighter uppercase mb-4">L&C.</p><p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.5em] leading-loose">© Takao Tsukakoshi / Conditioning Design. <br />All Rights Reserved.</p></div>
            <div className="flex gap-10">
              <a href="https://instagram.com/tsukakoshi_conditioning" target="_blank" rel="noopener noreferrer" className="p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl text-stone-400 hover:text-[#C97E6C] transition-all"><Instagram className="w-6 h-6" /></a>
              <a href="https://twitter.com/t_conditioning" target="_blank" rel="noopener noreferrer" className="p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl text-stone-400 hover:text-[#C97E6C] transition-all"><Twitter className="w-6 h-6" /></a>
            </div>
          </div>
          <div className="pt-12 border-t border-stone-100 dark:border-stone-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[9px] leading-relaxed text-stone-400 dark:text-stone-600 uppercase tracking-widest text-center md:text-left">
              <div className="space-y-2"><p className="font-bold text-stone-500 underline underline-offset-4">Medical Disclaimer</p><p>当サービスは医療行為ではなく、疾患の診断や治療を目的としたものではありません。健康状態に不安がある場合は医師にご相談ください。</p></div>
              <div className="space-y-2"><p className="font-bold text-stone-500 underline underline-offset-4">Result Disclaimer</p><p>掲載されている成果や体験談は個人の感想であり、結果には個人差があります。全ての方に同様の結果を保証するものではありません。</p></div>
              <div className="space-y-2"><p className="font-bold text-stone-500 underline underline-offset-4">Privacy & Legal</p><p>お預かりした個人情報は法令に基づき厳重に管理し、目的外の利用は行いません。当サイトの全コンテンツの著作権はConditioning Designに帰属します。</p></div>
            </div>
          </div>
        </div>
      </footer>

      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`fixed bottom-8 right-8 p-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl shadow-2xl transition-all duration-500 z-[90] ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'} hover:bg-[#C97E6C] dark:hover:bg-[#C97E6C] dark:hover:text-white`} aria-label="Top"><ArrowUp className="w-6 h-6" /></button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-line { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .animate-scroll-line { animation: scroll-line 2s cubic-bezier(0.76, 0, 0.24, 1) infinite; }
        .vertical-text { writing-mode: vertical-rl; }
        ::placeholder { opacity: 0.3 !important; }
      `}} />
    </div>
  );
};

const App = () => (<ThemeProvider><MainContent /></ThemeProvider>);
export default App;