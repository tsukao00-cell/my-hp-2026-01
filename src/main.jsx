// ============================================================
// OSHIFIT Portfolio Site — 完全版（全修正・全機能込み）
// ============================================================

import {
  Component,        // ErrorBoundary 用クラスベース
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useTransition,
  memo,
} from 'react';
import { createRoot } from 'react-dom/client';
import {
  Sun, Moon, Menu, X,
  ChevronDown, ChevronUp,
  ArrowUp, ExternalLink,
  Mail, Instagram, Twitter,
} from 'lucide-react';

/* ================================================================
   ① getSafeStorage — コンポーネント外（再生成コストゼロ）
   ================================================================ */
const getSafeStorage = () => {
  try {
    const s = window.localStorage;
    s.setItem('__test__', '1');
    s.removeItem('__test__');
    return s;
  } catch {
    return null; // プライベートモード等でブロックされた場合
  }
};

/* ================================================================
   ② 静的データ — モジュールスコープ（レンダーごとの再生成なし）
   ================================================================ */
const NAV_ITEMS = [
  { label: 'メソッド',       id: 'methods'  },
  { label: 'プロフィール',   id: 'profile'  },
  { label: '料金',           id: 'pricing'  },
  { label: '記事',           id: 'articles' },
  { label: 'FAQ',            id: 'faq'      },
  { label: 'お問い合わせ',   id: 'contact'  },
];

const STATS_DATA = [
  { label: '指導実績',       value: '500+', unit: '名' },
  { label: '継続率',         value: '94',   unit: '%'  },
  { label: 'SNSフォロワー',  value: '10万', unit: '+'  },
];

const METHODS_DATA = [
  {
    icon: '💪',
    title: 'パーソナルトレーニング',
    description: '一人ひとりの目標・体力・生活スタイルに合わせたオーダーメイドのトレーニングプログラム。',
  },
  {
    icon: '🥗',
    title: '食事サポート',
    description: '無理なく続けられる食事管理。好きな食べ物を我慢しない賢い栄養コントロールを指導。',
  },
  {
    icon: '📱',
    title: 'オンラインコーチング',
    description: '全国どこからでも受けられるオンライン指導。LINEで毎日フォローアップ。',
  },
  {
    icon: '🧠',
    title: 'マインドセット',
    description: '挫折しないための心理的アプローチ。習慣化の科学に基づいたメンタルサポート。',
  },
];

const PRICING_DATA = [
  {
    name: 'ライトプラン',
    price: '¥29,800', period: '/月',
    features: ['週2回トレーニング', '食事アドバイス（週1回）', 'LINEサポート（平日）'],
    accent: false,
  },
  {
    name: 'スタンダードプラン',
    price: '¥49,800', period: '/月',
    features: ['週3回トレーニング', '食事管理（毎日）', 'LINEサポート（毎日）', '体組成測定'],
    accent: true,
  },
  {
    name: 'プレミアムプラン',
    price: '¥79,800', period: '/月',
    features: ['週5回トレーニング', '完全食事管理', '24時間サポート', '体組成測定', 'オンライン相談'],
    accent: false,
  },
];

const FAQS_DATA = [
  {
    question: '運動が全くの初心者でも大丈夫ですか？',
    answer: 'はい、むしろ初心者の方を多く指導しています。体力レベルや運動経験に関わらず、あなたのペースに合わせてスタートします。',
  },
  {
    question: '食事制限は厳しいですか？',
    answer: '極端な食事制限は行いません。好きな食べ物を楽しみながら、バランスよく食べる方法をお伝えします。',
  },
  {
    question: 'どのくらいで効果が出ますか？',
    answer: '多くの方が1ヶ月で体の変化を実感されています。ただし個人差があり、目標や生活スタイルによって異なります。',
  },
  {
    question: 'オンラインコーチングはどのように行いますか？',
    answer: 'ZoomまたはLINEビデオ通話でセッションを行います。トレーニング動画のフォームチェック、食事記録の確認など、対面と変わらないサポートを提供します。',
  },
  {
    question: 'キャンセルポリシーはありますか？',
    answer: '前日までのキャンセルは無料です。当日キャンセルは1セッション分の料金が発生します。やむを得ない事情の場合はご相談ください。',
  },
];

// ✅ Fix: 記事ごとに異なるプレースホルダー（全記事同一画像を廃止）
const ARTICLE_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop',
];

// フォームの初期値（ContactSection 外に定義しリセットで再利用）
const FORM_INIT = { name: '', email: '', message: '', botField: '' };

/* ================================================================
   ③ スクロール状態を useReducer で一元管理
   ================================================================ */
const SCROLL_INIT = { progress: 0, isScrolled: false, showBackToTop: false };

const scrollReducer = (state, { type, payload }) => {
  if (type !== 'UPDATE') return state;
  const { scrollY } = payload;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  return {
    progress:      docH > 0 ? Math.min((scrollY / docH) * 100, 100) : 0,
    isScrolled:    scrollY > 50,
    showBackToTop: scrollY > 600,
  };
};

/* ================================================================
   ④ ThemeContext / ThemeProvider
   ================================================================ */
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // ✅ Fix: getSafeStorage() 経由で安全にアクセス
    const saved = getSafeStorage()?.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    getSafeStorage()?.setItem('theme', theme);
  }, [theme]);

  // ✅ Fix: useCallback で安定した参照
  const toggleTheme = useCallback(
    () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark')),
    []
  );

  // ✅ Fix: useMemo でコンテキスト値を安定化
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/* ================================================================
   ⑤ SEO コンポーネント — memo + 空の依存配列
   ================================================================ */
const SEO = memo(({ title, description, ogImage, ogUrl }) => {
  useEffect(() => {
    document.documentElement.lang = 'ja';
    document.title = title;

    const setMeta = (nameOrProp, content, isProp = false) => {
      const attr = isProp ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, nameOrProp);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title',       title,       true);
    setMeta('og:description', description, true);
    setMeta('og:type',        'website',   true);
    setMeta('og:url',         ogUrl,       true);
    if (ogImage) setMeta('og:image', ogImage, true);
  // ✅ Fix: props が定数のため [] でOK（stale meta 問題なし）
  }, [title, description, ogImage, ogUrl]);

  return null;
});
SEO.displayName = 'SEO';

/* ================================================================
   ⑥ ErrorBoundary — 非同期・LazySection のクラッシュを局所化
   ================================================================ */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-600 text-sm">
          ⚠️ このセクションの読み込みに失敗しました。
        </div>
      );
    }
    return this.props.children;
  }
}

/* ================================================================
   ⑦ FadeIn — IntersectionObserver で入場アニメーション
   ================================================================ */
const FadeIn = memo(({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current; // ✅ Fix: ローカル変数キャプチャ（cleanup 時に null 安全）
    if (!el) return;

    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
        observer.unobserve(el);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.unobserve(el); // ✅ Fix: ローカル変数を使用
  }, [delay]);

  return <div ref={ref} className={className}>{children}</div>;
});
FadeIn.displayName = 'FadeIn';

/* ================================================================
   ⑧ LazySection — ビューポート外セクションを遅延マウント
   ================================================================ */
const LazySection = memo(({ children, className = '' }) => {
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMounted(true);
        observer.unobserve(el);
      },
      // ✅ Fix: 200px 手前から事前マウント → コンテンツが一瞬空白になる問題を解消
      { rootMargin: '200px 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return (
    <div ref={ref} className={className}>
      {mounted ? children : <div className="min-h-[200px]" aria-hidden="true" />}
    </div>
  );
});
LazySection.displayName = 'LazySection';

/* ================================================================
   ⑨ Header
   ================================================================ */
const Header = memo(({ scrollState, scrollTo, toggleTheme, theme, isMenuOpen, setIsMenuOpen }) => (
  <header
    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrollState.isScrolled
        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md'
        : 'bg-transparent'
    }`}
  >
    {/* スクロールプログレスバー */}
    <div
      className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-150"
      style={{ width: `${scrollState.progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(scrollState.progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="ページスクロール進捗"
    />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* ロゴ */}
        <button
          onClick={() => scrollTo('hero')}
          aria-label="トップへ戻る"
          className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent"
        >
          OSHIFIT
        </button>

        {/* デスクトップナビ */}
        <nav className="hidden md:flex items-center gap-6" aria-label="メインナビゲーション">
          {NAV_ITEMS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* テーマ切替 */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark'
              ? <Sun  className="w-5 h-5 text-yellow-400" />
              : <Moon className="w-5 h-5 text-gray-600"   />}
          </button>

          {/* ハンバーガー */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            // ✅ Fix: functional updater
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  </header>
));
Header.displayName = 'Header';

/* ================================================================
   ⑩ MobileMenu — ✅ テーマ切替ボタン追加
   ================================================================ */
const MobileMenu = memo(({ isMenuOpen, scrollTo, toggleTheme, theme }) => {
  if (!isMenuOpen) return null;
  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-label="モバイルメニュー"
      className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-800 md:hidden"
    >
      <nav className="flex flex-col p-4 gap-1" aria-label="モバイルナビゲーション">
        {NAV_ITEMS.map(({ label, id }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="text-left py-3 px-4 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {label}
          </button>
        ))}
        {/* ✅ Fix: モバイルにもテーマ切替 */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          className="flex items-center gap-2 py-3 px-4 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-lg transition-colors mt-1 border-t border-gray-100 dark:border-gray-700 pt-4"
        >
          {theme === 'dark'
            ? <><Sun  className="w-4 h-4 text-yellow-400" /><span>ライトモード</span></>
            : <><Moon className="w-4 h-4" /><span>ダークモード</span></>}
        </button>
      </nav>
    </div>
  );
});
MobileMenu.displayName = 'MobileMenu';

/* ================================================================
   ⑪ HeroSection — ✅ pt-20 で固定ヘッダー下に隠れない
   ================================================================ */
const HeroSection = memo(({ scrollTo }) => (
  <section
    id="hero"
    className="min-h-screen flex items-center justify-center pt-20 pb-16 px-4
               bg-gradient-to-br from-pink-50 via-white to-purple-50
               dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <div className="max-w-4xl mx-auto text-center">
      <FadeIn>
        <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-medium">
          🏋️ パーソナルフィットネスコーチ
        </span>
      </FadeIn>

      <FadeIn delay={100}>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          あなたの理想の体を、<br />
          <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            一緒に作ろう
          </span>
        </h1>
      </FadeIn>

      <FadeIn delay={200}>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          科学的なアプローチと継続できる食事管理で、
          無理なく・楽しく・確実にボディメイクを実現します。
        </p>
      </FadeIn>

      <FadeIn delay={300}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => scrollTo('contact')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            無料相談を申し込む
          </button>
          <button
            onClick={() => scrollTo('methods')}
            className="px-8 py-4 rounded-full border-2 border-pink-400 text-pink-500 dark:text-pink-400 font-semibold text-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200"
          >
            サービスを見る
          </button>
        </div>
      </FadeIn>

      <FadeIn delay={400}>
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-md mx-auto">
          {STATS_DATA.map(({ label, value, unit }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}<span className="text-pink-400">{unit}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  </section>
));
HeroSection.displayName = 'HeroSection';

/* ================================================================
   ⑫ MethodsSection
   ================================================================ */
const MethodsSection = memo(() => (
  <section id="methods" className="py-20 px-4 bg-white dark:bg-gray-900">
    <div className="max-w-6xl mx-auto">
      <FadeIn>
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">サービス内容</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            あなたのライフスタイルに合わせた4つのアプローチで目標達成をサポート
          </p>
        </div>
      </FadeIn>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {METHODS_DATA.map((method, i) => (
          <FadeIn key={method.title} delay={i * 100}>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300 h-full">
              <div className="text-4xl mb-4">{method.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{method.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{method.description}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
));
MethodsSection.displayName = 'MethodsSection';

/* ================================================================
   ⑬ ProfileSection
   ================================================================ */
const ProfileSection = memo(() => (
  <section
    id="profile"
    className="py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
  >
    <div className="max-w-4xl mx-auto">
      <FadeIn>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-14 text-center">
          プロフィール
        </h2>
      </FadeIn>
      <div className="flex flex-col md:flex-row items-center gap-10">
        <FadeIn className="flex-shrink-0">
          <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center shadow-xl">
            <span className="text-7xl" role="img" aria-label="トレーナーアイコン">👩‍💪</span>
          </div>
        </FadeIn>
        <FadeIn delay={150} className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Yuki Tanaka</h3>
          <p className="text-pink-500 font-medium mb-4">パーソナルトレーナー / フィットネスコーチ</p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            元競技ダンサーとして培った体作りの知識を活かし、10年以上のパーソナルトレーニング経験。
            特に女性の体型改善・姿勢矯正を得意とし、延べ500名以上の変身をサポート。
          </p>
          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank" rel="noopener noreferrer"
              aria-label="Instagram を開く"
              className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-500 hover:bg-pink-200 dark:hover:bg-pink-900/60 transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank" rel="noopener noreferrer"
              aria-label="Twitter/X を開く"
              className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-500 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="mailto:contact@oshifit.jp"
              aria-label="メールを送る"
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  </section>
));
ProfileSection.displayName = 'ProfileSection';

/* ================================================================
   ⑭ PricingSection
   ================================================================ */
const PricingSection = memo(({ scrollTo }) => (
  <section id="pricing" className="py-20 px-4 bg-white dark:bg-gray-900">
    <div className="max-w-5xl mx-auto">
      <FadeIn>
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">料金プラン</h2>
          <p className="text-gray-500 dark:text-gray-400">あなたの目標とライフスタイルに合ったプランをお選びください</p>
        </div>
      </FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PRICING_DATA.map((plan, i) => (
          <FadeIn key={plan.name} delay={i * 100} className="flex">
            <div
              className={`relative p-8 rounded-2xl flex flex-col w-full transition-all duration-300 hover:scale-[1.02] ${
                plan.accent
                  ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-2xl shadow-pink-200 dark:shadow-pink-900/40 ring-2 ring-pink-400'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
              }`}
            >
              {plan.accent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow">
                  🌟 人気 No.1
                </div>
              )}
              <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className={`text-sm ml-1 ${plan.accent ? 'text-pink-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="flex-1 space-y-2 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 ${plan.accent ? 'text-pink-200' : 'text-pink-400'}`}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => scrollTo('contact')}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                  plan.accent
                    ? 'bg-white text-pink-600 hover:bg-pink-50 hover:shadow-lg'
                    : 'bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                申し込む
              </button>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
));
PricingSection.displayName = 'PricingSection';

/* ================================================================
   ⑮ ArticleCard — memo で個別最適化
   ================================================================ */
const ArticleCard = memo(({ article }) => (
  <div className="group rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
    <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
      <img
        src={article.image}
        alt={article.title}      // ✅ Fix: 記事タイトルを alt に設定
        loading="lazy"           // ✅ Fix: 遅延読み込み
        decoding="async"         // ✅ Fix: 非同期デコード
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={e => { e.currentTarget.src = ARTICLE_PLACEHOLDERS[0]; }}
      />
    </div>
    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
          {article.platform}
        </span>
        <time className="text-xs text-gray-400" dateTime={article.dateISO}>{article.date}</time>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-pink-500 transition-colors flex-1">
        {article.title}
      </h3>
      {article.url && (
        <a
          href={article.url}
          target="_blank" rel="noopener noreferrer"
          aria-label={`${article.title} の記事を読む`}
          className="inline-flex items-center gap-1 text-sm text-pink-500 hover:text-pink-600 font-medium"
        >
          続きを読む <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  </div>
));
ArticleCard.displayName = 'ArticleCard';

/* ================================================================
   ⑯ ArticlesSection — ✅ isLoading で isPending を活用
   ================================================================ */
const ArticlesSection = memo(({ articles, isLoading }) => (
  <section
    id="articles"
    className="py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
  >
    <div className="max-w-6xl mx-auto">
      <FadeIn>
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            メディア掲載・記事
          </h2>
          <p className="text-gray-500 dark:text-gray-400">フィットネスや健康に関する情報を発信しています</p>
        </div>
      </FadeIn>

      {isLoading ? (
        // ✅ Fix: isPending をローディングスピナーに反映
        <div className="flex justify-center py-12" role="status" aria-label="記事を読み込み中">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-400" />
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <FadeIn key={article.id}>
              <ArticleCard article={article} />
            </FadeIn>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 dark:text-gray-600 py-12">
          記事はまだありません
        </p>
      )}
    </div>
  </section>
));
ArticlesSection.displayName = 'ArticlesSection';

/* ================================================================
   ⑰ FaqSection — 独立 state（親の再レンダーに影響しない）
   ================================================================ */
const FaqSection = memo(() => {
  const [openFaq, setOpenFaq] = useState(null);

  // ✅ Fix: functional updater でトグル
  const toggleFaq = useCallback(idx => {
    setOpenFaq(prev => (prev === idx ? null : idx));
  }, []);

  return (
    <section id="faq" className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-14 text-center">
            よくある質問
          </h2>
        </FadeIn>
        <div className="space-y-3">
          {FAQS_DATA.map((faq, idx) => (
            <FadeIn key={faq.question} delay={idx * 60}>
              <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={openFaq === idx}  // ✅ Fix: アクセシビリティ
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full flex items-center justify-between p-5 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  {openFaq === idx
                    ? <ChevronUp   className="w-5 h-5 text-pink-400 flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-gray-400  flex-shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    className="p-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-900"
                  >
                    {faq.answer}
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
   ⑱ ContactSection — 独立 state＋全フォーム修正
   ================================================================ */
const ContactSection = memo(() => {
  const [formState,   setFormState]   = useState(FORM_INIT);
  const [errors,      setErrors]      = useState({});
  // ✅ submitStatus: null | 'success' | 'error' | 'ratelimit'
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef(0);

  // ✅ Fix: functional updater + 入力時にステータスリセット
  const handleFieldChange = useCallback(field => e => {
    const { value } = e.target;
    setFormState(prev => ({ ...prev, [field]: value }));
    setSubmitStatus(null);
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!formState.name.trim())
      errs.name = 'お名前を入力してください';
    if (!formState.email.trim())
      errs.email = 'メールアドレスを入力してください';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email))
      errs.email = '正しいメールアドレスを入力してください';
    if (!formState.message.trim())
      errs.message = 'メッセージを入力してください';
    else if (formState.message.trim().length < 10)
      errs.message = '10文字以上入力してください';
    return errs;
  }, [formState]);

  // ✅ Fix: useCallback + !response.ok 捕捉 + rate-limit
  const handleFormSubmit = useCallback(async e => {
    e.preventDefault();
    if (formState.botField) return; // ハニーポット

    const now = Date.now();
    if (now - lastSubmitTime.current < 10_000) {
      setSubmitStatus('ratelimit');
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch('https://formspree.io/f/mpqdveaw', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name:    formState.name,
          email:   formState.email,
          message: formState.message,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`); // ✅ 4xx/5xx を捕捉

      lastSubmitTime.current = now; // ✅ Fix: 成功時のみ更新（now を再利用）
      setSubmitStatus('success');
      setFormState(FORM_INIT);
      setErrors({});
    } catch (err) {
      console.error('[Contact] 送信エラー:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, validate]);

  return (
    <section
      id="contact"
      className="py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
    >
      <div className="max-w-2xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">お問い合わせ</h2>
            <p className="text-gray-500 dark:text-gray-400">無料相談・お見積もりはこちらからどうぞ</p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <form
            onSubmit={handleFormSubmit}
            noValidate
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 relative"
          >
            {/* ✅ Fix: ハニーポット — 画面外に隠す + aria-hidden + name + autoComplete */}
            <div
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
              aria-hidden="true"
            >
              <label htmlFor="bot-field">このフィールドは空のままにしてください</label>
              <input
                id="bot-field"
                name="bot-field"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formState.botField}
                onChange={handleFieldChange('botField')}
              />
            </div>

            {/* お名前 */}
            <div>
              {/* ✅ Fix: htmlFor でラベルとフィールドを紐づけ */}
              <label
                htmlFor="contact-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                お名前 <span className="text-pink-500" aria-hidden="true">*</span>
                <span className="sr-only">（必須）</span>
              </label>
              <input
                id="contact-name"
                type="text"
                value={formState.name}
                onChange={handleFieldChange('name')}
                autoComplete="name"
                placeholder="山田 太郎"
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'error-name' : undefined}
                className={`w-full px-4 py-3 rounded-xl border transition-colors
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
              />
              {errors.name && (
                <p id="error-name" role="alert" className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* メールアドレス */}
            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                メールアドレス <span className="text-pink-500" aria-hidden="true">*</span>
                <span className="sr-only">（必須）</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={formState.email}
                onChange={handleFieldChange('email')}
                autoComplete="email"
                placeholder="example@email.com"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'error-email' : undefined}
                className={`w-full px-4 py-3 rounded-xl border transition-colors
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
              />
              {errors.email && (
                <p id="error-email" role="alert" className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* メッセージ */}
            <div>
              <label
                htmlFor="contact-message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                メッセージ <span className="text-pink-500" aria-hidden="true">*</span>
                <span className="sr-only">（必須・10文字以上）</span>
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={formState.message}
                onChange={handleFieldChange('message')}
                autoComplete="off"
                placeholder="お問い合わせ内容をご記入ください（10文字以上）"
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'error-message' : undefined}
                className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  ${errors.message ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
              />
              {errors.message && (
                <p id="error-message" role="alert" className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            {/* ✅ 送信ステータス — alert でなく JSX で表示 */}
            {submitStatus === 'success' && (
              <div role="alert" className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm flex items-start gap-2">
                <span>✅</span>
                <span>送信が完了しました！2〜3営業日以内にご連絡いたします。</span>
              </div>
            )}
            {submitStatus === 'error' && (
              <div role="alert" className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
                <span>❌</span>
                <span>送信に失敗しました。時間をおいて再度お試しください。</span>
              </div>
            )}
            {submitStatus === 'ratelimit' && (
              <div role="alert" className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm flex items-start gap-2">
                <span>⏳</span>
                <span>送信間隔が短すぎます。10秒後に再度お試しください。</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold text-lg
                         hover:shadow-lg hover:scale-[1.02] transition-all duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  送信中...
                </span>
              ) : '送信する'}
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
});
ContactSection.displayName = 'ContactSection';

/* ================================================================
   ⑲ Footer
   ================================================================ */
const Footer = memo(() => (
  <footer className="py-10 px-4 bg-gray-900 text-gray-400">
    <div className="max-w-6xl mx-auto text-center">
      <p className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-2">
        OSHIFIT
      </p>
      <p className="text-sm mb-6">科学的アプローチで理想の体へ</p>
      <nav className="flex justify-center gap-6 text-xs mb-6" aria-label="フッターナビゲーション">
        <a href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</a>
        <a href="/terms"   className="hover:text-white transition-colors">利用規約</a>
        <a href="#contact" className="hover:text-white transition-colors">お問い合わせ</a>
      </nav>
      <p className="text-xs">© {new Date().getFullYear()} OSHIFIT. All rights reserved.</p>
    </div>
  </footer>
));
Footer.displayName = 'Footer';

/* ================================================================
   ⑳ BackToTopButton — ✅ aria-label 追加
   ================================================================ */
const BackToTopButton = memo(({ show, scrollTo }) => {
  if (!show) return null;
  return (
    <button
      onClick={() => scrollTo('hero')}
      aria-label="ページトップへ戻る"  // ✅ Fix
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full
                 bg-gradient-to-r from-pink-400 to-purple-500 text-white
                 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
});
BackToTopButton.displayName = 'BackToTopButton';

/* ================================================================
   ㉑ MainContent — スクロール / 記事フェッチ / ルーティング
   ================================================================ */
const MainContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [articles, setArticles]     = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  // ✅ Fix: isPending を ArticlesSection に渡してローディング表示
  const [isPending, startTransition] = useTransition();

  const [scrollState, dispatch] = useReducer(scrollReducer, SCROLL_INIT);
  const rafRef = useRef(null);

  /* ── スクロール検出（RAF スロットリング + ✅ cancelAnimationFrame） ── */
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        dispatch({ type: 'UPDATE', payload: { scrollY: window.scrollY } });
        rafRef.current = null;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // ✅ Fix: アンマウント時に RAF をキャンセルしてメモリリークを防止
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── スクロール移動（✅ 動的にヘッダー高さを取得） ── */
  const scrollTo = useCallback(id => {
    const el     = document.getElementById(id);
    if (!el) return;
    const header       = document.querySelector('header');
    // ✅ Fix: getBoundingClientRect() でリサイズ後も正確な高さを取得
    const headerHeight = header?.getBoundingClientRect().height ?? 70;
    const top          = el.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    setIsMenuOpen(false);
  }, []); // 実行時に DOM から高さを取得するため依存なし

  /* ── microCMS 記事フェッチ ── */
  useEffect(() => {
    const domain = import.meta.env?.VITE_MICROCMS_SERVICE_DOMAIN;
    const key    = import.meta.env?.VITE_MICROCMS_API_KEY;

    if (!domain || !key) {
      console.warn('[OSHIFIT] VITE_MICROCMS_SERVICE_DOMAIN または VITE_MICROCMS_API_KEY が未設定です');
      setArticlesLoading(false);
      return;
    }

    fetch(`https://${domain}.microcms.io/api/v1/news`, {
      headers: { 'X-MICROCMS-API-KEY': key },
    })
      .then(res => {
        if (!res.ok) throw new Error(`microCMS API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // ✅ Fix: startTransition で低優先度更新
        startTransition(() => {
          setArticles(
            (data.contents ?? []).map((item, idx) => ({
              id:       item.id,
              title:    item.title,
              platform: item.platform ?? 'Note',
              date:     item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString('ja-JP')
                : '',
              dateISO: item.publishedAt ?? '',
              // ✅ Fix: 記事ごとに異なるプレースホルダー
              image:   item.eyecatch?.url ?? ARTICLE_PLACEHOLDERS[idx % ARTICLE_PLACEHOLDERS.length],
              url:     item.url ?? null,
            }))
          );
          setArticlesLoading(false);
        });
      })
      .catch(err => {
        console.error('[OSHIFIT] 記事取得エラー:', err);
        setArticlesLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // マウント時1回のみ

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header
        scrollState={scrollState}
        scrollTo={scrollTo}
        toggleTheme={toggleTheme}
        theme={theme}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      <MobileMenu
        isMenuOpen={isMenuOpen}
        scrollTo={scrollTo}
        toggleTheme={toggleTheme}
        theme={theme}
      />

      <main>
        {/* Hero はファーストビューなので LazySection 不要 */}
        <HeroSection scrollTo={scrollTo} />

        {/* 以降のセクションは LazySection + ErrorBoundary でラップ */}
        <ErrorBoundary>
          <LazySection>
            <MethodsSection />
          </LazySection>
        </ErrorBoundary>

        <ErrorBoundary>
          <LazySection>
            <ProfileSection />
          </LazySection>
        </ErrorBoundary>

        <ErrorBoundary>
          <LazySection>
            <PricingSection scrollTo={scrollTo} />
          </LazySection>
        </ErrorBoundary>

        <ErrorBoundary>
          <LazySection>
            {/* ✅ Fix: isPending || articlesLoading でローディング表示 */}
            <ArticlesSection articles={articles} isLoading={isPending || articlesLoading} />
          </LazySection>
        </ErrorBoundary>

        <ErrorBoundary>
          <LazySection>
            <FaqSection />
          </LazySection>
        </ErrorBoundary>

        <ErrorBoundary>
          <LazySection>
            <ContactSection />
          </LazySection>
        </ErrorBoundary>
      </main>

      <Footer />

      <BackToTopButton show={scrollState.showBackToTop} scrollTo={scrollTo} />
    </div>
  );
};

/* ================================================================
   ㉒ App & ブートストラップ
   ================================================================ */
const App = () => (
  <ThemeProvider>
    <SEO
      title="OSHIFIT | パーソナルフィットネスコーチ"
      description="科学的なアプローチで理想の体を実現。パーソナルトレーニング・食事サポート・オンラインコーチングでダイエット・ボディメイクを完全サポート。"
      ogUrl="https://oshifit.jp"
    />
    <MainContent />
  </ThemeProvider>
);

createRoot(document.getElementById('root')).render(<App />);
