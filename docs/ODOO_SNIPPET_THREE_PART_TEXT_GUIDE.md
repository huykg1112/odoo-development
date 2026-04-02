# HƯỚNG DẪN SNIPPET "THREE PART TEXT" - TỰ BIẾN STYLE CHO TỪNG PHẦN

## 📋 Mục Lục
1. [Giới Thiệu Snippet](#giới-thiệu)
2. [Cấu Trúc HTML](#cấu-trúc-html)
3. [Hướng Dẫn Sử Dụng Trên Giao Diện Editor](#hướng-dẫn-editor)
4. [Tùy Chỉnh Style Chi Tiết](#tùy-chỉnh-style)
5. [Ví Dụ Thực Tế](#ví-dụ)
6. [Lý Thuyết & Cấu Trúc Behind The Scenes](#lý-thuyết)

---

## 📖 <a name="giới-thiệu"></a>1. Giới Thiệu Snippet

### Snippet Là Gì?
**Snippet "Three Part Text"** (Văn Bản Ba Phần) là một công cụ cho phép bạn:

✅ **Tạo một đoạn văn hoàn chỉnh** từ 3 phần riêng biệt  
✅ **Tùy chỉnh style độc lập** cho mỗi phần (màu, kích thước, độ dày, etc.)  
✅ **Edit text trực tiếp** trên trang web (contenteditable)  
✅ **Bảo toàn formatting** - mỗi phần giữ style của riêng nó  

### Tại Sao Cần?
Đôi khi bạn cần nhấn mạnh một phần cụ thể trong câu văn bằng cách:
- Đổi màu text
- Thay đổi kích thước chữ
- Làm đậm hoặc in nghiêng
- Thêm gạch chân

**Thay vì dùng 3 đoạn text riêng, snippet này kết hợp chúng thành 1 đoạn liền mạch!**

### Ví Dụ Kết Quả

```
Mục tiêu của chúng tôi là cung cấp dịch vụ chất lượng cao với giá cạnh tranh.
└─┬──────────────────┬──────────────────────────────────┬────────────┘
  Phần 1            Phần 2                              Phần 3
  (Xanh, 16px)      (Đỏ đậm, 18px, Bold)              (Xanh, 16px)
```

---

## 🏗️ <a name="cấu-trúc-html"></a>2. Cấu Trúc HTML Snippet

### HTML Cơ Bản

```html
<div class="s_three_part_text" 
     data-part1-text="Edit this text"
     data-part2-text=" in the middle"
     data-part3-text=" and this text">
    
    <p class="s_three_part_text_paragraph">
        <!-- Phần 1 -->
        <span class="s_three_part_text_part1" 
              contenteditable="true">
            Edit this text
        </span>
        
        <!-- Phần 2 -->
        <span class="s_three_part_text_part2" 
              contenteditable="true">
             in the middle
        </span>
        
        <!-- Phần 3 -->
        <span class="s_three_part_text_part3" 
              contenteditable="true">
             and this text
        </span>
    </p>
</div>
```

### Giải Thích Cấu Trúc

| Phần | Chức Năng | Ví Dụ |
|------|----------|-------|
| `s_three_part_text` | Container chính | Chứa toàn bộ |
| `data-part1-text` | Lưu text phần 1 | "Edit this text" |
| `data-part2-text` | Lưu text phần 2 | " in the middle" |
| `data-part3-text` | Lưu text phần 3 | " and this text" |
| `s_three_part_text_paragraph` | Paragraph wrapper | `<p>` container |
| `s_three_part_text_part1` | Span phần 1 | Cho style riêng |
| `s_three_part_text_part2` | Span phần 2 | Cho style riêng |
| `s_three_part_text_part3` | Span phần 3 | Cho style riêng |
| `contenteditable="true"` | Cho phép edit | Có thể nhập text |

---

## 🎨 <a name="hướng-dẫn-editor"></a>3. Hướng Dẫn Sử Dụng Trên Giao Diện Editor

### Bước 1: Thêm Snippet Vào Trang

1. **Mở website editor** (Mode chỉnh sửa)
2. **Kéo snippet "Three Part Text"** từ snippet picker vào trang
3. **Click nút Save** để lưu

### Bước 2: Edit Nội Dung Text

#### Chỉnh Sửa Trực Tiếp
```
Kích đôi chuột vào text → Edit text → Bấm Ctrl+S hoặc click Save
```

#### Hoặc Dùng Options Panel

```
1. Click chọn snippet (trên trang)
2. Panel "Options" xuất hiện ở bên phải
3. Tìm section "Part 1 - Starting Text"
4. Nhấn vào field "Text Content"
5. Nhập text mới
6. Ấn Enter → Text update tự động
```

### Bước 3: Tùy Chỉnh Style Phần 1

**Trong panel Options, tìm section "Part 1 - Starting Text"**

#### A. Thay Đổi Màu Chữ
```
1. Click vào "Text Color" → Color picker thoát ra
2. Chọn màu mừa muốn
3. Màu được áp dụng tức thì
```

**Ví dụ**:
- Chọn xanh dương → Phần 1 thành xanh dương
- Chọn đỏ → Phần 1 thành đỏ

#### B. Thay Đổi Kích Thước Chữ
```
1. Tìm "Font Size"
2. Chọn size:
   - Small (14px)
   - Normal (16px)
   - Medium (18px)
   - Large (20px)
   - Extra Large (24px)
   - XXL (28px)
3. Size được áp dụng ngay
```

#### C. Thay Đổi Độ Dày Chữ
```
1. Tìm "Font Weight"
2. Chọn độ dày:
   - Light (300) - mỏng
   - Normal (400) - bình thường
   - Semi Bold (600) - đậm nhẹ
   - Bold (700) - đậm
   - Black (900) - rất đậm
3. Độ dày được áp dụng
```

#### D. Thay Đổi Kiểu Chữ (In Nghiêng)
```
1. Tìm "Font Style"
2. Chọn:
   - Normal: Chữ thẳng
   - Italic: Chữ in nghiêng
3. Style được áp dụng
```

#### E. Thêm/Bỏ Gạch Chân
```
1. Tìm "Text Decoration"
2. Chọn:
   - None: Không gạch
   - Underline: Gạch chân
   - Strike Through: Gạch ngang
3. Decoration được áp dụng
```

---

## 🎯 <a name="tùy-chỉnh-style"></a>4. Tùy Chỉnh Style Chi Tiết

### Quy Trình Chung

```
Snippet "Three Part Text"
    │
    ├─ Part 1 (Phần Đầu)
    │   ├─ Text Content: "Edit this text"
    │   ├─ Text Color: Xanh (#2d3748)
    │   ├─ Font Size: 16px
    │   ├─ Font Weight: Normal (400)
    │   ├─ Font Style: Normal
    │   └─ Text Decoration: None
    │
    ├─ Part 2 (Phần Giữa)
    │   ├─ Text Content: " in the middle"
    │   ├─ Text Color: Đỏ (#e53e3e)
    │   ├─ Font Size: 18px
    │   ├─ Font Weight: Bold (600)
    │   ├─ Font Style: Normal
    │   └─ Text Decoration: None
    │
    ├─ Part 3 (Phần Cuối)
    │   ├─ Text Content: " and this text"
    │   ├─ Text Color: Xanh (#3182ce)
    │   ├─ Font Size: 16px
    │   ├─ Font Weight: Normal (400)
    │   ├─ Font Style: Normal
    │   └─ Text Decoration: None
    │
    └─ General Settings (Cài Đặt Chung)
        ├─ Text Alignment: Left, Center, Right, Justify
        ├─ Line Height: 1, 1.4, 1.6, 1.8, 2
        └─ Padding: None, Small, Medium, Large
```

### Ví Dụ Kết Hợp Style

#### Ví Dụ 1: Tạo Highlight Động Động

**Part 1**: Màu xanh, 14px, Normal
**Part 2**: Màu đỏ, 20px, Bold + Underline
**Part 3**: Màu xanh, 14px, Normal

**Kết Quả**:
```
Chúng tôi cung cấp dịch vụ chất lượng cao với giá cạnh tranh.
              └──────────────────────────┘
                  (Phần 2 - Highlight)
```

#### Ví Dụ 2: Gradient Style (Thay Đổi Kích Thước)

**Part 1**: 14px
**Part 2**: 16px
**Part 3**: 14px

**Kết Quả**: Phần giữa nổi bật hơn!

#### Ví Dụ 3: Italic Highlight

**Part 1**: Normal
**Part 2**: Italic + Bold
**Part 3**: Normal

**Kết Quả**: Phần giữa in nghiêng và đậm

---

## 💡 <a name="ví-dụ"></a>5. Các Ví Dụ Thực Tế

### Ví Dụ 1: Câu PR (Public Relations)

```
"VUI MỪNG THÔNG BÁO rằng công ty chúng tôi đã ký kết hợp tác với Google."
 └──────┬──────┘  └──────────┬──────────┘ └──────────────┬──────────────┘
  Part 1              Part 2                      Part 3
(Đỏ, Bold, 20px)   (Xanh, 16px)              (Xanh, 16px)
```

**Cách Setup**:
- Part 1: "VUI MỪNG THÔNG BÁO"
  - Color: Đỏ (#e53e3e)
  - Font-Size: 20px
  - Font-Weight: Bold (700)

- Part 2: " rằng công ty chúng tôi đã ký kết hợp tác với Google"
  - Color: Xanh (#2d3748)
  - Font-Size: 16px
  - Font-Weight: Normal (400)

### Ví Dụ 2: Khoa Học Thực Tế

```
"Phát hiện mới cho thấy việc uống cà phê hàng ngày là tốt cho sức khoẻ."
└─────────┬────────┘ └────────────────────────┬──────────────────┘
   Part 1                      Part 2
 (Xanh, Bold)           (Đen, Italic, Large)
```

**Cách Setup**:
- Part 1: "Phát hiện mới"
  - Color: Xanh (#3182ce)
  - Font-Weight: Bold (700)

- Part 2: " cho thấy việc uống cà phê hàng ngày là tốt cho sức khoẻ"
  - Color: Đen (#2d3748)
  - Font-Style: Italic
  - Font-Size: 18px

### Ví Dụ 3: Khuyến Nghị Sản Phẩm

```
"Chúng tôi khuyến cáo sử dụng sản phẩm X vì nó an toàn và hiệu quả."
└────┬──────┘ └──────────────────────────┬────────────────────┘
 Part 1                  Part 2
(Đỏ, 16px)      (Xanh, 18px, Bold)
```

---

## 🔧 <a name="lý-thuyết"></a>6. Lý Thuyết & Cấu Trúc Behind The Scenes

### Cách Hoạt Động (Technical)

#### A. HTML & Inline Styles

Khi bạn chỉnh sửa style, HTML được update như sau:

```xml
<!-- Ban đầu -->
<span class="s_three_part_text_part1">Edit this text</span>

<!-- Sau khi chọn màu đỏ + size 20px -->
<span class="s_three_part_text_part1" style="color: #e53e3e; font-size: 20px;">
    Edit this text
</span>
```

#### B. Data Attributes

Text content được lưu trong `data-*` attributes:

```html
<div class="s_three_part_text"
     data-part1-text="Phần 1"
     data-part2-text=" Phần 2"
     data-part3-text=" Phần 3">
</div>
```

**Tại sao?** Để bảo toàn text khi refresh hoặc reload trang.

#### C. CSS Classes

```css
.s_three_part_text {
    display: block;  /* Block element */
}

.s_three_part_text_paragraph {
    margin: 0;       /* Không margin */
    padding: 0;      /* Không padding */
}

.s_three_part_text_part1,
.s_three_part_text_part2,
.s_three_part_text_part3 {
    display: inline; /* Nằm cạnh nhau */
}
```

#### D. JavaScript (Backend)

File `000.js` xử lý:

```javascript
// 1. Sync text từ spans vào data attributes
part1Text = span.textContent;
container.setAttribute('data-part1-text', part1Text);

// 2. Load text từ data attributes vào spans
text = container.getAttribute('data-part1-text');
span.textContent = text;

// 3. Listen to changes
span.addEventListener('input', function() {
    updateDataAttribute();
});
```

### CSS Properties Được Hỗ Trợ

| Property | Giá Trị | Ví Dụ |
|----------|--------|-------|
| `color` | HEX/RGB | #e53e3e, rgb(229, 62, 62) |
| `font-size` | px, rem | 16px, 1rem, 18px |
| `font-weight` | 300-900 | 300, 400, 600, 700, 900 |
| `font-style` | normal, italic | italic |
| `text-decoration` | underline, line-through, none | underline |
| `text-align` | left, center, right, justify | center |
| `line-height` | 1-2 | 1.4, 1.6, 1.8, 2 |

### Cấu Trúc File

```
s_three_part_text/
├── 000.scss          ← Styling
├── 000.js            ← Logic JavaScript
└── (XMLhịnh lưu trong s_three_part_text.xml)
```

**Manifest Entry**:
```python
'views/snippets/s_three_part_text.xml',
```

**Snippets Registration**:
```xml
<t t-snippet="website.s_three_part_text" 
   string="Three Part Text" 
   group="text">
    <keywords>three parts, formatted text, ...</keywords>
</t>
```

---

## 🎓 Best Practices

### DO's ✅

```
✅ Sử dụng để nhấn mạng một phần trong câu
✅ Giữ text ngắn gọn (dễ đọc)
✅ Dùng màu contrast cao
✅ Thử xem trước trên mobile + desktop
✅ Không lạm dụng (1-2 snippet mỗi trang)
```

### DON'Ts ❌

```
❌ Không tạo text quá dài (>500 ký tự)
❌ Không dùng quá nhiều màu khác nhau
❌ Không dùng font size quá nhỏ (<12px) hoặc quá lớn (>36px)
❌ Không bỏ quên update text content
```

---

## ❓ FAQ

**Q: Có thể tùy chỉnh font family (Arial, Times New Roman, etc.) không?**
A: Hiện tại chưa hỗ trợ. Chỉ có color, size, weight, style, decoration.

**Q: Có thể thêm background color không?**
A: Không, chỉ text color. Nhưng bạn có thể add CSS custom nếu cần.

**Q: Khoảng cách giữa 3 phần có thể tùy chỉnh không?**
A: Không trực tiếp. Nhưng bạn có thể thêm khoảng trắng trong text ("Part 1 | Part 2").

**Q: Lưu ở đâu?**
A: Lưu trong HTML của trang website (ir.ui.view records).

---

**Tài liệu được cập nhật**: Tháng 4, 2026
