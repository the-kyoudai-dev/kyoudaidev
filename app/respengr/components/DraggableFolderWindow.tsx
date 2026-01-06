'use client';

import { useState, useRef, useEffect } from 'react';
import type { Article, Folder } from '@/lib/respengr-data';

interface DraggableFolderWindowProps {
  folder: Folder;
  articles: Article[];
  onClose: () => void;
  onArticleClick: (article: Article) => void;
  initialPosition?: { x: number; y: number };
  zIndex: number;
  onBringToFront: () => void;
  accentColor: string;
}

export default function DraggableFolderWindow({
  folder,
  articles,
  onClose,
  onArticleClick,
  initialPosition = { x: 150, y: 100 },
  zIndex,
  onBringToFront,
  accentColor
}: DraggableFolderWindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-titlebar')) {
      setIsDragging(true);
      dragRef.current = {
        startX: e.clientX - position.x,
        startY: e.clientY - position.y
      };
      onBringToFront();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 500, e.clientX - dragRef.current.startX)),
          y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragRef.current.startY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="fixed rounded"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '500px',
        maxWidth: 'calc(100vw - 40px)',
        maxHeight: '70vh',
        zIndex,
        backgroundColor: '#0a0a0a',
        border: `2px solid ${accentColor}`,
        boxShadow: `0 0 20px ${accentColor}40`
      }}
      onMouseDown={handleMouseDown}
      onClick={onBringToFront}
    >
      {/* Title Bar */}
      <div 
        className="window-titlebar px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: accentColor }}
      >
        <div className="flex items-center gap-2 font-mono text-sm text-black font-bold">
          <span>📁</span>
          <span>{folder.name.toUpperCase()}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-black hover:text-red-600 font-bold text-lg transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
        <div className="grid grid-cols-4 gap-4">
          {articles.map(article => (
            <button
              key={article.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(article.id);
                onArticleClick(article);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onArticleClick(article);
              }}
              className={`flex flex-col items-center gap-2 p-2 rounded transition-colors ${
                selectedItem === article.id
                  ? 'bg-white/10'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="text-4xl">📄</div>
              <span className="text-xs font-mono text-neutral-400 text-center line-clamp-2">
                {article.filename}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div 
        className="px-3 py-1 flex items-center justify-between font-mono text-xs border-t"
        style={{ 
          backgroundColor: '#0a0a0a',
          borderColor: accentColor,
          color: accentColor
        }}
      >
        <span>{selectedItem ? '1 item selected' : `${articles.length} items`}</span>
        <span>{Math.round(articles.reduce((sum, a) => sum + a.wordCount, 0) / 1000)}Ko</span>
      </div>
    </div>
  );
}