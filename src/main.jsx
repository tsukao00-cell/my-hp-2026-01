import React, {
  useState, useEffect, useCallback, useRef,
  createContext, useContext, useMemo, useReducer,
  memo, useTransition
} from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight, Zap, RefreshCw, Menu, X,
  ChevronDown, Loader2, Maximize2, Compass,
  Moon, Sun, ArrowUp
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ OPT 1: 静的データをモジュールスコープに配置
//    → useMemo 不要、コンポーネント外で一度だけ生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getSafeStorage = (key, fallback) => {
  try {
    if (typeof window !== 'undefined') return localStorage.getItem(key) || fallback;
  } catch (e) { console.warn('Storage access denied:', e); }
  return fallback;
};

const NAV_ITEMS = ['methods', 'profile', 'pricing', 'articles', 'faq', 'contact'];

const STATS_DATA = [
  { label: 'Experience',      value: '15',     suffix: 'Years+'   },
  { label: 'Annual Sessions', value: '1,200',  suffix: '+'        },
  { label: 'Strategy',        value: 'Custom', suffix: 'Tailored' },
];

const METHODS_DATA = [
  { id: 'analysis',    icon: Compass,   title: 'Bio-Logic Analysis',  desc: '骨格・神経のクセを解析し、改善への地図を描きます。'           },
  { id: 'stretch',     icon: Maximize2, title: 'Active Conditioning', desc: '可動域を正しく使いこなせる状態へと再編します。'               },
  { id: 'performance', icon: Zap,       title: 'Dynamic Training',    desc: '最小限の努力で最大のパワーを生む動作を習得。', isAccent: true  },
  { id: 'recovery',    icon: RefreshCw, title: 'Cyclic Recovery',     desc: '24時間の代謝サイクルを最適化し、活力を維持します。'           },
];

const PRICING_DATA = [
  { id: 'trial',   label: 'Trial Session',      title: '90min Experience', price: '22,000',   note: '(tax inc.)' },
  { id: 'premium', label: 'Premium Membership', title: 'Custom Plan',      price: 'Customized', note: '', isAccent: true },
];

const FAQS_DATA = [
  { q: '運動初心者でも受講可能ですか？', a: 'はい。体力や状態に合わせてプログラムを構成しますのでご安心ください。' },
  { q: 'セッションの場所はどこですか？', a: '都内提携スタジオ、または出張にて対応しております。'                  },
  { q: '準備するものはありますか？',     a: '動きやすい服装、室内用シューズ、タオル、水分をご用意ください。'        },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Context & Theme Provider
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(p => p === 'light' ? 'dark' : 'light'), []);
  // ✅ OPT 2: Context value を useMemo で安定化 → 全Consumerの不要な再レンダーを防止
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ OPT 3: useReducer でスクロール状態を一元管理
//    → 3つのsetState → 1つのdispatch でバッチ更新
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SCROLL_INIT = { scrollProgress: 0, scrolled: false, showBackToTop: false };
const scrollReducer = (state, { payload }) => ({ ...state, ...payload });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEO（memo で再マウント防止）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ OPT 4: memo → 親の再レンダーに巻き込まれない
const SEO = memo(() => {
  useEffect(() => {
    const siteName = '塚越 貴男 | Conditioning Design';
    document.documentElement.lang = 'ja';
    document.title = `${siteName} - パフォーマンスコーチ`;
    const setMeta = (name, content, isProp = false) => {
      const attr = isProp ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', '身体構造を最適化し、人生のパフォーマンスを向上させるコンディショニング。');
    setMeta('og:title', siteName, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://t-conditioning-design.com', true);
  }, []);
  return null;
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FadeIn（memo）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FadeIn = memo(({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setIsVisible(true); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return (
    <div ref={ref}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ OPT 5: LazySection
//    FadeIn との違い:
//    - FadeIn   → 常にDOMに存在し、見えたらアニメーション
//    - LazySection → ビューポートに近づくまでDOMに追加しない
//                    → 初期レンダリングのコストを大幅削減
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const LazySection = memo(({ children, minHeight = '32rem' }) => {
  const [rendered, setRendered] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRendered(true); obs.unobserve(el); } },
      { rootMargin: '400px' } // ビューポートより400px手前でレンダリング開始
    );
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  // minHeight でレイアウトシフトを防止
  return (
    <div ref={ref} style={{ minHeight: rendered ? undefined : minHeight }}>
      {rendered ? children : null}
    </div>
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ OPT 6: 各コンポーネントを memo で個別ラップ
//    → スクロールで MainContent が再レンダーされても
//      props が変わらないコンポーネントは再レンダーしない
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ScrollProgressBar = memo(({ scrollProgress }) => (
  <div className="fixed top-0 left-0 w-full h-1 z-[110] bg-stone-100/50 dark:bg-stone-900/50">
    <div className="h-full bg-[#C97E6C] transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
  </div>
));

// Header は scrolled / scrollTo / isMenuOpen が変わった時だけ再レンダー
const Header = memo(({ scrolled, scrollTo, isMenuOpen, setIsMenuOpen }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl py-4 shadow-sm' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
          <span className="text-2xl font-black uppercase text-stone-900 dark:text-white">C&D.</span>
          <div className="w-1.5 h-1.5 bg-[#C97E6C] rounded-full" />
        </button>
        <nav className="hidden md:flex items-center gap-10">
          {NAV_ITEMS.map(item => (
            <button key={item} onClick={() => scrollTo(item)}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 hover:text-[#C97E6C] transition-all">
              {item}
            </button>
          ))}
          <button onClick={toggleTheme}
            aria-label={theme === 'light' ? 'ダークモードへ切り替え' : 'ライトモードへ切り替え'}
            className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-900 text-stone-500">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </nav>
        <button onClick={() => setIsMenuOpen(p => !p)}
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isMenuOpen}
          className="md:hidden p-2">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
});

// MobileMenu: isMenuOpen=false のときはDOMに存在しない
const MobileMenu = memo(({ scrollTo }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div className="fixed inset-0 z-[90] bg-white dark:bg-stone-950 flex flex-col items-center justify-center gap-8 md:hidden">
      {NAV_ITEMS.map(item => (
        <button key={item} onClick={() => scrollTo(item)}
          className="text-2xl font-black uppercase tracking-widest text-stone-900 dark:text-white hover:text-[#C97E6C] transition-colors">
          {item}
        </button>
      ))}
      <button onClick={toggleTheme}
        className="flex items-center gap-4 text-stone-500 mt-4 border px-6 py-2 rounded-full">
        {theme === 'light' ? <><Moon size={20} /> Dark</> : <><Sun size={20} /> Light</>}
      </button>
    </div>
  );
});

// HeroSection: scrollTo が変わった時だけ再レンダー
const HeroSection = memo(({ scrollTo }) => (
  <section className="min-h-screen flex items-center pt-20 px-6 md:px-12">
    <FadeIn>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-12 h-px bg-[#C97E6C]" />
        <p className="text-xs font-bold uppercase tracking-[0.5em] text-[#C97E6C]">Performance Architect</p>
      </div>
      <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.85] mb-8">
        Refine Your<br /><span className="text-[#C97E6C]">Potential.</span>
      </h1>
      <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 mb-12 max-w-xl">
        15年以上の知見を凝縮した、勝者のためのコンディショニング。
      </p>
      <button onClick={() => scrollTo('contact')}
        className="px-10 py-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold hover:bg-[#C97E6C] transition-all shadow-2xl flex items-center gap-3">
        セッションを予約 <ArrowUpRight size={20} />
      </button>
    </FadeIn>
  </section>
));

// MethodsSection: props なし → 一度も再レンダーしない
const MethodsSection = memo(() => (
  <section id="methods" className="py-32 bg-stone-50 dark:bg-stone-900/30">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <FadeIn><h2 className="text-4xl md:text-7xl font-black mb-16">Methods.</h2></FadeIn>
      <div className="grid md:grid-cols-4 gap-8">
        {METHODS_DATA.map((m, i) => (
          <FadeIn key={m.id} delay={i * 100}
            className={`p-10 rounded-[3rem] border ${m.isAccent ? 'bg-[#C97E6C] text-white border-transparent' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800'}`}>
            <m.icon className="w-10 h-10 mb-6 mx-auto" />
            <h4 className="text-xl font-bold mb-4">{m.title}</h4>
            <p className="text-sm opacity-80">{m.desc}</p>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
));

// ProfileSection: props なし → 一度も再レンダーしない
const ProfileSection = memo(() => (
  <section id="profile" className="py-40 bg-white dark:bg-stone-950">
    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
      <div className="lg:col-span-8">
        <FadeIn>
          <h3 className="text-5xl md:text-6xl font-black mb-8">
            塚越 貴男 <span className="text-xl font-normal text-stone-400 ml-4">Takao Tsukakoshi</span>
          </h3>
          <p className="text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl mb-12">
            15年以上のキャリアを通じ、独自の「Ciメソッド」であなたの可能性を再定義します。
          </p>
          <div className="flex flex-wrap gap-12 mt-12">
            {STATS_DATA.map(s => (
              <div key={s.label}>
                <p className="text-xs font-bold text-stone-400 tracking-widest uppercase">{s.label}</p>
                <p className="text-3xl font-black">{s.value}{s.suffix}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  </section>
));

// PricingSection: scrollTo が変わった時だけ再レンダー
const PricingSection = memo(({ scrollTo }) => (
  <section id="pricing" className="py-32 bg-stone-50 dark:bg-stone-900/40 text-center">
    <div className="max-w-5xl mx-auto px-6">
      <FadeIn><h2 className="text-4xl md:text-7xl font-black mb-20">Value.</h2></FadeIn>
      <div className="grid md:grid-cols-2 gap-10">
        {PRICING_DATA.map((p, i) => (
          <FadeIn key={p.id} delay={i * 100}
            className={`p-12 rounded-[4rem] border ${p.isAccent ? 'bg-stone-900 text-white border-[#C97E6C]' : 'bg-white dark:bg-stone-900 border-stone-100'}`}>
            <span className={`inline-block px-5 py-2 rounded-full text-[10px] font-bold uppercase mb-8 text-[#C97E6C] ${p.isAccent ? 'bg-stone-800' : 'bg-stone-100 dark:bg-stone-800'}`}>
              {p.label}
            </span>
            <h4 className="text-4xl font-bold mb-2">{p.title}</h4>
            <div className="text-5xl font-black mb-12 flex justify-center items-baseline gap-2">
              {p.id === 'trial' && '¥'}{p.price}
              <span className="text-sm font-normal text-stone-400">{p.note}</span>
            </div>
            <button onClick={() => scrollTo('contact')}
              className={`w-full py-6 rounded-full font-bold transition-all ${p.isAccent ? 'bg-[#C97E6C] text-white hover:bg-[#b06a5a]' : 'border-2 border-stone-900 dark:border-white hover:bg-stone-900 hover:text-white'}`}>
              お問い合わせ
            </button>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
));

// ✅ OPT 7: ArticleCard を個別にメモ化
//    → articles 配列の一部が変わっても、変わっていないカードは再レンダーしない
const ArticleCard = memo(({ article, index }) => (
  <FadeIn delay={index * 100} className="group cursor-pointer">
    <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 shadow-lg">
      {/* ✅ OPT 8: loading="lazy" + decoding="async" で画像遅延読み込み */}
      <img src={article.image} alt={article.title}
        loading="lazy" decoding="async"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
    </div>
    <p className="text-[10px] font-bold text-stone-400 mb-2 tracking-widest">{article.date}</p>
    <h4 className="text-xl font-bold group-hover:text-[#C97E6C] transition-colors">{article.title}</h4>
  </FadeIn>
));

// ✅ OPT 9: useTransition の isPending を受け取り、ローディングUIを表示
const ArticlesSection = memo(({ articles, isPending }) => (
  <section id="articles" className="py-32">
    <div className="max-w-7xl mx-auto px-6">
      <FadeIn><h3 className="text-5xl font-black mb-20">Journal.</h3></FadeIn>
      {isPending
        ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#C97E6C]" /></div>
        : articles.length === 0
          ? <p className="text-stone-400 text-center py-16">記事がありません</p>
          : <div className="grid md:grid-cols-3 gap-12">
              {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
      }
    </div>
  </section>
));

// ✅ OPT 10: FaqSection が openFaq state を自分で持つ
//    → FAQ の開閉操作が MainContent を再レンダーしない
const FaqSection = memo(() => {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <section id="faq" className="py-32 bg-stone-50 dark:bg-stone-900/40">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <FadeIn><h3 className="text-4xl md:text-7xl font-black mb-20">FAQ.</h3></FadeIn>
        <div className="space-y-4 text-left">
          {FAQS_DATA.map((f, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-100 dark:border-stone-800 overflow-hidden">
                <button onClick={() => setOpenFaq(p => p === i ? null : i)} aria-expanded={openFaq === i}
                  className="w-full p-8 flex justify-between items-center gap-4 text-lg font-bold text-left">
                  {f.q}
                  <ChevronDown className={`flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-8 pb-8 text-stone-500 dark:text-stone-400 leading-relaxed">{f.a}</div>}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
});

// ✅ OPT 11: ContactSection がフォーム state を全て自分で持つ
//    → 入力のたびに MainContent / 他セクションが再レンダーされない（最大の恩恵）
const ContactSection = memo(() => {
  const [formState,    setFormState]    = useState({ name: '', email: '', message: '' });
  const [formErrors,   setFormErrors]   = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [honeypotValue, setHoneypotValue] = useState('');
  const lastSubmitTime = useRef(0);

  const handleFieldChange = useCallback((field) => (e) => {
    setSubmitStatus(null);
    setFormState(p => ({ ...p, [field]: e.target.value }));
  }, []);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (honeypotValue) return;
    const now = Date.now();
    if (now - lastSubmitTime.current < 10000) { setSubmitStatus('ratelimit'); return; }
    const errs = {
      name:    !formState.name.trim()         ? 'お名前を入力してください'         : '',
      email:   !formState.email.includes('@') ? 'メールアドレスが正しくありません' : '',
      message: !formState.message.trim()      ? '内容を入力してください'           : '',
    };
    setFormErrors(errs);
    if (errs.name || errs.email || errs.message) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/mpqdveaw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formState),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitStatus('success');
      setFormState({ name: '', email: '', message: '' });
      lastSubmitTime.current = now;
    } catch (_) { setSubmitStatus('error'); }
    finally     { setIsSubmitting(false);   }
  }, [honeypotValue, formState]);

  return (
    <section id="contact" className="py-32 bg-stone-950 text-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <FadeIn>
          <h2 className="text-6xl md:text-8xl font-black mb-12 leading-[0.9]">
            Get in <span className="text-[#C97E6C]">Touch.</span>
          </h2>
        </FadeIn>
        <form onSubmit={handleFormSubmit} noValidate
          className="max-w-xl mx-auto space-y-8 bg-stone-900/50 p-10 rounded-[4rem] border border-stone-800">
          <input type="text" name="bot-field" autoComplete="off"
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            aria-hidden="true" tabIndex={-1}
            value={honeypotValue} onChange={e => setHoneypotValue(e.target.value)} />
          {[
            { id: 'name',  label: 'Full Name',     type: 'text',  placeholder: 'お名前',        ac: 'name'  },
            { id: 'email', label: 'Email Address', type: 'email', placeholder: 'メールアドレス', ac: 'email' },
          ].map(({ id, label, type, placeholder, ac }) => (
            <div key={id} className="space-y-2 text-left">
              <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">{label}</label>
              <input id={id} type={type} value={formState[id]} onChange={handleFieldChange(id)}
                className="w-full bg-transparent border-b border-stone-800 focus:border-[#C97E6C] py-4 outline-none text-xl transition-colors"
                placeholder={placeholder} autoComplete={ac} />
              {formErrors[id] && <p className="text-xs text-red-500">{formErrors[id]}</p>}
            </div>
          ))}
          <div className="space-y-2 text-left">
            <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-[#C97E6C]">Message</label>
            <textarea id="message" rows={4} value={formState.message} onChange={handleFieldChange('message')}
              className="w-full bg-transparent border-b border-stone-800 focus:border-[#C97E6C] py-4 outline-none text-xl resize-none transition-colors"
              placeholder="ご相談内容" />
            {formErrors.message && <p className="text-xs text-red-500">{formErrors.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting}
            className="w-full py-8 bg-[#C97E6C] text-white rounded-full font-black text-2xl hover:bg-[#b06a5a] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4">
            {isSubmitting ? <Loader2 className="animate-spin" size={32} /> : 'SEND MESSAGE'}
          </button>
          <div className="h-6 text-center">
            {submitStatus === 'success'   && <p className="text-green-400  font-bold">送信完了いたしました。</p>}
            {submitStatus === 'error'     && <p className="text-red-400    font-bold">送信エラーが発生しました。</p>}
            {submitStatus === 'ratelimit' && <p className="text-yellow-400 font-bold">送信間隔を空けてください。</p>}
          </div>
        </form>
      </div>
    </section>
  );
});

// Footer: 完全静的、再レンダー不要
const Footer = memo(() => (
  <footer className="py-24 bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-900 text-center">
    <p className="text-3xl font-black uppercase mb-4 text-stone-900 dark:text-white">C&D.</p>
    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.5em]">© Takao Tsukakoshi / Conditioning Design.</p>
  </footer>
));

const BackToTopButton = memo(({ show }) => (
  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    aria-label="トップへ戻る"
    className={`fixed bottom-8 right-8 p-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl shadow-2xl transition-all duration-500 z-[90] ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
    <ArrowUp size={24} />
  </button>
));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MainContent
// スクロール状態 + 記事データのみを管理
// フォーム/FAQ の state は各セクションが保持
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MainContent = () => {
  // ✅ OPT 3: useReducer でスクロール状態を一元管理
  const [{ scrollProgress, scrolled, showBackToTop }, dispatchScroll] = useReducer(scrollReducer, SCROLL_INIT);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [articles,   setArticles]   = useState([]);
  // ✅ OPT 9: useTransition → 記事更新を低優先度に設定
  //    → 記事が届いてもUI操作（スクロール等）を優先して処理
  const [isPending, startTransition] = useTransition();
  const rafRef = useRef(null);

  // ✅ OPT 12: requestAnimationFrame でスクロールハンドラをスロットリング
  //    → 1フレーム（約16ms）に1回だけ状態更新
  //    → スクロールイベントが毎ms発火しても React 再レンダーは 60fps 以下に抑制
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return; // 前フレームの処理が残っていればスキップ
      rafRef.current = requestAnimationFrame(() => {
        const y = window.pageYOffset || document.documentElement.scrollTop;
        const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        dispatchScroll({ payload: {
          scrollProgress:  h > 0 ? (y / h) * 100 : 0,
          scrolled:        y > 50,
          showBackToTop:   y > 600,
        }});
        rafRef.current = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current); // cleanup
    };
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      const domain = import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN;
      const apiKey  = import.meta.env.VITE_MICROCMS_API_KEY;
      if (!domain || !apiKey) return;
      try {
        const res = await fetch(`https://${domain}.microcms.io/api/v1/news`, {
          headers: { 'X-MICROCMS-API-KEY': apiKey },
        });
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        startTransition(() => { // ✅ 低優先度更新
          setArticles((data.contents || []).map(item => ({
            id:       item.id,
            title:    item.title,
            platform: item.category || 'News',
            date:     item.date ? item.date.split('T')[0].replace(/-/g, '.') : '',
            image:    'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=800',
          })));
        });
      } catch (err) { console.error(err); }
    };
    fetchNews();
  }, []);

  const scrollTo = useCallback((id) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const offset = scrolled ? 70 : 100;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
  }, [scrolled]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 font-sans antialiased transition-colors duration-500">
      <SEO />
      <ScrollProgressBar scrollProgress={scrollProgress} />
      <Header scrolled={scrolled} scrollTo={scrollTo} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      {/* isMenuOpen=true の時だけマウント → 閉じている間はDOMに存在しない */}
      {isMenuOpen && <MobileMenu scrollTo={scrollTo} />}

      <main>
        {/* Hero のみ即時レンダー（ファーストビュー） */}
        <HeroSection scrollTo={scrollTo} />

        {/* ✅ OPT 5: スクロール前はDOMに追加しない → 初期レンダリングを軽量化 */}
        <LazySection minHeight="36rem"><MethodsSection /></LazySection>
        <LazySection minHeight="32rem"><ProfileSection /></LazySection>
        <LazySection minHeight="32rem"><PricingSection scrollTo={scrollTo} /></LazySection>
        <LazySection minHeight="28rem"><ArticlesSection articles={articles} isPending={isPending} /></LazySection>
        <LazySection minHeight="24rem"><FaqSection /></LazySection>
        <LazySection minHeight="32rem"><ContactSection /></LazySection>
      </main>

      <Footer />
      <BackToTopButton show={showBackToTop} />
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <MainContent />
  </ThemeProvider>
);

const rootElement = document.getElementById('root');
if (rootElement) { createRoot(rootElement).render(<App />); }
