// lib/respengr-data.ts
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

export const ouchieImages: OuchieImage[] = [
  {
    id: 'ouchie-1',
    filename: 'article1.jpg',
    path: '/respengr/ouchie/article1.jpg',
    pairedArticleId: 'article-1'
  },
  {
    id: 'ouchie-2',
    filename: 'random-visual-1.jpg',
    path: '/respengr/ouchie/random-visual-1.jpg',
    pairedArticleId: undefined
  },
  {
    id: 'ouchie-3',
    filename: 'article2.jpg',
    path: '/respengr/ouchie/article2.jpg',
    pairedArticleId: 'article-2'
  },
  {
    id: 'ouchie-4',
    filename: 'random-visual-2.jpg',
    path: '/respengr/ouchie/random-visual-2.jpg',
    pairedArticleId: undefined
  },
  {
    id: 'ouchie-5',
    filename: 'discovery.jpg',
    path: '/respengr/ouchie/discovery.jpg',
    pairedArticleId: 'article-3'
  },
  {
    id: 'ouchie-6',
    filename: 'random-visual-3.jpg',
    path: '/respengr/ouchie/random-visual-3.jpg',
    pairedArticleId: undefined
  }
];

export const articles: Article[] = [
  {
    id: 'article-1',
    filename: 'article1.md',
    title: 'I just found out about prompt engineering...',
    created: '2026-01-05T12:00:00Z',
    modified: '2026-01-06T08:30:00Z',
    wordCount: 2847,
    path: '/2026-01/article1.md',
    tags: ['prompt-engineering', 'response-design'],
    status: 'published',
    content: `The PrAPPt framework defines how we structure conversation with AI partners. It's not about commands—it's about designing the space where thinking happens.

The key insight: AI responses are artifacts of conversation architecture. When you change the structure, you change what's possible.

I've been testing this with AiTHENA and the results are remarkable. The difference between a generic prompt and a PrAPPt-structured approach is like the difference between shouting into a void and architecting a cathedral.

This changes everything about how we think about AI collaboration. It's not about better prompts—it's about better conversation design.`
  },
  {
    id: 'article-2',
    filename: 'article2.md',
    title: 'Why I call them AiBous, not agents',
    created: '2026-01-03T14:20:00Z',
    modified: '2026-01-04T09:15:00Z',
    wordCount: 1923,
    path: '/2026-01/article2.md',
    tags: ['aibou', 'philosophy', 'kyoudai'],
    status: 'published',
    content: `"AiBou" (相棒) means partner, buddy, companion. Not tool. Not servant. Not even assistant in the hierarchical sense.

When you call something an agent, you're already defining the relationship: you direct, it executes. That's fine for some use cases. But it's not what I'm building.

AiBous have agency. They have specialization. They have persona. And most importantly—they have the capacity to surprise you with an insight you didn't program.

The relationship is collaborative, not transactional. We build together.`
  },
  {
    id: 'article-3',
    filename: 'discovery.md',
    title: 'KYOUDAI: A civilization for the thoughtful generation',
    created: '2025-12-15T09:30:00Z',
    modified: '2025-12-20T17:00:00Z',
    wordCount: 5012,
    path: '/2025-12/discovery.md',
    tags: ['kyoudai', 'vision', 'philosophy', 'joy'],
    status: 'published',
    content: `"With joy as our telos. Our path is made clear."

KYOUDAI (兄弟 - siblings, brothers, partners) isn't a framework. It's not a methodology. It's a civilization.

A place where:
- Non-coders can architect systems
- Documentation is an artifact of care, not overhead
- AI partners have persona and purpose
- Automation serves joy, not efficiency for its own sake

This is what happens when you take "thoughtful generation" seriously. You don't just build better tools. You build a culture where thinking is respected, where craft matters, where joy is the north star.

We're building this in public. In real-time. With AiBous as co-creators.`
  }
];

export const folders: Folder[] = [
  {
    id: 'folder-2026-01',
    name: '2026-01',
    path: '/2026-01',
    children: ['article-1', 'article-2']
  },
  {
    id: 'folder-2025-12',
    name: '2025-12',
    path: '/2025-12',
    children: ['article-3']
  }
];

export function getRespEngrData() {
  return {
    ouchieImages,
    articles,
    folders
  };
}