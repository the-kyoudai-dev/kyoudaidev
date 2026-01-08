import React from 'react';
import { marked } from 'marked';
import { useState, useRef } from 'react';
import type { Article, OwchieImage } from '@/lib/respengr-data';
import '../styles/article-content.css'; // Import the typography CSS

// Configure marked.js WITHOUT deprecated options
marked.setOptions({
  breaks: true,
  gfm: true,
  // headerIds removed - enabled by default in marked v9+
});

interface DraggableArticleModalProps {
  article: Article;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  zIndex: number;
  onBringToFront: () => void;
  accentColor: string;
  owchieImages?: OwchieImage[]; // Add owchieImages to find paired image
}

export default function DraggableArticleModal({ 
  article, 
  onClose,
  initialPosition = { x: 200, y: 150 },
  zIndex,
  onBringToFront,
  accentColor,
  owchieImages = []
}: DraggableArticleModalProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  // Find paired image for this article
  const pairedImage = owchieImages.find(img => img.pairedArticleId === article.id);

  // Use pre-processed HTML from osCatcher if available, otherwise fallback to markdown processing
  const htmlContent = article.htmlContent || marked.parse(article.content);

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.modal-close, .modal-body')) return;
    
    onBringToFront();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    
    setPosition({
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  // Attach global mouse events
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div 
      className="fixed bg-neutral-900 border rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex,
        borderColor: accentColor,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onClick={onBringToFront}
    >
      {/* Title Bar */}
      <div 
        className="flex items-center justify-between p-3 border-b font-mono text-sm"
        style={{ borderColor: accentColor }}
      >
        <div className="flex items-center gap-2">
          <span>📄</span>
          <span className="truncate">{article.filename}</span>
        </div>
        <button 
          className="modal-close text-xl hover:opacity-70 transition-opacity" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>

      {/* Article Header */}
      <header className="p-4 border-b" style={{ borderColor: accentColor }}>
        <h1 className="text-xl font-bold mb-2">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-neutral-400">
          <time>{new Date(article.created).toLocaleDateString()}</time>
          <span>{article.wordCount} words</span>
          {article.tags && article.tags.length > 0 && (
            <div className="flex gap-1">
              {article.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: accentColor, color: '#000' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Article Content */}
      <div className="modal-body flex-1 overflow-y-auto p-4">
        {/* Show paired image if it exists */}
        {pairedImage && (
          <div className="mb-4">
            <img 
              src={pairedImage.path} 
              alt={`Image for ${article.title}`}
              className="w-full h-auto rounded-lg border"
              style={{ borderColor: accentColor }}
            />
          </div>
        )}
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}
