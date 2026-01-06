// scripts/osCatcher.js - COMPLETE REWRITE
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONFIG = {
  vaultDir: path.join(process.cwd(), 'public', 'respengr'),
  ouchieDir: path.join(process.cwd(), 'public', 'respengr', 'ouchie'),
  outputFile: path.join(process.cwd(), 'public', 'data', 'respengr.json'),
  ignorePatterns: ['.obsidian', 'ouchie'], // Ignore from file tree
  watchMode: process.argv.includes('--watch')
};

// Ensure output directory exists
function ensureOutputDir() {
  const outputDir = path.dirname(CONFIG.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

// Recursively scan directory for markdown files
function scanVault(dir, baseDir = dir) {
  let articles = [];
  let folders = [];
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const relativePath = path.relative(baseDir, fullPath);
    const stat = fs.statSync(fullPath);
    
    // Skip ignored patterns
    if (CONFIG.ignorePatterns.some(pattern => item === pattern || relativePath.startsWith(pattern))) {
      return;
    }
    
    if (stat.isDirectory()) {
      // Add folder to tree
      folders.push({
        id: `folder-${relativePath.replace(/\\/g, '/').replace(/\s+/g, '-').toLowerCase()}`,
        name: item,
        path: `/${relativePath.replace(/\\/g, '/')}`,
        children: [] // Will populate later
      });
      
      // Recurse into subdirectory
      const subResults = scanVault(fullPath, baseDir);
      articles = articles.concat(subResults.articles);
      folders = folders.concat(subResults.folders);
      
    } else if (item.endsWith('.md')) {
      // Parse markdown file
      const article = parseMarkdown(fullPath, baseDir);
      articles.push(article);
    }
  });
  
  return { articles, folders };
}

// Parse markdown file with frontmatter
function parseMarkdown(filepath, baseDir) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const parsed = matter(content);
  const stats = fs.statSync(filepath);
  
  const filename = path.basename(filepath);
  const relativePath = path.relative(baseDir, filepath);
  const id = relativePath.replace(/\\/g, '/').replace(/\.md$/, '').toLowerCase().replace(/\s+/g, '-');
  
  return {
    id,
    filename,
    title: parsed.data.title || filename.replace('.md', ''),
    content: parsed.content.trim(),
    created: parsed.data.created || stats.birthtime.toISOString(),
    modified: stats.mtime.toISOString(),
    author: parsed.data.by || parsed.data.author || 'Amukat',
    wordCount: parsed.content.trim().split(/\s+/).length,
    path: `/${relativePath.replace(/\\/g, '/')}`,
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
    status: parsed.data.status || 'published'
  };
}

// Scan ouchie directory for background images
function scanOuchieImages(articles) {
  if (!fs.existsSync(CONFIG.ouchieDir)) {
    console.log('⚠️  Ouchie directory not found, skipping image pairing');
    return [];
  }
  
  const imageFiles = fs.readdirSync(CONFIG.ouchieDir)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
  
  console.log(`🖼️  Found ${imageFiles.length} images in /ouchie/`);
  
  return imageFiles.map(imageFile => {
    // Simple pairing: article.md → article.jpg
    const baseName = imageFile.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    
    // Find matching article (case-insensitive, match filename only)
    const pairedArticle = articles.find(article => {
      const articleBase = article.filename.replace('.md', '');
      return baseName.toLowerCase() === articleBase.toLowerCase();
    });
    
    return {
      id: `ouchie-${baseName.toLowerCase().replace(/\s+/g, '-')}`,
      filename: imageFile,
      path: `/respengr/ouchie/${imageFile}`,
      pairedArticleId: pairedArticle ? pairedArticle.id : undefined
    };
  });
}

// Build folder tree with children
function buildFolderTree(articles, folders) {
  // Populate folder children
  folders.forEach(folder => {
    const folderPath = folder.path.replace(/^\//, '');
    
    // Find articles in this folder
    folder.children = articles
      .filter(article => {
        const articleDir = path.dirname(article.path.replace(/^\//, ''));
        return articleDir === folderPath;
      })
      .map(article => article.id);
  });
  
  // Remove empty folders
  return folders.filter(f => f.children.length > 0);
}

// Main processing function
function processRespEngr() {
  console.log('🔍 Scanning RespEngr vault...');
  console.log(`📂 Vault: ${CONFIG.vaultDir}`);
  
  if (!fs.existsSync(CONFIG.vaultDir)) {
    console.error(`❌ Vault directory not found: ${CONFIG.vaultDir}`);
    return;
  }
  
  // Scan vault for articles and folders
  const { articles, folders: rawFolders } = scanVault(CONFIG.vaultDir);
  
  console.log(`📄 Found ${articles.length} articles`);
  console.log(`📁 Found ${rawFolders.length} folders`);
  
  // Scan ouchie directory for images
  const ouchieImages = scanOuchieImages(articles);
  
  // Build folder tree
  const folders = buildFolderTree(articles, rawFolders);
  
  console.log(`📁 ${folders.length} folders with content`);
  
  // Build output data
  const outputData = {
    ouchieImages,
    articles,
    folders,
    meta: {
      generated: new Date().toISOString(),
      totalArticles: articles.length,
      totalImages: ouchieImages.length,
      totalFolders: folders.length,
      vaultPath: CONFIG.vaultDir
    }
  };
  
  // Write to JSON file
  ensureOutputDir();
  fs.writeFileSync(
    CONFIG.outputFile,
    JSON.stringify(outputData, null, 2),
    'utf-8'
  );
  
  console.log(`✅ Generated: ${CONFIG.outputFile}`);
  console.log(`📊 Stats: ${articles.length} articles, ${ouchieImages.length} images, ${folders.length} folders`);
  
  // Log pairing results
  const pairedCount = ouchieImages.filter(img => img.pairedArticleId).length;
  console.log(`🔗 Paired ${pairedCount} images with articles`);
  
  // Log orphan images (for randomization pool)
  const orphanCount = ouchieImages.length - pairedCount;
  if (orphanCount > 0) {
    console.log(`🎨 ${orphanCount} orphan images available for randomization`);
  }
}

// Watch mode
function watchDirectory() {
  console.log(`👁️  Watching vault for changes...`);
  
  // Watch vault root recursively
  fs.watch(CONFIG.vaultDir, { recursive: true }, (eventType, filename) => {
    if (filename) {
      // Ignore .obsidian and ouchie changes (unless it's an image)
      const shouldIgnore = CONFIG.ignorePatterns.some(pattern => {
        if (pattern === 'ouchie' && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
          return false; // Don't ignore ouchie image changes
        }
        return filename.startsWith(pattern);
      });
      
      if (!shouldIgnore && /\.(md|jpg|jpeg|png|gif|webp)$/i.test(filename)) {
        console.log(`\n🔄 Change detected: ${filename}`);
        setTimeout(() => processRespEngr(), 500); // Debounce
      }
    }
  });
}

// Run
try {
  processRespEngr();
  
  if (CONFIG.watchMode) {
    watchDirectory();
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}