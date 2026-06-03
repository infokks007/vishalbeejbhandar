/* ============ My Orders JS ============ */
mountLayout('orders.html');

const ORDER_PLACEHOLDER = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&q=70';

const STATUS_ICONS = {
  pending: 'fa-clock',
  processing: 'fa-gear fa-spin',
  shipped: 'fa-truck-fast',
  delivered: 'fa-circle-check',
  cancelled: 'fa-circle-xmark'
};

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: 'fa-bag-shopping' },
  { key: 'processing', label: 'Processing', icon: 'fa-gear' },
  { key: 'shipped', label: 'Shipped', icon: 'fa-truck-fast' },
  { key: 'delivered', label: 'Delivered', icon: 'fa-circle-check' }
];

function getStatusIndex(status) {
  const s = (status || 'pending').toLowerCase();
  return TIMELINE_STEPS.findIndex(t => t.key === s);
}

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function parseItems(items) {
  if (!items) return [];
  if (typeof items === 'string') { try { return JSON.parse(items); } catch { return []; } }
  return items;
}

function renderTimeline(status) {
  const idx = getStatusIndex(status);
  return `<div class="tl-steps">
    ${TIMELINE_STEPS.map((step, i) => {
      let cls = '';
      if (i < idx) cls = 'done';
      else if (i === idx) cls = 'active';
      return `<div class="tl-step ${cls}">
        <div class="tl-dot"><i class="fa-solid ${step.icon}"></i></div>
        <span class="tl-label">${step.label}</span>
      </div>`;
    }).join('')}
  </div>`;
}

function renderOrderCard(order, index) {
  const items = parseItems(order.items);
  const status = (order.status || 'pending').toLowerCase();
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const isCancelled = status === 'cancelled';

  return `<div class="order-card">
    <div class="order-header">
      <div>
        <div class="order-id"><i class="fa-solid fa-receipt" style="color:var(--primary);margin-right:6px"></i>Order #${String(order.id || index + 1).slice(-6).padStart(4, '0')}</div>
        <div class="order-date"><i class="fa-regular fa-calendar"></i> ${formatDate(order.created_at || order.createdAt)}</div>
      </div>
      <span class="status-badge status-${status}"><i class="fa-solid ${STATUS_ICONS[status] || 'fa-circle-question'}"></i> ${statusLabel}</span>
    </div>
    <div class="order-items">
      ${items.length ? items.map(it => `
        <div class="order-item-row">
          <img src="${it.image || ORDER_PLACEHOLDER}" alt="${it.name || 'Product'}">
          <div class="oi-info">
            <h4>${it.name || 'Product'}</h4>
            <small>${it.unit || ''} × ${it.qty || 1}</small>
          </div>
          <div class="oi-price">${inr((it.price || 0) * (it.qty || 1))}</div>
        </div>
      `).join('') : '<p style="color:var(--text-soft);font-size:.9rem">Order details not available</p>'}
    </div>
    ${!isCancelled ? `<div class="track-timeline" id="track-${index}">
      ${renderTimeline(status)}
    </div>` : ''}
    <div class="order-footer">
      <div class="order-total">Total: ${inr(order.total || 0)}</div>
      <div class="order-actions">
        ${!isCancelled ? `<button class="btn btn-ghost btn-sm" onclick="toggleTrack(${index})"><i class="fa-solid fa-route"></i> Track Order</button>` : ''}
        <button class="btn btn-primary btn-sm" onclick='reorder(${JSON.stringify(items).replace(/'/g, "\\'")})' ><i class="fa-solid fa-rotate-left"></i> Reorder</button>
      </div>
    </div>
  </div>`;
}

function toggleTrack(idx) {
  const el = document.getElementById('track-' + idx);
  if (el) el.classList.toggle('open');
}

function reorder(items) {
  if (!items || !items.length) { toast('No items to reorder', 'error'); return; }
  items.forEach(it => {
    addToCart({ id: it.id, name: it.name, price: it.price, image: it.image, unit: it.unit }, it.qty || 1);
  });
  toast('Items added to cart! 🛒');
}

async function loadOrders() {
  const body = document.getElementById('orders-body');
  const user = currentUser();

  if (!user) {
    body.innerHTML = `<div class="empty-state">
      <i class="fa-solid fa-lock"></i>
      <p>Please log in to view your orders.</p>
      <a href="login.html" class="btn btn-primary" style="margin-top:14px"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
    </div>`;
    return;
  }

  body.innerHTML = '<div class="spinner"></div>';

  // Gather orders from both API and localStorage
  let orders = [];

  // Try API
  try {
    const res = await apiList('orders', '?limit=1000');
    const all = res.data || [];
    orders = all.filter(o => {
      const name = (o.customer_name || '').toLowerCase();
      const email = (o.customer_email || '').toLowerCase();
      const phone = (o.customer_phone || '').replace(/\s/g, '');
      return (
        (user.email && email === user.email.toLowerCase()) ||
        (user.name && name === user.name.toLowerCase()) ||
        (user.phone && phone === user.phone.replace(/\s/g, ''))
      );
    });
  } catch (e) {
    console.log('API orders fetch failed, using local orders');
  }

  // Merge with localStorage orders
  try {
    const localOrders = JSON.parse(localStorage.getItem('vbb-orders') || '[]');
    const apiIds = new Set(orders.map(o => o.id));
    localOrders.forEach(lo => {
      if (!apiIds.has(lo.id)) orders.push(lo);
    });
  } catch (e) {}

  // Sort by date descending
  orders.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

  if (!orders.length) {
    body.innerHTML = `<div class="empty-state">
      <i class="fa-solid fa-box-open"></i>
      <h3 style="margin:14px 0 6px;color:var(--text)">No orders yet</h3>
      <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
      <a href="products.html" class="btn btn-primary" style="margin-top:18px"><i class="fa-solid fa-bag-shopping"></i> Browse Products</a>
    </div>`;
    return;
  }

  body.innerHTML = `
    <div style="text-align:center;margin-bottom:30px">
      <p style="color:var(--text-soft)"><i class="fa-solid fa-box"></i> You have <strong>${orders.length}</strong> order${orders.length > 1 ? 's' : ''}</p>
    </div>
    <div class="orders-list">
      ${orders.map((o, i) => renderOrderCard(o, i)).join('')}
    </div>
  `;
}

loadOrders();
