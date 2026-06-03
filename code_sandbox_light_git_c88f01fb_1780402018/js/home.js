/* ============ Homepage JS ============ */
mountLayout('index.html');

/* ---- Typed text animation ---- */
const phrases = [
  "Seeds of Trust, Roots of Growth.",
  "Quality you can sow with confidence.",
  "Your harvest, our responsibility.",
  "Genuine Indofil • Seminis • Clause."
];
(function typeLoop() {
  const el = document.getElementById('typed');
  if (!el) return;
  let p = 0, c = 0, deleting = false;
  function tick() {
    const word = phrases[p];
    el.textContent = word.slice(0, c);
    if (!deleting && c < word.length) { c++; setTimeout(tick, 55); }
    else if (!deleting && c === word.length) { deleting = true; setTimeout(tick, 1800); }
    else if (deleting && c > 0) { c--; setTimeout(tick, 28); }
    else { deleting = false; p = (p + 1) % phrases.length; setTimeout(tick, 350); }
  }
  tick();
})();

/* ---- Animated counters ---- */
function animateCounters() {
  document.querySelectorAll('.hero-stat .num[data-count]').forEach(el => {
    const target = +el.dataset.count;
    let cur = 0; const step = Math.max(1, Math.ceil(target / 60));
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(t); }
      el.textContent = target >= 1000 ? Math.floor(cur / 1000) + 'K+' : cur + '+';
    }, 25);
  });
}
setTimeout(animateCounters, 1600);

/* ---- Categories ---- */
const CATEGORIES = [
  { name: 'Vegetable Seeds', icon: '🥬', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=70' },
  { name: 'Fruit Seeds', icon: '🍉', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=70' },
  { name: 'Field Crop Seeds', icon: '🌾', img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=70' },
  { name: 'Fungicides', icon: '🧪', img: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&q=70' },
  { name: 'Insecticides', icon: '🐛', img: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=70' },
  { name: 'Fertilizers', icon: '🌱', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=70' }
];
function renderCategories() {
  const grid = document.getElementById('cat-grid');
  grid.innerHTML = CATEGORIES.map(c => `
    <a class="cat-card" href="products.html?category=${encodeURIComponent(c.name)}">
      <img src="${c.img}" alt="${c.name}" loading="lazy">
      <div><h4>${c.icon} ${c.name}</h4><span>Explore range</span></div>
    </a>`).join('');
}
renderCategories();

/* ---- Featured products ---- */
async function loadFeatured() {
  const grid = document.getElementById('featured-grid');
  try {
    const res = await apiList('products', '?limit=100');
    let items = (res.data || []).filter(p => !p.deleted);
    let featured = items.filter(p => p.featured);
    if (featured.length < 4) featured = items.slice(0, 8);
    featured = featured.slice(0, 8);
    if (!featured.length) { grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-box-open"></i><p>Products coming soon!</p></div>`; return; }
    grid.innerHTML = featured.map(productCard).join('');
  } catch (e) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-triangle-exclamation"></i><p>Could not load products.</p></div>`;
  }
}

function productCard(p) {
  const off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const img = p.image || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=70';
  return `
  <article class="product-card">
    <a href="product.html?id=${p.id}" class="pc-img">
      <img src="${img}" alt="${p.name}" loading="lazy">
      ${off ? `<span class="pc-badge">${off}% OFF</span>` : ''}
      ${p.brand ? `<span class="pc-brand-tag">${p.brand}</span>` : ''}
    </a>
    <div class="pc-body">
      <span class="pc-cat">${p.category || ''}</span>
      <a href="product.html?id=${p.id}"><h3 class="pc-name">${p.name}</h3></a>
      <div class="pc-rating">${'★'.repeat(Math.round(p.rating||4))}<span style="color:var(--text-soft)"> ${(p.rating||4).toFixed(1)}</span></div>
      <p class="pc-desc">${p.short_desc || ''}</p>
      <div class="pc-price"><span class="now">${inr(p.price)}</span>${off?`<span class="was">${inr(p.mrp)}</span><span class="off">${off}% off</span>`:''}<span style="font-size:.78rem;color:var(--text-soft);margin-left:auto">${p.unit||''}</span></div>
      <div class="pc-actions">
        <button class="btn btn-primary btn-sm" onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,image:img,unit:p.unit})})'><i class="fa-solid fa-cart-plus"></i> Add</button>
        <a href="product.html?id=${p.id}" class="btn btn-ghost btn-sm">View</a>
      </div>
    </div>
  </article>`;
}

loadFeatured();
setTimeout(initReveal, 200);
