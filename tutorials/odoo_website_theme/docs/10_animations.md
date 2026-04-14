# Phần 10: Animations — Scroll Animations & Effects

> **Tài liệu gốc:** [Animations](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/animations.html)
> **Mục tiêu:** Thêm scroll animations và visual effects cho website.

---

## 1. Animations trong Odoo Website

Odoo Website Builder hỗ trợ animation qua:
1. **`data-scrolled-to` / CSS animations** — Odoo built-in scroll detection
2. **WOW.js style classes** — `o_animate`, `o_anim_fade_in`, ...
3. **Custom CSS/JS animations** — Do theme tự viết

---

## 2. Odoo Built-in Scroll Animations

Odoo có hệ thống animation khi scroll. Áp dụng vào bất kỳ element nào:

```xml
<!-- Fade in từ dưới lên khi scroll đến -->
<div class="o_animate o_anim_fade_in" data-scroll-zones="visible">
    <h2>This fades in on scroll</h2>
</div>

<!-- Slide in từ trái -->
<div class="o_animate o_anim_slide_in" data-animation-direction="left">
    <p>Slides in from left</p>
</div>
```

**Các class animation built-in:**

| Class | Effect |
|-------|--------|
| `o_anim_fade_in` | Fade in |
| `o_anim_slide_in` | Slide in |
| `o_anim_bounce_in` | Bounce in |
| `o_anim_rotate_in` | Rotate in |
| `o_anim_zoom_in` | Zoom in |

**Data attributes:**

```html
data-scroll-zones="visible"          <!-- Trigger khi element visible -->
data-animation-direction="left"      <!-- Direction: left/right/up/down -->
data-animation-delay="100"           <!-- Delay (ms) -->
data-animation-duration="500"        <!-- Duration (ms) -->
```

---

## 3. Custom CSS Animations

### 3.1 Scroll-triggered Animations với CSS

Tạo SCSS trong `static/src/scss/components/`:

```scss
// components/animations.scss

// ===========================
// Scroll Reveal Animations
// ===========================

// Base state (invisible)
.o_airproof_anim {
    opacity: 0;
    transition: opacity 0.6s ease, transform 0.6s ease;

    // Animated state (when visible)
    &.o_animated {
        opacity: 1;
        transform: none !important;
    }
}

// Fade in từ dưới lên
.o_airproof_anim_up {
    @extend .o_airproof_anim;
    transform: translateY(40px);
}

// Fade in từ trái
.o_airproof_anim_left {
    @extend .o_airproof_anim;
    transform: translateX(-40px);
}

// Fade in từ phải
.o_airproof_anim_right {
    @extend .o_airproof_anim;
    transform: translateX(40px);
}

// Scale up
.o_airproof_anim_scale {
    @extend .o_airproof_anim;
    transform: scale(0.9);
}

// Delay classes
@for $i from 1 through 10 {
    .o_airproof_anim_delay_#{$i} {
        transition-delay: #{$i * 0.1}s;
    }
}


// ===========================
// Hover Animations
// ===========================

// Card lift
.o_airproof_hover_lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }
}

// Button glow
.btn-airproof-glow {
    position: relative;
    overflow: hidden;

    &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 300%;
        height: 300%;
        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%);
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0.5s ease;
    }

    &:hover::after {
        transform: translate(-50%, -50%) scale(1);
    }
}


// ===========================
// Loading / Skeleton
// ===========================

.o_airproof_skeleton {
    background: linear-gradient(90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 4px;
}

@keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

### 3.2 JavaScript để Trigger Animation on Scroll

Tạo `static/src/js/animations.js`:

```javascript
/** @odoo-module **/

// Intersection Observer để trigger animations khi element vào viewport
document.addEventListener("DOMContentLoaded", () => {
    const animatedElements = document.querySelectorAll(
        ".o_airproof_anim_up, .o_airproof_anim_left, .o_airproof_anim_right, .o_airproof_anim_scale"
    );

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("o_animated");
                    // Unobserve sau khi đã animate
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,     // Trigger khi 10% element visible
            rootMargin: "0px 0px -50px 0px",  // Offset từ bottom viewport
        }
    );

    animatedElements.forEach((el) => observer.observe(el));
});
```

Khai báo trong `__manifest__.py`:
```python
'assets': {
    'web.assets_frontend': [
        'website_airproof/static/src/scss/components/animations.scss',
        'website_airproof/static/src/js/animations.js',
    ],
},
```

---

## 4. Mouse Follower — Airproof Custom Effect

Airproof có effect con trỏ đặc biệt (mouse follower), là ví dụ về custom animation JS.

### 4.1 `static/src/js/mouse_follower.js`

```javascript
/** @odoo-module **/

document.addEventListener("DOMContentLoaded", () => {
    // Chỉ chạy trên desktop (không touch device)
    if ("ontouchstart" in window) return;

    const follower = document.createElement("div");
    follower.classList.add("o_mouse_follower");
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let isVisible = false;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isVisible) {
            follower.style.opacity = "1";
            isVisible = true;
        }
    });

    document.addEventListener("mouseleave", () => {
        follower.style.opacity = "0";
        isVisible = false;
    });

    // Smooth follow với lerp (linear interpolation)
    function animate() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        follower.style.transform =
            `translate(${followerX - 12}px, ${followerY - 12}px)`;

        requestAnimationFrame(animate);
    }

    animate();

    // Hiệu ứng khi hover link/button
    const interactables = document.querySelectorAll("a, button, .btn");
    interactables.forEach((el) => {
        el.addEventListener("mouseenter", () => {
            follower.classList.add("o_mouse_follower_active");
        });
        el.addEventListener("mouseleave", () => {
            follower.classList.remove("o_mouse_follower_active");
        });
    });
});
```

### 4.2 `static/src/scss/components/mouse_follower.scss`

```scss
.o_mouse_follower {
    position: fixed;
    width: 24px;
    height: 24px;
    background: rgba(16, 23, 40, 0.6);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease,
                width 0.2s ease,
                height 0.2s ease,
                background 0.2s ease;

    &.o_mouse_follower_active {
        width: 40px;
        height: 40px;
        background: rgba(16, 23, 40, 0.2);
        border: 2px solid rgba(16, 23, 40, 0.6);
    }
}

// Ẩn trên mobile
@include media-breakpoint-down(md) {
    .o_mouse_follower {
        display: none;
    }
}
```

---

## 5. CSS Keyframe Animations

```scss
// Loading spinner
@keyframes o_airproof_spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

// Pulse effect
@keyframes o_airproof_pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

// Float up-down
@keyframes o_airproof_float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

// Usage
.o_airproof_float {
    animation: o_airproof_float 3s ease-in-out infinite;
}

.o_airproof_pulse {
    animation: o_airproof_pulse 2s ease-in-out infinite;
}
```

---

## 6. Áp Dụng Animations vào Templates

```xml
<!-- Hero image float animation -->
<div class="o_airproof_float">
    <img src="/web/image/website_airproof.img_mini"
         alt="Drone" class="img-fluid"/>
</div>

<!-- Staggered card animations -->
<div class="row g-4">
    <div class="col-md-4">
        <div class="card o_airproof_anim_up o_airproof_anim_delay_1">
            <!-- Card content -->
        </div>
    </div>
    <div class="col-md-4">
        <div class="card o_airproof_anim_up o_airproof_anim_delay_2">
            <!-- Card content -->
        </div>
    </div>
    <div class="col-md-4">
        <div class="card o_airproof_anim_up o_airproof_anim_delay_3">
            <!-- Card content -->
        </div>
    </div>
</div>
```

---

## Checklist Bước 10

- [ ] Tạo `static/src/scss/components/animations.scss`
- [ ] Tạo `static/src/js/animations.js` với Intersection Observer
- [ ] Tạo `static/src/js/mouse_follower.js`
- [ ] Tạo `static/src/scss/components/mouse_follower.scss`
- [ ] Khai báo tất cả trong `__manifest__.py`
- [ ] Test animations khi scroll trang
- [ ] Test mouse follower trên desktop
- [ ] Đảm bảo animations không ảnh hưởng performance (không dùng expensive effects)

**Bước tiếp theo:** [Phần 11 — Forms](./11_forms.md)
