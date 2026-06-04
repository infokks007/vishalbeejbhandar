# 🌱 Vishal Beej Bhandar — Online Store

A modern, responsive e-commerce + agri-services website for **Vishal Beej Bhandar**, a trusted seed & agri-input shop in Naya Bhojpur, Dumraon, Buxar, Bihar — serving farmers since **1995**.

> **Tagline:** *Seeds of Trust, Roots of Growth — Since 1995*

---

## ✅ Completed Features

### 1. 🏠 Homepage (`index.html`)
- **Animated video background** hero (auto-play crop fields video)
- **Animated headline** (line-by-line reveal) + **typewriter tagline**
- Animated stat counters (30+ years, 500+ products, 10K+ farmers)
- Brand strip (Indofil • Seminis • Clause), shop-by-category grid
- **Featured products** loaded from the database
- "Why Choose Us", AI Plant Doctor promo, testimonials, CTA banner

### 2. 🛒 Products (`products.html`)
- Live grid of all products from the database
- **Filters:** search, brand, category, max-price slider
- **Sorting:** featured / price / name
- Reads URL params (`?brand=`, `?category=`, `?search=`)

### 3. 📄 Product Detail (`product.html?id=...`)
- Amazon/Flipkart-style individual product page
- Gallery, price/MRP/discount, stock, specialities, quantity selector
- Add to Cart, Buy Now, WhatsApp enquiry, related products

### 4. ℹ️ About Us (`about.html`)
- Story, founder (Shri Ramakant Singh), vision/mission, timeline, values

### 5. 📞 Contact Us (`contact.html`)
- Contact info, store hours, **embedded Google Map**
- Contact form → **saved to DB** + forwarded via **WhatsApp** & **email (mailto)** to `infokks007@gmail.com`

### 6. 🌱 AI Plant Doctor (`plant-doctor.html`)
- Guided 3-step symptom checker (crop → affected part → symptoms)
- Rule-based diagnosis engine with confidence score
- **Recommends matching products** from the shop + WhatsApp expert link

### 7. 🔐 Login / Sign Up (`login.html`)
- Email login & signup (stored in `users` table)
- "Continue with Google" (demo flow)

### 8. 🛠️ Admin Panel (`admin.html`) — 🔒 Password protected
- **Password:** `Abhay@1985`
- Dashboard with stats (products, orders, sales, customers, messages)
- **Products:** full add / edit / delete (CRUD)
- **Orders:** view details, update status
- **Messages:** view, reply via email/WhatsApp, mark resolved
- **Customers:** view all registered users

### 9. 🛍️ Cart & Checkout (`cart.html`)
- Cart with quantity controls, order summary
- Checkout saves order to DB + sends order via WhatsApp

### 10. 🎨 Theming
- **Greenish-Pink** brand palette (from logo)
- **Light & Dark mode** toggle (saved in localStorage)
- Fully responsive (mobile menu, adaptive grids)

---

## 🔗 Functional Entry URIs

| Page | Path | Parameters |
|---|---|---|
| Home | `index.html` | — |
| Products | `products.html` | `?brand=`, `?category=`, `?search=` |
| Product detail | `product.html` | `?id=<productId>` |
| AI Plant Doctor | `plant-doctor.html` | — |
| About | `about.html` | — |
| Contact | `contact.html` | — |
| Login / Signup | `login.html` | — |
| Cart / Checkout | `cart.html` | — |
| Admin Panel | `admin.html` | password: `Abhay@1985` |

---

## 🗄️ Data Models (RESTful Table API)

- **products** — id, name, brand, category, price, mrp, unit, short_desc, description, specialities[], image, stock, rating, featured, tags[]
- **users** — id, name, email, password (obfuscated), phone, provider, role
- **messages** — id, name, email, phone, subject, message, status
- **orders** — id, customer_name, customer_email, customer_phone, items, total, status, address

> 12 sample products from **Indofil, Seminis & Clause** are pre-loaded. Manage everything from the Admin Panel.

---

## ⚠️ Important Notes & Limitations (static site)

- **Login security:** Auth is client-side only (passwords are lightly obfuscated, not securely hashed on a server). Suitable for a small shop demo, not bank-grade security.
- **Google Login:** A demo flow (real Google OAuth needs a backend/API key, which is unsafe on a static site).
- **Contact/Order email:** A static site cannot auto-send server emails. Messages are **saved in the database** and forwarded via **WhatsApp (8804428490)** and **mailto (infokks007@gmail.com)**.
- **AI Plant Doctor:** Smart **rule-based** diagnosis (no external LLM/API). The DeepSeek API key shared cannot be used safely on a static site — **please revoke/regenerate it.**
- **Logo:** Your uploaded logo is used in header & footer (`images/logo.png`).

---

## 🚀 Recommended Next Steps

1. **Add more products** via the Admin Panel (real prices, images, stock).
2. Replace the hero video with your own shop/field footage if desired.
3. Add real customer photos/testimonials.
4. (Optional) Integrate **Formspree** for true email delivery from the contact form.
5. Verify store hours & update if needed.

---

## 📦 Project Structure
```
index.html              Homepage
products.html           Product listing + filters
product.html            Individual product page
about.html              About Us
contact.html            Contact Us
plant-doctor.html       AI Plant Doctor
login.html              Login / Signup
cart.html               Cart & checkout
admin.html              Admin panel (password protected)
css/
  ├── style.css         Global theme (light/dark, greenish-pink)
  └── home.css          Homepage styles
js/
  ├── app.js            Shared: header/footer, theme, cart, auth, API helpers
  ├── home.js           Homepage logic
  ├── products.js       Product listing & filters
  ├── product.js        Product detail
  ├── cart.js           Cart & checkout
  ├── plant-doctor.js   AI diagnosis engine
  ├── auth.js           Login / signup
  └── admin.js          Admin panel
images/
  └── logo.png          Shop logo
```

---

## 🌐 Deployment
To make the site live, open the **Publish tab** in the editor and publish with one click.
