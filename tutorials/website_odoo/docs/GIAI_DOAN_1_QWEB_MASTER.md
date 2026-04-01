# GIAI ĐOẠN 1 — QWeb Master (3–5 ngày)

Mục tiêu của giai đoạn này là **hiểu cách Website render UI trong Odoo** và **cách override đúng chuẩn** (inheritance/xpath), đủ để bạn:

- Clone 1 trang mẫu (theo doc bạn đưa: `/about` — trong core thường là `/about-us`).
- Custom layout (`website.layout`) theo cách ổn định, không “đập core”.
- Hiểu vì sao Website Builder “Edit” lại tạo ra view mới trong DB (Copy-on-Write / COW).

Tài liệu này ưu tiên thực hành theo source hiện có trong repo.

---

## 0) Trước khi bắt đầu (Checklist)

- Bạn đã cài module `website`.
- Bật Developer mode.
- Biết vào Website → Edit (builder) và kéo thả snippet.
- Biết cách mở URL với `?debug=assets` để giảm cache khi dev.

**Source neo (để đọc)**

- Layout chính: `website.layout` nằm trong [odoo/addons/website/views/website_templates.xml](odoo/addons/website/views/website_templates.xml)
- Mẫu About Us: template `website.aboutus` nằm trong [odoo/addons/website/data/website_data.xml](odoo/addons/website/data/website_data.xml)

---

## 1) Mental model: QWeb trong Website chạy như thế nào?

### 1.1. `ir.ui.view` + QWeb template

Trong Odoo Website, hầu hết HTML bạn thấy là QWeb template (stored as `ir.ui.view`).

- `<template id="layout" ...>` trong module `website` tạo ra view có XMLID `website.layout`.
- `t-call="website.layout"` giống như “include layout”: nó bọc nội dung page vào layout chung (header/footer/assets/SEO…)

**Cheat-sheet context (những biến hay gặp trong Website templates)**

Các template Website thường có sẵn (tùy trang/mode) những biến sau:

- `request`: request hiện tại (có `request.env`, `request.website`, `request.params`, ...)
- `website`: record `website` đang active (multi-website)
- `lang`: ngôn ngữ hiện tại (vd `vi_VN`)
- `editable`: đang ở Website Builder Edit mode hay không
- `translatable`: đang bật translate mode hay không
- `main_object`: record “chính” của trang (khi trang map tới record; nhiều logic SEO/publish dựa vào đây)

Bạn có thể nhìn thấy các biến được set/cập nhật ngay trong `website.layout` ở [odoo/addons/website/views/website_templates.xml](odoo/addons/website/views/website_templates.xml).

### 1.2. Page là gì?

Một “trang” thường có 2 mảnh:

1) **View QWeb** (HTML template) — render ra DOM
2) (tuỳ trường hợp) **website.page record** — map `url` → `view_id`

Ví dụ core:

- `homepage_page` map `/` → `view_id` `homepage` trong [odoo/addons/website/data/website_data.xml](odoo/addons/website/data/website_data.xml)

### 1.3. Website Builder và COW (Copy-on-Write)

Khi bạn Edit một page trong builder và kéo-thả snippet, Odoo thường:

- Không sửa “base view” của module.
- Tạo view **child** trong database (inherit view) để lưu thay đổi.

Hệ quả:

- Bạn thấy nhiều view liên quan 1 trang.
- Khi debug, phải biết nhìn “view chain”: base view → inherited views.

**Cách soi “view chain” nhanh (thực dụng cho dev mới)**

1) Mở backend (developer mode) → Settings → Technical → User Interface → Views.
2) Tìm theo:
  - XMLID (ví dụ `website.layout`, `website_training.about_clone`)
  - hoặc theo `Key`/`Name` nếu bạn quen.
3) Khi bạn chỉnh trang trong Website Builder, sẽ xuất hiện các views “child” (inherited) lưu trong DB.
  - Nếu trang của bạn tự nhiên khác so với source module: khả năng cao là có view custom trong DB đang override.

Tip: khi dev, nếu “không hiểu vì sao nó render vậy”, ưu tiên nhìn chain trong Views trước, rồi mới đoán.

---

## 2) QWeb directives quan trọng (cần thuộc)

> Bạn không cần nhớ 100% cú pháp ngay. Mục tiêu là biết “khi nào dùng cái nào” và đọc được source.

### 2.1. `t-call` — gọi template khác (layout / component)

Dùng khi:

- Page gọi layout: `t-call="website.layout"`
- Snippet gọi base template: `t-call="website.s_dynamic_snippet_template"`

Nguyên tắc:

- `t-call` truyền context hiện tại xuống template được gọi.
- Bạn có thể `t-set` biến trước khi `t-call`.

### 2.2. `t-set` + `t-value` — tạo biến trong context

Dùng khi:

- Chuẩn bị dữ liệu cho template con.
- Tạo constants/flags.

Ví dụ (pattern phổ biến trong website):

- `t-set="cta_btn_href"` trước khi render header.

### 2.3. `t-if / t-elif / t-else` — điều kiện

Dùng khi:

- Hiển thị block theo điều kiện.
- Chú ý: QWeb là XML, `&` và `<` phải escape.

### 2.4. `t-foreach` + `t-as` — lặp

Dùng khi:

- Render list (menu items, cards, posts…)

Lưu ý:

- Nếu loop recordset, ưu tiên chuẩn bị recordset ở controller/model để tránh logic nặng trong template.

### 2.5. `t-esc`, `t-out`, `t-field` — output

- `t-esc`: escape HTML (an toàn) → output text.
- `t-out`: output raw HTML/string (cẩn thận XSS; thường dùng nội bộ khi biết chắc dữ liệu).
- `t-field`: render field của record theo widget/formatting của Odoo (rất hay dùng trong portal/website với record).

Quy tắc an toàn:

- Public website: ưu tiên `t-esc` (hoặc `t-field`) hơn `t-out`.

### 2.6. `t-att-*` và `t-attf-*` — bind attribute

- `t-att-href="..."`: set attribute từ expression.
- `t-attf-class="... #{expr} ..."`: format string.

Dùng khi:

- CSS class phụ thuộc state.
- URL build từ data.

### 2.7. `t-cache` — cache block

Trong `website.layout`, Odoo có caching cho `<head>` và một số phần header/footer.

Khi dev bạn nên:

- Mở URL với `?debug=assets` hoặc `?debug=1` để giảm tác động cache.
- Nếu bạn override layout mà không thấy đổi, rất có thể bạn đang bị cache.

### 2.8. `t-translation` và `t-ignore` (hay gặp khi đọc source website)

- `t-translation="off"`: tắt translate cho block đó (hay dùng cho title/seo values được build từ biến).
- `t-ignore="true"`: báo cho editor/builder bỏ qua node (hay thấy ở menu/link để tránh inline editor chạm vào những chỗ không nên).

Bạn có thể thấy ví dụ `t-ignore="true"` trong snippet menu/submenu ở [odoo/addons/website/views/website_templates.xml](odoo/addons/website/views/website_templates.xml).

---

## 3) Cấu trúc page Website “đúng chuẩn”

Khi bạn tạo template page cho Website, thường theo pattern:

- `t-call="website.layout"`
- Bên trong có `<div id="wrap">`.
- Có vùng `.oe_structure` để Website Builder có thể cắm snippets.

Bạn có thể xem ví dụ trực tiếp trong template About Us: [odoo/addons/website/data/website_data.xml](odoo/addons/website/data/website_data.xml)

Tại sao phải có `.oe_structure`?

- Builder tìm các “drop zone” để drag-drop.
- Nếu bạn không có, nhiều thao tác builder sẽ không work đúng.

### 3.1. Template inheritance (quan trọng nhất khi custom)

Trong Odoo, bạn **gần như luôn** mở rộng template bằng inheritance thay vì copy toàn bộ.

Pattern:

```xml
<template id="my_override" inherit_id="website.layout">
  <xpath expr="..." position="inside|before|after|replace|attributes">
    ...
  </xpath>
</template>
```

**Vì sao phải làm vậy?**

- Upstream Odoo thay đổi layout → bạn chỉ gãy ở vùng bạn đụng.
- Dễ review và dễ maintain.

### 3.2. XPath cookbook (mẫu thao tác hay dùng)

**(A) Chèn node**

```xml
<xpath expr="//div[@id='wrapwrap']" position="inside">
  <div>...</div>
</xpath>
```

**(B) Replace node** (cẩn thận: replace lớn dễ gãy)

```xml
<xpath expr="//footer" position="replace">
  <footer>...</footer>
</xpath>
```

**(C) Sửa attribute** (thường ổn định hơn replace)

```xml
<xpath expr="//header" position="attributes">
  <attribute name="class" add="my_extra_class" separator=" "/>
</xpath>
```

**Best practice**

- Ưu tiên `attributes` hoặc insert nhỏ thay vì replace lớn.
- XPath nên bám vào `@id`, `@data-name`, `hasclass('...')` (nếu có) thay vì bám theo thứ tự DOM.
- Nếu XPath fail khi upgrade, Odoo sẽ log error lúc load module → luôn check log sau khi update.

---

## 4) LAB A — Clone trang About (từ core) thành trang mới

### 4.1. Kết quả mong muốn

- Có trang mới `/about` (hoặc `/about-training`) render layout website.
- Trang hiển thị giống `About Us` nhưng tiêu đề khác + thêm 1 đoạn text.

> Core thường có `/about-us`, còn doc bạn ghi `/about`. Mình đề xuất làm `/about` để đúng bài tập; còn muốn giữ giống core thì dùng `/about-us`.

### 4.2. Tạo addon training (chỉ QWeb)

Tạo module (ví dụ): `website_training`

**Cấu trúc gợi ý**

- `website_training/__manifest__.py`
- `website_training/views/pages.xml`

Nếu bạn muốn “chuẩn Odoo” hơn (dễ mở rộng các giai đoạn sau), dùng cấu trúc:

- `website_training/__init__.py`
- `website_training/__manifest__.py`
- `website_training/views/pages.xml`

> Giai đoạn 1 chưa cần `models/` hay `controllers/`.

**Manifest tối thiểu (ví dụ)**

- `depends`: `['website']`
- `data`: `['views/pages.xml']`

Ví dụ nội dung `__manifest__.py`:

```python
{
  'name': 'Website Training - QWeb Stage 1',
  'version': '1.0',
  'category': 'Website',
  'summary': 'Training module for Website QWeb basics',
  'depends': ['website'],
  'data': [
    'views/pages.xml',
  ],
  'installable': True,
}
```

### 4.3. Tạo view page mới (QWeb)

Trong `views/pages.xml`:

1) Tạo template page, ví dụ `website_training.about_clone`.
2) Bọc nội dung bằng `t-call="website.layout"`.
3) Copy khung cơ bản của About Us (không cần copy y hệt; chỉ cần giống cấu trúc).

Ví dụ `views/pages.xml` (tối thiểu nhưng đủ dùng với builder):

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
  <!-- 1) QWeb template cho trang -->
  <template id="about_clone" name="About (Training)">
    <t t-call="website.layout">
      <div id="wrap">
        <!-- Drop zone cho Website Builder -->
        <div class="oe_structure">
          <section class="s_title pt24 pb24" data-snippet="s_title" data-name="Title">
            <div class="container">
              <h1>About (Training)</h1>
              <p class="lead">
                Trang này được tạo trong module training để học QWeb + layout.
              </p>
            </div>
          </section>
        </div>

        <!-- Drop zone thứ 2: để builder dễ thêm block phía dưới -->
        <div class="oe_structure"/>
      </div>
    </t>
  </template>

  <!-- 2) Map URL -> view -->
  <data noupdate="1">
    <record id="about_page" model="website.page">
      <field name="url">/about</field>
      <field name="is_published">True</field>
      <field name="view_id" ref="about_clone"/>
      <field name="track">True</field>
      <field name="website_meta_description">Training page for learning QWeb layout</field>
    </record>

    <!-- (Optional) thêm menu item để dễ click -->
    <record id="menu_about" model="website.menu">
      <field name="name">About</field>
      <field name="url">/about</field>
      <field name="page_id" ref="about_page"/>
      <field name="parent_id" ref="website.main_menu"/>
      <field name="sequence" type="int">50</field>
    </record>
  </data>
</odoo>
```

Ghi chú:

- `id="about_clone"` sẽ tạo XMLID `website_training.about_clone`.
- `website.page.view_id` trỏ tới view QWeb.
- `noupdate="1"`: tránh bị overwrite khi upgrade module (thường dùng cho data “default”).
- Menu: mình gắn vào `website.main_menu` (menu mặc định của website core) để bạn thấy link ngay.

### 4.4. Map URL → view (website.page)

Tạo `website.page` record:

- `url`: `/about`
- `view_id`: ref tới template bạn tạo
- `is_published`: True

**Tip**: bạn có thể nhìn pattern `homepage_page` / `contactus_page` trong [odoo/addons/website/data/website_data.xml](odoo/addons/website/data/website_data.xml)

### 4.5. Verify

- Mở `/about?debug=assets`
- Vào Website → Edit → đảm bảo có thể thêm snippet vào vùng `.oe_structure`

**Nếu bạn không thấy menu “About”**

- Vào Website → Customize / hoặc Website → Edit Menu để kiểm tra menu có bị theme che/đổi header.

**Nếu `/about` vẫn 404**

- Đảm bảo bạn đã:
  1) update app list
  2) install module `website_training`

Khi dev, bạn thường phải upgrade module sau khi sửa XML:

- Upgrade module từ Apps UI, hoặc chạy server với tham số update module.

### 4.6. Debug nhanh nếu không ra

- Nếu 404: check `website.page` có tạo đúng chưa, URL có đúng chưa.
- Nếu template không load thay đổi:
  - mở với `?debug=assets`
  - check view trong backend: Settings → Technical → User Interface → Views

---

## 5) LAB B — Custom layout (`website.layout`) theo inheritance

### 5.1. Mục tiêu

- Thêm một “ribbon” nhỏ ngay trên nội dung trang (hoặc ngay dưới header) cho toàn site.
- Tất cả làm bằng template inheritance (xpath), không copy/paste toàn bộ layout.

### 5.2. Chọn vị trí override (đọc source)

Mở [odoo/addons/website/views/website_templates.xml](odoo/addons/website/views/website_templates.xml) và tìm template `id="layout"` (XMLID `website.layout`).

Gợi ý điểm gắn ổn định:

- `//div[@id='wrapwrap']` hoặc các điểm có `data-name="Header"`, `data-name="Footer"`.

### 5.3. Viết template inherit

Trong addon của bạn tạo 1 `<template inherit_id="website.layout">`.

- Dùng `<xpath expr="..." position="...">` để insert block.

Ví dụ: chèn “ribbon” ngay **đầu nội dung** (bên trong `#wrapwrap`, trước `#wrap` của page):

```xml
<odoo>
  <template id="layout_ribbon" inherit_id="website.layout" name="Layout ribbon (training)">
    <xpath expr="//div[@id='wrapwrap']" position="inside">
      <div class="container my-2" data-name="Training Ribbon">
        <div class="alert alert-info mb-0" role="status">
          Đây là ribbon từ module <strong>website_training</strong>.
        </div>
      </div>
    </xpath>
  </template>
</odoo>
```

Nếu bạn muốn ribbon nằm **ngay dưới header** thay vì đầu `wrapwrap`, bạn sẽ phải chọn XPath bám vào `header` hoặc một node ổn định ngay sau header.

Lưu ý best practice:

- XPath phải đủ “dày” để không dễ gãy khi upstream đổi.
- Không nên override lớn; chỉ insert/replace đúng 1 vùng.

### 5.4. Verify

- Mở bất kỳ trang nào (vd `/` hoặc `/about`) để thấy ribbon.
- Mở builder mode để đảm bảo không phá edit.

**Debug nếu ribbon không hiện**

- Đảm bảo file XML có được load trong `__manifest__.py`.
- Mở với `?debug=assets` để tránh cache làm bạn tưởng chưa đổi.
- Trong backend Views, tìm view có XMLID `website_training.layout_ribbon` và kiểm tra `Active`.

---

## 6) Chuẩn review cho giai đoạn 1

### 6.1. Bạn phải trả lời được

- `website.layout` ở đâu? Nó làm gì?
- Vì sao page cần `#wrap` và `.oe_structure`?
- Khác nhau giữa `t-esc`, `t-out`, `t-field`?
- Khi nào nên dùng `t-attf-class`?
- Vì sao có `t-cache` và khi dev nên làm gì?

### 6.2. Deliverable tối thiểu

- 1 addon `website_training` (hoặc tên khác) tạo được:
  - 1 trang `/about`
  - 1 override nhỏ vào `website.layout`

---

## 7) Bài nâng cấp (nếu còn thời gian)

1) Thêm menu item trỏ tới `/about` bằng `website.menu` record.
2) Thêm SEO title/description cho page.
3) Làm layout override chỉ áp dụng cho 1 website (multi-website) bằng condition theo `website.id`.

---

## 8) Tài liệu liên quan

- Lộ trình tổng: [tutorials/website_odoo/docs/ODOO WEBSITE DEVELOPER.md](tutorials/website_odoo/docs/ODOO%20WEBSITE%20DEVELOPER.md)
- Plan tổng onboarding: [tutorials/website_odoo/docs/WEBSITE_MODULE_ONBOARDING_PLAN.md](tutorials/website_odoo/docs/WEBSITE_MODULE_ONBOARDING_PLAN.md)
