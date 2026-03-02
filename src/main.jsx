import React, { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo, useReducer, memo, useTransition } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Zap, RefreshCw, Menu, X, ChevronDown, Loader2, Maximize2, Compass, Moon, Sun, ArrowUp } from 'lucide-react';

// --- Static Data & Helpers ---
const getSafeStorage = (key, fallback) => {
  try { if (typeof window !== 'undefined') return localStorage.getItem(key) || fallback; } catch (e) { console.warn('Storage denied:', e); }
  return fallback;
};

const NAV_ITEMS = ['methods', 'profile', 'pricing', 'articles', 'faq', 'contact'];

const STATS_DATA = [
  { label: 'Experience', value: '15', suffix: 'Years+' },
  { label: 'Annual Sessions', value: '1,200', suffix: '+' },
  { label: 'Strategy', value: 'Custom', suffix: 'Tailored' },
];

const METHODS_DATA = [
  { id: 'analysis', icon: Compass, title: 'Bio-Logic Analysis', desc: '骨格・神経のクセを解析し、改善への地図を描きます。' },
  { id: 'stretch', icon: Maximize2, title: 'Active Conditioning', desc: '可動域を正しく使いこなせる状態へと再編します。' },
  { id: 'performance', icon: Zap, title: 'Dynamic Training', desc: '最小限の努力で最大のパワーを生む動作を習得。', isAccent: true },
  { id: 'recovery', icon: RefreshCw, title: 'Cyclic Recovery', desc: '24時間の代謝サイクルを最適化し、活力を維持します。' },
];

const PRICING_DATA = [
  { id: 'trial', label: 'Trial Session', title: '90min Experience', price: '22,000', note: '(tax inc.)' },
  { id: 'premium', label: 'Premium Membership', title: 'Custom Plan', price: 'Customized', note: '', isAccent: true },
];

// --- Context & Theme ---
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
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// --- Components ---
const SEO = memo(() => {
  useEffect(() => {
    const siteName = '塚越 貴男 | Conditioning Design';
    document.documentElement.lang = 'ja';
    document.title = `${siteName} - パフォーマンスコーチ`;
    const setMeta = (n, c, p = false) => {
      const a = p ? 'property' : 'name';
      let el = document.querySelector(`meta[${a}="${n}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(a, n); document.head.appendChild(el); }
      el.setAttribute('content', c);
    };
    setMeta('description', '身体構造を最適化し、人生のパフォーマンスを向上させるコンディショニング。');
    setMeta('og:title', siteName, true);
    setMeta('og:url', 'https://t-conditioning-design.com', true);
  }, []);
  return null;
});

const FadeIn = memo(({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsVisible(true); obs.unobserve(el); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
});

const LazySection = memo(({ children, minHeight = '32rem' }) => {
  const [rendered, setRendered] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setRendered(true); obs.unobserve(el); } }, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return <div ref={ref} style={{ minHeight: rendered ? undefined : minHeight }}>{rendered ? children : null}</div>;
});

// --- UI Sections ---
const HeroSection = memo(({ scrollTo }) => (
  <section className="min-h-screen flex items-center pt-20 px-6 md:px-12">
    <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-16 items-center">
      <div className="lg:col-span-7">
        <FadeIn>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-px bg-[#C97E6C]" />
            <p className="text-xs font-bold uppercase tracking-[0.5em] text-[#C97E6C]">Performance Architect</p>
          </div>
          <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.85] mb-8">Refine Your<br /><span className="text-[#C97E6C]">Potential.</span></h1>
          <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 mb-12 max-w-xl">15年以上の知見を凝縮した、勝者のためのコンディショニング。</p>
          <button onClick={() => scrollTo('contact')} className="px-10 py-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold hover:bg-[#C97E6C] transition-all shadow-2xl flex items-center gap-3 group">
            セッションを予約 <ArrowUpRight className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </FadeIn>
      </div>
      {/* RESTORED TOP IMAGE */}
      <div className="lg:col-span-5 hidden lg:block">
        <FadeIn delay={200}>
          <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative">
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200" alt="Training" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" loading="eager" />
          </div>
        </FadeIn>
      </div>
    </div>
  </section>
));

const ProfileSection = memo(() => (
  <section id="profile" className="py-40 bg-white dark:bg-stone-950">
    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
      <div className="lg:col-span-8">
        <FadeIn>
          <h3 className="text-5xl md:text-6xl font-black mb-8">塚越 貴男 <span className="text-xl font-normal text-stone-400 ml-4">Takao Tsukakoshi</span></h3>
          <p className="text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl mb-12">15年以上のキャリアを通じ、独自の「Ciメソッド」であなたの可能性を再定義します。</p>
          <div className="flex flex-wrap gap-12">{STATS_DATA.map(s => (<div key={s.label}><p className="text-xs font-bold text-stone-400 tracking-widest uppercase">{s.label}</p><p className="text-3xl font-black">{s.value}{s.suffix}</p></div>))}</div>
        </FadeIn>
      </div>
      {/* RESTORED PROFILE IMAGE */}
      <div className="lg:col-span-4 hidden lg:block">
        <FadeIn delay={200}>
          <div className="rounded-[4rem] overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
            <img src="/profile.JPG" alt="Takao Tsukakoshi" className="w-full h-full object-cover" loading="lazy" />
          </div>
        </FadeIn>
      </div>
    </div>
  </section>
));

const PricingSection = memo(({ scrollTo }) => (
  <section id="pricing" className="py-32 bg-stone-50 dark:bg-stone-900/40 text-center">
    <div className="max-w-5xl mx-auto px-6">
      <FadeIn><h2 className="text-4xl md:text-7xl font-black mb-20">Value.</h2></FadeIn>
      <div className="grid md:grid-cols-2 gap-10">
        {PRICING_DATA.map((p, i) => (
          <FadeIn key={p.id} delay={i * 100} className={`p-12 rounded-[4rem] border ${p.isAccent ? 'bg-stone-900 text-white border-[#C97E6C]' : 'bg-white dark:bg-stone-900 border-stone-100'}`}>
            <span className="inline-block px-5 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-[10px] font-bold uppercase mb-8 text-[#C97E6C]">{p.label}</span>
            <h4 className="text-4xl font-bold mb-2">{p.title}</h4>
            <div className="text-5xl font-black mb-12 flex justify-center items-baseline gap-2">{p.id === 'trial' && '¥'}{p.price}<span className="text-sm font-normal text-stone-400 ml-2">{p.note}</span></div>
            <button onClick={() => scrollTo('contact')} className={`w-full py-6 rounded-full font-bold transition-all ${p.isAccent ? 'bg-[#C97E6C] text-white hover:bg-[#b06a5a]' : 'border-2 border-stone-900 dark:border-white hover:bg-stone-900 hover:text-white'}`}>お問い合わせ</button>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
));

const ArticlesSection = memo(({ articles, isPending }) => (
  <section id="articles" className="py-32">
    <div className="max-w-7xl mx-auto px-6">
      <FadeIn><h3 className="text-5xl font-black mb-20">Journal.</h3></FadeIn>
      {isPending ? <div className="flex justify-center"><Loader2 className="animate-spin text-[#C97E6C]" /></div> : (
        <div className="grid md:grid-cols-3 gap-12">
          {articles.map((a, i) => (
            <FadeIn key={a.id} delay={i * 100} className="group cursor-pointer">
              <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 shadow-lg"><img src={a.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>
              <h4 className="text-xl font-bold group-hover:text-[#C97E6C] transition-colors">{a.title}</h4>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  </section>
));

const ContactSection = memo(() => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const lastTime = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Date.now() - lastTime.current < 10000) { setStatus('ratelimit'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/mpqdveaw', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setStatus('success'); setForm({ name: '', email: '', message: '' }); lastTime.current = Date.now(); } else { setStatus('error'); }
    } catch { setStatus('error'); } finally { setSubmitting(false); }
  };

  return (
    <section id="contact" className="py-32 bg-stone-950 text-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-6xl md:text-8xl font-black mb-12">Get in <span className="text-[#C97E6C]">Touch.</span></h2>
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8 bg-stone-900/50 p-10 rounded-[4rem] border border-stone-800">
          <input type="text" value={form.name} onChange={e => { setStatus(null); setForm({...form, name: e.target.value}); }} className="w-full bg-transparent border-b border-stone-800 py-4 outline-none text-xl" placeholder="お名前" />
          <input type="email" value={form.email} onChange={e => { setStatus(null); setForm({...form, email: e.target.value}); }} className="w-full bg-transparent border-b border-stone-800 py-4 outline-none text-xl" placeholder="メールアドレス" />
          <textarea rows={4} value={form.message} onChange={e => { setStatus(null); setForm({...form, message: e.target.value}); }} className="w-full bg-transparent border-b border-stone-800 py-4 outline-none text-xl resize-none" placeholder="ご相談内容" />
          <button type="submit" disabled={submitting} className="w-full py-8 bg-[#C97E6C] rounded-full font-black text-2xl disabled:opacity-50">{submitting ? <Loader2 className="animate-spin mx-auto" /> : 'SEND MESSAGE'}</button>
          <div className="h-6 mt-4">{status === 'success' && <p className="text-green-400">送信完了いたしました。</p>}{status === 'error' && <p className="text-red-400">送信エラーが発生しました。</p>}{status === 'ratelimit' && <p className="text-yellow-400">間隔を空けてください。</p>}</div>
        </form>
      </div>
    </section>
  );
});

// --- Main App ---
const MainContent = () => {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [articles, setArticles] = useState([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const onScroll = () => {
      const y = window.pageYOffset;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (y / h) * 100 : 0);
      setScrolled(y > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      const d = import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN;
      const k = import.meta.env.VITE_MICROCMS_API_KEY;
      if (!d || !k) return;
      try {
        const res = await fetch(`https://${d}.microcms.io/api/v1/news`, { headers: { 'X-MICROCMS-API-KEY': k } });
        const data = await res.json();
        startTransition(() => {
          setArticles((data.contents || []).map(item => ({ id: item.id, title: item.title, date: item.date?.split('T')[0].replace(/-/g, '.') || '', image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=800' })));
        });
      } catch (err) { console.error(err); }
    };
    fetchNews();
  }, []);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - (scrolled ? 70 : 100), behavior: 'smooth' });
  }, [scrolled]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0a09] transition-colors duration-500">
      <SEO />
      <div className="fixed top-0 left-0 w-full h-1 z-[110] bg-stone-100/50"><div className="h-full bg-[#C97E6C] transition-all" style={{ width: `${progress}%` }} /></div>
      <header className={`fixed top-0 left-0 w-full z-[100] transition-all ${scrolled ? 'bg-white/90 dark:bg-stone-950/90 py-4 shadow-sm' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-2xl font-black">C&D.</button>
          <nav className="hidden md:flex gap-10">
            {NAV_ITEMS.map(i => (<button key={i} onClick={() => scrollTo(i)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 hover:text-[#C97E6C]">{i}</button>))}
          </nav>
        </div>
      </header>
      <main>
        <HeroSection scrollTo={scrollTo} />
        <LazySection><section id="methods" className="py-32 bg-stone-50 dark:bg-stone-900/30 text-center"><h2 className="text-4xl md:text-7xl font-black mb-16">Methods.</h2><div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">{METHODS_DATA.map(m => (<div key={m.id} className={`p-10 rounded-[3rem] border ${m.isAccent ? 'bg-[#C97E6C] text-white border-transparent' : 'bg-white dark:bg-stone-900 border-stone-100'}`}><m.icon className="w-10 h-10 mb-6 mx-auto" /><h4 className="text-xl font-bold mb-4">{m.title}</h4><p className="text-sm opacity-80">{m.desc}</p></div>))}</div></section></LazySection>
        <LazySection><ProfileSection /></LazySection>
        <LazySection><PricingSection scrollTo={scrollTo} /></LazySection>
        <LazySection><ArticlesSection articles={articles} isPending={isPending} /></LazySection>
        <LazySection><ContactSection /></LazySection>
      </main>
      <footer className="py-24 border-t border-stone-100 dark:border-stone-900 text-center"><p className="text-3xl font-black mb-4">C&D.</p><p className="text-[10px] text-stone-400 uppercase tracking-widest">© Takao Tsukakoshi / Conditioning Design.</p></footer>
    </div>
  );
};

const App = () => (<ThemeProvider><MainContent /></ThemeProvider>);
const rootElement = document.getElementById('root');
if (rootElement) { createRoot(rootElement).render(<App />); }