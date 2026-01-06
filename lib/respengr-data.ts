// lib/respengr-data.ts - Updated to match actual files

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

// Single Ouchie Eye image matching actual file
export const ouchieImages: OuchieImage[] = [
  {
    id: 'ouchie-1',
    filename: 'Welcome to RespEngr.jpg',
    path: '/respengr/ouchie/Welcome to RespEngr.jpg',
    pairedArticleId: 'welcome-article'
  }
];

// Single article matching actual file
export const articles: Article[] = [
  {
    id: 'welcome-article',
    filename: 'Welcome to RespEngr.md',
    title: 'Welcome to the Response Engineering (RespEngr) portal',
    created: '2026-01-06T14:48:00Z',
    modified: '2026-01-06T14:48:00Z',
    wordCount: 25,
    path: '/Welcome to RespEngr.md',
    tags: ['welcome', 'respengr', 'kyoudai', 'civilization'],
    status: 'published',
    content: `Welcome to the KYOUDAI Civilization RespEngr Portal

This is a living window into the Response Engineering workspace. You're not reading a blog—you're invading a workspace.

The RespEngr portal is where response architecture meets real-time research. Every interaction shapes the conversation space.

Click around. Explore. Change your perception.

The Ouchie Eye sees all. 👁️

BY: Amukat
CREATED: 2601061448
UPDATED: 2601061448`
  }
];

// No folders - single article at root
export const folders: Folder[] = [];

export function getRespEngrData() {
  return {
    ouchieImages,
    articles,
    folders
  };
}