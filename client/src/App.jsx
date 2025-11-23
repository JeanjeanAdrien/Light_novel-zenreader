import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import Reader from './components/Reader';
import NavDock from './components/NavDock';
import Particles from './components/Particles';
import Home from './pages/Home';
import Library from './pages/Library';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useChapterStream } from './hooks/useChapterStream';

function ReaderPage() {
  // State
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlParam = searchParams.get('url');
  const [lastUrl, setLastUrl] = useLocalStorage('zen_last_url', 'https://novelbin.com/b/48-hours-a-day/chapter-170');

  // Use URL param if present, otherwise fallback to lastUrl
  const currentUrl = urlParam || lastUrl;

  const [lang, setLang] = useLocalStorage('zen_lang', 'original');
  const [theme, setTheme] = useLocalStorage('zen_theme', 'void');
  const [fontSize, setFontSize] = useLocalStorage('zen_font_size', 18);
  const [lineHeight, setLineHeight] = useLocalStorage('zen_line_height', 1.8);
  const [maxWidth, setMaxWidth] = useLocalStorage('zen_max_width', 672);
  const [contrast, setContrast] = useLocalStorage('zen_contrast', 100);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [warmth, setWarmth] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Hooks
  const { content, meta, isLoading, isStreaming, error, loadChapter, preloadChapter } = useChapterStream();

  // Update URL when navigating
  const handleNavigate = (newUrl) => {
    setLastUrl(newUrl);
    setSearchParams({ url: newUrl });
  };

  // Effects
  useEffect(() => {
    document.body.className = `font-crimson antialiased overflow-x-hidden transition-colors duration-500 theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    loadChapter(currentUrl, lang, aiEnabled);
  }, [currentUrl, lang, aiEnabled, loadChapter]);

  // Preload next chapter
  useEffect(() => {
    if (meta?.next && !isLoading && !isStreaming) {
      preloadChapter(meta.next, lang, aiEnabled);
    }
  }, [meta, lang, aiEnabled, isLoading, isStreaming, preloadChapter]);

  // Scroll saving
  useEffect(() => {
    const saveScroll = setInterval(() => {
      if (currentUrl && window.scrollY > 100) {
        localStorage.setItem(`zen_scroll_${btoa(currentUrl)}`, Math.floor(window.scrollY));
      }
    }, 1000);
    return () => clearInterval(saveScroll);
  }, [currentUrl]);

  // Restore scroll
  useEffect(() => {
    if (!isLoading && meta) {
      const savedScroll = localStorage.getItem(`zen_scroll_${btoa(currentUrl)}`);
      if (savedScroll) {
        setTimeout(() => window.scrollTo({ top: parseInt(savedScroll), behavior: 'smooth' }), 500);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentUrl, isLoading, meta]);

  return (
    <>
      <Particles theme={theme} />

      <div className="fixed top-0 left-0 w-full h-0.5 z-50 bg-white/5">
        <div className="h-full bg-[var(--accent-color)] w-0 transition-all duration-100 shadow-[0_0_10px_var(--accent-color)]" id="progress-bar"></div>
      </div>

      <Header
        aiEnabled={aiEnabled}
        setAiEnabled={setAiEnabled}
        lang={lang}
        setLang={setLang}
        toggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        status={isLoading ? 'loading' : isStreaming ? 'streaming' : 'idle'}
        currentUrl={currentUrl}
        onNavigate={handleNavigate}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        theme={theme}
        setTheme={setTheme}
        warmth={warmth}
        setWarmth={setWarmth}
        fontSize={fontSize}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        maxWidth={maxWidth}
        setMaxWidth={setMaxWidth}
        contrast={contrast}
        setContrast={setContrast}
      />

      <Reader
        content={content}
        meta={meta}
        isLoading={isLoading}
        isStreaming={isStreaming}
        error={error}
        fontSize={fontSize}
        lineHeight={lineHeight}
        maxWidth={maxWidth}
        contrast={contrast}
        warmth={warmth}
      />

      <NavDock
        prevUrl={meta?.prev}
        nextUrl={meta?.next}
        onNavigate={handleNavigate}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/read" element={<ReaderPage />} />
      </Routes>
    </BrowserRouter>
  );
}
