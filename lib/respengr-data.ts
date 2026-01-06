// lib/respengr-data.ts - Updated to read from generated JSON

export interface OuchieImage {
  id: string;
  filename: string;
  path: string;
  pairedArticleId?: string;
}

export interface Article {
  id: string;
  filename: string;
  title: string;
  content: string;
  created: string;
  modified: string;
  author?: string;
  wordCount: number;
  path: string;
  tags: string[];
  status: 'published' | 'draft';
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  children: string[];
}

interface RespEngrData {
  ouchieImages: OuchieImage[];
  articles: Article[];
  folders: Folder[];
  meta?: {
    generated: string;
    totalArticles: number;
    totalImages: number;
    totalFolders: number;
  };
}

// Fallback data for development
const fallbackData: RespEngrData = {
  ouchieImages: [],
  articles: [],
  folders: [],
  meta: {
    generated: new Date().toISOString(),
    totalArticles: 0,
    totalImages: 0,
    totalFolders: 0
  }
};

export function getRespEngrData(): RespEngrData {
  // In browser, return fallback (will be loaded via client-side fetch)
  if (typeof window !== 'undefined') {
    return fallbackData;
  }
  
  // On server, read from generated JSON
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(process.cwd(), 'public', 'data', 'respengr.json');
    
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading RespEngr data:', error);
  }
  
  return fallbackData;
}