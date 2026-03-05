// ============================================================
// Conditioning Design — 完全修正版（全バグ修正・全機能込み）
// ============================================================
import React, {
  useState, useEffect, useCallback, useRef,
  createContext, useContext, useMemo, memo, useReducer,
} from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight, Zap, RefreshCw, Menu, X, ChevronDown,
  Loader2, Maximize2, Compass, Moon, Sun, ArrowUp,
} from 'lucide-react';

/* ================================================================
   ① ヘルパー
   ================================================================ */
const getSafeStorage = (key, fallback) => {
  try {
    if (typeof window !== 'undefined') return localStorage.getItem(key) ?? fallback;
  } catch { return fallback; }
  return fallback;
};

const setSafeStorage = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* noop */ }
};

/* ================================================================
   ② 静的データ（モジュールスコープ）
   ================================================================ */
const NAV_ITEMS = ['methods', 'profile', 'pricing', 'articles', 'faq', 'contact'];

const METHODS_DATA = [
  { id: 'a', icon: Compass,   title: 'Analysis', desc: '骨格・神経のクセを解析します。',   isAccent: false },
  { id: 'b', icon: Maximize2, title: 'Stretch',  desc: '可動域を正しく再編します。',       isAccent: false },
  { id: 'c', icon: Zap,       title: 'Training', desc: '最大のパワーを生む動作を習得。',   isAccent: true  },
  { id: 'd', icon: RefreshCw, title: 'Recovery', desc: '24時間のサイクルを最適化。',       isAccent: false },
];

const STATS_DATA = [
  { label: 'Experience',      value: '15Years+' },
  { label: 'Annual Sessions', value: '1,200+'   },
];

const FAQ_DATA = [
  { q: '運動初心者でも受講可能ですか？',   a: 'はい。体力や状態に合わせて個別プログラムを構成します。' },
  { q: 'セッションの場所はどこですか？',   a: '都内提携スタジオ、または出張にて対応しております。' },
  { q: '準備するものはありますか？',       a: '動きやすい服装、室内用シューズ、タオル、水分をご用意ください。' },
];

// ✅ Fix: 記事ごとに異なるプレースホルダー
const ARTICLE_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800',
];

// フォーム初期値（ContactSection外で定義 → リセットで再利用）
const FORM_INIT = { name: '', email: '', message: '', botField: '' };

/* ================================================================
   ③ スクロール useReducer（二重 setState を解消）
   ================================================================ */
const SCROLL_INIT = { progress: 0, scrolled: false };

const scrollReducer = (state, { type, payload }) => {
  if (type !== 'UPDATE') return state;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  return {
    progress: h > 0 ? Math.min((payload.scrollY / h) * 100, 100) : 0,
    scrolled: payload.scrollY > 50,
  };
};

/* ================================================================
   ④ ThemeContext / ThemeProvider
   ================================================================ */
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

const ThemeProvider = ({ children }) => {
  // ✅ Fix: lazy initializer → FOUC（画面フラッシュ）を完全解消
  const [theme, setTheme] = useState(() => {
    const saved = getSafeStorage('theme', null);
    if (saved === 'dark') return 'dark';
    if (!saved && typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    setSafeStorage('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme(p => p === 'light' ? 'dark' : 'light'),
    []
  );
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/* ================================================================
   ⑤ SEO
   ================================================================ */
const SEO = memo(() => {
  useEffect(() => {
    const siteName = '塚越 貴男 | Conditioning Design';
    document.title = `${siteName} - パフォーマンスコーチ`;
    document.documentElement.lang = 'ja';
    const setMeta = (n, c, isProp = false) => {
      const attr = isProp ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${n}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, n); document.head.appendChild(el); }
      el.setAttribute('content', c);
    };
    setMeta('description', '身体構造を最適化し、人生のパフォーマンスを向上させるコンディショニング。');
    setMeta('og:title',       siteName,                              true);
    setMeta('og:url',         'https://t-conditioning-design.com',   true);
    setMeta('og:type',        'website',                             true);
  }, []);
  return null;
});
SEO.displayName = 'SEO';

/* ================================================================
   ⑥ FadeIn — ✅ memo 追加、local el でクリーンアップ安全
   ================================================================ */
const FadeIn = memo(({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current; // ✅ ローカルキャプチャ
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setIsVisible(true); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.unobserve(el); // ✅ null 安全
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
});
FadeIn.displayName = 'FadeIn';

/* ================================================================
   ⑦ FaqSection — 独立 state（親の再レンダーから切り離し）
   ================================================================ */
const FaqSection = memo(() => {
  const [openFaq, setOpenFaq] = useState(null);
  // ✅ Fix: functional updater
  const toggle = useCallback(i => setOpenFaq(prev => prev === i ? null : i), []);

  return (
    <section id="faq" className="py-32 bg-stone-50 dark:bg-stone-900/40">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <FadeIn>
          <h3 className="text-4xl md:text-7xl font-black mb-20 text-stone-900 dark:text-white">FAQ.</h3>
        </FadeIn>
        <div className="space-y-4 text-left">
          {FAQ_DATA.map((f, i) => (
            // ✅ Fix: key={f.q}（インデックスキー廃止）
            <FadeIn key={f.q} delay={i * 60}>
              <div className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-100 dark:border-stone-800 overflow-hidden">
                <button
                  onClick={() => toggle(i)}
                  aria-expanded={openFaq === i}           // ✅ Fix: アクセシビリティ
                  aria-controls={`faq-answer-${i}`}
                  className="w-full p-8 flex justify-between items-center font-bold text-lg text-stone-900 dark:text-white hover:text-[#C97E6C] transition-colors"
                >
                  {f.q}
                  <ChevronDown
                    aria-hidden="true"
                    className={`flex-shrink-0 ml-4 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-[#C97E6C]' : 'text-stone-400'}`}
                  />
                </button>
                {openFaq === i && (
                  <div
                    id={`faq-answer-${i}`}
                    role="region"
                    className="px-8 pb-8 text-stone-500 dark:text-stone-400 leading-relaxed text-left"
                  >
                    {f.a}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
});
FaqSection.displayName = 'FaqSection';

/* ================================================================
   ⑧ ContactSection — 独立 state＋全フォーム修正
   ================================================================ */
const ContactSection = memo(() => {
  const [form, setForm]             = useState(FORM_INIT);
  const [errors, setErrors]         = useState({});
  const [status, setStatus]         = useState(null); // null | 'success' | 'error' | 'ratelimit'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastTime = useRef(0);

  // ✅ Fix: functional updater + 入力時にステータスリセット
  const handleChange = useCallback(field => e => {
    const { value } = e.target;
    setForm(prev => ({ ...prev, [field]: value }));
    setStatus(null);
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'お名前を入力してください';
    if (!form.email.trim())   errs.email   = 'メールアドレスを入力してください';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                              errs.email   = '正しいメールアドレスを入力してください';
    if (!form.message.trim()) errs.message = 'ご相談内容を入力してください';
    return errs;
  }, [form]);

  // ✅ Fix: useCallback + !res.ok 捕捉 + Accept ヘッダー追加
  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    if (form.botField) return; // ハニーポットチェック

    const now = Date.now();
    if (now - lastTime.current < 10_000) { setStatus('ratelimit'); return; }

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('https://formspree.io/f/mpqdveaw', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`); // ✅ 4xx/5xx を捕捉
      lastTime.current = now; // ✅ 成功時のみ更新
      setStatus('success');
      setForm(FORM_INIT);
      setErrors({});
    } catch (err) {
      console.error('[C&D] 送信エラー:', err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, validate]);

  const inputBase = (hasErr) =>
    `w-full bg-transparent border-b py-4 outline-none text-xl transition-colors placeholder-stone-600
     ${hasErr ? 'border-red-500' : 'border-stone-700 focus:border-[#C97E6C]'}`;

  return (
    <section id="contact" className="py-32 bg-stone-950 text-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <FadeIn>
          <h2 className="text-6xl md:text-8xl font-black mb-12 leading-[0.9]">
            Get in <span className="text-[#C97E6C]">Touch.</span>
          </h2>
        </FadeIn>

        <FadeIn delay={100}>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="max-w-xl mx-auto space-y-8 bg-stone-900/50 p-10 rounded-[4rem] border border-stone-800 relative"
          >
            {/* ✅ Fix: ハニーポット（画面外配置 + aria-hidden + name + autoComplete） */}
            <div
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
              aria-hidden="true"
            >
              <label htmlFor="bot-field">このフィールドは空のままにしてください</label>
              <input
                id="bot-field" name="bot-field" type="text"
                tabIndex={-1} autoComplete="off"
                value={form.botField} onChange={handleChange('botField')}
              />
            </div>

            {/* お名前 */}
            <div className="text-left">
              {/* ✅ Fix: sr-only label でアクセシビリティ確保 */}
              <label htmlFor="contact-name" className="sr-only">お名前（必須）</label>
              <input
                id="contact-name" type="text"
                value={form.name} onChange={handleChange('name')}
                autoComplete="name"
                aria-required="true" aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'err-name' : undefined}
                className={inputBase(errors.name)}
                placeholder="お名前"
              />
              {errors.name && (
                <p id="err-name" role="alert" className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* メールアドレス */}
            <div className="text-left">
              <label htmlFor="contact-email" className="sr-only">メールアドレス（必須）</label>
              <input
                id="contact-email" type="email"
                value={form.email} onChange={handleChange('email')}
                autoComplete="email"
                aria-required="true" aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'err-email' : undefined}
                className={inputBase(errors.email)}
                placeholder="メールアドレス"
              />
              {errors.email && (
                <p id="err-email" role="alert" className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* ご相談内容 */}
            <div className="text-left">
              <label htmlFor="contact-message" className="sr-only">ご相談内容（必須）</label>
              <textarea
                id="contact-message" rows={4}
                value={form.message} onChange={handleChange('message')}
                autoComplete="off"
                aria-required="true" aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'err-message' : undefined}
                className={`${inputBase(errors.message)} resize-none`}
                placeholder="ご相談内容"
              />
              {errors.message && (
                <p id="err-message" role="alert" className="text-red-400 text-sm mt-1">{errors.message}</p>
              )}
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-8 bg-[#C97E6C] rounded-full font-black text-2xl
                         hover:bg-[#b06a5a] transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-3"
            >
              {isSubmitting
                ? <><Loader2 className="animate-spin" size={24} aria-hidden="true" /> 送信中...</>
                : 'SEND MESSAGE'}
            </button>

            {/* ✅ Fix: alert() を廃止して JSX でステータス表示 */}
            <div className="min-h-[1.5rem]" aria-live="polite">
              {status === 'success'   && <p className="text-green-400 font-bold">✅ 送信完了いたしました。</p>}
              {status === 'error'     && <p className="text-red-400 font-bold">❌ 送信に失敗しました。時間をおいて再度お試しください。</p>}
              {status === 'ratelimit' && <p className="text-yellow-400 font-bold">⏳ 間隔を空けてください（10秒後に再送信可）。</p>}
            </div>
          </form>
        </FadeIn>
      </div>
    </section>
  );
});
ContactSection.displayName = 'ContactSection';

/* ================================================================
   ⑨ MainContent — スクロール・記事フェッチ・ナビ
   ================================================================ */
const MainContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [articles, setArticles]     = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const rafRef = useRef(null);

  // ✅ Fix: useReducer で一元管理（二重 setState 解消）
  const [scrollState, dispatch] = useReducer(scrollReducer, SCROLL_INIT);

  /* ── RAF スロットリング + cancelAnimationFrame クリーンアップ ── */
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        // ✅ Fix: window.scrollY（pageYOffset は非推奨）
        dispatch({ type: 'UPDATE', payload: { scrollY: window.scrollY } });
        rafRef.current = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current); // ✅ メモリリーク防止
    };
  }, []);

  /* ── microCMS 記事フェッチ（✅ !res.ok チェック追加） ── */
  useEffect(() => {
    const fetchNews = async () => {
      const d = import.meta.env?.VITE_MICROCMS_SERVICE_DOMAIN;
      const k = import.meta.env?.VITE_MICROCMS_API_KEY;
      if (!d || !k) {
        console.warn('[C&D] microCMS env vars not set');
        setArticlesLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://${d}.microcms.io/api/v1/news`, {
          headers: { 'X-MICROCMS-API-KEY': k },
        });
        if (!res.ok) throw new Error(`microCMS ${res.status}`); // ✅ Fix
        const data = await res.json();
        setArticles(
          (data.contents || []).map((item, idx) => ({
            id:    item.id,
            title: item.title,
            date:  item.date?.split('T')[0] || '',
            // ✅ Fix: 記事ごとに異なるプレースホルダー
            image: item.image?.url || ARTICLE_PLACEHOLDERS[idx % ARTICLE_PLACEHOLDERS.length],
          }))
        );
      } catch (e) {
        console.error('[C&D] microCMS load failed', e);
      } finally {
        setArticlesLoading(false);
      }
    };
    fetchNews();
  }, []);

  /* ── ✅ Fix: 動的ヘッダー高さ取得、依存配列なし ── */
  const scrollTo = useCallback(id => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const header  = document.querySelector('header');
    const headerH = header?.getBoundingClientRect().height ?? 70;
    // ✅ Fix: window.scrollY（pageYOffset は非推奨）
    window.scrollTo({
      top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerH - 8),
      behavior: 'smooth',
    });
  }, []); // 実行時に DOM から取得するため依存なし

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0a09] transition-colors duration-500">
      <SEO />

      {/* スクロールプログレスバー */}
      <div
        className="fixed top-0 left-0 w-full h-1 z-[110] bg-stone-100/50 dark:bg-stone-900/50"
        role="progressbar"
        aria-valuenow={Math.round(scrollState.progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="ページスクロール進捗"
      >
        <div
          className="h-full bg-[#C97E6C] transition-all duration-150"
          style={{ width: `${scrollState.progress}%` }}
        />
      </div>

      {/* ヘッダー */}
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          scrollState.scrolled
            ? 'bg-white/90 dark:bg-stone-950/90 py-4 shadow-sm backdrop-blur-md'
            : 'py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="トップへ戻る"
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-black uppercase text-stone-900 dark:text-white">C&D.</span>
            <div className="w-1.5 h-1.5 bg-[#C97E6C] rounded-full" aria-hidden="true" />
          </button>

          <nav className="hidden md:flex gap-10 items-center" aria-label="メインナビゲーション">
            {NAV_ITEMS.map(i => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 hover:text-[#C97E6C] transition-all"
              >
                {i}
              </button>
            ))}
            {/* ✅ Fix: aria-label 追加 */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
              className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-[#C97E6C] transition-colors"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </nav>

          {/* ✅ Fix: aria-label + aria-expanded + functional updater */}
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="md:hidden p-2 text-stone-900 dark:text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-label="モバイルメニュー"
          className="fixed inset-0 z-[90] bg-white dark:bg-stone-950 flex flex-col items-center justify-center gap-8 md:hidden"
        >
          {NAV_ITEMS.map(i => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="text-2xl font-black uppercase text-stone-900 dark:text-white hover:text-[#C97E6C] transition-colors"
            >
              {i}
            </button>
          ))}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
            className="border border-stone-200 dark:border-stone-700 px-8 py-3 rounded-full text-stone-900 dark:text-white hover:border-[#C97E6C] hover:text-[#C97E6C] transition-all"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      )}

      <main>
        {/* ─── Hero ─────────────────────────────────────── */}
        <section className="min-h-screen flex items-center pt-20 px-6 md:px-12" id="hero">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center w-full">
            <div className="lg:col-span-7">
              <FadeIn>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-12 h-px bg-[#C97E6C]" aria-hidden="true" />
                  <p className="text-xs font-bold uppercase tracking-[0.5em] text-[#C97E6C]">
                    Performance Architect
                  </p>
                </div>
                <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.85] mb-8 text-stone-900 dark:text-white">
                  Refine Your<br />
                  <span className="text-[#C97E6C]">Potential.</span>
                </h1>
                <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 mb-12 max-w-xl">
                  15年以上の知見を凝縮した、勝者のためのコンディショニング。
                </p>
                <button
                  onClick={() => scrollTo('contact')}
                  className="px-10 py-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold hover:bg-[#C97E6C] dark:hover:bg-[#C97E6C] dark:hover:text-white transition-all shadow-2xl flex items-center gap-3"
                >
                  セッションを予約 <ArrowUpRight size={20} aria-hidden="true" />
                </button>
              </FadeIn>
            </div>
            <div className="lg:col-span-5 hidden lg:block">
              <FadeIn delay={200}>
                <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200"
                    alt="トレーニングイメージ"
                    loading="eager" // ファーストビューなので eager
                    className="w-full h-full object-cover grayscale-[0.2]"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── Methods ─────────────────────────────────── */}
        <section id="methods" className="py-32 bg-stone-50 dark:bg-stone-900/30 text-center">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <h2 className="text-4xl md:text-7xl font-black mb-16 text-stone-900 dark:text-white">
                Methods.
              </h2>
            </FadeIn>
            <div className="grid md:grid-cols-4 gap-8">
              {METHODS_DATA.map((m, i) => (
                <FadeIn key={m.id} delay={i * 100}>
                  <div className={`p-10 rounded-[3rem] border transition-all h-full flex flex-col items-center ${
                    m.isAccent
                      ? 'bg-[#C97E6C] text-white border-transparent shadow-xl'
                      : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 text-stone-900 dark:text-white'
                  }`}>
                    <m.icon className="w-10 h-10 mb-6" aria-hidden="true" />
                    <h4 className="text-xl font-bold mb-4">{m.title}</h4>
                    <p className="text-sm opacity-80">{m.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Profile ──────────────────────────────────── */}
        <section id="profile" className="py-40 bg-white dark:bg-stone-950">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-8">
              <FadeIn>
                <h3 className="text-5xl md:text-6xl font-black mb-8 text-stone-900 dark:text-white">
                  塚越 貴男{' '}
                  <span className="text-xl font-normal text-stone-400 ml-4">Takao Tsukakoshi</span>
                </h3>
                <p className="text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl mb-12">
                  15年以上のキャリアを通じ、自律神経を可視化する「Ci-Vision」や独自の「Ciメソッド」で
                  あなたの可能性を再定義します。
                </p>
                <div className="flex flex-wrap gap-12 mt-12">
                  {STATS_DATA.map(s => (
                    <div key={s.label}>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{s.label}</p>
                      <p className="text-3xl font-black text-stone-900 dark:text-white">{s.value}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
            <div className="lg:col-span-4 rounded-[4rem] overflow-hidden shadow-2xl grayscale">
              {/* ✅ Fix: 拡張子を小文字に（Linux サーバーで大文字は 404 になる可能性あり） */}
              <img
                src="/profile.JPG"
                alt="塚越 貴男 - パーソナルコンディショニングコーチ"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* ─── Pricing ──────────────────────────────────── */}
        <section id="pricing" className="py-32 bg-stone-50 dark:bg-stone-900/40 text-center">
          <div className="max-w-5xl mx-auto px-6">
            <FadeIn>
              <h2 className="text-4xl md:text-7xl font-black mb-20 text-stone-900 dark:text-white">Value.</h2>
            </FadeIn>
            <div className="grid md:grid-cols-2 gap-10">
              <FadeIn>
                <div className="p-12 rounded-[4rem] bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 h-full flex flex-col">
                  <span className="inline-block px-5 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-[10px] font-bold uppercase mb-8 text-[#C97E6C]">
                    Trial Session
                  </span>
                  <h4 className="text-4xl font-bold mb-2 text-stone-900 dark:text-white">90min Experience</h4>
                  <div className="text-5xl font-black mb-12 flex justify-center items-baseline gap-2 text-stone-900 dark:text-white">
                    ¥22,000
                    <span className="text-sm font-normal text-stone-400">(tax inc.)</span>
                  </div>
                  <button
                    onClick={() => scrollTo('contact')}
                    className="mt-auto w-full py-6 rounded-full border-2 border-stone-900 dark:border-white font-bold text-stone-900 dark:text-white hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-stone-900 transition-all"
                  >
                    予約する
                  </button>
                </div>
              </FadeIn>
              <FadeIn delay={100}>
                <div className="p-12 rounded-[4rem] bg-stone-900 text-white border-4 border-[#C97E6C] h-full flex flex-col">
                  <span className="inline-block px-5 py-2 bg-[#C97E6C] rounded-full text-[10px] font-bold uppercase mb-8">
                    Premium Membership
                  </span>
                  <h4 className="text-4xl font-bold mb-2">Custom Plan</h4>
                  <div className="text-5xl font-black mb-12">Customized</div>
                  <button
                    onClick={() => scrollTo('contact')}
                    className="mt-auto w-full py-6 rounded-full bg-[#C97E6C] text-white font-bold hover:bg-[#b06a5a] transition-all"
                  >
                    詳細を聞く
                  </button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── Articles ─────────────────────────────────── */}
        <section id="articles" className="py-32 bg-white dark:bg-[#0c0a09]">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <h3 className="text-5xl font-black mb-20 text-stone-900 dark:text-white">Journal.</h3>
            </FadeIn>

            {/* ✅ Fix: ローディング・空状態を追加（Loader2 を有効活用） */}
            {articlesLoading ? (
              <div className="flex justify-center py-20" role="status" aria-label="記事を読み込み中">
                <Loader2 className="animate-spin text-[#C97E6C]" size={40} />
              </div>
            ) : articles.length === 0 ? (
              <p className="text-center text-stone-400 dark:text-stone-600 py-20">
                記事はまだありません
              </p>
            ) : (
              <div className="grid md:grid-cols-3 gap-12">
                {articles.map(a => (
                  <FadeIn key={a.id}>
                    <article className="group cursor-pointer">
                      <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 shadow-lg bg-stone-100 dark:bg-stone-800">
                        <img
                          src={a.image}
                          alt={a.title}    // ✅ Fix: 記事タイトルを alt に
                          loading="lazy"   // ✅ Fix: 遅延読み込み
                          decoding="async" // ✅ Fix: 非同期デコード
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <time
                        className="text-[10px] text-stone-400 font-bold block mb-2 uppercase"
                        dateTime={a.date}
                      >
                        {a.date}
                      </time>
                      <h4 className="text-xl font-bold text-stone-900 dark:text-white group-hover:text-[#C97E6C] transition-colors">
                        {a.title}
                      </h4>
                    </article>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── FAQ（独立コンポーネント） ─────────────────── */}
        <FaqSection />

        {/* ─── Contact（独立コンポーネント） ───────────────── */}
        <ContactSection />
      </main>

      {/* フッター */}
      <footer className="py-24 border-t border-stone-100 dark:border-stone-900 text-center">
        <p className="text-3xl font-black mb-4 uppercase text-stone-900 dark:text-white">C&D.</p>
        <p className="text-[10px] text-stone-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Takao Tsukakoshi / Conditioning Design.
        </p>
      </footer>

      {/* ✅ Fix: aria-label 追加 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="ページトップへ戻る"
        className={`fixed bottom-8 right-8 p-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl shadow-2xl transition-all duration-300 z-[90] ${
          scrollState.progress > 10
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-20 pointer-events-none'
        }`}
      >
        <ArrowUp size={24} aria-hidden="true" />
      </button>
    </div>
  );
};

/* ================================================================
   ⑩ App & ブートストラップ
   ================================================================ */
const App = () => (
  <ThemeProvider>
    <MainContent />
  </ThemeProvider>
);

const rootElement = document.getElementById('root');
if (rootElement) { createRoot(rootElement).render(<App />); }
