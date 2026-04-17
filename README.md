# 📚 शास्त्री कक्षा पोर्टल v2

## ✨ नयाँ Features (v2)
- 🍎 iOS Glass Morphism UI (Dynamic Island, Frosted, Vision Pro)
- 📖 Chapter Editor — आफ्नै अध्याय लेख्नुस् (Write + Preview)
- **Bold**, *Italic*, Heading, List, Quote — Markdown support
- ⚡ Auto-save — 1.5 सेकेन्डमा automatically save
- 🔖 Bookmark — महत्वपूर्ण किताब mark गर्नुस्
- 📊 Progress Bar — कति पढ्यो देखाउने
- 🕐 Reading History — अन्तिम पटक कहाँ पढ्यो
- 📈 Stats — किताब, अध्याय, नोट, bookmark count
- 💾 Backup Export/Import — data JSON मा save/restore
- 🔤 Font Size Slider — आफ्नो आँखा अनुसार मिलाउनुस्
- 🌙 Night/Day Mode
- 🔍 Real-time Search
- 📰 Animated News Ticker + Swipe Cards

## 📁 Files
```
shastri-v2/
├── index.html          ← एउटै HTML file (सबै pages)
├── css/style.css       ← सम्पूर्ण design + glass effects
├── js/main.js          ← सम्पूर्ण features
├── data/books.json     ← किताबको data (यहाँ नाम/लेखक भर्नुस्)
├── images/year1-4/     ← cover photos राख्नुस्
└── manifest.json       ← PWA
```

## 🚀 GitHub Setup

### Step 1: Repository बनाउनुस्
github.com → "+" → New repository → `shastri-portal` → Public → Create

### Step 2: Files Upload
Repository → "Add file" → "Upload files" → सबै files drag & drop → Commit

### Step 3: GitHub Pages ON गर्नुस्
Settings → Pages → Branch: main → / (root) → Save

### Step 4: URL
`https://YourUsername.github.io/shastri-portal/`

## ✏️ किताब थप्न
`data/books.json` मा title, author, description भर्नुस्।

## 🖼️ Cover Photo थप्न
`images/year1/nep1.jpg` format मा राख्नुस् र books.json मा `"cover"` path दिनुस्।
