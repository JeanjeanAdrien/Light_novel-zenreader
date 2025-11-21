import { useState, useEffect } from 'react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import Reader from './components/Reader';
import NavDock from './components/NavDock';
import Particles from './components/Particles';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useChapterStream } from './hooks/useChapterStream';

export default function App() {
  // State
  const [currentUrl, setCurrentUrl] = useLocalStorage('zen_last_url', 'https://novelbin.com/b/48-hours-a-day/chapter-170');
  const [lang, setLang] = useLocalStorage('zen_lang', 'original');
  const [theme, setTheme] = useLocalStorage('zen_theme', 'void');
  const [fontSize, setFontSize] = useLocalStorage('zen_font_size', 18);
  const [aiEnabled, setAiEnabled] = useState(false); // Default off, no persistence
  const [warmth, setWarmth] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Hooks
  const { content, meta, isLoading, isStreaming, error, loadChapter } = useChapterStream();

  // Effects
  useEffect(() => {
    document.body.className = `font-crimson antialiased overflow-x-hidden transition-colors duration-500 theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    loadChapter(currentUrl, lang, aiEnabled);
  }, [currentUrl, lang, aiEnabled, loadChapter]);

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
      <div
        id="night-shift-overlay"
        className="fixed inset-0 bg-[#ff9d00] mix-blend-multiply pointer-events-none z-[9999] transition-opacity duration-300"
        style={{ opacity: warmth / 100 }}
      ></div>

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
        onNavigate={setCurrentUrl}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        theme={theme}
        setTheme={setTheme}
        warmth={warmth}
        setWarmth={setWarmth}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />

      <Reader
        content={content}
        meta={meta}
        isLoading={isLoading}
        isStreaming={isStreaming}
        error={error}
        fontSize={fontSize}
      />

      <NavDock
        prevUrl={meta?.prev}
        nextUrl={meta?.next}
        onNavigate={setCurrentUrl}
      />
    </>
  );
}
