# Phần 11: Forms — Custom Website Forms

> **Tài liệu gốc:** [Forms](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/forms.html)
> **Mục tiêu:** Tạo và tùy chỉnh forms trên website.

---

## 1. Forms Trong Odoo Website

Odoo Website cung cấp module `website_form` tích hợp sẵn, cho phép:
- Tạo form liên hệ, đăng ký, thu thập lead
- Submit form → tạo record trong Odoo (Contact, Lead CRM, ...)
- Gửi email thông báo

**Cách tạo form:**
1. **Qua Website Builder** — Kéo snippet "Contact Form" → Configure (đơn giản nhất)
2. **Qua HTML template** — Viết form trực tiếp trong XML (kiểm soát tốt hơn)

---

## 2. Form Contact Chuẩn (Website Builder)

### Snippet mặc định của Odoo:

```xml
<!-- Kéo snippet s_website_form từ Website Builder -->
<section class="s_website_form pt32 pb32"
         data-snippet="s_website_form"
         data-name="Form">
    <div class="container">
        <form action="/web/dataset/call_kw"
              class="o_mark_required"
              data-model_name="mail.mail"
              data-success-mode="redirect"
              data-success-page="/contactus-thank-you"
              method="post"
              enctype="multipart/form-data">

            <input type="hidden" name="csrf_token" t-att-value="request.csrf_token()"/>

            <div class="s_website_form_rows row">
                <!-- Name -->
                <div class="col-sm-12 s_website_form_field">
                    <label class="s_website_form_label" for="name">
                        <span class="s_website_form_label_content">Name</span>
                        <span class="s_website_form_mark"> *</span>
                    </label>
                    <input type="text" name="name" id="name"
                           class="form-control s_website_form_input"
                           required="true"/>
                </div>
                <!-- Email -->
                <div class="col-sm-12 s_website_form_field">
                    <label class="s_website_form_label" for="email">
                        <span class="s_website_form_label_content">Email</span>
                        <span class="s_website_form_mark"> *</span>
                    </label>
                    <input type="email" name="email" id="email"
                           class="form-control s_website_form_input"
                           required="true"/>
                </div>
                <!-- Message -->
                <div class="col-sm-12 s_website_form_field">
                    <label class="s_website_form_label" for="message">
                        <span class="s_website_form_label_content">Message</span>
                    </label>
                    <textarea name="message" id="message"
                              class="form-control s_website_form_input"
                              rows="5"/>
                </div>
            </div>

            <button type="submit" class="btn btn-primary">
                Send Message
            </button>
        </form>
    </div>
</section>
```

---

## 3. Form Tạo Lead CRM

```xml
<!-- Form submit → tạo Lead trong CRM -->
<form action="/website_form/crm.lead"
      class="o_mark_required"
      data-model_name="crm.lead"
      data-success-mode="redirect"
      data-success-page="/contactus-thank-you"
      method="post">

    <input type="hidden" name="csrf_token" t-att-value="request.csrf_token()"/>

    <!-- Subject (tên lead) -->
    <div class="mb-3">
        <label for="contact_name">Your Name *</label>
        <input type="text" id="contact_name" name="contact_name"
               class="form-control" required="true"/>
    </div>

    <!-- Email -->
    <div class="mb-3">
        <label for="email_from">Email *</label>
        <input type="email" id="email_from" name="email_from"
               class="form-control" required="true"/>
    </div>

    <!-- Phone -->
    <div class="mb-3">
        <label for="phone">Phone</label>
        <input type="tel" id="phone" name="phone" class="form-control"/>
    </div>

    <!-- Drone model interest (custom field) -->
    <div class="mb-3">
        <label for="description">Interested in</label>
        <select id="description" name="description" class="form-select">
            <option value="">-- Select a model --</option>
            <option value="Airproof Mini">Airproof Mini</option>
            <option value="Airproof Pro">Airproof Pro</option>
            <option value="Airproof Eagle">Airproof Eagle</option>
        </select>
    </div>

    <!-- Message -->
    <div class="mb-3">
        <label for="description">Message</label>
        <textarea id="description" name="description"
                  class="form-control" rows="4"/>
    </div>

    <!-- GDPR consent -->
    <div class="mb-3 form-check">
        <input type="checkbox" id="gdpr_consent" name="gdpr_consent"
               class="form-check-input" required="true"/>
        <label for="gdpr_consent" class="form-check-label small">
            I agree to the <a href="/privacy-policy">Privacy Policy</a>
        </label>
    </div>

    <button type="submit" class="btn btn-primary btn-lg">
        Send Request <i class="fa fa-arrow-right ms-2"/>
    </button>
</form>
```

---

## 4. Form Styling (SCSS)

```scss
// Airproof form styles

.o_website_airproof_form {
    // Label styles
    .s_website_form_label,
    label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--o-cc1-text, #101728);
        margin-bottom: 0.5rem;
        letter-spacing: 0.02em;
    }

    // Input styles
    .form-control,
    .form-select {
        border: 1px solid #E8E8E8;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        background: #fff;

        &:focus {
            border-color: #101728;
            box-shadow: 0 0 0 3px rgba(16, 23, 40, 0.08);
            outline: none;
        }

        &::placeholder {
            color: #adb5bd;
            font-size: 0.875rem;
        }
    }

    // Textarea
    textarea.form-control {
        resize: vertical;
        min-height: 120px;
    }

    // Required mark
    .s_website_form_mark {
        color: #dc3545;
        margin-left: 2px;
    }

    // Submit button
    [type="submit"] {
        padding: 0.875rem 2.5rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        font-size: 0.85rem;
    }

    // Error states
    .o_has_error .form-control {
        border-color: #dc3545;
    }

    // Success state
    .o_has_success .form-control {
        border-color: #198754;
    }
}
```

---

## 5. Form Validation

Odoo tự động validate form qua `required` attribute. Để thêm custom validation:

```javascript
// static/src/js/form_validation.js
document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll(".o_website_airproof_form");

    forms.forEach((form) => {
        form.addEventListener("submit", (e) => {
            const phoneInput = form.querySelector('[name="phone"]');

            if (phoneInput && phoneInput.value) {
                const phoneRegex = /^\+?[\d\s\-()]{8,}$/;
                if (!phoneRegex.test(phoneInput.value)) {
                    e.preventDefault();
                    phoneInput.classList.add("is-invalid");
                    // Show error message
                    let errorEl = phoneInput.nextElementSibling;
                    if (!errorEl || !errorEl.classList.contains("invalid-feedback")) {
                        errorEl = document.createElement("div");
                        errorEl.className = "invalid-feedback";
                        phoneInput.after(errorEl);
                    }
                    errorEl.textContent = "Please enter a valid phone number";
                }
            }
        });
    });
});
```

---

## 6. Newsletter Form (Built-in)

Odoo có sẵn newsletter snippet. Tùy chỉnh style qua SCSS:

```scss
// static/src/scss/snippets/newsletter.scss

.s_newsletter_block,
.s_newsletter_subscribe_form {
    // Input group
    .input-group {
        max-width: 480px;

        .form-control {
            border-radius: 4px 0 0 4px;
            border-right: 0;

            &:focus {
                border-color: #E8E8E8;
                box-shadow: none;
                z-index: 1;
            }
        }

        .btn {
            border-radius: 0 4px 4px 0;
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            font-size: 0.875rem;
            letter-spacing: 0.03em;
        }
    }

    // Success message
    .js_subscribed_wrap {
        .text-success {
            font-weight: 500;
        }
    }
}
```

---

## Checklist Bước 11

- [ ] Tạo contact form trong `data/pages/contact.xml`
- [ ] Style form với `static/src/scss/` SCSS
- [ ] Test form submit → kiểm tra record tạo trong Odoo backend
- [ ] Test validation (required fields)
- [ ] Test redirect sau khi submit thành công
- [ ] Style newsletter form trong footer

**Bước tiếp theo:** [Phần 12 — Translations](./12_translations.md)
