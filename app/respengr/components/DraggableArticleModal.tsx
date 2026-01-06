'use client';

import { useState, useRef, useEffect } from 'react';
import type { Article } from '@/lib/respengr-data';

interface DraggableArticleModalProps {
  article: Article;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  zIndex: number;
  onBringToFront: () => void;
  accentColor: string; // NEW: portal-specific color
}

export default function DraggableArticleModal({
  article,
  onClose,
  initialPosition = { x: 200, y: 150 },
  zIndex,
  onBringToFront,
  accentColor
}: DraggableArticleModalProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.modal-toolbar')) {
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
          x: Math.max(0, Math.min(window.innerWidth - 600, e.clientX - dragRef.current.startX)),
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
      className="fixed rounded shadow-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '600px',
        maxWidth: 'calc(100vw - 40px)',
        maxHeight: '80vh',
        zIndex,
        backgroundColor: '#0a0a0a',
        border: `2px solid ${accentColor}`,
        boxShadow: `0 0 20px ${accentColor}40`
      }}
      onMouseDown={handleMouseDown}
      onClick={onBringToFront}
    >
      {/* Toolbar */}
      <div 
        className="modal-toolbar px-4 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing rounded-t"
        style={{ backgroundColor: accentColor }}
      >
        <div className="flex items-center gap-2 text-xs font-mono text-black font-bold">
          <button className="hover:text-neutral-800 transition-colors">←</button>
          <button className="hover:text-neutral-800 transition-colors">→</button>
          <span className="px-2 py-1 bg-black/20 rounded text-black">
            /respengr{article.path}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-black hover:text-neutral-800 transition-colors" title="Download">
            ⬇️
          </button>
          <button className="text-black hover:text-neutral-800 transition-colors" title="Email">
            ✉️
          </button>
          <button className="text-black hover:text-neutral-800 transition-colors" title="Comment">
            💬
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-black hover:text-red-600 transition-colors font-bold text-lg"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(80vh - 48px)' }}>
        <h2 className="text-2xl font-mono font-bold mb-3" style={{ color: accentColor }}>
          {article.title}
        </h2>
        <div className="text-sm font-mono mb-6" style={{ color: `${accentColor}80` }}>
          {article.wordCount} words · {new Date(article.created).toLocaleDateString()}
        </div>
        <div className="prose prose-invert max-w-none font-mono text-neutral-200 leading-relaxed">
          <p className="whitespace-pre-wrap">{article.content}</p>
        </div>
        <div className="mt-8 pt-4 border-t flex flex-wrap gap-2" style={{ borderColor: `${accentColor}40` }}>
          {article.tags.map(tag => (
            <span 
              key={tag}
              className="text-xs font-mono px-3 py-1 rounded border"
              style={{ 
                backgroundColor: `${accentColor}10`,
                borderColor: `${accentColor}40`,
                color: accentColor
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}