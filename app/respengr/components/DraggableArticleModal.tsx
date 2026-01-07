'use client';

import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import type { Article } from '@/lib/respengr-data';

// Configure marked for better rendering with proper heading sizes
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true
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
  const [imageError, setImageError] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  
  // Process markdown to remove Obsidian embeds and convert to alt text
  const processObsidianSyntax = (content: string): string => {
    // Remove Obsidian image embeds: ![[path/to/image.jpg]] or ![[image.jpg|alt text]]
    let processed = content.replace(/!\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (match, imagePath, pipe, altText) => {
      // Extract filename from path
      const filename = imagePath.split('/').pop();
      // Use alt text if provided, otherwise use filename without extension
      const displayText = altText || filename.replace(/\.\w+$/, '');
      return `_[Image: ${displayText}]_`;
    });
    
    // Also handle regular Obsidian links [[link]] → convert to text
    processed = processed.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (match, link, pipe, displayText) => {
      return displayText || link;
    });
    
    return processed;
  };
  
  // Process content and render markdown
  const processedContent = processObsidianSyntax(article.content);
  const renderedContent = marked(processedContent);
  
  // Check for paired image - try multiple extensions
  const baseFilename = article.filename.replace('.md', '');
  const possibleImages = [
    `/respengr/ouchie/${baseFilename}.jpg`,
    `/respengr/ouchie/${baseFilename}.jpeg`,
    `/respengr/ouchie/${baseFilename}.png`,
    `/respengr/ouchie/${baseFilename}.webp`
  ];
  const [pairedImage, setPairedImage] = useState<string | null>(null);

  // Try to load paired image
  useEffect(() => {
    const tryLoadImage = async () => {
      for (const imgPath of possibleImages) {
        try {
          const response = await fetch(imgPath, { method: 'HEAD' });
          if (response.ok) {
            setPairedImage(imgPath);
            return;
          }
        } catch (e) {
          // Continue to next image
        }
      }
      setImageError(true);
    };
    
    tryLoadImage();
  }, [article.filename]);

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
          {/* LIGHTER METADATA */}
          <div className="text-sm font-mono flex gap-4 text-neutral-400">
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

        {/* Paired Image (Hero) */}
        {pairedImage && !imageError && (
          <div className="p-6 border-b" style={{ borderColor: `${accentColor}40` }}>
            <img 
              src={pairedImage}
              alt={article.title}
              className="w-full h-auto rounded"
              style={{ border: `1px solid ${accentColor}40` }}
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Article Content with Proper Heading Sizes */}
        <div className="p-6">
          <style jsx>{`
            .article-content h1 {
              font-size: 2rem;
              line-height: 2.5rem;
              font-weight: bold;
              margin-top: 1.5rem;
              margin-bottom: 1rem;
              color: ${accentColor};
            }
            .article-content h2 {
              font-size: 1.75rem;
              line-height: 2.25rem;
              font-weight: bold;
              margin-top: 1.25rem;
              margin-bottom: 0.875rem;
              color: ${accentColor};
            }
            .article-content h3 {
              font-size: 1.5rem;
              line-height: 2rem;
              font-weight: 600;
              margin-top: 1rem;
              margin-bottom: 0.75rem;
              color: ${accentColor};
            }
            .article-content h4 {
              font-size: 1.25rem;
              line-height: 1.75rem;
              font-weight: 600;
              margin-top: 0.875rem;
              margin-bottom: 0.625rem;
              color: ${accentColor};
            }
            .article-content h5 {
              font-size: 1.125rem;
              line-height: 1.625rem;
              font-weight: 600;
              margin-top: 0.75rem;
              margin-bottom: 0.5rem;
              color: ${accentColor};
            }
            .article-content h6 {
              font-size: 1rem;
              line-height: 1.5rem;
              font-weight: 600;
              margin-top: 0.625rem;
              margin-bottom: 0.5rem;
              color: ${accentColor};
            }
            .article-content p {
              font-size: 1rem;
              line-height: 1.75rem;
              margin-bottom: 1rem;
              color: #e5e5e5;
            }
            .article-content ul, .article-content ol {
              margin-left: 1.5rem;
              margin-bottom: 1rem;
              color: #e5e5e5;
            }
            .article-content li {
              margin-bottom: 0.5rem;
              line-height: 1.625rem;
            }
            .article-content a {
              color: ${accentColor};
              text-decoration: underline;
            }
            .article-content a:hover {
              opacity: 0.8;
            }
            .article-content code {
              background-color: #1a1a1a;
              color: ${accentColor};
              padding: 0.125rem 0.375rem;
              border-radius: 0.25rem;
              font-size: 0.875rem;
            }
            .article-content pre {
              background-color: #1a1a1a;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin-bottom: 1rem;
              border: 1px solid ${accentColor}40;
            }
            .article-content pre code {
              background-color: transparent;
              padding: 0;
              color: #e5e5e5;
            }
            .article-content blockquote {
              border-left: 4px solid ${accentColor};
              padding-left: 1rem;
              margin-left: 0;
              margin-bottom: 1rem;
              color: #d4d4d4;
              font-style: italic;
            }
            .article-content em {
              color: #d4d4d4;
              font-style: italic;
            }
            .article-content strong {
              color: #ffffff;
              font-weight: bold;
            }
            .article-content hr {
              border: none;
              border-top: 1px solid ${accentColor}40;
              margin: 1.5rem 0;
            }
          `}</style>
          
          <div 
            className="article-content font-mono"
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