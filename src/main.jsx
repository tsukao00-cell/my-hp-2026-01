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
 * [Revised Edition: Security & UX Patched]
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

// --- 2. SEO Management ---

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
  
  // Spam Protection State
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
    
    // 1. Check Honeypot (Spam Trap)
    if (honeypotValue) {
      console.log("Bot detected."); 
      return; 
    }

    const errors = { name: '', email: '', message: '' };
    let isValid = true;
    if (!formState.name.trim()) { errors.name = 'お名前を入力してください'; isValid = false; }
    if (!formState.email.includes('@')) { errors.email = '有効なメールアドレスを入力してください'; isValid = false; }
    if (!formState.message.trim()) { errors.message = 'ご相談内容を入力してください'; isValid = false; }
    setFormErrors(errors);
    if (!isValid) return;
    
    setIsSubmitting(true);
    
   try {
      const response = await fetch("https://formspree.io/f/mpqdveaw", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formState)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormState({ name: '', email: '', message: '' });
      } else {
        alert("送信に失敗しました。時間をおいて再度お試しください。");
      }
    } catch (error) {
      alert("通信エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
      lastSubmitTime.current = Date.now();
    }
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-white dark:bg-stone-950 flex flex-col items-center justify-center gap-8 md:hidden">
          {['methods', 'profile', 'pricing', 'articles', 'faq', 'contact'].map((item) => (
            <button key={item} onClick={() => scrollTo(item)} className="text-2xl font-black uppercase tracking-widest">{item}</button>
          ))}
        </div>
      )}

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
                  <img 
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200" 
                    alt="Training" 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
                    width="1200"
                    height="1500"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Methods Section */}
        <section id="methods" className="py-32 bg-stone-50 dark:bg-stone-900/30">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-20">
            <FadeIn>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none mb-8">Conditioning Logic.</h2>
            </FadeIn>
            <div className="grid md:grid-cols-4 gap-8">
              {methods.map((method, i) => (
                <FadeIn key={method.id} delay={i * 100} className={`p-10 rounded-[3rem] border transition-all duration-700 ${method.isAccent ? 'bg-[#C97E6C] text-white' : 'bg-white dark:bg-stone-900 border-stone-100'}`}>
                  <method.icon className="w-10 h-10 mb-6 mx-auto" />
                  <h4 className="text-2xl font-bold mb-4">{method.title}</h4>
                  <p className="text-sm opacity-80">{method.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Profile Section */}
        <section id="profile" className="py-40 bg-white dark:bg-stone-950">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-8">
              <FadeIn>
                <h3 className="text-5xl md:text-6xl font-black mb-8">塚越 貴男 <span className="text-xl font-normal text-stone-400 ml-4">Takao Tsukakoshi</span></h3>
                <div className="space-y-6 text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl">
                  <p>15年以上のキャリアを通じ、アスリートや経営者の身体を最適化してきました。</p>
                  <p>「身体を人生の加速を阻むボトルネックにしない」。自律神経を可視化する「Ci-Vision」や独自の「Ciメソッド」で、あなたの可能性を再定義します。</p>
                </div>
                <div className="flex flex-wrap gap-12 mt-12">
                  {stats.map(s => (
                    <div key={s.label}><p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{s.label}</p><p className="text-3xl font-black">{s.value}{s.suffix}</p></div>
                  ))}
                </div>
              </FadeIn>
            </div>
            <div className="lg:col-span-4 rounded-[4rem] overflow-hidden shadow-2xl grayscale">
              <img 
                src="/profile.JPG" 
                alt="Takao Tsukakoshi"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null; 
                  // If image fails, you might want to show a placeholder or keep it blank
                  console.warn("Profile image not found at /profile.JPG");
                }}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 bg-stone-50 dark:bg-stone-900/40">
          <div className="max-w-5xl mx-auto px-6">
            <FadeIn className="text-center mb-20"><h2 className="text-4xl md:text-7xl font-black tracking-tighter">Value for Life.</h2></FadeIn>
            <div className="grid md:grid-cols-2 gap-10">
              <FadeIn className="p-12 rounded-[4rem] bg-white dark:bg-stone-900 border border-stone-100">
                <span className="inline-block px-5 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-[10px] font-bold uppercase mb-8">Trial Session</span>
                <h4 className="text-4xl font-bold mb-2">90min Experience</h4>
                <div className="text-5xl font-black mb-12 flex items-baseline gap-2">¥22,000 <span className="text-sm font-normal text-stone-400">(tax inc.)</span></div>
                <button onClick={() => scrollTo('contact')} className="w-full py-6 rounded-full border-2 border-stone-900 dark:border-white font-bold hover:bg-stone-900 hover:text-white transition-all">体験を予約する</button>
              </FadeIn>
              <FadeIn delay={150} className="p-12 rounded-[4rem] bg-stone-900 text-white border-4 border-[#C97E6C]">
                <span className="inline-block px-5 py-2 bg-[#C97E6C] rounded-full text-[10px] font-bold uppercase mb-8">Premium Membership</span>
                <h4 className="text-4xl font-bold mb-2">Custom Plan</h4>
                <div className="text-5xl font-black mb-12">Customized</div>
                <button onClick={() => scrollTo('contact')} className="w-full py-6 rounded-full bg-[#C97E6C] text-white font-bold hover:bg-[#b06a5a] transition-all">詳細をお問い合わせ</button>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section id="articles" className="py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <FadeIn className="mb-20"><h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">Journal.</h3></FadeIn>
            <div className="grid md:grid-cols-3 gap-12">
              {articles.map((article, i) => (
                <FadeIn key={article.id} delay={i * 100} className="group cursor-pointer">
                  <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-8 relative shadow-lg">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      loading="lazy" 
                    />
                    <div className="absolute top-6 left-6 bg-white/95 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase text-[#C97E6C]">{article.platform}</div>
                  </div>
                  <p className="text-[10px] font-bold text-stone-400 mb-3 tracking-widest">{article.date}</p>
                  <h4 className="text-2xl font-bold leading-tight group-hover:text-[#C97E6C] transition-colors">{article.title}</h4>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 bg-stone-50 dark:bg-stone-900/40">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-20"><h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">FAQ.</h3></FadeIn>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <FadeIn key={i} delay={i * 50}>
                  <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div className="p-8 flex justify-between items-center gap-4">
                      <h4 className="text-xl font-bold">{faq.q}</h4>
                      <ChevronDown className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </div>
                    {openFaq === i && <div className="px-8 pb-8 text-stone-500 leading-relaxed">{faq.a}</div>}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 bg-stone-950 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20">
              <FadeIn>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">Get in <br /> <span className="text-[#C97E6C]">Touch.</span></h2>
                <p className="text-stone-400 text-xl leading-relaxed mb-12">通常24時間以内にご返信いたします。</p>
                <div className="flex items-center gap-6 cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center"><Mail className="w-5 h-5 text-[#C97E6C]" /></div>
                  <div><p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Email Address</p><p className="text-lg font-bold">info@t-conditioning-design.com</p></div>
                </div>
              </FadeIn>
              <FadeIn delay={200}>
                <form onSubmit={handleFormSubmit} className="space-y-8 bg-stone-900/50 p-10 md:p-14 rounded-[4rem] border border-stone-800 backdrop-blur-sm" noValidate>
                  
                  {/* --- HONEYPOT FIELD (Spam Trap) --- */}
                  <input 
                    type="text" 
                    name="bot-field"
                    value={honeypotValue} 
                    onChange={(e) => setHoneypotValue(e.target.value)} 
                    className="hidden" 
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  {/* ---------------------------------- */}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">Full Name</label>
                    <input type="text" value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} className="w-full bg-transparent border-b border-stone-800 focus:border-[#C97E6C] py-4 outline-none transition-all text-xl" placeholder="お名前" />
                    {formErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">Email Address</label>
                    <input type="email" value={formState.email} onChange={(e) => setFormState({...formState, email: e.target.value})} className="w-full bg-transparent border-b border-stone-800 focus:border-[#C97E6C] py-4 outline-none transition-all text-xl" placeholder="メールアドレス" />
                    {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">Message</label>
                    <textarea rows={4} value={formState.message} onChange={(e) => setFormState({...formState, message: e.target.value})} className="w-full bg-transparent border-b border-stone-800 focus:border-[#C97E6C] py-4 outline-none transition-all text-xl resize-none" placeholder="ご相談内容" />
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

      <footer className="py-24 bg-white dark:bg-stone-950 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="text-center md:text-left"><p className="text-3xl font-black tracking-tighter uppercase mb-4">L&C.</p><p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.5em] leading-loose">© Takao Tsukakoshi / Conditioning Design. <br />All Rights Reserved.</p></div>
            <div className="flex gap-10">
              <Instagram className="w-6 h-6 text-stone-400" />
              <Twitter className="w-6 h-6 text-stone-400" />
            </div>
          </div>
          <div className="pt-12 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-8 text-[9px] leading-relaxed text-stone-400 uppercase tracking-widest text-center md:text-left">
            <div className="space-y-2"><p className="font-bold text-stone-500 underline underline-offset-4">Medical Disclaimer</p><p>当サービスは医療行為ではなく、疾患の診断や治療を目的としたものではありません。健康状態に不安がある場合は医師にご相談ください。</p></div>
            <div className="space-y-2"><p className="font-bold text-stone-500 underline underline-offset-4">Result Disclaimer</p><p>掲載されている成果や体験談は個人の感想であり、結果には個人差があります。</p></div>
            <div className="space-y-2"><p className="font-bold text-stone-500 underline underline-offset-4">Privacy & Legal</p><p>お預かりした個人情報は法令に基づき厳重に管理し、目的外の利用は行いません。</p></div>
          </div>
        </div>
      </footer>

      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`fixed bottom-8 right-8 p-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl shadow-2xl transition-all duration-500 z-[90] ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}><ArrowUp className="w-6 h-6" /></button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-line { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .animate-scroll-line { animation: scroll-line 2s cubic-bezier(0.76, 0, 0.24, 1) infinite; }
        ::placeholder { opacity: 0.3 !important; }
      `}} />
    </div>
  );
};

const App = () => (<ThemeProvider><MainContent /></ThemeProvider>);
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}