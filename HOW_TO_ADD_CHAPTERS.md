# 📖 अध्याय कसरी थप्ने / सम्पादन गर्ने

## File naming
प्रत्येक किताबको एउटा JSON file छ:
- `nep1_1.json` = प्रथम वर्ष, नेपाली साहित्य १
- `nep1_2.json` = प्रथम वर्ष, नेपाली साहित्य २
- `san2_1.json` = द्वितीय वर्ष, संस्कृत साहित्य १
- आदि...

## Format
```json
{
  "chapters": [
    {
      "id": 1,
      "title": "अध्याय १ — शीर्षक",
      "content": "## heading\n\nपाठ यहाँ।\n\n**bold** र *italic*"
    }
  ]
}
```

## Markdown shortcuts
| लेख्नुस् | देखिन्छ |
|---------|---------|
| `**text**` | **bold** |
| `*text*` | *italic* |
| `## heading` | ठूलो शीर्षक |
| `- item` | bullet list |
| `> quote` | उद्धरण |

## GitHub मा कसरी edit गर्ने
1. GitHub repository खोल्नुस्
2. `data/chapters/` folder मा जानुस्
3. किताबको file मा click गर्नुस् (जस्तै `nep1_1.json`)
4. ✏️ Edit (pencil icon) थिच्नुस्
5. Content थप्नुस् / सम्पादन गर्नुस्
6. "Commit changes" थिच्नुस्

Website automatically update हुन्छ!
