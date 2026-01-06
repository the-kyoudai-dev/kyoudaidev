'use client';

import { useState, useEffect } from 'react';

interface TaskbarProps {
  isRandomizing: boolean;
  onToggleRandomize: () => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  viewMode: 'desktop' | 'filetree';
  onViewModeChange: (mode: 'desktop' | 'filetree') => void;
  accentColor: string; // NEW
}

export default function BlogOSTaskbar({
  isRandomizing,
  onToggleRandomize,
  onNavigateBack,
  onNavigateForward,
  canGoBack,
  canGoForward,
  viewMode,
  onViewModeChange,
  accentColor
}: TaskbarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [thoughtBubble, setThoughtBubble] = useState<null | 'ow' | 'stop' | 'perception'>(null);

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

  const handleOuchieClick = () => {
    if (!isRandomizing) {
      setThoughtBubble('ow');
      setTimeout(() => setThoughtBubble(null), 800);
      onToggleRandomize();
    } else {
      setThoughtBubble('stop');
      setTimeout(() => setThoughtBubble(null), 1500);
      onToggleRandomize();
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 border-t"
      style={{ 
        backgroundColor: '#1a1a1a',
        borderColor: accentColor
      }}
    >
      {/* Left: KYOUDAI branding */}
      <div className="font-mono text-sm text-neutral-500">
        RespEngr v1.0
      </div>

      {/* Center: Ouchie Eye + Invisible Nav */}
      <div className="flex items-center gap-4 relative">
        {/* INVISIBLE Back Button */}
        <button
          onClick={onNavigateBack}
          disabled={!canGoBack}
          className="w-8 h-8 opacity-0 hover:opacity-20 disabled:opacity-0 transition-opacity text-neutral-400"
          aria-label="Navigate back"
        >
          ←
        </button>

        {/* Ouchie Eye */}
        <div className="relative">
          <button
            onClick={handleOuchieClick}
            className={`text-4xl transition-transform ${isRandomizing ? 'animate-pulse' : ''}`}
            aria-label="Toggle background randomizer"
          >
            {isBlinking ? '😑' : '👁️'}
          </button>

          {/* Thought Bubbles */}
          {thoughtBubble && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-lg text-sm font-mono whitespace-nowrap animate-bounce shadow-lg">
              {thoughtBubble === 'ow' && 'OW!'}
              {thoughtBubble === 'stop' && 'Dude! STOP!!'}
              {thoughtBubble === 'perception' && 'Change your perception...'}
              {/* Speech bubble tail */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
            </div>
          )}
        </div>

        {/* INVISIBLE Forward Button */}
        <button
          onClick={onNavigateForward}
          disabled={!canGoForward}
          className="w-8 h-8 opacity-0 hover:opacity-20 disabled:opacity-0 transition-opacity text-neutral-400"
          aria-label="Navigate forward"
        >
          →
        </button>
      </div>

      {/* Right: View Toggle */}
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