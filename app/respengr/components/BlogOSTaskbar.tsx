'use client';

import { useState, useEffect } from 'react';

interface TaskbarProps {
  isRandomizing: boolean;
  onToggleRandomize: () => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  showNavigation: boolean; // NEW: show buttons when history exists
  viewMode: 'desktop' | 'filetree';
  onViewModeChange: (mode: 'desktop' | 'filetree') => void;
  accentColor: string;
  clickCount: number;
}

export default function BlogOSTaskbar({
  isRandomizing,
  onToggleRandomize,
  onNavigateBack,
  onNavigateForward,
  canGoBack,
  canGoForward,
  showNavigation,
  viewMode,
  onViewModeChange,
  accentColor,
  clickCount
}: TaskbarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [thoughtBubble, setThoughtBubble] = useState<null | 'ow' | 'stop' | 'perception' | 'seriously'>(null);

  // Speech bubble messages
  const getMessage = () => {
    if (clickCount === 0) return null;
    if (clickCount === 1) return "OW!";
    if (clickCount === 2) return "Dude! STOP!!";
    return "...seriously?";
  };

  const message = getMessage();

  // Blink schedule (Fibonacci-ish pattern)
  useEffect(() => {
    const blinkSchedule = [3000, 5000, 8000, 13000, 21000];
    let currentBlink = 0;

    const scheduleBlink = () => {
      const delay = blinkSchedule[currentBlink % blinkSchedule.length];
      setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        currentBlink++;
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();
  }, []);

  // Random "Change your perception..." thought bubble
  useEffect(() => {
    const showPerceptionBubble = () => {
      const randomDelay = Math.random() * 30000 + 20000;
      setTimeout(() => {
        setThoughtBubble('perception');
        setTimeout(() => setThoughtBubble(null), 3000);
        showPerceptionBubble();
      }, randomDelay);
    };
    showPerceptionBubble();
  }, []);

  const handleOwchieClick = () => {
    onToggleRandomize();
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 border-t"
      style={{ 
        backgroundColor: '#1a1a1a',
        borderColor: accentColor
      }}
    >
      {/* Left: Navigation + Owchie Eye */}
      <div className="flex items-center gap-3">
        {/* Hidden navigation buttons - appear when history exists */}
        <div 
          className={`flex gap-2 transition-all duration-300 ${
            showNavigation ? 'opacity-0 hover:opacity-100 w-24' : 'opacity-0 w-0 overflow-hidden'
          }`}
        >
          <button
            onClick={onNavigateBack}
            disabled={!canGoBack}
            className="text-2xl disabled:cursor-not-allowed transition-colors"
            style={{ color: canGoBack ? accentColor : '#666' }}
          >
            ◀
          </button>
          <button
            onClick={onNavigateForward}
            disabled={!canGoForward}
            className="text-2xl disabled:cursor-not-allowed transition-colors"
            style={{ color: canGoForward ? accentColor : '#666' }}
          >
            ▶
          </button>
        </div>

        {/* Owchie Eye - pushed right when buttons appear */}
        <div className="relative">
          <button
            onClick={handleOwchieClick}
            className="text-6xl hover:scale-110 transition-transform cursor-pointer relative"
          >
            {isBlinking ? '😑' : '👁️'}
          </button>
          
          {message && (
            <div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 rounded-lg font-mono text-sm whitespace-nowrap animate-bounce"
              style={{
                backgroundColor: accentColor,
                color: '#000',
                fontWeight: 'bold'
              }}
            >
              {message}
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: `8px solid ${accentColor}`
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right: View toggles */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewModeChange('desktop')}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
            viewMode === 'desktop' ? '' : 'hover:bg-neutral-800'
          }`}
          style={viewMode === 'desktop' ? { backgroundColor: accentColor, color: '#000' } : {}}
          title="Desktop View"
        >
          🖥️
        </button>
        <button
          onClick={() => onViewModeChange('filetree')}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
            viewMode === 'filetree' ? '' : 'hover:bg-neutral-800'
          }`}
          style={viewMode === 'filetree' ? { backgroundColor: accentColor, color: '#000' } : {}}
          title="File Tree View"
        >
          📂
        </button>
      </div>
    </div>
  );
}