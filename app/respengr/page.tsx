'use client';

import { useState, useEffect } from 'react';
import type { Article, Folder, OwchieImage } from '@/lib/respengr-data';
import BlogOSTaskbar from './components/BlogOSTaskbar';
import DraggableArticleModal from './components/DraggableArticleModal';
import DraggableFolderWindow from './components/DraggableFolderWindow';

const PORTAL_COLOR = '#FF00FF';

export default function RespEngrPage() {
  // Data state
  const [owchieImages, setOwchieImages] = useState<OwchieImage[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Randomizer state
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // NEW: Track if randomizer has ever been started
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageHistory, setImageHistory] = useState<number[]>([0]);
  const [historyPointer, setHistoryPointer] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<'desktop' | 'filetree'>('desktop');

  // Modal state
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [openFolder, setOpenFolder] = useState<Folder | null>(null);
  const [topZIndex, setTopZIndex] = useState(100);

  // Time state (for top bar)
  const [currentTime, setCurrentTime] = useState('--:--:--');
  const [personState, setPersonState] = useState<'sleeping' | 'annoyed' | 'gone'>('sleeping');

  // Fetch data on mount
  useEffect(() => {
    fetch('/data/respengr.json')
      .then(res => res.json())
      .then(data => {
        setOwchieImages(data.owchieImages || []);
        setArticles(data.articles || []);
        setFolders(data.folders || []);
        setIsLoading(false);
        console.log('📊 RespEngr data loaded:', data.meta);
        
        // Initialize with first image
        if (data.owchieImages && data.owchieImages.length > 0) {
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

  // Enhanced randomizer with cinematic transitions
  useEffect(() => {
    if (!isRandomizing || owchieImages.length <= 1) return;

    const interval = setInterval(() => {
      // Start transition
      setIsTransitioning(true);
      
      // After fade out completes, change image
      setTimeout(() => {
        const nextIndex = Math.floor(Math.random() * owchieImages.length);
        setCurrentImageIndex(nextIndex);
        
        // Update history
        setImageHistory(prev => {
          const newHistory = [...prev.slice(0, historyPointer + 1), nextIndex];
          return newHistory;
        });
        setHistoryPointer(prev => prev + 1);
        
        // End transition (fade in)
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 2000); // 2 second fade out
      
    }, 60000); // 60 seconds = 1 minute

    return () => clearInterval(interval);
  }, [isRandomizing, owchieImages.length, historyPointer]);

  // Owchie Eye click handler - Enhanced to trigger first fade-in
  const handleOwchieClick = () => {
    setClickCount(prev => prev + 1);
    
    // First click: Start the system and fade in first image
    if (!hasStarted && owchieImages.length > 0) {
      setHasStarted(true);
      setIsTransitioning(true);
      
      // Fade in first image after brief delay
      setTimeout(() => {
        setCurrentImageIndex(0);
        setImageHistory([0]);
        setHistoryPointer(0);
        setIsTransitioning(false);
        setIsRandomizing(true);
      }, 100);
    } else {
      // Subsequent clicks: Toggle randomization
      setIsRandomizing(prev => !prev);
    }
  };

  const handleNavigateBack = () => {
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      setHistoryPointer(newPointer);
      setCurrentImageIndex(imageHistory[newPointer]);
      setIsRandomizing(false); // Stop randomizing when manually navigating
    }
  };

  const handleNavigateForward = () => {
    if (historyPointer < imageHistory.length - 1) {
      const newPointer = historyPointer + 1;
      setHistoryPointer(newPointer);
      setCurrentImageIndex(imageHistory[newPointer]);
      setIsRandomizing(false); // Stop randomizing when manually navigating
    }
  };

  // Click background to open paired article
  const handleBackgroundClick = () => {
    const currentImage = owchieImages[currentImageIndex];
    if (currentImage?.pairedArticleId) {
      const pairedArticle = articles.find(a => a.id === currentImage.pairedArticleId);
      if (pairedArticle) {
        setOpenArticle(pairedArticle);
        setTopZIndex(prev => prev + 1);
      }
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

  // Little person click handler - they leave FOREVER after 7 seconds
  const handlePersonClick = () => {
    if (personState !== 'sleeping') return; // Prevent multiple clicks during animation
    
    // Step 1: Show annoyed face
    setPersonState('annoyed');
    
    // Step 2: After 7 seconds, disappear FOREVER
    setTimeout(() => {
      setPersonState('gone');
      // They're gone for good! No coming back until page refresh
    }, 7000);
  };

  // Get current background image - only show if started
  const currentBackground = (hasStarted && owchieImages[currentImageIndex]?.path) || '';

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
    <div className="min-h-screen text-white relative overflow-hidden pb-16">
      {/* Base Background Layer */}
      <div className="fixed inset-0 bg-neutral-950" style={{ zIndex: -2 }} />
      
      {/* Clickable Background Image Layer with Cinematic Transitions */}
      <button
        onClick={handleBackgroundClick}
        className="absolute inset-0 transition-all cursor-pointer"
        style={{
          backgroundImage: currentBackground ? `url("${currentBackground}")` : 'none',
          backgroundSize: '100% auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: !hasStarted ? 0 : (isTransitioning ? 0.3 : 1.0),
          filter: !hasStarted ? 'blur(0px)' : (isTransitioning ? 'blur(20px)' : 'blur(0px)'),
          transform: 'scale(1.0)',
          transitionDuration: hasStarted ? '2000ms' : '2000ms',
          transitionProperty: 'opacity, filter',
          transitionTimingFunction: 'ease-in-out',
          zIndex: 1,
          pointerEvents: hasStarted ? 'auto' : 'none' // Only clickable after started
        }}
        aria-label="Background image"
      />

      {/* Top Bar */}
      <div 
        className="relative z-20 px-4 py-2 flex items-center justify-between font-mono text-sm"
        style={{ backgroundColor: '#1a1a1a', borderBottom: `1px solid ${PORTAL_COLOR}` }}
      >
        <div className="flex items-center gap-4">
          <a 
            href="/"
            className="font-bold hover:opacity-80 transition-opacity cursor-pointer"
            style={{ color: PORTAL_COLOR }}
          >
            KYOUDAI.dev
          </a>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-400">RespEngr v1.0</span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-500 italic text-xs">
            Click around and see how things "Respond" ;P
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-2">
            {/* Small mumbling speech bubble to the left */}
            {personState === 'annoyed' && (
              <div 
                className="px-2 py-1 rounded text-xs font-mono animate-pulse"
                style={{
                  backgroundColor: PORTAL_COLOR,
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '10px'
                }}
              >
                Yo... I'm no AiBou. Go PrAPPt yourself one. Don't click me off...
              </div>
            )}
            
            {personState !== 'gone' && (
              <button
                onClick={handlePersonClick}
                className="text-4xl hover:scale-110 transition-all duration-500 cursor-pointer"
                style={{
                  transform: personState === 'annoyed' ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {personState === 'sleeping' && '🛌'}
                {personState === 'annoyed' && '😒'}
              </button>
            )}
          </div>
          <span className="text-neutral-500" suppressHydrationWarning>
            {currentTime}
          </span>
        </div>
      </div>

      {/* Desktop View */}
      {viewMode === 'desktop' && (
        <main className="relative z-10 p-8 pointer-events-none">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {/* Folder Icons */}
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => handleFolderClick(folder)}
                className="flex flex-col items-center gap-2 group p-3 rounded-lg transition-all pointer-events-auto"
                style={{
                  backgroundColor: 'rgba(26, 26, 26, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 0, 255, 0.3)'
                }}
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
                className="flex flex-col items-center gap-2 group p-3 rounded-lg transition-all pointer-events-auto"
                style={{
                  backgroundColor: 'rgba(26, 26, 26, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 0, 255, 0.3)'
                }}
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
          owchieImages={owchieImages}
        />
      )}

      {/* Taskbar */}
      <BlogOSTaskbar
        isRandomizing={isRandomizing}
        onToggleRandomize={handleOwchieClick}
        onNavigateBack={handleNavigateBack}
        onNavigateForward={handleNavigateForward}
        canGoBack={historyPointer > 0}
        canGoForward={historyPointer < imageHistory.length - 1}
        showNavigation={hasStarted && imageHistory.length > 0}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        accentColor={PORTAL_COLOR}
        clickCount={clickCount}
      />
    </div>
  );
}