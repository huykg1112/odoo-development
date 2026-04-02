# 📦 ODOO WEBSITE SNIPPET: "THREE PART TEXT" 

## 🎯 Mục Đích

Xây dựng một snippet cho phép **tạo 1 đoạn văn hoàn chỉnh từ 3 phần nội dung riêng biệt**, trong đó **mỗi phần có thể được tùy chỉnh style riêng** (màu, kích thước, độ dày, italic, underline, etc.).

---

## ✨ Tính Năng Chính

✅ **3 Phần Nội Dung Độc Lập** - Đầu, Giữa, Cuối  
✅ **Tùy Chỉnh Style Riêng Cho Mỗi Phần** - Color, Font-Size, Font-Weight, Font-Style, Text-Decoration  
✅ **Edit Text Trực Tiếp** - Contenteditable inline  
✅ **Options Panel Đầy Đủ** - Tùy chỉnh via UI  
✅ **Bảo Toàn Formatting** - Inline styles được lưu  
✅ **Responsive Design** - Mobile, tablet, desktop friendly  

---

## 📂 Files Được Tạo

### Implementation Files (Code)
```
website/views/snippets/
└── s_three_part_text.xml

website/static/src/snippets/s_three_part_text/
├── 000.scss
└── 000.js
```

### Modified Files (Configuration)
```
website/
├── __manifest__.py (Modified)
└── views/snippets/snippets.xml (Modified)
```

### Documentation Files
```
docs/
├── ODOO_SNIPPET_THREE_PART_TEXT_QUICKSTART.md (5 min guide)
├── ODOO_SNIPPET_THREE_PART_TEXT_GUIDE.md (Full guide)
├── ODOO_SNIPPET_THREE_PART_TEXT_CODE.md (Code analysis)
└── ODOO_SNIPPET_THREE_PART_TEXT_SUMMARY.md (Complete summary)
```

---

## 🚀 Quick Start (5 Minutes)

### 1. Load Snippet
```
Website Editor → Snippet Picker → "Three Part Text" → Drag to page
```

### 2. Edit Text
```
Option A: Double-click text → Type → Ctrl+S
Option B: Options panel → Text Input field → Enter
```

### 3. Change Color
```
Options panel → Part X → "Text Color" → Pick color → Done!
```

### 4. Change Size/Weight/Style
```
Options panel → Part X → 
  "Font Size" / "Font Weight" / "Font Style" / "Text Decoration" →
  Select option → Applied!
```

### 5. General Settings
```
Scroll down → "General Settings" →
  "Text Alignment" / "Line Height" / "Padding" →
  Select option → Applied!
```

### 6. Save
```
Click "Save" button (top) → Snippet saved! ✨
```

---

## 💡 Usage Examples

### Example 1: Important Announcement
```
"VUI MỪNG THÔNG BÁO rằng chúng tôi đã đạt 1 triệu khách hàng."
└─────┬─────┘ └──────────────────┬────────────────────────┘
Phần 1              Phần 2 + 3
(Red, Bold, 20px)   (Blue, 16px)
```

### Example 2: Scientific Finding
```
"Nghiên cứu mới cho thấy uống cà phê tăng năng suất 30%."
└──────┬────┘ └─────────────────┬────────────────────┘
Phần 1         Phần 2 + 3
(Green, Bold)  (Black, Italic, Large)
```

---

## 🎨 Styling Options

| Feature | Values | Default |
|---------|--------|---------|
| **Text Color** | Any HEX/RGB color | Part1: #2d3748, Part2: #e53e3e, Part3: #3182ce |
| **Font Size** | 14px, 16px, 18px, 20px, 24px, 28px | Part1: 16px, Part2: 18px, Part3: 16px |
| **Font Weight** | 300, 400, 600, 700, 900 (Light to Black) | Part1/3: 400, Part2: 600 |
| **Font Style** | Normal, Italic | Part1/2/3: Normal |
| **Text Decoration** | None, Underline, Strike-through | All: None |
| **Text Align** | Left, Center, Right, Justify | Left |
| **Line Height** | 1, 1.4, 1.6, 1.8, 2 | 1.4 (system default) |
| **Padding** | None, Small, Medium, Large | None |

---

## 📖 Documentation Structure

### For Users 👥
- **[Quick Start Guide](ODOO_SNIPPET_THREE_PART_TEXT_QUICKSTART.md)** - 5 minute introduction
- **[Full Guide](ODOO_SNIPPET_THREE_PART_TEXT_GUIDE.md)** - Complete usage + detailed examples
- **[Summary](ODOO_SNIPPET_THREE_PART_TEXT_SUMMARY.md)** - Overview of everything

### For Developers 👨‍💻
- **[Code Analysis](ODOO_SNIPPET_THREE_PART_TEXT_CODE.md)** - Detailed code structure
- **[Summary](ODOO_SNIPPET_THREE_PART_TEXT_SUMMARY.md)** - Architecture overview

---

## 🛠️ Technical Details

### XML Structure
```xml
<template id="s_three_part_text" name="Three Part Text">
    <div class="s_three_part_text"
         data-part1-text="..." 
         data-part2-text="..." 
         data-part3-text="...">
        <p class="s_three_part_text_paragraph">
            <span class="s_three_part_text_part1" contenteditable="true">...</span>
            <span class="s_three_part_text_part2" contenteditable="true">...</span>
            <span class="s_three_part_text_part3" contenteditable="true">...</span>
        </p>
    </div>
</template>
```

### CSS (SCSS)
```scss
.s_three_part_text {
    display: block;
    
    .s_three_part_text_part1 { /* Default styling */ }
    .s_three_part_text_part2 { /* Default styling */ }
    .s_three_part_text_part3 { /* Default styling */ }
}
```

### JavaScript
```javascript
options.registry.ThreePartText = options.Class.extend({
    // Handle options in editor
});

publicWidget.registry.ThreePartText = publicWidget.Widget.extend({
    // Handle frontend rendering
});
```

---

## 🔧 Extending the Snippet

### Add Part 4
```xml
<!-- Add span -->
<span class="s_three_part_text_part4" contenteditable="true">...</span>

<!-- Add options, CSS, JS for part4 -->
```

### Add Background Color
```xml
<we-colorpicker string="Background Color"
               data-apply-to=".s_three_part_text"
               data-css-property="background-color"/>
```

### Add Text Transform
```xml
<we-select string="Text Transform">
    <we-button data-select-style="text-transform: uppercase;">UPPERCASE</we-button>
    <we-button data-select-style="text-transform: lowercase;">lowercase</we-button>
</we-select>
```

---

## ✅ Features Checklist

### Text Content
- [x] Edit text directly (double-click)
- [x] Edit text via options panel
- [x] Save text in data attributes
- [x] 3 independent parts

### Text Styling
- [x] Color picker for each part
- [x] 6 font sizes (14px-28px)
- [x] 5 font weights (300-900)
- [x] Normal/Italic styles
- [x] None/Underline/Strike-through decorations

### General Settings
- [x] Text alignment (L/C/R/J)
- [x] Line height control (1-2)
- [x] Padding options (None/S/M/L)

### Quality
- [x] Responsive design (mobile/tablet/desktop)
- [x] Contenteditable mode
- [x] Options panel integration
- [x] Inline styles preservation
- [x] Print-friendly styles

---

## 📋 How to Use This Documentation

### I'm a user, I want to...
1. **Get started quickly** → Read [Quick Start Guide](ODOO_SNIPPET_THREE_PART_TEXT_QUICKSTART.md)
2. **Learn detailed usage** → Read [Full Guide](ODOO_SNIPPET_THREE_PART_TEXT_GUIDE.md)
3. **See examples** → Look at "Ví Dụ Thực Tế" section in Full Guide
4. **Find answers** → Check FAQ in Full Guide

### I'm a developer, I want to...
1. **Understand the architecture** → Read [Summary - Technical Section](ODOO_SNIPPET_THREE_PART_TEXT_SUMMARY.md)
2. **Review the code** → Read [Code Analysis](ODOO_SNIPPET_THREE_PART_TEXT_CODE.md)
3. **Extend the snippet** → See "Mở Rộng Snippet" in Code Analysis
4. **Understand integration** → Check "Tích Hợp Vào Module" in Code Analysis

---

## 🎓 Learning Path

### New Users (30 minutes)
1. Read Quick Start (5 min)
2. Add snippet to test page (5 min)
3. Edit text and change colors (10 min)
4. Explore all options (10 min)

### Developers (1-2 hours)
1. Read Code Analysis (30 min)
2. Review XML structure (15 min)
3. Review CSS styling (15 min)
4. Review JavaScript logic (20 min)
5. Plan extensions (20 min)

---

## ❓ FAQ

**Q: How do I edit the text?**
A: Double-click text to edit inline, or use the Text Input field in options panel.

**Q: Where are the color options?**
A: Click the snippet, then look at the right panel under "Part X - ... Text" → "Text Color"

**Q: Can I add a Part 4?**
A: Yes, but requires code changes. See "Mở Rộng Snippet" in Code Analysis.

**Q: Do the styles get saved?**
A: Yes, inline styles are preserved in HTML. Data attributes save the text content.

**Q: Is it mobile responsive?**
A: Yes, fully responsive with media queries for mobile breakpoints.

**Q: Can I customize beyond the given options?**
A: Yes, edit the CSS file or extend with JavaScript. See Code Analysis.

---

## 📞 Support

1. **Check Documentation** - Most answers are in the guides
2. **Review Examples** - See "Ví Dụ Thực Tế" for common use cases
3. **Check Code** - Look at XML/CSS/JS for technical details
4. **Read FAQ** - Common questions answered in guides

---

## 🎉 Summary

You now have a **fully functional snippet** that allows users to create beautifully formatted text with **multiple styled parts in a single paragraph**. The snippet integrates seamlessly with Odoo Website editor and provides a complete options panel for customization.

**Happy editing! ✨**

---

## 📚 Related Documentation

This project is part of a larger Odoo Website Snippets learning system:
- [Main Snippets Guide](ODOO_SNIPPETS_GUIDE_DETAILED.md)
- [Snippet Analysis](ODOO_SNIPPETS_DETAILED_ANALYSIS.md)
- [Practical Guide](ODOO_SNIPPETS_PRACTICAL_GUIDE.md)

---

**Created**: April 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready  
