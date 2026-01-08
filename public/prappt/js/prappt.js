/**
 * PrAPPt Portal JavaScript
 * Handles lesson loading, navigation, wikilinks, and progress tracking
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const STATE = {
  curriculum: null,
  currentLesson: null,
  completedLessons: new Set(),
  searchIndex: []
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadCurriculum();
  setupEventListeners();
  loadProgressFromStorage();
});

// ============================================================================
// CURRICULUM LOADING
// ============================================================================

async function loadCurriculum() {
  try {
    const response = await fetch('/prappt/api/curriculum.json');
    if (!response.ok) throw new Error('Failed to load curriculum');
     
    STATE.curriculum = await response.json();
    renderSidebar();
    buildSearchIndex();
    updateProgressDisplay();
     
    // Load lesson from URL hash if present
    const hash = window.location.hash.slice(1);
    if (hash) {
      loadLesson(hash);
    }
   
  } catch (error) {
    console.error('Error loading curriculum:', error);
    document.getElementById('lesson-nav').innerHTML =
       '<p class="nav-loading" style="color: #ef4444;">Failed to load curriculum. Please refresh.</p>';
  }
}

// ============================================================================
// SIDEBAR RENDERING
// ============================================================================

function renderSidebar() {
  const nav = document.getElementById('lesson-nav');
  const hierarchy = STATE.curriculum.hierarchy;
   
  let html = '';
   
  for (const [tier, lessons] of Object.entries(hierarchy)) {
    if (lessons.length === 0) continue;
     
    html += `
      <div class="tier-section">
        <div class="tier-header ${tier}" data-tier="${tier}">
          <span>${capitalizeFirst(tier)} (${lessons.length})</span>
          <span class="tier-toggle">▼</span>
        </div>
        <ul class="tier-lessons" data-tier="${tier}">
    `;
     
    lessons.forEach(lesson => {
      const isCompleted = STATE.completedLessons.has(lesson.id);
      const statusIcon = isCompleted ? '✓' : '';
       
      html += `
        <li class="lesson-item" data-lesson-id="${lesson.id}">
          <div class="lesson-item-content">
            <div class="lesson-title">${lesson.title}</div>
            <div class="lesson-time">${lesson.estimatedTime}</div>
          </div>
          <span class="lesson-status ${isCompleted ? 'completed' : ''}">${statusIcon}</span>
        </li>
      `;
    });
     
    html += `
        </ul>
      </div>
    `;
  }
   
  nav.innerHTML = html;
   
  // Attach lesson click handlers
  document.querySelectorAll('.lesson-item').forEach(item => {
    item.addEventListener('click', () => {
      const lessonId = item.dataset.lessonId;
      loadLesson(lessonId);
    });
  });
   
  // Attach tier toggle handlers
  document.querySelectorAll('.tier-header').forEach(header => {
    header.addEventListener('click', () => {
      const tier = header.dataset.tier;
      const lessonsList = document.querySelector(`.tier-lessons[data-tier="${tier}"]`);
      const toggle = header.querySelector('.tier-toggle');
       
      lessonsList.classList.toggle('collapsed');
      toggle.textContent = lessonsList.classList.contains('collapsed') ? '▶' : '▼';
    });
  });
}

// ============================================================================
// LESSON LOADING
// ============================================================================

async function loadLesson(lessonId) {
  showLoading();
   
  try {
    // Find lesson in curriculum
    const lesson = findLesson(lessonId);
    if (!lesson) {
      throw new Error(`Lesson ${lessonId} not found`);
    }
     
    // Fetch lesson content
    const response = await fetch(`/prappt/lessons/${lessonId}.md`);
    if (!response.ok) throw new Error('Lesson file not found');
     
    const markdown = await response.text();
    const { frontmatter, content } = parseFrontmatter(markdown);
     
    // Update state
    STATE.currentLesson = { ...lesson, ...frontmatter, content };
     
    // Update URL hash
    window.location.hash = lessonId;
     
    // Render lesson
    renderLesson();
     
    // Update sidebar active state
    updateSidebarActiveState(lessonId);
     
    // Hide welcome screen
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('lesson-body').style.display = 'block';
     
    hideLoading();
   
  } catch (error) {
    console.error('Error loading lesson:', error);
    hideLoading();
    alert('Failed to load lesson. Please try again.');
  }
}

function findLesson(lessonId) {
  for (const lessons of Object.values(STATE.curriculum.hierarchy)) {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

// ============================================================================
// MARKDOWN PARSING
// ============================================================================

function parseFrontmatter(markdown) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);
   
  if (!match) {
    return { frontmatter: {}, content: markdown };
  }
   
  const frontmatterText = match[1];
  const content = match[2];
   
  // Simple YAML parser for our needs
  const frontmatter = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      frontmatter[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
    }
  });
   
  return { frontmatter, content };
}

function markdownToHTML(markdown) {
  let html = markdown;
   
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
   
  // Wikilinks [[target]] or [[target|display]]
  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, target, display) => {
    const displayText = display || target;
    return `<a href="#" class="wikilink" data-target="${target}">${displayText}</a>`;
  });
   
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
   
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
   
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
   
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
   
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
   
  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.trim() && !para.startsWith('<')) {
      return `<p>${para.trim()}</p>`;
    }
    return para;
  }).join('\n');
   
  return html;
}

// ============================================================================
// LESSON RENDERING
// ============================================================================

function renderLesson() {
  const lesson = STATE.currentLesson;
   
  // Header
  document.getElementById('lesson-header').style.display = 'block';
  document.getElementById('current-lesson-breadcrumb').textContent = lesson.title;
  document.getElementById('lesson-title').textContent = lesson.title;
   
  const badge = document.getElementById('difficulty-badge');
  badge.textContent = capitalizeFirst(lesson.difficulty);
  badge.className = `difficulty-badge ${lesson.difficulty}`;
   
  document.getElementById('time-estimate').textContent = `⏱ ${lesson.estimatedTime}`;
  document.getElementById('last-updated').textContent = `Updated: ${lesson.updated ? new Date(lesson.updated).toLocaleDateString() : 'Recently'}`;
   
  // Content
  const contentHTML = markdownToHTML(lesson.content);
  document.getElementById('lesson-body').innerHTML = contentHTML;
   
  // Attach wikilink click handlers
  document.querySelectorAll('.wikilink').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      // Try to find and load the target lesson
      const targetLesson = findLessonByTitle(target) || findLesson(target);
      if (targetLesson) {
        loadLesson(targetLesson.id);
      } else {
        alert(`Concept "${target}" not yet available.`);
      }
    });
  });
   
  // Footer
  document.getElementById('lesson-footer').style.display = 'block';
  renderNavigationButtons();
  renderRelatedConcepts();
   
  // Scroll to top
  window.scrollTo(0, 0);
}

function findLessonByTitle(title) {
  for (const lessons of Object.values(STATE.curriculum.hierarchy)) {
    const lesson = lessons.find(l => 
       l.title.toLowerCase() === title.toLowerCase()
    );
    if (lesson) return lesson;
  }
  return null;
}

function renderNavigationButtons() {
  const prevBtn = document.getElementById('prev-lesson');
  const nextBtn = document.getElementById('next-lesson');
   
  const allLessons = getAllLessonsInOrder();
  const currentIndex = allLessons.findIndex(l => l.id === STATE.currentLesson.id);
   
  // Previous button
  if (currentIndex > 0) {
    prevBtn.disabled = false;
    prevBtn.textContent = `← ${allLessons[currentIndex - 1].title}`;
    prevBtn.onclick = () => loadLesson(allLessons[currentIndex - 1].id);
  } else {
    prevBtn.disabled = true;
    prevBtn.textContent = '← Previous Lesson';
  }
   
  // Next button
  if (currentIndex < allLessons.length - 1) {
    nextBtn.disabled = false;
    nextBtn.textContent = `${allLessons[currentIndex + 1].title} →`;
    nextBtn.onclick = () => loadLesson(allLessons[currentIndex + 1].id);
  } else {
    nextBtn.disabled = true;
    nextBtn.textContent = 'Next Lesson →';
  }
}

function renderRelatedConcepts() {
  // Placeholder - will be populated by LinkWeaver metadata
  const relatedList = document.getElementById('related-list');
  relatedList.innerHTML = '<li>Related concepts coming soon...</li>';
}

function getAllLessonsInOrder() {
  const lessons = [];
  const hierarchy = STATE.curriculum.hierarchy;
   
  ['foundation', 'intermediate', 'advanced', 'expert'].forEach(tier => {
    if (hierarchy[tier]) {
      lessons.push(...hierarchy[tier]);
    }
  });
   
  return lessons;
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

function loadProgressFromStorage() {
  const saved = localStorage.getItem('prappt_progress');
  if (saved) {
    STATE.completedLessons = new Set(JSON.parse(saved));
  }
}

function saveProgressToStorage() {
  localStorage.setItem('prappt_progress', JSON.stringify([...STATE.completedLessons]));
}

function markLessonComplete(lessonId) {
  STATE.completedLessons.add(lessonId);
  saveProgressToStorage();
  updateProgressDisplay();
   
  // Update sidebar
  const lessonItem = document.querySelector(`.lesson-item[data-lesson-id="${lessonId}"]`);
  if (lessonItem) {
    const status = lessonItem.querySelector('.lesson-status');
    status.classList.add('completed');
    status.textContent = '✓';
  }
}

function updateProgressDisplay() {
  const total = getAllLessonsInOrder().length;
  const completed = STATE.completedLessons.size;
  const percentage = total > 0 ? (completed / total * 100) : 0;
   
  document.getElementById('progress-fill').style.width = `${percentage}%`;
  document.getElementById('completed-count').textContent = completed;
  document.getElementById('total-count').textContent = total;
}

// ============================================================================
// SEARCH
// ============================================================================

function buildSearchIndex() {
  STATE.searchIndex = getAllLessonsInOrder().map(lesson => ({
    id: lesson.id,
    title: lesson.title.toLowerCase(),
    estimatedTime: lesson.estimatedTime
  }));
}

function performSearch(query) {
  if (!query) {
    renderSidebar(); // Reset to full list
    return;
  }
   
  const lowerQuery = query.toLowerCase();
  const results = STATE.searchIndex.filter(item => 
     item.title.includes(lowerQuery)
  );
   
  // Re-render sidebar with filtered results
  const nav = document.getElementById('lesson-nav');
   
  if (results.length === 0) {
    nav.innerHTML = '<p class="nav-loading">No lessons found.</p>';
    return;
  }
   
  let html = '<ul class="tier-lessons" style="display: block;">';
  results.forEach(result => {
    const fullLesson = findLesson(result.id);
    html += `
      <li class="lesson-item" data-lesson-id="${result.id}">
        <div class="lesson-item-content">
          <div class="lesson-title">${fullLesson.title}</div>
          <div class="lesson-time">${fullLesson.estimatedTime}</div>
        </div>
      </li>
    `;
  });
  html += '</ul>';
   
  nav.innerHTML = html;
   
  // Re-attach click handlers
  document.querySelectorAll('.lesson-item').forEach(item => {
    item.addEventListener('click', () => {
      loadLesson(item.dataset.lessonId);
    });
  });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Mobile menu toggle
  const menuBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
   
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    menuBtn.classList.toggle('active');
  });
   
  // Close sidebar when clicking on main content (mobile)
  document.getElementById('main-content').addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('mobile-open');
      menuBtn.classList.remove('active');
    }
  });
   
  // Search
  const searchInput = document.getElementById('lesson-search');
  let searchTimeout;
   
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(e.target.value);
    }, 300);
  });
   
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+K or Cmd+K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

function updateSidebarActiveState(lessonId) {
  document.querySelectorAll('.lesson-item').forEach(item => {
    item.classList.remove('active');
  });
   
  const activeItem = document.querySelector(`.lesson-item[data-lesson-id="${lessonId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showLoading() {
  document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loading-overlay').style.display = 'none';
}