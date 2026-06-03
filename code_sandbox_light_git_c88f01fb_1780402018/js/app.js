/* ============================================================
   Vishal Beej Bhandar - Shared App JS
   Handles: theme, navbar, footer, cart, auth, toasts, helpers
   ============================================================ */

const SHOP = {
  name: "Vishal Beej Bhandar",
  tagline: "Seeds of Trust, Roots of Growth",
  since: 1995,
  phone: "8804428490",
  whatsapp: "918804428490",
  email: "infokks007@gmail.com",
  address: "Naya Bhojpur, Dumraon, Buxar, Bihar, India",
  maps: "https://www.google.com/maps/place/Vishal+Beej+Bhandar/@25.5810141,84.1517662,19z",
  adminPass: "Abhay@1985"
};

/* ---------------- Theme ---------------- */
function getTheme() { return localStorage.getItem('vbb-theme') || 'light'; }
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('vbb-theme', t);
  const icon = document.querySelector('#theme-toggle i');
  if (icon) icon.className = t === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}
function toggleTheme() { applyTheme(getTheme() === 'dark' ? 'light' : 'dark'); }
applyTheme(getTheme());

/* ---------------- Auth (client-side session) ---------------- */
function currentUser() {
  try { return JSON.parse(localStorage.getItem('vbb-user')); } catch { return null; }
}
function setUser(u) { localStorage.setItem('vbb-user', JSON.stringify(u)); updateAuthUI(); }
function logout() { localStorage.removeItem('vbb-user'); updateAuthUI(); toast('Logged out'); setTimeout(()=>location.href='index.html',600); }
function isAdmin() { return sessionStorage.getItem('vbb-admin') === 'yes'; }

/* ---------------- Cart ---------------- */
function getCart() { try { return JSON.parse(localStorage.getItem('vbb-cart')) || []; } catch { return []; } }
function saveCart(c) { localStorage.setItem('vbb-cart', JSON.stringify(c)); updateCartUI(); }
function addToCart(product, qty = 1) {
  const cart = getCart();
  const ex = cart.find(i => i.id === product.id);
  if (ex) ex.qty += qty; else cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, unit: product.unit, qty });
  saveCart(cart);
  toast(`Added "${product.name}" to cart`);
}
function cartCount() { return getCart().reduce((s, i) => s + i.qty, 0); }
function cartTotal() { return getCart().reduce((s, i) => s + i.price * i.qty, 0); }
function updateCartUI() {
  document.querySelectorAll('.cart-count').forEach(el => {
    const c = cartCount(); el.textContent = c; el.style.display = c ? 'grid' : 'none';
  });
}

/* ---------------- Toast ---------------- */
function toast(msg, type = 'success') {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const ic = type === 'error' ? 'fa-circle-exclamation' : type === 'info' ? 'fa-circle-info' : 'fa-circle-check';
  t.innerHTML = `<i class="fa-solid ${ic}"></i><span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(40px)'; setTimeout(() => t.remove(), 300); }, 3200);
}

/* ---------------- Format ---------------- */
function inr(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }

/* ---------------- Header / Footer injection ---------------- */
function navLink(href, label, page) {
  return `<li><a href="${href}" class="${page === href ? 'active' : ''}">${label}</a></li>`;
}

function renderHeader(active) {
  const u = currentUser();
  const authBtn = u
    ? `<button class="icon-btn" id="user-menu-btn" title="${u.name}"><i class="fa-solid fa-user"></i></button>`
    : `<a href="login.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-right-to-bracket"></i> Login</a>`;
  return `
  <header class="site-header">
    <div class="container nav">
      <a href="index.html" class="brand">
        <img src="images/logo.png" alt="Vishal Beej Bhandar logo">
        <span class="brand-name">Vishal Beej Bhandar<small>Since 1995</small></span>
      </a>
      <ul class="nav-links" id="nav-links">
        ${navLink('index.html','Home',active)}
        ${navLink('products.html','Products',active)}
        ${navLink('orders.html','My Orders',active)}
        ${navLink('history.html','Payment History',active)}
        ${navLink('plant-doctor.html','AI Plant Doctor',active)}
        ${navLink('about.html','About Us',active)}
        ${navLink('contact.html','Contact',active)}
      </ul>
      <div class="nav-actions">
        <button class="icon-btn" id="theme-toggle" onclick="toggleTheme()" title="Toggle theme"><i class="fa-solid fa-moon"></i></button>
        <a href="cart.html" class="icon-btn" title="Cart"><i class="fa-solid fa-cart-shopping"></i><span class="cart-count">0</span></a>
        ${authBtn}
        <button class="icon-btn hamburger" id="hamburger" title="Menu"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
  </header>
  ${u ? `<div class="modal-overlay" id="user-modal"><div class="modal" style="max-width:340px">
      <button class="modal-close" onclick="closeModal('user-modal')">&times;</button>
      <div style="text-align:center">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--grad-main);display:grid;place-items:center;margin:0 auto 12px;color:#fff;font-size:1.6rem"><i class="fa-solid fa-user"></i></div>
        <h3>${u.name}</h3>
        <p style="color:var(--text-soft);font-size:.9rem;margin-bottom:18px">${u.email}</p>
        <a href="cart.html" class="btn btn-ghost btn-block" style="margin-bottom:8px"><i class="fa-solid fa-bag-shopping"></i> My Cart</a>
        <a href="orders.html" class="btn btn-ghost btn-block" style="margin-bottom:8px"><i class="fa-solid fa-box"></i> My Orders</a>
        <a href="history.html" class="btn btn-ghost btn-block" style="margin-bottom:8px"><i class="fa-solid fa-file-invoice-dollar"></i> Payment History</a>
        <button class="btn btn-pink btn-block" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
      </div>
    </div></div>` : ''}
  `;
}

function renderFooter() {
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col footer-brand">
          <img src="images/logo.png" alt="Vishal Beej Bhandar">
          <p>${SHOP.tagline}. Trusted seed & agri-input store serving farmers of Buxar & beyond since ${SHOP.since}.</p>
          <div class="footer-social">
            <a href="https://wa.me/${SHOP.whatsapp}" target="_blank" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
            <a href="mailto:${SHOP.email}" title="Email"><i class="fa-solid fa-envelope"></i></a>
            <a href="tel:${SHOP.phone}" title="Call"><i class="fa-solid fa-phone"></i></a>
            <a href="${SHOP.maps}" target="_blank" title="Location"><i class="fa-solid fa-location-dot"></i></a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="products.html">Products</a></li>
            <li><a href="orders.html">My Orders</a></li>
            <li><a href="history.html">Payment History</a></li>
            <li><a href="plant-doctor.html">AI Plant Doctor</a></li>
            <li><a href="about.html">About Us</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Brands</h4>
          <ul>
            <li><a href="products.html?brand=Indofil">Indofil</a></li>
            <li><a href="products.html?brand=Seminis">Seminis</a></li>
            <li><a href="products.html?brand=Clause">Clause</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Get in Touch</h4>
          <ul>
            <li><i class="fa-solid fa-location-dot"></i> ${SHOP.address}</li>
            <li><i class="fa-solid fa-phone"></i> <a href="tel:${SHOP.phone}">+91 ${SHOP.phone}</a></li>
            <li><i class="fa-brands fa-whatsapp"></i> <a href="https://wa.me/${SHOP.whatsapp}" target="_blank">WhatsApp Chat</a></li>
            <li><i class="fa-solid fa-envelope"></i> <a href="mailto:${SHOP.email}">${SHOP.email}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; ${new Date().getFullYear()} Vishal Beej Bhandar. All rights reserved. &nbsp;|&nbsp; Crafted with <i class="fa-solid fa-heart" style="color:var(--pink-400)"></i> for farmers.
      </div>
    </div>
  </footer>`;
}

function updateAuthUI() {
  // re-render header on auth change
  const holder = document.getElementById('header-holder');
  if (holder) { holder.innerHTML = renderHeader(window.__activePage || ''); bindHeaderEvents(); updateCartUI(); }
}

function bindHeaderEvents() {
  const burger = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (burger) burger.onclick = () => links.classList.toggle('open');
  const umBtn = document.getElementById('user-menu-btn');
  if (umBtn) umBtn.onclick = () => openModal('user-modal');
}

/* ---------------- Modals ---------------- */
function openModal(id) { const m = document.getElementById(id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); }
document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); });

/* ---------------- Reveal on scroll ---------------- */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ---------------- Mount shared layout ---------------- */
function mountLayout(activePage) {
  window.__activePage = activePage;
  const h = document.getElementById('header-holder');
  const f = document.getElementById('footer-holder');
  if (h) h.innerHTML = renderHeader(activePage);
  if (f) f.innerHTML = renderFooter();
  bindHeaderEvents();
  updateCartUI();
  applyTheme(getTheme());
}

/* ---------------- API helpers with Local Storage Simulation Fallback ---------------- */
function hashPass(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return 'h' + Math.abs(h);
}

const SEED_PRODUCTS = [
  {
    id: "p1",
    name: "Indofil M-45 Fungicide",
    brand: "Indofil",
    category: "Fungicides",
    price: 250,
    mrp: 290,
    unit: "500g",
    short_desc: "Trusted contact fungicide for broad-spectrum control of crop diseases.",
    description: "Indofil M-45 is a contact fungicide of Mancozeb group, which remains on the plant surface and interferes with biochemical processes of fungi. It is effective against wide range of diseases including blights, downy mildew, leaf spots, and rusts in vegetables, fruits, and field crops.",
    specialities: ["Broad spectrum control", "Provides zinc and manganese nutrition", "Easy dispersion in water", "Excellent sticks-on property"],
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=500&q=70",
    stock: 120,
    rating: 4.8,
    featured: true,
    tags: ["fungicide", "blight", "mancozeb", "indofil", "leaf spot", "rust"]
  },
  {
    id: "p2",
    name: "Seminis Abhilash Tomato Seeds",
    brand: "Seminis",
    category: "Vegetable Seeds",
    price: 420,
    mrp: 480,
    unit: "10g",
    short_desc: "High-yielding tomato hybrid with excellent firmness and uniform deep red color.",
    description: "Seminis Abhilash is a premium tomato hybrid seed known for prolific bearing, high yield potential, and exceptional shelf life. It is highly resistant to major tomato diseases and thrives in diverse climatic conditions, making it the favorite of Indian tomato farmers.",
    specialities: ["Fruits are square round and firm", "Average weight: 80-90 grams", "Excellent transportability", "Harvesting starts in 65-70 days"],
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=70",
    stock: 85,
    rating: 4.9,
    featured: true,
    tags: ["tomato", "seeds", "seminis", "hybrid", "vegetable"]
  },
  {
    id: "p3",
    name: "Clause Durga Chilli Seeds",
    brand: "Clause",
    category: "Vegetable Seeds",
    price: 350,
    mrp: 390,
    unit: "10g",
    short_desc: "Highly pungent green-to-red hybrid chilli seeds with high yield.",
    description: "Durga is a premium F1 hybrid hot pepper variety from Clause seeds. It features erect, highly vigorous plants producing attractive, dark green slender fruits that turn brilliant red at maturity. Known for high pungency and excellent fruit quality.",
    specialities: ["High pungency (teekha)", "Fruit length: 8-10 cm", "Excellent tolerance to leaf curl virus", "Prolific continuous harvesting"],
    image: "https://images.unsplash.com/photo-1588252393763-677218025291?w=500&q=70",
    stock: 60,
    rating: 4.7,
    featured: true,
    tags: ["chilli", "seeds", "clause", "hybrid", "vegetable", "hot pepper"]
  },
  {
    id: "p4",
    name: "Indofil Avtar Fungicide",
    brand: "Indofil",
    category: "Fungicides",
    price: 680,
    mrp: 750,
    unit: "500g",
    short_desc: "Systemic and contact fungicide for dual action crop protection.",
    description: "Avtar is a combination fungicide containing Zineb and Hexaconazole. It offers both contact and systemic protection, making it highly effective against difficult-to-control diseases like powdery mildew, rust, and leaf spots.",
    specialities: ["Dual action (systemic + contact)", "Quick absorption by leaves", "Provides protective and curative action", "Improves crop greenness and yield"],
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&q=70",
    stock: 45,
    rating: 4.6,
    featured: false,
    tags: ["fungicide", "mildew", "indofil", "avtar", "powdery", "rust"]
  },
  {
    id: "p5",
    name: "Seminis Ankur Cauliflower Seeds",
    brand: "Seminis",
    category: "Vegetable Seeds",
    price: 510,
    mrp: 580,
    unit: "10g",
    short_desc: "Uniform, snow-white compact curds hybrid cauliflower seeds.",
    description: "Ankur is a popular early cauliflower hybrid from Seminis. It forms dense, snow-white curds protected by excellent self-wrapping leaves. Highly suitable for early winter cultivation with outstanding market pricing.",
    specialities: ["Pure white compact curds", "Avg curd weight: 1.0 to 1.5 kg", "Strong self-blanching leaf habit", "Harvest in 60-65 days after transplanting"],
    image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ecf?w=500&q=70",
    stock: 40,
    rating: 4.8,
    featured: true,
    tags: ["cauliflower", "seeds", "seminis", "vegetable", "cole"]
  },
  {
    id: "p6",
    name: "Clause F1 Hybrid Gourd Seeds",
    brand: "Clause",
    category: "Vegetable Seeds",
    price: 180,
    mrp: 210,
    unit: "20g",
    short_desc: "Prolific bottle gourd hybrid seeds producing straight tender green gourds.",
    description: "Clause F1 Hybrid Bottle Gourd produces highly uniform, attractive cylindrical light-green fruits. The plants are vigorous, branching heavily to generate high yields over a long harvesting period.",
    specialities: ["Tender skin with slow seed development", "Avg length: 30-35 cm", "High tolerance to weather fluctuations", "Excellent cooking quality"],
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500&q=70",
    stock: 90,
    rating: 4.5,
    featured: false,
    tags: ["gourd", "seeds", "clause", "hybrid", "vegetable", "cucurbit"]
  },
  {
    id: "p7",
    name: "Indofil Z-78 Fungicide",
    brand: "Indofil",
    category: "Fungicides",
    price: 310,
    mrp: 350,
    unit: "500g",
    short_desc: "Zinc-based broad spectrum protective fungicide.",
    description: "Indofil Z-78 contains Zineb, a coordinator of zinc ions and ethylene bisdithiocarbamate. It acts as a protective shield on foliage, preventing spore germination while supplying essential Zinc nutrition to plants.",
    specialities: ["Contains 15% Zinc element", "Broad spectrum protective action", "Safe for most crops", "Controls downy mildew and leaf spots"],
    image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=500&q=70",
    stock: 70,
    rating: 4.5,
    featured: false,
    tags: ["fungicide", "indofil", "z-78", "zinc", "protection"]
  },
  {
    id: "p8",
    name: "Seminis Virat Cabbage Seeds",
    brand: "Seminis",
    category: "Vegetable Seeds",
    price: 460,
    mrp: 520,
    unit: "10g",
    short_desc: "High uniformity, bluish-green compact hybrid cabbage seeds.",
    description: "Seminis Virat is a premium F1 cabbage hybrid with high field standing ability. It produces attractive round, dense heads with a beautiful bluish-green color and sweet, tender taste suitable for fresh market sales.",
    specialities: ["Highly compact and uniform heads", "Head weight: 1.2 to 1.8 kg", "Outstanding field holding capacity (20-25 days)", "Tolerance to Black Rot"],
    image: "https://images.unsplash.com/photo-1587334206501-12f638dfd544?w=500&q=70",
    stock: 55,
    rating: 4.7,
    featured: false,
    tags: ["cabbage", "seeds", "seminis", "vegetable", "cole"]
  },
  {
    id: "p9",
    name: "Premium Urea Fertilizer (N-46%)",
    brand: "Other",
    category: "Fertilizers",
    price: 299,
    mrp: 350,
    unit: "50kg",
    short_desc: "High-grade nitrogen fertilizer to boost vegetative growth and green foliage.",
    description: "Our Premium Urea contains 46% nitrogen. It is highly soluble in water and soil, providing immediate nitrogen availability to crops to ensure fast vegetative growth, strong stems, and lush green leaves.",
    specialities: ["46% Nitrogen content", "100% water-soluble prills", "Suitable for all crops", "Promotes fast growth and branching"],
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=70",
    stock: 300,
    rating: 4.8,
    featured: true,
    tags: ["fertilizer", "urea", "nitrogen", "growth"]
  },
  {
    id: "p10",
    name: "Single Super Phosphate (SSP)",
    brand: "Other",
    category: "Fertilizers",
    price: 450,
    mrp: 500,
    unit: "50kg",
    short_desc: "Phosphate fertilizer enriched with Sulphur and Calcium for root development.",
    description: "Single Super Phosphate (SSP) supplies critical Phosphorus (16%), Sulphur (11%), and Calcium (21%). It is essential for strong root establishment, early crop maturity, and robust seed production.",
    specialities: ["Triple nutrient boost (P, S, Ca)", "Enhances root structure", "Improves oil content in oilseeds", "Improves soil structure"],
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=500&q=70",
    stock: 150,
    rating: 4.6,
    featured: false,
    tags: ["fertilizer", "phosphate", "ssp", "root", "sulphur"]
  },
  {
    id: "p11",
    name: "Potassium Nitrate (13-0-45)",
    brand: "Other",
    category: "Plant Nutrition",
    price: 180,
    mrp: 220,
    unit: "1kg",
    short_desc: "Fully water-soluble foliar spray fertilizer for fruit and flower booster.",
    description: "NOP Potassium Nitrate provides soluble Nitrogen (13%) and Potassium (45%). It is ideal for fruit sizing, color development, flower retention, and improving crop resistance to drought and disease stresses.",
    specialities: ["100% water-soluble foliar fertilizer", "High potassium content (45%)", "Boosts fruit size, taste and color", "Reduces flower drop"],
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=70",
    stock: 110,
    rating: 4.7,
    featured: false,
    tags: ["nutrition", "potassium", "nitrate", "foliar", "fertilizer"]
  },
  {
    id: "p12",
    name: "Micro-Nutrient Liquid Booster",
    brand: "Other",
    category: "Plant Nutrition",
    price: 240,
    mrp: 290,
    unit: "250ml",
    short_desc: "Concentrated micronutrient formula to cure leaf yellowing and nutrient deficiencies.",
    description: "This crop booster is a concentrated formulation of EDTA-chelated micronutrients including Zinc, Iron, Manganese, Copper, Boron, and Molybdenum. It ensures rapid absorption through leaf spraying, quickly resolving deficiency symptoms.",
    specialities: ["Edta chelated formula", "Cures yellowing and stunted growth", "Compatible with most pesticides", "Highly cost-effective"],
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=70",
    stock: 80,
    rating: 4.9,
    featured: true,
    tags: ["nutrition", "micronutrient", "zinc", "boron", "yellowing", "booster"]
  }
];

const SEED_USERS = [
  { id: "u1", name: "Store Owner", email: "admin@vbb.com", password: hashPass("Abhay@1985"), phone: "8804428490", provider: "email", role: "admin" },
  { id: "u2", name: "Rajesh Kumar", email: "rajesh@gmail.com", password: hashPass("farmer"), phone: "9876543210", provider: "email", role: "customer" },
  { id: "u3", name: "Vikram Singh", email: "vikram@gmail.com", password: hashPass("1234"), phone: "8804428490", provider: "email", role: "customer" }
];

const SEED_LEDGER = [
  { id: "L1", customer_id: "u2", customer_name: "Rajesh Kumar", customer_phone: "9876543210", customer_email: "rajesh@gmail.com", date: "2026-05-25", bill_no: "VBB-2026-101", description: "Purchased Indofil M-45 Fungicide & Clause Seeds", debit: 4500, credit: 2500, due: 2000 },
  { id: "L2", customer_id: "u2", customer_name: "Rajesh Kumar", customer_phone: "9876543210", customer_email: "rajesh@gmail.com", date: "2026-05-28", bill_no: "VBB-2026-108", description: "Paid outstanding dues for May bill", debit: 0, credit: 2000, due: 0 },
  { id: "L3", customer_id: "u3", customer_name: "Vikram Singh", customer_phone: "8804428490", customer_email: "vikram@gmail.com", date: "2026-06-01", bill_no: "VBB-2026-112", description: "Purchased Seminis Abhilash Tomato Seeds & Urea", debit: 3400, credit: 3400, due: 0 }
];

const SEED_ORDERS = [
  {
    id: "o1",
    customer_name: "Rajesh Kumar",
    customer_email: "rajesh@gmail.com",
    customer_phone: "9876543210",
    items: [
      { id: "p1", name: "Indofil M-45 Fungicide", price: 250, qty: 2, unit: "500g" },
      { id: "p2", name: "Seminis Abhilash Tomato Seeds", price: 420, qty: 1, unit: "10g" }
    ],
    total: 920,
    status: "Delivered",
    address: "Naya Bhojpur, Buxar, Bihar",
    created_at: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: "o2",
    customer_name: "Vikram Singh",
    customer_email: "vikram@gmail.com",
    customer_phone: "8804428490",
    items: [
      { id: "p5", name: "Seminis Ankur Cauliflower Seeds", price: 510, qty: 4, unit: "10g" }
    ],
    total: 2040,
    status: "Processing",
    address: "Dumraon, Buxar, Bihar",
    created_at: Date.now() - 1 * 24 * 60 * 60 * 1000
  }
];

const SEED_MESSAGES = [
  { id: "m1", name: "Ramesh Sharma", email: "ramesh@gmail.com", phone: "9988776655", subject: "Bulk enquiry for Urea", message: "Hi, I need 50 bags of Urea fertilizer for my wheat crop. Do you provide doorstep delivery to Dumraon?", status: "new", created_at: Date.now() - 2 * 24 * 60 * 60 * 1000 }
];

function getLocalDb(table) {
  let key = `vbb_table_${table}`;
  if (table === 'orders') key = 'vbb-orders';
  if (table === 'ledger') key = 'vbb-ledger';
  
  const data = localStorage.getItem(key);
  if (!data) {
    let seed = [];
    if (table === 'products') seed = SEED_PRODUCTS;
    else if (table === 'users') seed = SEED_USERS;
    else if (table === 'ledger') seed = SEED_LEDGER;
    else if (table === 'orders') seed = SEED_ORDERS;
    else if (table === 'messages') seed = SEED_MESSAGES;
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
}

function saveLocalDb(table, data) {
  let key = `vbb_table_${table}`;
  if (table === 'orders') key = 'vbb-orders';
  if (table === 'ledger') key = 'vbb-ledger';
  localStorage.setItem(key, JSON.stringify(data));
}

async function apiList(table, params = '') {
  try {
    const r = await fetch(`tables/${table}${params}`);
    if (!r.ok) throw new Error('API status code: ' + r.status);
    const result = await r.json();
    return result;
  } catch (e) {
    console.warn(`[VBB DB Redirect] apiList('${table}') failed, using local simulation.`, e);
    let list = getLocalDb(table);
    
    // Process simple query parameters if search is present
    let searchVal = '';
    const searchMatch = params.match(/[?&]search=([^&]+)/);
    if (searchMatch) {
      searchVal = decodeURIComponent(searchMatch[1]).toLowerCase();
    }
    
    if (searchVal) {
      list = list.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchVal)
        )
      );
    }
    return { data: list };
  }
}

async function apiGet(table, id) {
  try {
    const r = await fetch(`tables/${table}/${id}`);
    if (!r.ok) throw new Error('API status code: ' + r.status);
    return await r.json();
  } catch (e) {
    console.warn(`[VBB DB Redirect] apiGet('${table}', '${id}') failed, using local simulation.`, e);
    const list = getLocalDb(table);
    const item = list.find(x => String(x.id) === String(id));
    if (!item) throw new Error(`Simulated item ${id} not found in table ${table}`);
    return item;
  }
}

async function apiCreate(table, data) {
  try {
    const r = await fetch(`tables/${table}`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(data) 
    });
    if (!r.ok) throw new Error('API status code: ' + r.status);
    return await r.json();
  } catch (e) {
    console.warn(`[VBB DB Redirect] apiCreate('${table}') failed, using local simulation.`, e);
    const list = getLocalDb(table);
    const newItem = {
      id: table.charAt(0) + Math.random().toString(36).substring(2, 9),
      created_at: Date.now(),
      ...data
    };
    list.push(newItem);
    saveLocalDb(table, list);
    return newItem;
  }
}

async function apiUpdate(table, id, data) {
  try {
    const r = await fetch(`tables/${table}/${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(data) 
    });
    if (!r.ok) throw new Error('API status code: ' + r.status);
    return await r.json();
  } catch (e) {
    console.warn(`[VBB DB Redirect] apiUpdate('${table}', '${id}') failed, using local simulation.`, e);
    const list = getLocalDb(table);
    const idx = list.findIndex(x => String(x.id) === String(id));
    if (idx === -1) throw new Error(`Simulated item ${id} not found in table ${table}`);
    const updated = { ...list[idx], ...data };
    list[idx] = updated;
    saveLocalDb(table, list);
    return updated;
  }
}

async function apiPatch(table, id, data) {
  try {
    const r = await fetch(`tables/${table}/${id}`, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(data) 
    });
    if (!r.ok) throw new Error('API status code: ' + r.status);
    return await r.json();
  } catch (e) {
    console.warn(`[VBB DB Redirect] apiPatch('${table}', '${id}') failed, using local simulation.`, e);
    const list = getLocalDb(table);
    const idx = list.findIndex(x => String(x.id) === String(id));
    if (idx === -1) throw new Error(`Simulated item ${id} not found in table ${table}`);
    const updated = { ...list[idx], ...data };
    list[idx] = updated;
    saveLocalDb(table, list);
    return updated;
  }
}

async function apiDelete(table, id) {
  try {
    const r = await fetch(`tables/${table}/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('API status code: ' + r.status);
    return r;
  } catch (e) {
    console.warn(`[VBB DB Redirect] apiDelete('${table}', '${id}') failed, using local simulation.`, e);
    const list = getLocalDb(table);
    const idx = list.findIndex(x => String(x.id) === String(id));
    if (idx !== -1) {
      list.splice(idx, 1);
      saveLocalDb(table, list);
    }
    return { status: 'ok' };
  }
}

document.addEventListener('DOMContentLoaded', initReveal);
