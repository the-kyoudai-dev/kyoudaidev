'use client';

import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import type { Article } from '@/lib/respengr-data';

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true
});

interface DraggableArticleModalProps {
  article: Article;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  zIndex: number;
  onBringToFront: () => void;
  accentColor: string;
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
  
  // Render markdown to HTML
  const renderedContent = marked(article.content);

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
          x: Math.max(0, Math.min(window.innerWidth - 700, e.clientX - dragRef.current.startX)),
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
        width: '700px',
        maxWidth: 'calc(100vw - 40px)',
        maxHeight: '85vh',
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
          <span className="px-2 py-1 bg-black/20 rounded text-black truncate max-w-md">
            {article.path}
          </span>
        </div>

        <div className="flex items-center gap-3">
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
      <div className="overflow-auto" style={{ maxHeight: 'calc(85vh - 48px)' }}>
        {/* Article Header */}
        <div className="p-6 border-b" style={{ borderColor: `${accentColor}40` }}>
          <h2 className="text-2xl font-mono font-bold mb-3" style={{ color: accentColor }}>
            {article.title}
          </h2>
          <div className="text-sm font-mono flex gap-4" style={{ color: `${accentColor}80` }}>
            <span>{article.wordCount} words</span>
            <span>·</span>
            <span>{new Date(article.created).toLocaleDateString()}</span>
            {article.author && (
              <>
                <span>·</span>
                <span>by {article.author}</span>
              </>
            )}
          </div>
        </div>

        {/* Article Content with Markdown */}
        <div className="p-6">
          <div 
            className="prose prose-invert max-w-none font-mono"
            style={{
              '--tw-prose-body': '#e5e5e5',
              '--tw-prose-headings': accentColor,
              '--tw-prose-links': accentColor,
              '--tw-prose-bold': '#ffffff',
              '--tw-prose-code': accentColor
            } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="px-6 pb-6">
            <div className="pt-4 border-t flex flex-wrap gap-2" style={{ borderColor: `${accentColor}40` }}>
              {article.tags.map((tag: string) => (
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
        )}
      </div>
    </div>
  );
}