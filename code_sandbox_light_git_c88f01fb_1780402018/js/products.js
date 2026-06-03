/* ============ Products page JS ============ */
mountLayout('products.html');

let ALL_PRODUCTS = [];
let state = { search: '', brands: [], cats: [], maxPrice: 2000, sort: 'featured' };

const BRANDS = ['Indofil', 'Seminis', 'Clause', 'Other'];
const CATS = ['Vegetable Seeds','Fruit Seeds','Field Crop Seeds','Fungicides','Insecticides','Herbicides','Fertilizers','Plant Nutrition','Other'];

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
      <div class="pc-price"><span class="now">${inr(p.price)}</span>${off?`<span class="was">${inr(p.mrp)}</span>`:''}<span style="font-size:.78rem;color:var(--text-soft);margin-left:auto">${p.unit||''}</span></div>
      <div class="pc-actions">
        <button class="btn btn-primary btn-sm" onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,image:img,unit:p.unit})})'><i class="fa-solid fa-cart-plus"></i> Add</button>
        <a href="product.html?id=${p.id}" class="btn btn-ghost btn-sm">View</a>
      </div>
    </div>
  </article>`;
}

function buildFilterUI() {
  document.getElementById('brand-filters').innerHTML = BRANDS.map(b =>
    `<label class="filter-opt"><input type="checkbox" value="${b}" class="brand-cb" onchange="onFilterChange()"> ${b}</label>`).join('');
  document.getElementById('cat-filters').innerHTML = CATS.map(c =>
    `<label class="filter-opt"><input type="checkbox" value="${c}" class="cat-cb" onchange="onFilterChange()"> ${c}</label>`).join('');
}

function onFilterChange() {
  state.brands = [...document.querySelectorAll('.brand-cb:checked')].map(c => c.value);
  state.cats = [...document.querySelectorAll('.cat-cb:checked')].map(c => c.value);
  render();
}

function clearFilters() {
  document.querySelectorAll('.brand-cb, .cat-cb').forEach(c => c.checked = false);
  document.getElementById('price-range').value = 2000;
  document.getElementById('price-label').textContent = '₹2000';
  document.getElementById('side-search').value = '';
  document.getElementById('top-search').value = '';
  state = { search: '', brands: [], cats: [], maxPrice: 2000, sort: state.sort };
  render();
}

function render() {
  let list = ALL_PRODUCTS.filter(p => !p.deleted);
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p => (p.name + ' ' + (p.short_desc||'') + ' ' + (p.brand||'') + ' ' + (p.category||'') + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(q));
  }
  if (state.brands.length) list = list.filter(p => state.brands.includes(p.brand));
  if (state.cats.length) list = list.filter(p => state.cats.includes(p.category));
  list = list.filter(p => (p.price||0) <= state.maxPrice);

  if (state.sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  else if (state.sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  else if (state.sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
  else list.sort((a,b) => (b.featured?1:0) - (a.featured?1:0));

  const grid = document.getElementById('products-grid');
  document.getElementById('result-count').textContent = `${list.length} product${list.length!==1?'s':''}`;
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-magnifying-glass"></i><p>No products match your filters.</p><button class="btn btn-outline btn-sm" onclick="clearFilters()" style="margin-top:12px">Reset Filters</button></div>`;
    return;
  }
  grid.innerHTML = list.map(productCard).join('');
}

async function init() {
  buildFilterUI();
  // Read URL params
  const params = new URLSearchParams(location.search);
  const urlBrand = params.get('brand');
  const urlCat = params.get('category');
  const urlSearch = params.get('search');

  try {
    const res = await apiList('products', '?limit=1000');
    ALL_PRODUCTS = res.data || [];
    const maxP = Math.max(2000, ...ALL_PRODUCTS.map(p => p.price || 0));
    const range = document.getElementById('price-range');
    range.max = Math.ceil(maxP / 50) * 50; range.value = range.max;
    state.maxPrice = +range.max;
    document.getElementById('price-label').textContent = inr(range.value);
  } catch (e) {
    document.getElementById('products-grid').innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-triangle-exclamation"></i><p>Could not load products.</p></div>`;
    return;
  }

  if (urlBrand) { const cb = document.querySelector(`.brand-cb[value="${urlBrand}"]`); if (cb){cb.checked=true; state.brands=[urlBrand];} }
  if (urlCat) { const cb = document.querySelector(`.cat-cb[value="${urlCat}"]`); if (cb){cb.checked=true; state.cats=[urlCat];} }
  if (urlSearch) { state.search = urlSearch; document.getElementById('top-search').value = urlSearch; document.getElementById('side-search').value = urlSearch; }

  render();
}

// Events
document.getElementById('top-search').addEventListener('input', e => { state.search = e.target.value; document.getElementById('side-search').value = e.target.value; render(); });
document.getElementById('side-search').addEventListener('input', e => { state.search = e.target.value; document.getElementById('top-search').value = e.target.value; render(); });
document.getElementById('price-range').addEventListener('input', e => { state.maxPrice = +e.target.value; document.getElementById('price-label').textContent = inr(e.target.value); render(); });
document.getElementById('sort-select').addEventListener('change', e => { state.sort = e.target.value; render(); });

init();
