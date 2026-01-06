// scripts/osCatcher.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONFIG = {
  sourceDir: path.join(process.cwd(), 'public', 'respengr'),
  ouchieDir: path.join(process.cwd(), 'public', 'respengr', 'ouchie'),
  outputFile: path.join(process.cwd(), 'public', 'data', 'respengr.json'),
  watchMode: process.argv.includes('--watch')
};

// Ensure output directory exists
function ensureOutputDir() {
  const outputDir = path.dirname(CONFIG.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

// Scan directory for files
function scanDirectory() {
  // Scan root respengr directory for markdown files
  const rootFiles = fs.existsSync(CONFIG.sourceDir) ? fs.readdirSync(CONFIG.sourceDir) : [];
  const markdownFiles = rootFiles.filter(f => f.endsWith('.md'));
  
  // Scan ouchie directory for images
  const ouchieFiles = fs.existsSync(CONFIG.ouchieDir) ? fs.readdirSync(CONFIG.ouchieDir) : [];
  const imageFiles = ouchieFiles.filter(f => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
  );
  
  return { markdownFiles, imageFiles };
}

// Parse markdown file with frontmatter
function parseMarkdown(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const parsed = matter(content);
  const stats = fs.statSync(filepath);
  
  const filename = path.basename(filepath);
  const id = filename.replace(/\.md$/, '').toLowerCase().replace(/\s+/g, '-');
  
  // Parse custom date format (YYMMDDHHMM)
  function parseCustomDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    // Handle format like "2601061448" (YYMMDDHHMM)
    if (dateStr.length === 10 && /^\d+$/.test(dateStr)) {
      const year = 2000 + parseInt(dateStr.substring(0, 2));
      const month = parseInt(dateStr.substring(2, 4)) - 1; // JS months are 0-indexed
      const day = parseInt(dateStr.substring(4, 6));
      const hour = parseInt(dateStr.substring(6, 8));
      const minute = parseInt(dateStr.substring(8, 10));
      
      return new Date(year, month, day, hour, minute).toISOString();
    }
    
    // Try to parse as regular date
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }
  
  const createdDate = parseCustomDate(parsed.data.CREATED) || 
                     parseCustomDate(parsed.data.created) || 
                     stats.birthtime.toISOString();
                     
  const modifiedDate = parseCustomDate(parsed.data.UPDATED) || 
                      parseCustomDate(parsed.data.updated) || 
                      stats.mtime.toISOString();
  
  return {
    id,
    filename,
    title: parsed.data.TITLE || parsed.data.title || filename.replace('.md', ''),
    content: parsed.content.trim(),
    created: createdDate,
    modified: modifiedDate,
    author: parsed.data.BY || parsed.data.by || parsed.data.author || 'Amukat',
    wordCount: parsed.content.trim().split(/\s+/).length,
    path: `/${filename}`,
    tags: parsed.data.tags || ['respengr'],
    status: parsed.data.status || 'published'
  };
}

// Pair images with articles based on filename matching
function pairImagesWithArticles(imageFiles, articles) {
  return imageFiles.map(imageFile => {
    const baseName = imageFile.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    
    // Find matching article (case-insensitive)
    const pairedArticle = articles.find(article => {
      const articleBase = article.filename.replace('.md', '');
      return baseName.toLowerCase() === articleBase.toLowerCase();
    });
    
    const id = baseName.toLowerCase().replace(/\s+/g, '-');
    
    return {
      id: `ouchie-${id}`,
      filename: imageFile,
      path: `/respengr/ouchie/${imageFile}`,
      pairedArticleId: pairedArticle ? pairedArticle.id : undefined
    };
  });
}

// Generate folders based on date/category
function generateFolders(articles) {
  const folderMap = new Map();
  
  articles.forEach(article => {
    // Group by year-month
    const date = new Date(article.created);
    const folderName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!folderMap.has(folderName)) {
      folderMap.set(folderName, {
        id: `folder-${folderName}`,
        name: folderName,
        path: `/${folderName}`,
        children: []
      });
    }
    
    folderMap.get(folderName).children.push(article.id);
  });
  
  return Array.from(folderMap.values());
}

// Main processing function
function processRespEngr() {
  console.log('🔍 Scanning RespEngr workspace...');
  
  if (!fs.existsSync(CONFIG.sourceDir)) {
    console.error(`❌ Source directory not found: ${CONFIG.sourceDir}`);
    console.log('📁 Creating directory structure...');
    fs.mkdirSync(CONFIG.sourceDir, { recursive: true });
    fs.mkdirSync(CONFIG.ouchieDir, { recursive: true });
    return;
  }
  
  const { markdownFiles, imageFiles } = scanDirectory();
  
  console.log(`📄 Found ${markdownFiles.length} articles`);
  console.log(`🖼️  Found ${imageFiles.length} images`);
  
  // Parse all markdown files
  const articles = markdownFiles.map(file => {
    const filepath = path.join(CONFIG.sourceDir, file);
    return parseMarkdown(filepath);
  });
  
  // Pair images with articles
  const ouchieImages = pairImagesWithArticles(imageFiles, articles);
  
  // Generate folder structure
  const folders = generateFolders(articles);
  
  // Build output data
  const outputData = {
    ouchieImages,
    articles,
    folders,
    meta: {
      generated: new Date().toISOString(),
      totalArticles: articles.length,
      totalImages: imageFiles.length,
      totalFolders: folders.length
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
  console.log(`📊 Stats: ${articles.length} articles, ${imageFiles.length} images, ${folders.length} folders`);
  
  // Log pairing results
  const pairedCount = ouchieImages.filter(img => img.pairedArticleId).length;
  console.log(`🔗 Paired ${pairedCount} images with articles`);
}

// Watch mode
function watchDirectory() {
  console.log(`👁️  Watching ${CONFIG.sourceDir} for changes...`);
  
  fs.watch(CONFIG.sourceDir, { recursive: true }, (eventType, filename) => {
    if (filename && /\.(md|jpg|jpeg|png|gif|webp)$/i.test(filename)) {
      console.log(`\n🔄 Change detected: ${filename}`);
      setTimeout(() => processRespEngr(), 100); // Small delay to ensure file is written
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
  process.exit(1);
}