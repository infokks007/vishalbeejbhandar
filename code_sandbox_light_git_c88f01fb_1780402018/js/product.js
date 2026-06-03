/* ============ Product detail JS ============ */
mountLayout('');

let CURRENT = null, QTY = 1;
const PLACEHOLDER = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=700&q=70';

function relatedCard(p) {
  const img = p.image || PLACEHOLDER;
  return `<article class="product-card">
    <a href="product.html?id=${p.id}" class="pc-img"><img src="${img}" alt="${p.name}" loading="lazy">${p.brand?`<span class="pc-brand-tag">${p.brand}</span>`:''}</a>
    <div class="pc-body"><span class="pc-cat">${p.category||''}</span><a href="product.html?id=${p.id}"><h3 class="pc-name">${p.name}</h3></a>
    <div class="pc-price"><span class="now">${inr(p.price)}</span></div>
    <div class="pc-actions"><a href="product.html?id=${p.id}" class="btn btn-ghost btn-sm btn-block">View</a></div></div></article>`;
}

function changeQty(d) {
  QTY = Math.max(1, QTY + d);
  document.getElementById('qty-val').textContent = QTY;
}

function render(p) {
  CURRENT = p;
  document.title = `${p.name} — Vishal Beej Bhandar`;
  document.getElementById('breadcrumb').innerHTML = `<a href="index.html">Home</a> / <a href="products.html">Products</a> / <a href="products.html?category=${encodeURIComponent(p.category||'')}">${p.category||''}</a> / <span>${p.name}</span>`;
  const off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const img = p.image || PLACEHOLDER;
  const inStock = (p.stock === undefined || p.stock === null || p.stock > 0);
  const specs = (p.specialities || []);

  document.getElementById('product-content').innerHTML = `
  <div class="pd-wrap">
    <div class="pd-gallery">
      <img class="pd-main-img" src="${img}" alt="${p.name}">
    </div>
    <div>
      <div class="pd-brand">${p.brand || ''}</div>
      <h1 class="pd-title">${p.name}</h1>
      <div class="pd-rating">${'★'.repeat(Math.round(p.rating||4))}${'☆'.repeat(5-Math.round(p.rating||4))} <span>${(p.rating||4).toFixed(1)} rating</span></div>
      <div class="pd-price">
        <span class="now">${inr(p.price)}</span>
        ${off?`<span class="was">${inr(p.mrp)}</span><span class="off">${off}% OFF</span>`:''}
        ${p.unit?`<span style="color:var(--text-soft)">/ ${p.unit}</span>`:''}
      </div>
      <div class="pd-stock ${inStock?'in-stock':'out-stock'}"><i class="fa-solid ${inStock?'fa-circle-check':'fa-circle-xmark'}"></i> ${inStock?(p.stock?`In Stock (${p.stock} available)`:'In Stock'):'Out of Stock'}</div>
      <p class="pd-short">${p.short_desc || ''}</p>
      ${specs.length?`<ul class="pd-specs">${specs.map(s=>`<li><i class="fa-solid fa-leaf"></i> ${s}</li>`).join('')}</ul>`:''}
      <div class="qty-row">
        <span style="font-weight:600">Quantity:</span>
        <div class="qty-ctrl"><button onclick="changeQty(-1)">−</button><span id="qty-val">1</span><button onclick="changeQty(1)">+</button></div>
      </div>
      <div class="pd-actions">
        <button class="btn btn-primary" ${!inStock?'disabled style="opacity:.5"':''} onclick="addCurrentToCart()"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
        <button class="btn btn-pink" ${!inStock?'disabled style="opacity:.5"':''} onclick="buyNow()"><i class="fa-solid fa-bolt"></i> Buy Now</button>
        <a class="btn btn-ghost" href="https://wa.me/918804428490?text=${encodeURIComponent('Hi, I am interested in: '+p.name)}" target="_blank"><i class="fa-brands fa-whatsapp"></i> Enquire</a>
      </div>
      <div class="pd-meta">
        <span class="pd-meta-item"><i class="fa-solid fa-shield-halved"></i> 100% Genuine</span>
        <span class="pd-meta-item"><i class="fa-solid fa-award"></i> Trusted since 1995</span>
        <span class="pd-meta-item"><i class="fa-solid fa-headset"></i> Expert support</span>
      </div>
    </div>
  </div>
  <div class="pd-tabs">
    <div class="section-head" style="text-align:left;margin:0 0 0"><h2 style="font-size:1.5rem">Product <span class="gradient-text">Description</span></h2></div>
    <div class="tab-content">${p.description || p.short_desc || 'No additional description available.'}</div>
  </div>`;

  loadRelated(p);
}

function addCurrentToCart() { addToCart(CURRENT, QTY); }
function buyNow() { addToCart(CURRENT, QTY); setTimeout(()=>location.href='cart.html', 400); }

async function loadRelated(p) {
  try {
    const res = await apiList('products', '?limit=1000');
    let rel = (res.data||[]).filter(x => !x.deleted && x.id !== p.id && (x.category === p.category || x.brand === p.brand));
    rel = rel.slice(0, 4);
    if (rel.length) {
      document.getElementById('related-section').style.display = 'block';
      document.getElementById('related-grid').innerHTML = rel.map(relatedCard).join('');
    }
  } catch {}
}

async function init() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { document.getElementById('product-content').innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>Product not found.</p></div>'; return; }
  try {
    const p = await apiGet('products', id);
    if (!p || p.deleted) throw new Error();
    render(p);
  } catch {
    document.getElementById('product-content').innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>Product not found.</p><a href="products.html" class="btn btn-outline btn-sm" style="margin-top:12px">Back to Products</a></div>';
  }
}
init();
