'use client';

import { useState, useEffect } from 'react';
import type { Article, Folder, OuchieImage } from '@/lib/respengr-data';
import BlogOSTaskbar from './components/BlogOSTaskbar';
import DraggableArticleModal from './components/DraggableArticleModal';
import DraggableFolderWindow from './components/DraggableFolderWindow';

const PORTAL_COLOR = '#FF00FF';

export default function RespEngrPage() {
  // Data state
  const [ouchieImages, setOuchieImages] = useState<OuchieImage[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Randomizer state
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageHistory, setImageHistory] = useState<number[]>([0]);
  const [historyPointer, setHistoryPointer] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  // View state
  const [viewMode, setViewMode] = useState<'desktop' | 'filetree'>('desktop');

  // Modal state
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [openFolder, setOpenFolder] = useState<Folder | null>(null);
  const [topZIndex, setTopZIndex] = useState(100);

  // Time state (for top bar)
  const [currentTime, setCurrentTime] = useState('--:--:--');

  // Fetch data on mount
  useEffect(() => {
    fetch('/data/respengr.json')
      .then(res => res.json())
      .then(data => {
        setOuchieImages(data.ouchieImages || []);
        setArticles(data.articles || []);
        setFolders(data.folders || []);
        setIsLoading(false);
        console.log('📊 RespEngr data loaded:', data.meta);
        
        // Initialize with first image
        if (data.ouchieImages && data.ouchieImages.length > 0) {
          setCurrentImageIndex(0);
          setImageHistory([0]);
        }
      })
      .catch(err => {
        console.error('Failed to load RespEngr data:', err);
        setIsLoading(false);
      });
  }, []);

  // Update time display
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Randomizer logic - FIXED
  useEffect(() => {
    if (!isRandomizing || ouchieImages.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = Math.floor(Math.random() * ouchieImages.length);
      setCurrentImageIndex(nextIndex);
      
      // Update history
      setImageHistory(prev => {
        const newHistory = [...prev.slice(0, historyPointer + 1), nextIndex];
        return newHistory;
      });
      setHistoryPointer(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isRandomizing, ouchieImages.length, historyPointer]);

  // Ouchie Eye click handler
  const handleOuchieClick = () => {
    setClickCount(prev => prev + 1);
    setIsRandomizing(prev => !prev);
  };

  const handleNavigateBack = () => {
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      setHistoryPointer(newPointer);
      setCurrentImageIndex(imageHistory[newPointer]);
    }
  };

  const handleNavigateForward = () => {
    if (historyPointer < imageHistory.length - 1) {
      const newPointer = historyPointer + 1;
      setHistoryPointer(newPointer);
      setCurrentImageIndex(imageHistory[newPointer]);
    }
  };

  const handleArticleClick = (article: Article) => {
    setOpenArticle(article);
    setOpenFolder(null);
    setTopZIndex(prev => prev + 1);
  };

  const handleFolderClick = (folder: Folder) => {
    setOpenFolder(folder);
    setOpenArticle(null);
    setTopZIndex(prev => prev + 1);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpenArticle(null);
      setOpenFolder(null);
    }
  };

  // Get current background image
  const currentBackground = ouchieImages[currentImageIndex]?.path || '';

  // Standalone files
  const standaloneArticles = articles.filter(
    article => !folders.some(folder => folder.children.includes(article.id))
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">👁️</div>
          <div className="text-xl font-mono" style={{ color: PORTAL_COLOR }}>
            Loading RespEngr workspace...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-neutral-950 text-white relative overflow-hidden pb-16"
      onClick={handleBackgroundClick}
    >
      {/* Animated Background - FIXED */}
      <div
        className="fixed inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          opacity: 0.08,
          filter: 'blur(20px)',
          transform: 'scale(1.1)',
          pointerEvents: 'none'
        }}
        key={currentImageIndex} // Force re-render on image change
      />

      {/* Top Bar */}
      <div 
        className="relative z-20 px-4 py-2 flex items-center justify-between font-mono text-sm"
        style={{ backgroundColor: '#1a1a1a', borderBottom: `1px solid ${PORTAL_COLOR}` }}
      >
        <div className="flex items-center gap-4">
          <span style={{ color: PORTAL_COLOR }} className="font-bold">KYOUDAI.dev</span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-400">RespEngr v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-4xl">👁️</span>
          <span className="text-neutral-500" suppressHydrationWarning>
            {currentTime}
          </span>
        </div>
      </div>

      {/* Desktop View */}
      {viewMode === 'desktop' && (
        <main className="relative z-10 p-8">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {/* Folder Icons */}
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => handleFolderClick(folder)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="text-6xl group-hover:scale-110 transition-transform">
                  📁
                </div>
                <span 
                  className="text-xs font-mono text-center group-hover:underline"
                  style={{ color: PORTAL_COLOR }}
                >
                  {folder.name}
                </span>
              </button>
            ))}

            {/* Standalone File Icons */}
            {standaloneArticles.map(article => (
              <button
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="text-6xl group-hover:scale-110 transition-transform">
                  📄
                </div>
                <span className="text-xs font-mono text-neutral-400 text-center group-hover:text-white line-clamp-2">
                  {article.filename}
                </span>
              </button>
            ))}
          </div>
        </main>
      )}

      {/* File Tree View */}
      {viewMode === 'filetree' && (
        <main className="relative z-10 p-8">
          <div 
            className="max-w-4xl mx-auto rounded border p-6"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: PORTAL_COLOR
            }}
          >
            <h2 
              className="text-sm font-mono uppercase mb-4"
              style={{ color: PORTAL_COLOR }}
            >
              Archive Structure
            </h2>
            <nav className="space-y-3">
              {folders.map(folder => {
                const folderArticles = articles.filter(a => folder.children.includes(a.id));
                
                return (
                  <div key={folder.id}>
                    <button
                      onClick={() => handleFolderClick(folder)}
                      className="flex items-center gap-2 hover:text-white transition-colors font-mono text-sm w-full text-left"
                      style={{ color: PORTAL_COLOR }}
                    >
                      <span>📁</span>
                      <span>{folder.name}</span>
                      <span className="text-neutral-600 text-xs">({folderArticles.length})</span>
                    </button>
                  </div>
                );
              })}

              {standaloneArticles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <div className="text-xs font-mono text-neutral-600 mb-2">Root Files</div>
                  {standaloneArticles.map(article => (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="block text-sm font-mono text-neutral-400 hover:text-white transition-colors text-left w-full mb-2"
                    >
                      <span className="mr-2">📄</span>
                      {article.filename}
                    </button>
                  ))}
                </div>
              )}
            </nav>
          </div>
        </main>
      )}

      {/* Draggable Folder Window */}
      {openFolder && (
        <DraggableFolderWindow
          folder={openFolder}
          articles={articles.filter(a => openFolder.children.includes(a.id))}
          onClose={() => setOpenFolder(null)}
          onArticleClick={handleArticleClick}
          zIndex={topZIndex}
          onBringToFront={() => setTopZIndex(prev => prev + 1)}
          accentColor={PORTAL_COLOR}
        />
      )}

      {/* Draggable Article Modal */}
      {openArticle && (
        <DraggableArticleModal
          article={openArticle}
          onClose={() => setOpenArticle(null)}
          zIndex={topZIndex}
          onBringToFront={() => setTopZIndex(prev => prev + 1)}
          accentColor={PORTAL_COLOR}
        />
      )}

      {/* Taskbar */}
      <BlogOSTaskbar
        isRandomizing={isRandomizing}
        onToggleRandomize={handleOuchieClick}
        onNavigateBack={handleNavigateBack}
        onNavigateForward={handleNavigateForward}
        canGoBack={historyPointer > 0}
        canGoForward={historyPointer < imageHistory.length - 1}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        accentColor={PORTAL_COLOR}
        clickCount={clickCount}
      />
    </div>
  );
}