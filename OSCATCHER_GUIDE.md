# osCatcher: RespEngr Automation Engine

## 🚀 Status: LIVE & AUTOMATED

osCatcher is the automation engine that makes RespEngr truly alive. It scans your workspace files and generates real-time data for the web interface.

## 🔧 How It Works

```
File System → osCatcher → JSON Data → Web UI
     ↓             ↓           ↓         ↓
  .md files    Scans &     respengr.   Live
  .jpg files   Parses      json        Updates
```

## 📁 File Structure

```
kyoudaidev/
├── scripts/
│   └── osCatcher.js              # Main automation engine
├── public/
│   ├── respengr/
│   │   ├── *.md                  # Articles (scanned)
│   │   └── ouchie/
│   │       └── *.jpg             # Images (paired with articles)
│   └── data/
│       └── respengr.json         # Generated data (auto-updated)
└── app/respengr/
    └── page.tsx                  # Reads from respengr.json
```

## 🎯 Commands

### Generate Data Once
```bash
npm run oscatcher
```

### Watch Mode (Auto-regenerate on file changes)
```bash
npm run oscatcher:watch
```

### Full Development (Watch + Dev Server)
```bash
npm run dev:full
```

## 📝 Supported File Formats

### Articles (.md files)
- **Location**: `/public/respengr/*.md`
- **Frontmatter Support**:
  ```yaml
  ---
  TITLE: Your Article Title
  BY: Author Name
  CREATED: "2601061448"  # YYMMDDHHMM format
  UPDATED: "2601061448"
  tags: [tag1, tag2]
  status: published
  ---
  ```

### Images (.jpg, .png, .gif, .webp)
- **Location**: `/public/respengr/ouchie/*`
- **Auto-pairing**: Images with same name as articles get paired
- **Example**: `Welcome to RespEngr.md` ↔ `Welcome to RespEngr.jpg`

## 🔄 Real-Time Workflow

1. **Add new article**: Drop `new-article.md` in `/public/respengr/`
2. **Add paired image**: Drop `new-article.jpg` in `/public/respengr/ouchie/`
3. **osCatcher detects**: File change triggers regeneration
4. **JSON updates**: `respengr.json` gets new data
5. **UI refreshes**: Web interface shows new content immediately

## 🎨 Generated Data Structure

```json
{
  "ouchieImages": [
    {
      "id": "ouchie-welcome-to-respengr",
      "filename": "Welcome to RespEngr.jpg",
      "path": "/respengr/ouchie/Welcome to RespEngr.jpg",
      "pairedArticleId": "welcome-to-respengr"
    }
  ],
  "articles": [
    {
      "id": "welcome-to-respengr",
      "filename": "Welcome to RespEngr.md",
      "title": "Welcome to the Response Engineering (RespEngr) portal",
      "content": "# Welcome to the KYOUDAI Civilization RespEngr Portal",
      "created": "2026-01-06T22:48:00.000Z",
      "modified": "2026-01-06T22:48:00.000Z",
      "author": "Amukat",
      "wordCount": 11,
      "path": "/Welcome to RespEngr.md",
      "tags": ["respengr"],
      "status": "published"
    }
  ],
  "folders": [
    {
      "id": "folder-2026-01",
      "name": "2026-01",
      "path": "/2026-01",
      "children": ["welcome-to-respengr"]
    }
  ],
  "meta": {
    "generated": "2026-01-06T23:21:21.316Z",
    "totalArticles": 1,
    "totalImages": 1,
    "totalFolders": 1
  }
}
```

## 🚀 Production Deployment

### Vercel Setup
1. **Build Hook**: Add `npm run oscatcher` to build process
2. **Auto-deploy**: Push to GitHub triggers rebuild with latest content
3. **Static Generation**: JSON is generated at build time

### Local Development
```bash
# Terminal 1: Watch files and auto-regenerate
npm run oscatcher:watch

# Terminal 2: Dev server
npm run dev

# Or combined:
npm run dev:full
```

## 🔍 Features

### Smart File Pairing
- Automatically pairs images with articles based on filename
- `article.md` + `article.jpg` = paired content
- Unpaired images become background rotation

### Date Format Support
- Custom format: `"2601061448"` (YYMMDDHHMM)
- ISO format: `"2026-01-06T22:48:00.000Z"`
- Fallback to file system timestamps

### Folder Generation
- Auto-creates folders based on article creation dates
- Groups by year-month (e.g., "2026-01")
- Maintains chronological organization

### Real-Time Updates
- File system watching with immediate regeneration
- Hot reload compatible
- Zero-downtime content updates

## 🎯 Next Steps

1. **Add Content**: Drop new `.md` and `.jpg` files
2. **Watch Magic**: osCatcher automatically processes them
3. **Deploy**: Push to GitHub for production updates
4. **Scale**: Add more portals (PrAPPt, AiBouMOS) with same system

RespEngr is now a living, breathing workspace that updates in real-time! 👁️🔥✨