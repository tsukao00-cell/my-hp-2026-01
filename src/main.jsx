import React, { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo, memo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ArrowUpRight, Zap, RefreshCw, Menu, X, ChevronDown, 
  Loader2, Maximize2, Compass, Moon, Sun, ArrowUp 
} from 'lucide-react';

// --- Helpers ---
const getSafeStorage = (key, fallback) => {
  try {
    if (typeof window !== 'undefined') return localStorage.getItem(key) || fallback;
  } catch (e) { return fallback; }
};

const NAV_ITEMS = ['methods', 'profile', 'pricing', 'articles', 'faq', 'contact'];

// --- 1. Context & Theme ---
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const saved = getSafeStorage('theme', null);
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) setTheme('dark');
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(p => p === 'light' ? 'dark' : 'light'), []);
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// --- 2. SEO Component ---
const SEO = memo(() => {
  useEffect(() => {
    const siteName = "塚越 貴男 | Conditioning Design";
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
    setMeta('og:type', 'website', true);
  }, []);
  return null;
});

// --- 3. UI Components ---
const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsVisible(true); obs.unobserve(el); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => { if (el) obs.unobserve(el); };
  }, []);
  return <div ref={ref} className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

// --- 4. Main Application ---
const MainContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);
  const lastTime = useRef(0);

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
        setArticles((data.contents || []).map(i => ({
          id: i.id, title: i.title, date: i.date?.split('T')[0] || '',
          image: i.image?.url || 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=800'
        })));
      } catch (e) { console.error("microCMS load failed", e); }
    };
    fetchNews();
  }, []);

  const scrollTo = useCallback((id) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - (scrolled ? 70 : 100), behavior: 'smooth' });
  }, [scrolled]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Date.now() - lastTime.current < 10000) { setStatus('ratelimit'); return; }
    try {
      const res = await fetch('https://formspree.io/f/mpqdveaw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setStatus('success'); setForm({ name: '', email: '', message: '' }); lastTime.current = Date.now(); }
    } catch { setStatus('error'); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0a09] transition-colors duration-500">
      <SEO />
      {/* Scroll Progress */}
      <div className="fixed top-0 left-0 w-full h-1 z-[110] bg-stone-100/50 dark:bg-stone-900/50">
        <div className="h-full bg-[#C97E6C] transition-all" style={{ width: `${progress}%` }} />
      </div>
      
      {/* Header */}
      <header className={`fixed top-0 left-0 w-full z-[100] transition-all ${scrolled ? 'bg-white/90 dark:bg-stone-950/90 py-4 shadow-sm' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="flex items-center gap-2 group">
            <span className="text-2xl font-black uppercase text-stone-900 dark:text-white">C&D.</span>
            <div className="w-1.5 h-1.5 bg-[#C97E6C] rounded-full" />
          </button>
          <nav className="hidden md:flex gap-10 items-center">
            {NAV_ITEMS.map(i => (<button key={i} onClick={() => scrollTo(i)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 hover:text-[#C97E6C] transition-all">{i}</button>))}
            <button onClick={toggleTheme} className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-900 text-stone-500">{theme === 'light' ? <Moon size={16}/> : <Sun size={16}/>}</button>
          </nav>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-stone-900 dark:text-white">{isMenuOpen ? <X size={24}/> : <Menu size={24}/>}</button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-white dark:bg-stone-950 flex flex-col items-center justify-center gap-8 md:hidden">
          {NAV_ITEMS.map(i => (<button key={i} onClick={() => scrollTo(i)} className="text-2xl font-black uppercase">{i}</button>))}
          <button onClick={toggleTheme} className="border border-stone-200 px-8 py-3 rounded-full">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</button>
        </div>
      )}

      <main>
        {/* --- Hero Section --- */}
        <section className="min-h-screen flex items-center pt-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center w-full">
            <div className="lg:col-span-7">
              <FadeIn>
                <div className="flex items-center gap-3 mb-6"><span className="w-12 h-px bg-[#C97E6C]" /><p className="text-xs font-bold uppercase tracking-[0.5em] text-[#C97E6C]">Performance Architect</p></div>
                <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.85] mb-8 text-stone-900 dark:text-white">Refine Your<br /><span className="text-[#C97E6C]">Potential.</span></h1>
                <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 mb-12 max-w-xl">15年以上の知見を凝縮した、勝者のためのコンディショニング。</p>
                <button onClick={() => scrollTo('contact')} className="px-10 py-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold hover:bg-[#C97E6C] transition-all shadow-2xl flex items-center gap-3">セッションを予約 <ArrowUpRight size={20}/></button>
              </FadeIn>
            </div>
            <div className="lg:col-span-5 hidden lg:block">
              <FadeIn delay={200}><div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl"><img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200" alt="Training" className="w-full h-full object-cover grayscale-[0.2]" /></div></FadeIn>
            </div>
          </div>
        </section>

        {/* --- Methods Section --- */}
        <section id="methods" className="py-32 bg-stone-50 dark:bg-stone-900/30 text-center">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-7xl font-black mb-16">Methods.</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { id: 'a', icon: Compass, title: 'Analysis', desc: '骨格・神経のクセを解析します。' },
                { id: 'b', icon: Maximize2, title: 'Stretch', desc: '可動域を正しく再編します。' },
                { id: 'c', icon: Zap, title: 'Training', desc: '最大のパワーを生む動作を習得。', isAccent: true },
                { id: 'd', icon: RefreshCw, title: 'Recovery', desc: '24時間のサイクルを最適化。' }
              ].map(m => (
                <div key={m.id} className={`p-10 rounded-[3rem] border transition-all ${m.isAccent ? 'bg-[#C97E6C] text-white border-transparent shadow-xl' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800'}`}>
                  <m.icon className="w-10 h-10 mb-6 mx-auto" /><h4 className="text-xl font-bold mb-4">{m.title}</h4><p className="text-sm opacity-80">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Profile Section --- */}
        <section id="profile" className="py-40 bg-white dark:bg-stone-950">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-8">
              <FadeIn>
                <h3 className="text-5xl md:text-6xl font-black mb-8 text-stone-900 dark:text-white">塚越 貴男 <span className="text-xl font-normal text-stone-400 ml-4">Takao Tsukakoshi</span></h3>
                <p className="text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl mb-12">15年以上のキャリアを通じ、自律神経を可視化する「Ci-Vision」や独自の「Ciメソッド」であなたの可能性を再定義します。</p>
                <div className="flex flex-wrap gap-12 mt-12">
                  <div key="exp"><p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Experience</p><p className="text-3xl font-black">15Years+</p></div>
                  <div key="ses"><p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Annual Sessions</p><p className="text-3xl font-black">1,200+</p></div>
                </div>
              </FadeIn>
            </div>
            <div className="lg:col-span-4 rounded-[4rem] overflow-hidden shadow-2xl grayscale"><img src="/profile.JPG" alt="Takao Tsukakoshi" className="w-full h-full object-cover" /></div>
          </div>
        </section>

        {/* --- Pricing Section --- */}
        <section id="pricing" className="py-32 bg-stone-50 dark:bg-stone-900/40 text-center">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-4xl md:text-7xl font-black mb-20">Value.</h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="p-12 rounded-[4rem] bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
                <span className="inline-block px-5 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-[10px] font-bold uppercase mb-8 text-[#C97E6C]">Trial Session</span>
                <h4 className="text-4xl font-bold mb-2">90min Experience</h4>
                <div className="text-5xl font-black mb-12 flex justify-center items-baseline gap-2">¥22,000 <span className="text-sm font-normal text-stone-400">(tax inc.)</span></div>
                <button onClick={() => scrollTo('contact')} className="w-full py-6 rounded-full border-2 border-stone-900 dark:border-white font-bold hover:bg-stone-900 hover:text-white transition-all">予約する</button>
              </div>
              <div className="p-12 rounded-[4rem] bg-stone-900 text-white border-4 border-[#C97E6C]">
                <span className="inline-block px-5 py-2 bg-[#C97E6C] rounded-full text-[10px] font-bold uppercase mb-8">Premium Membership</span>
                <h4 className="text-4xl font-bold mb-2">Custom Plan</h4>
                <div className="text-5xl font-black mb-12">Customized</div>
                <button onClick={() => scrollTo('contact')} className="w-full py-6 rounded-full bg-[#C97E6C] text-white font-bold hover:bg-[#b06a5a] transition-all">詳細を聞く</button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Articles Section --- */}
        <section id="articles" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-5xl font-black mb-20">Journal.</h3>
            <div className="grid md:grid-cols-3 gap-12">
              {articles.map(a => (
                <div key={a.id} className="group cursor-pointer">
                  <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 shadow-lg"><img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>
                  <p className="text-[10px] text-stone-400 font-bold mb-2 uppercase">{a.date}</p>
                  <h4 className="text-xl font-bold group-hover:text-[#C97E6C] transition-colors">{a.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FAQ Section --- */}
        <section id="faq" className="py-32 bg-stone-50 dark:bg-stone-900/40 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h3 className="text-4xl md:text-7xl font-black mb-20">FAQ.</h3>
            <div className="space-y-4 text-left">
              {[
                { q: "運動初心者でも受講可能ですか？", a: "はい。体力や状態に合わせて個別プログラムを構成します。" },
                { q: "セッションの場所はどこですか？", a: "都内提携スタジオ、または出張にて対応しております。" },
                { q: "準備するものはありますか？", a: "動きやすい服装、室内用シューズ、タオル、水分をご用意ください。" }
              ].map((f, i) => (
                <div key={i} className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-100 dark:border-stone-800 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-8 flex justify-between items-center font-bold text-lg">{f.q}<ChevronDown className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} /></button>
                  {openFaq === i && <div className="px-8 pb-8 text-stone-500 dark:text-stone-400 leading-relaxed">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Contact Section --- */}
        <section id="contact" className="py-32 bg-stone-950 text-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-6xl md:text-8xl font-black mb-12 leading-[0.9]">Get in <span className="text-[#C97E6C]">Touch.</span></h2>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8 bg-stone-900/50 p-10 rounded-[4rem] border border-stone-800">
              <input type="text" value={form.name} onChange={e => { setStatus(null); setForm({...form, name: e.target.value}); }} className="w-full bg-transparent border-b border-stone-800 py-4 outline-none text-xl" placeholder="お名前" />
              <input type="email" value={form.email} onChange={e => { setStatus(null); setForm({...form, email: e.target.value}); }} className="w-full bg-transparent border-b border-stone-800 py-4 outline-none text-xl" placeholder="メールアドレス" />
              <textarea rows={4} value={form.message} onChange={e => { setStatus(null); setForm({...form, message: e.target.value}); }} className="w-full bg-transparent border-b border-stone-800 py-4 outline-none text-xl resize-none" placeholder="ご相談内容" />
              <button type="submit" className="w-full py-8 bg-[#C97E6C] rounded-full font-black text-2xl hover:bg-[#b06a5a] transition-all">SEND MESSAGE</button>
              <div className="h-6 mt-4">{status === 'success' && <p className="text-green-400 font-bold">送信完了いたしました。</p>}{status === 'ratelimit' && <p className="text-yellow-400 font-bold">間隔を空けてください。</p>}</div>
            </form>
          </div>
        </section>
      </main>

      <footer className="py-24 border-t border-stone-100 dark:border-stone-900 text-center">
        <p className="text-3xl font-black mb-4 uppercase text-stone-900 dark:text-white">C&D.</p>
        <p className="text-[10px] text-stone-400 uppercase tracking-widest">© Takao Tsukakoshi / Conditioning Design.</p>
      </footer>
      
      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`fixed bottom-8 right-8 p-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl shadow-2xl transition-all z-[90] ${progress > 10 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}><ArrowUp size={24} /></button>
    </div>
  );
};

const App = () => (<ThemeProvider><MainContent /></ThemeProvider>);
const rootElement = document.getElementById('root');
if (rootElement) { createRoot(rootElement).render(<App />); }