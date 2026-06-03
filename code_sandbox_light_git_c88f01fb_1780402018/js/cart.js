/* ============ Cart & Checkout JS ============ */
mountLayout('');

const PLACEHOLDER = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&q=70';

function renderCart() {
  const cart = getCart();
  const body = document.getElementById('cart-body');
  if (!cart.length) {
    body.innerHTML = `<div class="empty-state"><i class="fa-solid fa-cart-shopping"></i><p>Your cart is empty.</p><a href="products.html" class="btn btn-primary" style="margin-top:14px"><i class="fa-solid fa-bag-shopping"></i> Start Shopping</a></div>`;
    return;
  }
  const total = cartTotal();
  body.innerHTML = `
  <div class="cart-layout">
    <div>
      ${cart.map(i => `
        <div class="cart-item">
          <img src="${i.image||PLACEHOLDER}" alt="${i.name}">
          <div class="ci-info"><h4>${i.name}</h4><div class="unit">${i.unit||''} &bull; ${inr(i.price)} each</div></div>
          <div class="ci-qty"><button onclick="updateQty('${i.id}',-1)">−</button><span>${i.qty}</span><button onclick="updateQty('${i.id}',1)">+</button></div>
          <div class="ci-price">${inr(i.price*i.qty)}</div>
          <button class="ci-remove" onclick="removeItem('${i.id}')" title="Remove"><i class="fa-solid fa-trash"></i></button>
        </div>`).join('')}
      <a href="products.html" class="btn btn-ghost btn-sm"><i class="fa-solid fa-arrow-left"></i> Continue Shopping</a>
    </div>
    <div class="card summary">
      <h3 style="margin-bottom:16px">Order Summary</h3>
      <div class="sum-row"><span>Items (${cart.reduce((s,i)=>s+i.qty,0)})</span><span>${inr(total)}</span></div>
      <div class="sum-row"><span>Delivery</span><span style="color:var(--green-600)">To be confirmed</span></div>
      <div class="sum-total"><span>Total</span><span>${inr(total)}</span></div>
      <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="openCheckout()"><i class="fa-solid fa-bag-shopping"></i> Checkout</button>
      <a class="btn btn-ghost btn-block" style="margin-top:10px" href="https://wa.me/918804428490?text=${encodeURIComponent(cartWhatsappText())}" target="_blank"><i class="fa-brands fa-whatsapp"></i> Order via WhatsApp</a>
    </div>
  </div>`;
}

function updateQty(id, d) {
  const cart = getCart();
  const it = cart.find(i => i.id === id);
  if (!it) return;
  it.qty += d;
  if (it.qty <= 0) { removeItem(id); return; }
  saveCart(cart); renderCart();
}
function removeItem(id) { saveCart(getCart().filter(i => i.id !== id)); renderCart(); toast('Item removed','info'); }

function cartWhatsappText() {
  const cart = getCart();
  let t = `*New Order — Vishal Beej Bhandar*\n\n`;
  cart.forEach(i => t += `• ${i.name} (${i.unit||''}) x${i.qty} = ${inr(i.price*i.qty)}\n`);
  t += `\n*Total: ${inr(cartTotal())}*`;
  return t;
}

function openCheckout() {
  const u = currentUser();
  if (u) { document.getElementById('co-name').value = u.name||''; document.getElementById('co-email').value = u.email||''; document.getElementById('co-phone').value = u.phone||''; }
  openModal('checkout-modal');
}

document.getElementById('checkout-form').addEventListener('submit', async e => {
  e.preventDefault();
  const cart = getCart();
  if (!cart.length) return;
  const data = {
    customer_name: document.getElementById('co-name').value,
    customer_phone: document.getElementById('co-phone').value,
    customer_email: document.getElementById('co-email').value,
    items: JSON.stringify(cart),
    total: cartTotal(),
    status: 'pending',
    address: document.getElementById('co-address').value
  };
  try {
    const result = await apiCreate('orders', data);
    // Save to localStorage for My Orders page
    try {
      const localOrders = JSON.parse(localStorage.getItem('vbb-orders') || '[]');
      localOrders.unshift({
        id: result.id || ('local-' + Date.now()),
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email,
        items: data.items,
        total: data.total,
        status: 'pending',
        address: data.address,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('vbb-orders', JSON.stringify(localOrders));
    } catch(e) {}
    const wa = `${cartWhatsappText()}\n\n*Customer:* ${data.customer_name}\n*Phone:* ${data.customer_phone}\n*Address:* ${data.address}`;
    closeModal('checkout-modal');
    saveCart([]);
    toast('Order placed successfully! 🎉');
    // Show success with View Orders link
    const body = document.getElementById('cart-body');
    body.innerHTML = `<div class="empty-state">
      <i class="fa-solid fa-circle-check" style="color:var(--primary)"></i>
      <h3 style="margin:14px 0 6px;color:var(--text)">Order Placed Successfully!</h3>
      <p>Your order has been received. We'll confirm it shortly via WhatsApp.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px">
        <a href="orders.html" class="btn btn-primary"><i class="fa-solid fa-box"></i> View My Orders</a>
        <a href="products.html" class="btn btn-ghost"><i class="fa-solid fa-bag-shopping"></i> Continue Shopping</a>
      </div>
    </div>`;
    setTimeout(() => { window.open(`https://wa.me/918804428490?text=${encodeURIComponent(wa)}`, '_blank'); }, 800);
  } catch {
    toast('Could not place order. Please try WhatsApp.', 'error');
  }
});

renderCart();
