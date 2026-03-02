import React, { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight, Zap, RefreshCw, Menu, X,
  ChevronDown, Loader2, Maximize2, Compass,
  Moon, Sun, ArrowUp
} from 'lucide-react';

// ─────────────────────────────────────────
// Helper（コンポーネント外に配置）
// ─────────────────────────────────────────
const getSafeStorage = (key, fallback) => {
  try {
    if (typeof window !== 'undefined') return localStorage.getItem(key) || fallback;
  } catch (e) { console.warn('Storage access denied:', e); }
  return fallback;
};

// ✅ Fix: ナビ項目を定数として外部に定義（再レンダーで再生成されない）
const NAV_ITEMS = ['methods', 'profile', 'articles', 'contact'];

// ─────────────────────────────────────────
// 1. Context & Theme Provider
// ─────────────────────────────────────────
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = getSafeStorage('theme', null);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) setTheme('dark');
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } catch (_) {}
  }, [theme]);

  // ✅ Fix: toggleTheme を useCallback で安定化
  const toggleTheme = useCallback(
    () => setTheme(prev => (prev === 'light' ? 'dark' : 'light')),
    []
  );

  // ✅ Fix: Context value を useMemo で安定化（不要な再レンダー防止）
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// ─────────────────────────────────────────
// 2. SEO Management
// ─────────────────────────────────────────
const SEO = () => {
  useEffect(() => {
    // ✅ Fix: 全て定数 → deps は [] でよい。定数を effect 内に移動
    const siteName  = '塚越 貴男 | Conditioning Design';
    const fullTitle = `${siteName} - パフォーマンスコーチ / Wellness Strategist`;
    const description = '身体構造を最適化し、人生のパフォーマンスを向上させる。';
    const url     = 'https://t-conditioning-design.com';
    const ogImage = 'https://t-conditioning-design.com/og-image.jpg';

    document.documentElement.lang = 'ja';
    document.title = fullTitle;

    const setMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title',    siteName,  true);
    setMeta('og:url',      url,       true);
    setMeta('og:type',     'website', true);
    setMeta('og:image',    ogImage,   true);
  }, []); // ✅ Fix: 全て定数なのでマウント時のみ実行

  return null;
};

// ─────────────────────────────────────────
// 3. FadeIn コンポーネント
// ─────────────────────────────────────────
const FadeIn = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.unobserve(el); // ✅ ローカル変数 el を使用
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─────────────────────────────────────────
// 4. Main Content
// ─────────────────────────────────────────
const MainContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [scrolled,       setScrolled]       = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [showBackToTop,  setShowBackToTop]  = useState(false);

  const [formState,    setFormState]    = useState({ name: '', email: '', message: '' });
  const [formErrors,   setFormErrors]   = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | 'ratelimit'
  const [openFaq,      setOpenFaq]      = useState(null);
  const [honeypotValue, setHoneypotValue] = useState('');
  const lastSubmitTime = useRef(0);

  // ── 静的データ ──────────────────────────
  const stats = useMemo(() => [
    { label: 'Experience',      value: '15',    suffix: 'Years+'  },
    { label: 'Annual Sessions', value: '1,200', suffix: '+'       },
    { label: 'Strategy',        value: 'Custom',suffix: 'Tailored'}
  ], []);

  const methods = useMemo(() => [
    { id: 'analysis',    icon: Compass,   title: 'Bio-Logic Analysis', desc: '解析を元に改善への地図を描きます。'        },
    { id: 'stretch',     icon: Maximize2, title: 'Active Conditioning',desc: '可動域を正しく使いこなせる状態へ。'        },
    { id: 'performance', icon: Zap,       title: 'Dynamic Training',   desc: '最小限の努力で最大のパワーを。', isAccent: true },
    { id: 'recovery',    icon: RefreshCw, title: 'Cyclic Recovery',    desc: '24時間の代謝サイクルを最適化。'           }
  ], []);

  const faqs = useMemo(() => [
    { q: '運動初心者でも受講可能ですか？', a: 'はい。体力に合わせた個別プログラムを構成します。'        },
    { q: 'セッションの場所はどこですか？', a: '都内提携スタジオ、または出張にて対応しております。'       },
    { q: '準備するものはありますか？',     a: '動きやすい服装、室内用シューズ、タオル、水分をご用意ください。' }
  ], []);

  const [articles, setArticles] = useState([]);

  // ── 副作用 ──────────────────────────────
  useEffect(() => {
    const fetchNews = async () => {
      const domain = import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN;
      const apiKey = import.meta.env.VITE_MICROCMS_API_KEY;
      if (!domain || !apiKey) return;
      try {
        const res = await fetch(`https://${domain}.microcms.io/api/v1/news`, {
          headers: { 'X-MICROCMS-API-KEY': apiKey }
        });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setArticles((data.contents || []).map(item => ({
          id:       item.id,
          title:    item.title,
          platform: item.category || 'News',
          date:     item.date ? item.date.split('T')[0].replace(/-/g, '.') : '',
          image:    'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=800'
        })));
      } catch (err) { console.error('microCMS load failed:', err); }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(h > 0 ? (y / h) * 100 : 0);
      setScrolled(y > 50);
      setShowBackToTop(y > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ✅ Fix: useCallback + Fixed Header のオフセットを考慮したスクロール
  const scrollTo = useCallback((id) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = scrolled ? 70 : 100;
    const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, [scrolled]);

  // ✅ Fix: カリー化ハンドラ → 関数型更新 + submitStatus リセット
  //        useCallback の deps は [] （setFormState / setSubmitStatus は安定）
  const handleFieldChange = useCallback(
    (field) => (e) => {
      setSubmitStatus(null);                                    // 入力開始でメッセージ消去
      setFormState(prev => ({ ...prev, [field]: e.target.value })); // stale closure 防止
    },
    []
  );

  // ✅ Fix: useCallback でラップ（スクロール再レンダーで再生成されない）
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (honeypotValue) return;

    const now = Date.now();
    if (now - lastSubmitTime.current < 10000) { setSubmitStatus('ratelimit'); return; }

    const errors = { name: '', email: '', message: '' };
    if (!formState.name.trim())          errors.name    = 'お名前を入力してください';
    if (!formState.email.includes('@'))  errors.email   = '有効なメールアドレスを入力してください';
    if (!formState.message.trim())       errors.message = 'ご相談内容を入力してください';
    setFormErrors(errors);
    if (errors.name || errors.email || errors.message) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/mpqdveaw', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(formState)
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitStatus('success');
      setFormState({ name: '', email: '', message: '' });
      lastSubmitTime.current = now; // ✅ now を再利用
    } catch (_) {
      setSubmitStatus('error'); // ✅ alert() 不使用・State で管理
    } finally {
      setIsSubmitting(false);
    }
  }, [honeypotValue, formState]);

  // ─────────────────────────────────────
  // JSX
  // ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 font-sans antialiased selection:bg-[#C97E6C] selection:text-white transition-colors duration-500">
      <SEO />

      {/* スクロール進行バー */}
      <div className="fixed top-0 left-0 w-full h-1 z-[110] bg-stone-100/50 dark:bg-stone-900/50">
        <div className="h-full bg-[#C97E6C] transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* ヘッダー */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl py-4 shadow-sm' : 'bg-transparent py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-2xl font-black uppercase tracking-tighter text-stone-900 dark:text-white"
          >
            OSHIFIT.
          </button>

          {/* デスクトップナビ */}
          <nav className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map(item => (
              <button
                key={item}
                onClick={() => scrollTo(item)}          // ✅ Fix: scrollTo 使用
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 hover:text-[#C97E6C] transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#C97E6C] transition-all group-hover:w-full" />
              </button>
            ))}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
              className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-[#C97E6C] transition-colors"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </nav>

          {/* ハンバーガー */}
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={isMenuOpen}
            className="md:hidden p-2 text-stone-900 dark:text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-white dark:bg-stone-950 flex flex-col items-center justify-center gap-8 md:hidden">
          {NAV_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => scrollTo(item)}           // ✅ Fix: scrollTo 使用
              className="text-2xl font-black uppercase tracking-widest text-stone-900 dark:text-white hover:text-[#C97E6C] transition-colors"
            >
              {item}
            </button>
          ))}
          {/* ✅ モバイルにもテーマ切替を追加済み */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 text-stone-500 mt-4 border border-stone-200 dark:border-stone-700 px-6 py-3 rounded-full hover:text-[#C97E6C] transition-colors"
          >
            {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
          </button>
        </div>
      )}

      <main>
        {/* ── Hero ───────────────────────────── */}
        <section className="relative min-h-screen flex items-center pt-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto w-full">
            <FadeIn>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-12 h-px bg-[#C97E6C]" />
                <p className="text-xs font-bold uppercase tracking-[0.5em] text-[#C97E6C]">Performance Architect</p>
              </div>
              <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.85] mb-8 text-stone-900 dark:text-white">
                Refine Your<br /><span className="text-[#C97E6C]">Potential.</span>
              </h1>
              <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 mb-12 max-w-xl leading-relaxed">
                15年以上の知見を凝縮した、勝者のためのコンディショニング。
              </p>
              <button
                onClick={() => scrollTo('contact')}
                className="px-10 py-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold hover:bg-[#C97E6C] dark:hover:bg-[#C97E6C] dark:hover:text-white transition-all shadow-2xl flex items-center gap-3 group"
              >
                セッションを予約
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </FadeIn>
          </div>
        </section>

        {/* ── Methods ────────────────────────── */}
        {/* ✅ Fix: id="methods" を持つセクションを追加（ナビリンクと整合） */}
        <section id="methods" className="py-32 bg-stone-50 dark:bg-stone-900/30">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-20">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">Conditioning Logic.</h2>
            </FadeIn>
            <div className="grid md:grid-cols-4 gap-8">
              {methods.map((m, i) => (
                <FadeIn
                  key={m.id}
                  delay={i * 100}
                  className={`p-10 rounded-[3rem] border transition-colors duration-300 ${
                    m.isAccent
                      ? 'bg-[#C97E6C] text-white border-transparent'
                      : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800'
                  }`}
                >
                  <m.icon className="w-10 h-10 mb-6" />
                  <h4 className="text-xl font-bold mb-3">{m.title}</h4>
                  <p className="text-sm opacity-80 leading-relaxed">{m.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Profile ────────────────────────── */}
        {/* ✅ Fix: id="profile" を持つセクションを追加 */}
        <section id="profile" className="py-40 bg-white dark:bg-stone-950">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <h3 className="text-5xl md:text-6xl font-black mb-4">
                塚越 貴男
                <span className="text-xl font-normal text-stone-400 ml-4">Takao Tsukakoshi</span>
              </h3>
              <p className="text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl mb-12">
                15年以上のキャリアを通じ、独自の「Ciメソッド」であなたの可能性を再定義します。
              </p>
              <div className="flex flex-wrap gap-12">
                {stats.map(s => (
                  <div key={s.label}>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-3xl font-black">
                      {s.value}
                      <span className="text-lg font-normal text-stone-400 ml-1">{s.suffix}</span>
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Articles ───────────────────────── */}
        {/* ✅ Fix: id="articles" を持つセクションを追加 */}
        <section id="articles" className="py-32 bg-stone-50 dark:bg-stone-900/30">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="mb-20">
              <h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">Journal.</h3>
            </FadeIn>
            {articles.length === 0 ? (
              <p className="text-stone-400 text-center py-16">記事を読み込み中...</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-12">
                {articles.map((a, i) => (
                  <FadeIn key={a.id} delay={i * 100} className="group cursor-pointer">
                    <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-6 shadow-lg">
                      <img
                        src={a.image} alt={a.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-stone-400 mb-2 tracking-widest">{a.date}</p>
                    <h4 className="text-xl font-bold leading-tight group-hover:text-[#C97E6C] transition-colors">{a.title}</h4>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────── */}
        <section className="py-32 bg-white dark:bg-stone-950">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-20">
              <h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">FAQ.</h3>
            </FadeIn>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <div className="bg-stone-50 dark:bg-stone-900 rounded-[2rem] border border-stone-100 dark:border-stone-800 overflow-hidden">
                    <button
                      className="w-full p-8 flex justify-between items-center gap-4 text-left"
                      onClick={() => setOpenFaq(prev => prev === i ? null : i)} // ✅ 関数型更新
                      aria-expanded={openFaq === i} // ✅ アクセシビリティ
                    >
                      <h4 className="text-lg font-bold">{faq.q}</h4>
                      <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-8 pb-8 text-stone-500 dark:text-stone-400 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact ────────────────────────── */}
        <section id="contact" className="py-32 bg-stone-950 text-white">
          <div className="max-w-5xl mx-auto px-6">
            <FadeIn>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-16 text-center leading-[0.9]">
                Get in<br /><span className="text-[#C97E6C]">Touch.</span>
              </h2>
            </FadeIn>
            <form
              onSubmit={handleFormSubmit}
              className="max-w-xl mx-auto space-y-8 bg-stone-900/50 p-10 rounded-[4rem] border border-stone-800"
              noValidate
            >
              {/* ハニーポット（ボット対策） */}
              <input
                type="text"
                name="bot-field"
                style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                aria-hidden="true"
                tabIndex={-1}
                autoComplete="off"
                value={honeypotValue}
                onChange={e => setHoneypotValue(e.target.value)}
              />

              {/* お名前 */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formState.name}
                  onChange={handleFieldChange('name')} // ✅ Fix: 関数型更新 + status リセット
                  className="w-full bg-transparent border-b border-stone-800 focus:border-[#C97E6C] py-4 outline-none text-xl transition-colors"
                  placeholder="お名前"
                  autoComplete="name"
                />
                {formErrors.name && <p className="text-xs text-red-400">{formErrors.name}</p>}
              </div>

              {/* メールアドレス */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={handleFieldChange('email')} // ✅ Fix
                  className="w-full bg-transparent border-b border-stone-800 focus:border-[#C97E6C] py-4 outline-none text-xl transition-colors"
                  placeholder="メールアドレス"
                  autoComplete="email"
                />
                {formErrors.email && <p className="text-xs text-red-400">{formErrors.email}</p>}
              </div>

              {/* メッセージ */}
              <div className="space-y-2">
                <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formState.message}
                  onChange={handleFieldChange('message')} // ✅ Fix
                  className="w-full bg-transparent border-b border-stone-800 focus:border-[#C97E6C] py-4 outline-none text-xl resize-none transition-colors"
                  placeholder="ご相談内容"
                />
                {formErrors.message && <p className="text-xs text-red-400">{formErrors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-8 bg-[#C97E6C] text-white rounded-full font-black text-2xl hover:bg-[#b06a5a] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4"
              >
                {isSubmitting ? <Loader2 size={32} className="animate-spin" /> : 'SEND MESSAGE'}
              </button>

              {/* ✅ Fix: 全ステータスを State で管理（alert() なし） */}
              <div className="text-center min-h-6">
                {submitStatus === 'success'   && <p className="text-green-400 font-bold">送信完了いたしました。折り返しご連絡いたします。</p>}
                {submitStatus === 'error'     && <p className="text-red-400   font-bold">送信エラーが発生しました。時間をおいて再度お試しください。</p>}
                {submitStatus === 'ratelimit' && <p className="text-yellow-400 font-bold">連投防止のため、送信間隔を空けてください。</p>}
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="py-24 bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-900 text-center">
        <p className="text-3xl font-black tracking-tighter uppercase mb-4">OSHIFIT.</p>
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.5em]">
          © Takao Tsukakoshi / Conditioning Design.
        </p>
      </footer>

      {/* トップへ戻る */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="トップへ戻る" // ✅ Fix: aria-label 追加
        className={`fixed bottom-8 right-8 p-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl shadow-2xl transition-all duration-500 z-[90] ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────
// Entry Point
// ─────────────────────────────────────────
const App = () => (
  <ThemeProvider>
    <MainContent />
  </ThemeProvider>
);

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
