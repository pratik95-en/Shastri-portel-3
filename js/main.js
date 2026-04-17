/* ============================================
   शास्त्री पोर्टल v2 — main.js
   ============================================ */
'use strict';

/* ── App State ── */
const App = {
  page: 'home',
  yearId: null,
  subjectId: null,
  theme: localStorage.getItem('sp_theme') || 'light',
  fontSize: +localStorage.getItem('sp_fontsize') || 16,
  notes: JSON.parse(localStorage.getItem('sp_notes') || '[]'),
  chapters: JSON.parse(localStorage.getItem('sp_chapters') || '{}'),
  bookmarks: JSON.parse(localStorage.getItem('sp_bookmarks') || '[]'),
  history: JSON.parse(localStorage.getItem('sp_history') || '[]'),
  progress: JSON.parse(localStorage.getItem('sp_progress') || '{}'),
  editNoteId: null,
  newsIdx: 0,
  data: null,
};

/* ── Boot ── */
// Apply theme immediately to prevent flash
(function() {
  var t = localStorage.getItem('sp_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();

document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(App.theme);
  applyFontSize(App.fontSize);
  await loadData();
  renderHome();
  startClock();
  initSearch();
  initNews();
  initNavigation();
  initNotes();
  initSettings();
  initSwipe();
});

/* ── Data ── */
async function loadData() {
  try {
    const r = await fetch('data/books.json');
    App.data = await r.json();
  } catch {
    App.data = buildFallback();
  }
}

function buildFallback() {
  const mkBooks = (prefix, label, count) =>
    Array.from({ length: count }, (_, i) => ({
      id: `${prefix}_${i+1}`,
      title: `${label} ${['१','२','३'][i]}`,
      author: 'लेखकको नाम',
      cover: '', description: `${label} — विवरण यहाँ राख्नुस्`, pdf: ''
    }));
  const mkYear = (id, title, sub, color) => ({
    id, title, subtitle: sub, color,
    subjects: {
      nepali:   mkBooks(`nep${id}`, 'नेपाली साहित्य', 3),
      english:  mkBooks(`eng${id}`, 'English Literature', 3),
      sanskrit: mkBooks(`san${id}`, 'संस्कृत साहित्य', 3),
      vyakaran: mkBooks(`vya${id}`, 'व्याकरण', 2),
      jyotish:  mkBooks(`jyo${id}`, 'ज्योतिष शास्त्र', 2),
    }
  });
  return {
    years: [
      mkYear(1,'प्रथम वर्ष','पहिलो वर्ष','orange'),
      mkYear(2,'द्वितीय वर्ष','दोस्रो वर्ष','green'),
      mkYear(3,'तृतीय वर्ष','तेस्रो वर्ष','blue'),
      mkYear(4,'चतुर्थ वर्ष','चौथो वर्ष','purple'),
    ],
    news: [
      {id:1,title:'शास्त्री पोर्टलमा स्वागत!',content:'सबै विद्यार्थीहरूलाई यस नयाँ पोर्टलमा हार्दिक स्वागत छ।',date:'२०८१-०२-०१',category:'कार्यक्रम'},
      {id:2,title:'परीक्षाको तयारी सुरु',content:'यस वर्षको शास्त्री परीक्षाको तयारी सुरु भएको छ।',date:'२०८१-०१-२०',category:'परीक्षा'},
      {id:3,title:'छात्रवृत्ति आवेदन खुल्यो',content:'मेधावी विद्यार्थीहरूका लागि छात्रवृत्तिको आवेदन खुलेको छ।',date:'२०८१-०१-१०',category:'छात्रवृत्ति'},
      {id:4,title:'संस्कृत सेमिनार',content:'आगामी महिनामा राष्ट्रिय संस्कृत सेमिनार हुनेछ।',date:'२०८०-१२-२५',category:'कार्यक्रम'},
      {id:5,title:'नयाँ पाठ्यक्रम',content:'यस शैक्षिक सत्रदेखि नयाँ पाठ्यक्रम लागू हुने भएको छ।',date:'२०८०-१२-१५',category:'पाठ्यक्रम'},
    ]
  };
}

/* ── Theme ── */
function applyTheme(t) {
  App.theme = t;
  // Set on both html element AND body for maximum coverage
  document.documentElement.setAttribute('data-theme', t);
  document.body.setAttribute('data-theme', t);
  localStorage.setItem('sp_theme', t);
  
  // Update button icon
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
  
  // Update toggle
  const tog = document.getElementById('darkToggle');
  if (tog) tog.classList.toggle('on', t === 'dark');
  
  // Force repaint on bg-mesh for ::before pseudo-element (CSS variable doesn't auto-trigger)
  const mesh = document.querySelector('.bg-mesh');
  if (mesh) {
    mesh.style.display = 'none';
    void mesh.offsetHeight; // trigger reflow
    mesh.style.display = '';
  }
}

function applyFontSize(sz) {
  App.fontSize = sz;
  document.documentElement.style.fontSize = sz + 'px';
  localStorage.setItem('sp_fontsize', sz);
  const sl = document.getElementById('fontSlider');
  if (sl) sl.value = sz;
  const lbl = document.getElementById('fontSizeLbl');
  if (lbl) lbl.textContent = sz + 'px';
}

/* ── Clock ── */
function startClock() {
  tick(); setInterval(tick, 1000);
}
function tick() {
  const now = new Date();
  const timeEl = document.getElementById('dtTime');
  const dateEl = document.getElementById('dtDate');
  const bsEl   = document.getElementById('dtBS');
  if (timeEl) {
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    timeEl.textContent = `${h}:${m}:${s}`;
  }
  if (dateEl) {
    const days = ['आइत','सोम','मङ्गल','बुध','बिही','शुक्र','शनि'];
    const months = ['जनवरी','फेब्रुअरी','मार्च','अप्रिल','मई','जुन','जुलाई','अगस्ट','सेप्टेम्बर','अक्टोबर','नोभेम्बर','डिसेम्बर'];
    dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  }
  if (bsEl) bsEl.textContent = adToBs(now);
}

function adToBs(d) {
  const bsYear = d.getFullYear() + (d.getMonth() < 3 || (d.getMonth()===3 && d.getDate()<14) ? 56 : 57);
  const nepMonths = ['बैशाख','जेठ','असार','श्रावण','भाद्र','आश्विन','कार्तिक','मंसिर','पुष','माघ','फागुन','चैत्र'];
  return toNep(bsYear) + ' ' + nepMonths[(d.getMonth()+8)%12];
}
function toNep(n) { return String(n).replace(/[0-9]/g, d => '०१२३४५६७८९'[d]); }

/* ── Navigation ── */
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => go(el.dataset.page));
  });
}

function go(page, data = {}) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('on'));

  const pg = document.getElementById('p-' + page);
  if (pg) { pg.classList.add('on'); App.page = page; }

  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (nav) nav.classList.add('on');

  if (page === 'year' && data.yearId) {
    App.yearId = data.yearId;
    renderYearPage(data.yearId);
  } else if (page === 'subject' && data.subjectId) {
    App.subjectId = data.subjectId;
    App.yearId = data.yearId;
    renderSubjectPage(data.subjectId, data.yearId);
  } else if (page === 'notes') {
    renderNotes();
  } else if (page === 'profile') {
    renderProfile();
  } else if (page === 'courses') {
    renderCourses('all');
  }
  window.scrollTo(0, 0);
}
window.go = go;

/* ── Home ── */
function renderHome() {
  if (!App.data) return;
  const grid = document.getElementById('yearsGrid');
  if (!grid) return;
  grid.innerHTML = App.data.years.map((yr, i) => {
    const total = Object.values(yr.subjects).reduce((a,b) => a+b.length, 0);
    const pct = getYearProgress(yr.id);
    return `
    <a class="year-card yc-${yr.color} s${i+1}" onclick="go('year',{yearId:${yr.id}});return false;" href="#">
      <div class="yc-glass"></div><div class="yc-blob1"></div><div class="yc-blob2"></div><div class="yc-glare"></div>
      <div class="yc-content">
        <div class="yc-title">${yr.title}</div>
        <div class="yc-sub">${yr.subtitle}</div>
        <div class="yc-badges">
          <span class="yc-badge">📚 ${total}</span>
          <span class="yc-badge">🕉️</span>
          <span class="yc-badge">⭐</span>
          ${pct > 0 ? `<span class="yc-badge">${pct}%</span>` : ''}
        </div>
      </div>
      <div class="yc-arrow">›</div>
    </a>`;
  }).join('');
  renderTicker();
  renderNewsCards();
}

function getYearProgress(yearId) {
  const yr = App.data.years.find(y => y.id === yearId);
  if (!yr) return 0;
  let read = 0, total = 0;
  Object.values(yr.subjects).forEach(books => {
    books.forEach(b => {
      total++;
      const chs = App.chapters[b.id] || [];
      if (chs.length > 0 || App.bookmarks.includes(b.id)) read++;
    });
  });
  return total ? Math.round((read/total)*100) : 0;
}

/* ── Ticker ── */
function renderTicker() {
  const el = document.getElementById('tickerInner');
  if (!el || !App.data?.news?.length) return;
  const dbl = [...App.data.news, ...App.data.news];
  el.innerHTML = dbl.map(n =>
    `<span class="ticker-item" onclick="openNews(${n.id})">${n.title}</span>`
  ).join('');
}

/* ── News Cards ── */
function renderNewsCards() {
  const track = document.getElementById('newsTrack');
  const dotsEl = document.getElementById('newsDots');
  if (!track || !App.data?.news?.length) return;
  const catCls = {परीक्षा:'cat-exam',पाठ्यक्रम:'cat-course',छात्रवृत्ति:'cat-schol',कार्यक्रम:'cat-event',कार्यशाला:'cat-work'};
  track.innerHTML = App.data.news.map(n => `
    <div class="news-card" onclick="openNews(${n.id})">
      <div class="nc-top">
        <span class="nc-cat ${catCls[n.category]||'cat-event'}">${n.category}</span>
        <span class="nc-date">${n.date}</span>
      </div>
      <div class="nc-title">${n.title}</div>
      <div class="nc-body">${n.content}</div>
    </div>`).join('');
  dotsEl.innerHTML = App.data.news.map((_,i) =>
    `<div class="nd${i===0?' on':''}" onclick="setNews(${i})"></div>`
  ).join('');
}

function initNews() { setInterval(() => { if (App.data?.news) setNews((App.newsIdx+1)%App.data.news.length); }, 4500); }

function setNews(idx) {
  App.newsIdx = idx;
  const track = document.getElementById('newsTrack');
  if (!track || !track.children.length) return;
  const w = track.children[0].offsetWidth + 12;
  track.style.transform = `translateX(-${idx*w}px)`;
  document.querySelectorAll('.nd').forEach((d,i) => d.classList.toggle('on', i===idx));
}
window.setNews = setNews;

function openNews(id) {
  const n = App.data?.news?.find(x => x.id===id);
  if (!n) return;
  document.getElementById('newsModalTitle').textContent = n.title;
  document.getElementById('newsModalDate').textContent = n.date;
  document.getElementById('newsModalBody').textContent = n.content;
  openOverlay('newsModal');
}
window.openNews = openNews;

function initSwipe() {
  const el = document.getElementById('newsOverflow');
  if (!el) return;
  let sx = 0;
  el.addEventListener('touchstart', e => sx = e.touches[0].clientX, {passive:true});
  el.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40 && App.data?.news) {
      const t = App.data.news.length;
      setNews(dx > 0 ? (App.newsIdx+1)%t : (App.newsIdx-1+t)%t);
    }
  }, {passive:true});
}

/* ── Year Page ── */
const SUBJ = {
  nepali:   {label:'नेपाली साहित्य', icon:'📜', g:'#FFE0B2,#FF8A65'},
  english:  {label:'English Literature', icon:'📗', g:'#C8E6C9,#43A047'},
  sanskrit: {label:'संस्कृत साहित्य', icon:'🕉️', g:'#D1C4E9,#7B1FA2'},
  vyakaran: {label:'व्याकरण', icon:'✏️', g:'#BBDEFB,#1565C0'},
  jyotish:  {label:'ज्योतिष शास्त्र', icon:'⭐', g:'#FFF9C4,#F57F17'},
};

function renderYearPage(yearId) {
  const yr = App.data.years.find(y => y.id===yearId);
  if (!yr) return;
  const clr = {orange:'yc-orange',green:'yc-green',blue:'yc-blue',purple:'yc-purple'};
  const el = document.getElementById('p-year');
  el.innerHTML = `
  <div class="content">
    <a class="back-btn" onclick="go('home');return false;" href="#">← फिर्ता</a>
    <div class="yr-pg-head ${clr[yr.color]||'yc-orange'} s1" style="position:relative;overflow:hidden">
      <div class="yc-glass"></div><div class="yc-glare"></div>
      <div style="position:relative;z-index:2">
        <div class="yr-pg-title">${yr.title}</div>
        <div class="yr-pg-sub">${yr.subtitle} • ${Object.values(yr.subjects).reduce((a,b)=>a+b.length,0)} विषय</div>
        <div class="reading-bar" style="margin-top:12px"><div class="reading-fill" style="width:${getYearProgress(yearId)}%"></div></div>
        <div class="reading-lbl">${getYearProgress(yearId)}% पूरा भयो</div>
      </div>
    </div>
    ${Object.entries(yr.subjects).map(([key,books]) => {
      const s = SUBJ[key]||{label:key,icon:'📚',g:'#E0E0E0,#9E9E9E'};
      return `
      <div class="subj-group">
        <div class="subj-group-head">
          <div class="subj-group-icon">${s.icon}</div>
          ${s.label}
        </div>
        <div class="books-grid">
          ${books.map(b => renderBookCard(b, yr.id, key)).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderBookCard(b, yearId, key) {
  const s = SUBJ[key]||{icon:'📚',g:'#E0E0E0,#9E9E9E'};
  const [c1,c2] = s.g.split(',');
  const chs = App.chapters[b.id]||[];
  const pct = getBookProgress(b.id);
  const isBm = App.bookmarks.includes(b.id);
  return `
  <a class="book-card" onclick="go('subject',{subjectId:'${b.id}',yearId:${yearId}});return false;" href="#">
    <div class="book-cover" style="background:linear-gradient(135deg,${c1},${c2})">
      <span style="font-size:30px;position:relative;z-index:1">${s.icon}</span>
      <span class="book-cover-lbl" style="position:relative;z-index:1">COVER</span>
      ${isBm ? '<span style="position:absolute;top:8px;right:8px;z-index:2;font-size:14px">🔖</span>' : ''}
    </div>
    <div class="book-info">
      <div class="book-title">${b.title}</div>
      <div class="book-author">${b.author}</div>
      ${chs.length > 0 ? `
        <div class="book-progress">
          <div class="book-progress-bar" style="width:${pct}%"></div>
        </div>
        <div class="book-progress-lbl">${chs.length} अध्याय • ${pct}%</div>` : ''}
    </div>
  </a>`;
}

function getBookProgress(bookId) {
  const chs = App.chapters[bookId]||[];
  if (!chs.length) return 0;
  const done = chs.filter(c => c.content && c.content.trim().length > 10).length;
  return Math.round((done/chs.length)*100);
}

/* ── Subject Page ── */
function renderSubjectPage(subjectId, yearId) {
  const yr = App.data.years.find(y => y.id===yearId);
  if (!yr) return;
  let book=null, key=null;
  for (const [k,books] of Object.entries(yr.subjects)) {
    const f = books.find(b => b.id===subjectId);
    if (f) { book=f; key=k; break; }
  }
  if (!book) return;

  // Track history
  addHistory(book, yr);

  const s = SUBJ[key]||{icon:'📚',g:'#E0E0E0,#9E9E9E',label:key};
  const [c1,c2] = s.g.split(',');
  const isBm = App.bookmarks.includes(book.id);
  const pct = getBookProgress(book.id);

  const el = document.getElementById('p-subject');
  el.innerHTML = `
  <div class="content">
    <a class="back-btn" onclick="go('year',{yearId:${yearId}});return false;" href="#">← ${yr.title}</a>
    
    <div class="subj-hero" style="background:linear-gradient(135deg,${c1},${c2})">
      <span class="subj-hero-emoji">${s.icon}</span>
      <div class="subj-hero-overlay">
        <div class="subj-hero-info">
          <div class="subj-hero-title">${book.title}</div>
          <div class="subj-hero-meta">${s.label} • ${yr.title}</div>
        </div>
        <span class="bm-ico" onclick="toggleBookmark('${book.id}')" title="Bookmark" style="margin-left:auto;font-size:24px">${isBm?'🔖':'🏷️'}</span>
      </div>
    </div>

    ${pct > 0 ? `<div class="reading-bar"><div class="reading-fill" style="width:${pct}%"></div></div><div class="reading-lbl">अध्याय: ${pct}% पूरा</div>` : ''}

    <div class="tabs-pill">
      <button class="tab-btn on" onclick="switchTab(this,'tab-overview')">विवरण</button>
      <button class="tab-btn" onclick="switchTab(this,'tab-chapters')">अध्यायहरू</button>
      <button class="tab-btn" onclick="switchTab(this,'tab-notes')">नोट</button>
    </div>

    <div id="tab-overview" class="tab-pane on">
      <div class="info-card">
        <h3>📖 किताबको बारेमा</h3>
        <p>${book.description||'विवरण यहाँ राख्नुस्।'}</p>
      </div>
      <div class="info-card">
        <h3>👨‍🏫 लेखक</h3><p>${book.author}</p>
      </div>
      <div class="info-card">
        <h3>🏫 विषय</h3><p>${s.label} — ${yr.title}</p>
      </div>
      <button class="add-chapter-btn" onclick="switchTab(document.querySelector('.tabs-pill .tab-btn:nth-child(2)'),'tab-chapters')">
        ➕ अध्याय हेर्नुस् / थप्नुस्
      </button>
    </div>

    <div id="tab-chapters" class="tab-pane">
      <div id="chaptersList"></div>
      <button class="add-chapter-btn" onclick="addChapter('${book.id}')">➕ नयाँ अध्याय थप्नुस्</button>
    </div>

    <div id="tab-notes" class="tab-pane">
      <div id="bookNotesList"></div>
      <button class="add-chapter-btn" onclick="openNoteModalFor('${book.title}')">➕ यो किताबको नोट थप्नुस्</button>
    </div>
  </div>`;

  renderChaptersList(book.id); // async - loads from JSON file
  renderBookNotes(book.title);
}

function switchTab(btn, tabId) {
  const parent = btn.closest('.content')||document;
  parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
  parent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  const pane = document.getElementById(tabId);
  if (pane) pane.classList.add('on');
}
window.switchTab = switchTab;

/* ── Chapters ── */
// Chapter data: loaded from data/chapters/{bookId}.json
// User edits saved to localStorage (overrides file)
// To permanently save: edit the JSON file directly on GitHub

async function loadChaptersForBook(bookId) {
  // Check localStorage first (user's saved edits win)
  if (App.chapters[bookId]) return App.chapters[bookId];
  // Try loading from JSON file
  try {
    const r = await fetch(`data/chapters/${bookId}.json`);
    if (!r.ok) return [];
    const data = await r.json();
    // Store in memory (not overwriting localStorage unless user edits)
    App.chaptersFromFile = App.chaptersFromFile || {};
    App.chaptersFromFile[bookId] = data.chapters || [];
    return data.chapters || [];
  } catch {
    return [];
  }
}

function getChapters(bookId) {
  // localStorage edits take priority over file
  if (App.chapters[bookId]) return App.chapters[bookId];
  // Return from file cache
  return (App.chaptersFromFile && App.chaptersFromFile[bookId]) || [];
}

function saveChapters(bookId, chs) {
  App.chapters[bookId] = chs;
  localStorage.setItem('sp_chapters', JSON.stringify(App.chapters));
}

async function renderChaptersList(bookId) {
  const el = document.getElementById('chaptersList');
  if (!el) return;
  el.innerHTML = '<div class="spin-wrap"><div class="spinner"></div></div>';
  const chs = await loadChaptersForBook(bookId);
  if (!chs.length) {
    el.innerHTML = '<div class="empty"><div class="empty-ico">📖</div><div class="empty-t">अध्याय छैन</div><div class="empty-s">तल बटन थिचेर अध्याय थप्नुस्</div></div>';
    return;
  }
  el.innerHTML = chs.map((ch, i) => `
    <div class="chapter-item" id="ch-${bookId}-${i}">
      <div class="chapter-head" onclick="toggleChapter('${bookId}',${i})">
        <div class="ch-num">${toNep(i+1)}</div>
        <div class="ch-title-text">${ch.title||'अध्याय '+(i+1)}</div>
        <div class="ch-actions">
          <button class="ch-act-btn del" onclick="deleteChapter('${bookId}',${i});event.stopPropagation()">🗑️</button>
          <span style="font-size:14px;color:var(--text-3)">▾</span>
        </div>
      </div>
      <div class="chapter-body" id="chbody-${bookId}-${i}">
        <div class="editor-mode-btns">
          <button class="mode-btn on" onclick="setEditorMode('${bookId}',${i},'write')">✏️ लेख्नुस्</button>
          <button class="mode-btn" onclick="setEditorMode('${bookId}',${i},'preview')">👁️ हेर्नुस्</button>
        </div>
        <div class="editor-toolbar">
          <button class="tb-btn" onclick="insertMd('${bookId}',${i},'**','**')"><b>B</b></button>
          <button class="tb-btn" onclick="insertMd('${bookId}',${i},'*','*')"><i>I</i></button>
          <button class="tb-btn" onclick="insertMd('${bookId}',${i},'## ','')">H2</button>
          <button class="tb-btn" onclick="insertMd('${bookId}',${i},'### ','')">H3</button>
          <button class="tb-btn" onclick="insertMd('${bookId}',${i},'- ','')">• सूची</button>
          <button class="tb-btn" onclick="insertMd('${bookId}',${i},'> ','')">❝ उद्धरण</button>
        </div>
        <textarea class="ch-editor" id="ched-${bookId}-${i}"
          placeholder="यहाँ अध्यायको सामग्री लेख्नुस्... (Markdown सपोर्ट)"
          oninput="autoSaveChapter('${bookId}',${i})"
        >${ch.content||''}</textarea>
        <div class="ch-preview" id="chprev-${bookId}-${i}">${renderMd(ch.content||'')}</div>
        <div class="ch-footer">
          <span class="ch-saved-lbl" id="chsaved-${bookId}-${i}">${ch.savedAt||''}</span>
          <button class="ch-save-btn" onclick="saveChapter('${bookId}',${i})">💾 सुरक्षित</button>
        </div>
      </div>
    </div>`).join('');
}

function toggleChapter(bookId, idx) {
  const body = document.getElementById(`chbody-${bookId}-${idx}`);
  if (body) body.classList.toggle('open');
}
window.toggleChapter = toggleChapter;

function addChapter(bookId) {
  const chs = getChapters(bookId).slice(); // copy
  chs.push({ id: chs.length+1, title: 'अध्याय ' + toNep(chs.length+1) + ' — शीर्षक राख्नुस्', content: '', savedAt: '' });
  saveChapters(bookId, chs);
  renderChaptersList(bookId);
  toast('नयाँ अध्याय थपियो ✓');
}
window.addChapter = addChapter;

function deleteChapter(bookId, idx) {
  const chs = getChapters(bookId);
  chs.splice(idx, 1);
  saveChapters(bookId, chs);
  renderChaptersList(bookId);
  toast('अध्याय मेटियो');
}
window.deleteChapter = deleteChapter;

let autoSaveTimers = {};
function autoSaveChapter(bookId, idx) {
  clearTimeout(autoSaveTimers[`${bookId}-${idx}`]);
  autoSaveTimers[`${bookId}-${idx}`] = setTimeout(() => saveChapter(bookId, idx, true), 1500);
  // live preview update
  const ed = document.getElementById(`ched-${bookId}-${idx}`);
  const prev = document.getElementById(`chprev-${bookId}-${idx}`);
  if (ed && prev && prev.classList.contains('on')) {
    prev.innerHTML = renderMd(ed.value);
  }
}
window.autoSaveChapter = autoSaveChapter;

function saveChapter(bookId, idx, silent=false) {
  const ed = document.getElementById(`ched-${bookId}-${idx}`);
  if (!ed) return;
  const chs = getChapters(bookId);
  if (!chs[idx]) return;
  chs[idx].content = ed.value;
  chs[idx].savedAt = new Date().toLocaleTimeString('ne-NP');
  saveChapters(bookId, chs);
  const savedEl = document.getElementById(`chsaved-${bookId}-${idx}`);
  if (savedEl) savedEl.textContent = '✓ ' + chs[idx].savedAt + ' मा सुरक्षित';
  if (!silent) toast('अध्याय सुरक्षित भयो ✓');
  // update progress
  saveProgress(bookId);
}
window.saveChapter = saveChapter;

function saveProgress(bookId) {
  App.progress[bookId] = getBookProgress(bookId);
  localStorage.setItem('sp_progress', JSON.stringify(App.progress));
}

function setEditorMode(bookId, idx, mode) {
  const ed   = document.getElementById(`ched-${bookId}-${idx}`);
  const prev = document.getElementById(`chprev-${bookId}-${idx}`);
  const body = document.getElementById(`chbody-${bookId}-${idx}`);
  if (!ed||!prev||!body) return;
  body.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('on'));
  const btn = mode==='write' ? body.querySelector('.mode-btn:first-child') : body.querySelector('.mode-btn:last-child');
  if (btn) btn.classList.add('on');
  if (mode==='write') {
    ed.style.display = 'block';
    prev.classList.remove('on');
  } else {
    prev.innerHTML = renderMd(ed.value);
    ed.style.display = 'none';
    prev.classList.add('on');
  }
}
window.setEditorMode = setEditorMode;

function insertMd(bookId, idx, before, after) {
  const ta = document.getElementById(`ched-${bookId}-${idx}`);
  if (!ta) return;
  const s = ta.selectionStart, e = ta.selectionEnd;
  const sel = ta.value.substring(s, e);
  ta.value = ta.value.substring(0,s) + before + sel + after + ta.value.substring(e);
  ta.selectionStart = s + before.length;
  ta.selectionEnd = e + before.length;
  ta.focus();
}
window.insertMd = insertMd;

/* ── Simple Markdown renderer ── */
function renderMd(text) {
  if (!text) return '<span style="color:var(--text-4)">सामग्री छैन</span>';
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid var(--orange);padding-left:10px;color:var(--text-2)">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');
}

/* ── Bookmark ── */
function toggleBookmark(bookId) {
  const idx = App.bookmarks.indexOf(bookId);
  if (idx > -1) App.bookmarks.splice(idx,1);
  else App.bookmarks.push(bookId);
  localStorage.setItem('sp_bookmarks', JSON.stringify(App.bookmarks));
  // re-render hero bookmark icon
  const bm = document.querySelector('.bm-ico');
  if (bm) bm.textContent = App.bookmarks.includes(bookId) ? '🔖' : '🏷️';
  toast(idx > -1 ? 'Bookmark हटाइयो' : 'Bookmark थपियो 🔖');
}
window.toggleBookmark = toggleBookmark;

/* ── History ── */
function addHistory(book, yr) {
  App.history = App.history.filter(h => h.id !== book.id);
  App.history.unshift({ id: book.id, title: book.title, year: yr.title, time: new Date().toLocaleString('ne-NP'), yearId: yr.id });
  if (App.history.length > 20) App.history = App.history.slice(0,20);
  localStorage.setItem('sp_history', JSON.stringify(App.history));
}

/* ── Search ── */
function initSearch() {
  const inp = document.getElementById('searchInp');
  const clr = document.getElementById('searchClr');
  const drop = document.getElementById('searchDrop');
  if (!inp) return;
  inp.addEventListener('input', () => {
    const q = inp.value.trim();
    clr.classList.toggle('show', q.length>0);
    if (q.length < 2) { drop.classList.remove('open'); return; }
    const res = doSearch(q);
    renderSearchDrop(res, q);
    drop.classList.add('open');
  });
  clr.addEventListener('click', () => { inp.value=''; clr.classList.remove('show'); drop.classList.remove('open'); inp.focus(); });
  document.addEventListener('click', e => { if (!e.target.closest('.search-glass')) drop.classList.remove('open'); });
}

function doSearch(q) {
  if (!App.data) return [];
  const ql = q.toLowerCase();
  const res = [];
  App.data.years.forEach(yr => {
    Object.entries(yr.subjects).forEach(([key,books]) => {
      books.forEach(b => {
        if (b.title.toLowerCase().includes(ql) || b.author.toLowerCase().includes(ql) || yr.title.includes(q)) {
          res.push({b, yr, key});
        }
      });
    });
  });
  return res.slice(0,7);
}

function renderSearchDrop(res, q) {
  const el = document.getElementById('searchDrop');
  if (!res.length) { el.innerHTML = `<div class="s-no-result">🔍 "${q}" भेटिएन</div>`; return; }
  el.innerHTML = res.map(({b,yr,key}) => {
    const s = SUBJ[key]||{icon:'📚',g:'#E0E0E0,#9E9E9E'};
    const [c1,c2] = s.g.split(',');
    return `
    <div class="s-result" onclick="go('subject',{subjectId:'${b.id}',yearId:${yr.id}});document.getElementById('searchDrop').classList.remove('open')">
      <div class="s-result-ico" style="background:linear-gradient(135deg,${c1},${c2})">${s.icon}</div>
      <div>
        <div class="s-result-name">${b.title}</div>
        <div class="s-result-sub">${yr.title} • ${b.author}</div>
      </div>
    </div>`;
  }).join('');
}

/* ── Notes ── */
function initNotes() {
  const fab = document.getElementById('notesFab');
  if (fab) fab.addEventListener('click', () => openNoteModal());
  document.getElementById('closeNoteModal').addEventListener('click', () => closeOverlay('noteModal'));
  document.getElementById('noteForm').addEventListener('submit', e => { e.preventDefault(); saveNote(); });
}

function renderNotes(filterSubj = '') {
  const el = document.getElementById('notesList');
  if (!el) return;
  let notes = App.notes;
  if (filterSubj) notes = notes.filter(n => n.subject===filterSubj);
  if (!notes.length) {
    el.innerHTML = '<div class="empty"><div class="empty-ico">📝</div><div class="empty-t">कुनै नोट छैन</div><div class="empty-s">+ बटन थिचेर नोट थप्नुस्</div></div>';
    return;
  }
  el.innerHTML = notes.map(n => `
    <div class="note-card">
      <div class="nc-head">
        <div class="nc-note-title">${n.title}</div>
        <div class="nc-note-actions">
          <button class="nc-note-btn" onclick="editNote('${n.id}')">✏️</button>
          <button class="nc-note-btn del" onclick="delNote('${n.id}')">🗑️</button>
        </div>
      </div>
      <div class="nc-note-body">${n.content}</div>
      <div class="nc-note-foot">
        <span class="nc-note-date">${n.date}</span>
        ${n.subject?`<span class="nc-note-tag">${n.subject}</span>`:''}
      </div>
    </div>`).join('');
}

function renderBookNotes(subjectTitle) {
  const el = document.getElementById('bookNotesList');
  if (!el) return;
  const notes = App.notes.filter(n => n.subject===subjectTitle);
  if (!notes.length) {
    el.innerHTML = '<div class="empty"><div class="empty-ico">📝</div><div class="empty-t">यो किताबको नोट छैन</div></div>';
    return;
  }
  el.innerHTML = notes.map(n => `
    <div class="note-card">
      <div class="nc-note-title">${n.title}</div>
      <div class="nc-note-body">${n.content}</div>
      <div class="nc-note-foot"><span class="nc-note-date">${n.date}</span></div>
    </div>`).join('');
}

function openNoteModal(subj='') {
  App.editNoteId = null;
  document.getElementById('noteMTitle').textContent = 'नयाँ नोट';
  document.getElementById('nTitle').value = '';
  document.getElementById('nContent').value = '';
  document.getElementById('nSubject').value = subj;
  openOverlay('noteModal');
}

function openNoteModalFor(subjectTitle) {
  openNoteModal(subjectTitle);
  go('notes');
}
window.openNoteModalFor = openNoteModalFor;

function closeNoteModal() { closeOverlay('noteModal'); }

function saveNote() {
  const title = document.getElementById('nTitle').value.trim();
  const content = document.getElementById('nContent').value.trim();
  const subject = document.getElementById('nSubject').value.trim();
  if (!title||!content) { toast('शीर्षक र सामग्री आवश्यक छ!'); return; }
  if (App.editNoteId) {
    const n = App.notes.find(x => x.id===App.editNoteId);
    if (n) Object.assign(n, {title, content, subject});
  } else {
    App.notes.unshift({ id: Date.now().toString(), title, content, subject, date: new Date().toLocaleDateString('ne-NP') });
  }
  localStorage.setItem('sp_notes', JSON.stringify(App.notes));
  closeOverlay('noteModal');
  renderNotes();
  toast('नोट सुरक्षित भयो ✓');
}

function editNote(id) {
  const n = App.notes.find(x => x.id===id);
  if (!n) return;
  App.editNoteId = id;
  document.getElementById('noteMTitle').textContent = 'नोट सम्पादन';
  document.getElementById('nTitle').value = n.title;
  document.getElementById('nContent').value = n.content;
  document.getElementById('nSubject').value = n.subject||'';
  openOverlay('noteModal');
}
window.editNote = editNote;

function delNote(id) {
  App.notes = App.notes.filter(n => n.id!==id);
  localStorage.setItem('sp_notes', JSON.stringify(App.notes));
  renderNotes();
  toast('नोट मेटियो');
}
window.delNote = delNote;

/* ── Courses ── */
function renderCourses(filter='all') {
  const el = document.getElementById('coursesList');
  if (!el || !App.data) return;
  document.querySelectorAll('.cf-chip').forEach(c => c.classList.toggle('on', c.dataset.key===filter));
  let html = '';
  App.data.years.forEach(yr => {
    Object.entries(yr.subjects).forEach(([key,books]) => {
      if (filter!=='all' && key!==filter) return;
      const s = SUBJ[key]||{icon:'📚',g:'#E0E0E0,#9E9E9E',label:key};
      const [c1,c2] = s.g.split(',');
      books.forEach(b => {
        const pct = getBookProgress(b.id);
        html += `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:8px;background:var(--glass-card);backdrop-filter:blur(20px);border:1px solid var(--glass-card-b);border-radius:var(--r-md);cursor:pointer;box-shadow:0 2px 10px var(--glass-shadow);transition:all 0.2s var(--ease-spring)"
             onclick="go('subject',{subjectId:'${b.id}',yearId:${yr.id}})"
             onmouseover="this.style.transform='translateX(4px)'"
             onmouseout="this.style.transform=''"
        >
          <div style="width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,${c1},${c2});display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${s.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:0.86rem;font-weight:700;color:var(--text-1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.title}</div>
            <div style="font-size:0.72rem;color:var(--text-3);margin-top:2px">${yr.title} • ${b.author}</div>
            ${pct>0?`<div style="height:3px;background:var(--border);border-radius:2px;margin-top:5px"><div style="height:100%;width:${pct}%;background:linear-gradient(to right,var(--orange),var(--orange-l));border-radius:2px"></div></div>`:''}
          </div>
          <span style="color:var(--text-3);font-size:18px">›</span>
        </div>`;
      });
    });
  });
  el.innerHTML = html || '<div class="empty"><div class="empty-ico">📭</div><div class="empty-t">भेटिएन</div></div>';
}
window.renderCourses = renderCourses;

/* ── Profile / Settings ── */
function renderProfile() {
  const tog = document.getElementById('darkToggle');
  if (tog) { tog.classList.toggle('on', App.theme==='dark'); tog.onclick = () => applyTheme(App.theme==='dark'?'light':'dark'); }
  const sl = document.getElementById('fontSlider');
  if (sl) { sl.value = App.fontSize; sl.oninput = () => { applyFontSize(+sl.value); document.getElementById('fontSizeLbl').textContent = sl.value+'px'; }; }
  renderStats();
  renderHistoryList();
}

function renderStats() {
  let totalBooks=0, totalChapters=0, totalNotes=App.notes.length, totalBookmarks=App.bookmarks.length;
  if (App.data) {
    App.data.years.forEach(yr => Object.values(yr.subjects).forEach(books => { totalBooks+=books.length; books.forEach(b => totalChapters+=(App.chapters[b.id]||[]).length); }));
  }
  const el = document.getElementById('statsGrid');
  if (el) el.innerHTML = `
    <div class="stat-card"><div class="stat-num">${totalBooks}</div><div class="stat-lbl">📚 किताबहरू</div></div>
    <div class="stat-card"><div class="stat-num">${totalChapters}</div><div class="stat-lbl">📖 अध्यायहरू</div></div>
    <div class="stat-card"><div class="stat-num">${totalNotes}</div><div class="stat-lbl">📝 नोटहरू</div></div>
    <div class="stat-card"><div class="stat-num">${totalBookmarks}</div><div class="stat-lbl">🔖 Bookmarks</div></div>`;
}

function renderHistoryList() {
  const el = document.getElementById('historyList');
  if (!el) return;
  if (!App.history.length) { el.innerHTML = '<div class="empty"><div class="empty-ico">🕐</div><div class="empty-t">इतिहास छैन</div></div>'; return; }
  el.innerHTML = App.history.slice(0,8).map(h => `
    <div class="history-item" onclick="go('subject',{subjectId:'${h.id}',yearId:${h.yearId}})">
      <span class="hi-ico">📖</span>
      <div><div class="hi-name">${h.title}</div><div class="hi-sub">${h.year}</div></div>
      <span class="hi-time">${h.time}</span>
    </div>`).join('');
}

function initSettings() {
  // Backup
  const expBtn = document.getElementById('exportBtn');
  if (expBtn) expBtn.addEventListener('click', exportData);
  const impInp = document.getElementById('importInp');
  if (impInp) impInp.addEventListener('change', importData);
  const clrBtn = document.getElementById('clearHistBtn');
  if (clrBtn) clrBtn.addEventListener('click', () => { App.history=[]; localStorage.setItem('sp_history','[]'); renderHistoryList(); toast('इतिहास सफा भयो'); });
}

function exportData() {
  const data = { notes: App.notes, chapters: App.chapters, bookmarks: App.bookmarks, history: App.history };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'shastri-backup-'+Date.now()+'.json';
  a.click();
  toast('Backup डाउनलोड भयो ✓');
}
window.exportData = exportData;

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const d = JSON.parse(ev.target.result);
      if (d.notes) { App.notes = d.notes; localStorage.setItem('sp_notes', JSON.stringify(d.notes)); }
      if (d.chapters) { App.chapters = d.chapters; localStorage.setItem('sp_chapters', JSON.stringify(d.chapters)); }
      if (d.bookmarks) { App.bookmarks = d.bookmarks; localStorage.setItem('sp_bookmarks', JSON.stringify(d.bookmarks)); }
      if (d.history) { App.history = d.history; localStorage.setItem('sp_history', JSON.stringify(d.history)); }
      toast('Backup import भयो ✓');
      renderProfile();
    } catch { toast('File गलत छ!'); }
  };
  reader.readAsText(file);
}

/* ── Overlay helpers ── */
function openOverlay(id) { document.getElementById(id).classList.add('open'); }
function closeOverlay(id) { document.getElementById(id).classList.remove('open'); }
window.openOverlay = openOverlay;
window.closeOverlay = closeOverlay;

/* ── Toast ── */
function toast(msg) {
  const t = document.getElementById('toastEl');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
window.toast = toast;

// Expose App for profile page
window.App = App;
window.applyTheme = applyTheme;
