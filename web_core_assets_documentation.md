# Tài liệu về module `@web/core/assets` trong Odoo

Module `@web/core/assets` (nằm ở `odoo/addons/web/static/src/core/assets.js`) cung cấp các công cụ tiện ích để tải động (lazy load) các tài nguyên (JS libs, CSS) và các bundle (gói giao diện) của Odoo ngay tại runtime của trình duyệt. 

Thay vì tải toàn bộ code JavaScript và CSS của hệ thống ngay lần đầu truy cập (gây chậm trang), chúng ta sử dụng các hàm và component trong module này để chỉ tải các thư viện hoặc bundle nặng khi thực sự cần thiết, giúp tăng đáng kể tốc độ tải trang ban đầu (Initial Page Load).

Dưới đây là chi tiết các thành phần trong thư viện này:

---

## 1. Hàm `loadJS(url)`
- **Dùng để làm gì:** Tải một tệp JavaScript từ một đường dẫn `url` cụ thể bằng cách tạo thẻ `<script>` chèn vào `document.head`. Hàm trả về một `Promise` báo hiệu khi file tải xong. (Đã tích hợp sẵn bộ đệm cache map để chặn việc tải lại nếu file đã được load trước đó).
- **Tại sao dùng:** Tránh làm phình to bộ source chính với các thư viện bên thứ 3 (ví dụ: PDF.js, thư viện quét Barcode ZXing, API Google, Stripe/Paypal SDK) nếu chúng chỉ hiếm khi được sử dụng tới trong một vài trường hợp đặc thù. Nó giúp tiết kiệm băng thông.
- **Khi nào dùng:** Khi component chuẩn bị hiển thị và bạn biết chắc nó sẽ phụ thuộc vào một thư viện ngoài. Thường được gọi trong vòng đời `onWillStart()`.
- **Ví dụ cụ thể:** Trong hệ thống có component quét mã vạch (`barcode_video_scanner.js`). Nếu trình duyệt không hỗ trợ API chuẩn `BarcodeDetector` thì ta phải tự dùng thư viện ZXing, thư viện ZXing rất nặng nên thiết kế sẽ là tải động:

```javascript
import { loadJS } from "@web/core/assets";
import { onWillStart } from "@odoo/owl";

onWillStart(async () => {
    let DetectorClass;
    if ("BarcodeDetector" in window) {
        DetectorClass = BarcodeDetector;
    } else {
        // Tải động thư viện ZXing bên thứ 3 chỉ khi trình duyệt cũ không đáp ứng được tính năng
        await loadJS("/web/static/lib/zxing-library/zxing-library.js");
        DetectorClass = buildZXingBarcodeDetector(window.ZXing);
    }
});
```

---

## 2. Hàm `loadCSS(url, retryCount = 0)`
- **Dùng để làm gì:** Tải một tệp CSS thông qua thẻ `<link rel="stylesheet">` chèn vào `document.head`. Chức năng tương tự `loadJS`, đồng thời có hỗ trợ tự động retry (mặc định thử lại tối đa 3 lần và có độ trễ delay mỗi lần tăng lên) nếu do đường mạng gặp lỗi.
- **Tại sao dùng:** Tải CSS qua mạng có thể bất ổn định. Tính năng retry kết hợp Promise đảm bảo giao diện luôn hiển thị đúng đắn kể cả khi có rớt mạng vài giây.
- **Khi nào dùng:** Khi bạn cần tải một file style đi kèm cho các iframe, widget con rời rạc thay vì style cho toàn nền tảng.

---

## 3. Hàm `getBundle(bundleName)`
- **Dùng để làm gì:** Gửi HTTP request (có kèm param của session) lên router `/web/bundle/{bundleName}` đẻ lấy danh sách các đường link CSS và đường dẫn JS đã qua tổng hợp tạo thành bundle đó trên server. Trả về một JSON cấu trúc gồm mảng `cssLibs` và `jsLibs`.
- **Tại sao dùng:** Định nghĩa Odoo Bundle (ví dụ: `web.assets_backend`) thực chất trên server là gộp lại hàng chục file rời rạc. Hàm này lấy chính xác danh sách các file đã gộp (nếu chưa gộp) hoặc link gộp để đẩy tải.
- **Khi nào dùng:** Hàm này làm nền tảng cho việc phân giải bundle thành danh sách file tĩnh. Rất hiếm khi Frontend Developer gọi trực tiếp mà sẽ gọi gián tiếp qua `loadBundle()`.

---

## 4. Hàm `loadBundle(bundleName)`
- **Dùng để làm gì:** Gọi `getBundle(bundleName)` rồi sau khi lấy được danh sách, lập tức tạo luồng thực thi `Promise.all` với `loadCSS` và `loadJS` cho toàn bộ các file trả về đó.
- **Tại sao dùng:** Nhu cầu lazy-load trọn vẹn cả một phân hệ (module app) Odoo gồm toàn bộ template XML/logic JS/CSS liên quan (gọi chung là bundle) thường xuyên xảy ra.
- **Khi nào dùng:** Ví dụ lớn nhất là chuyển sang ứng dụng Point of Sale (POS Máy tính tiền). POS là một single-ap page riêng rẽ cực khủng, do đó nền tảng frontend chính sẽ cho gọi `loadBundle('point_of_sale.assets_pos')` khi cần.

---

## 5. Web Component `LazyComponent`
- **Dùng để làm gì:** Là một web component chuẩn của OWL (`<LazyComponent />`) có vai trò bọc tính năng lazy-load Bundle trong một cú pháp giao diện rút gọn. Nhiệm vụ là nằm trên file XML, thực hiện `loadBundle(...)` chầm chậm vào lúc onWillStart, sau đó tiến hành xuất Component kết quả ra ngoài.
- **Tại sao dùng:** Render một màn hình sub-app từ giao diện XML một cách "lười biếng" mà không cần code các block if-else hay tự trigger các hàm await chờ ở trong class Javascript. Code rất gọn gàng.
- **Khi nào dùng:** Bạn có 1 client-action, module con riêng, muốn chỉ gọi load sau cùng để trang chính load nhanh.
- **Ví dụ cụ thể (Trích đoạn code file thực thế trong dự án `awesome_dashboard` của Odoo):**

Trong file client action xml là `dashboard_action.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">
    <t t-name="awesome_dashboard.DashboardLoader"> 
        <!-- Sử dụng LazyComponent để tách riêng phân đoạn load Dashboard rất nặng, giúp trang chính hiển thị nhanh hơn -->
        <LazyComponent
            bundle="'awesome_dashboard.dashboard_assets'"
            Component="'awesome_dashboard.AwesomeDashboard'"
        />
    </t>
</templates>
```
*Giải nghĩa: Trong Awesome Dashboard, nó không tải sẵn mọi JS CSS khi mở Odoo lên, thay vào đó khi user ấn mở Menu, `<LazyComponent>` mới vào vòng đời. Khởi đầu nó sẽ báo gọi thư viện `loadBundle('awesome_dashboard.dashboard_assets')`. Khi quá trình kết thúc, code app lúc này đã có trong bộ nhớ, nó kiểm tra registry và thấy class mang tên "awesome_dashboard.AwesomeDashboard", `<LazyComponent>` kích hoạt tự động render thẻ đó.*

---

## 6. Lớp lỗi `AssetsLoadingError`
- **Dùng để làm gì:** Thừa kế từ lớp native JS là `Error`, đây là Custom Error văng ra (`throw`) khi nỗ lực request `loadJS` thất bại (chết server hoặc mạng đi) hoặc thử lại (retry) vượt quá số lần thông qua `loadCSS` mà vẫn không có được tệp.
- **Khi nào dùng:** Sẽ có trong khối block `try..catch` khi bạn gọi async call của hệ load động nhằm thiết lập UX tốt hơn (có thể in ra hộp thoại: Xin lỗi nền tảng mạng không ổn định, xin thử lại).
