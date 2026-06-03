/* ============ Admin Panel JS ============ */
mountLayout('admin.html');

let DATA = { products: [], orders: [], messages: [], customers: [], ledger: [] };

/* ---- Lock / unlock ---- */
function unlock(){ document.getElementById('lock-screen').style.display='none'; document.getElementById('admin-dashboard').style.display='grid'; sessionStorage.setItem('vbb-admin','yes'); loadAll(); }
if(isAdmin()) unlock();

document.getElementById('admin-login-form').addEventListener('submit', e=>{
  e.preventDefault();
  const p=document.getElementById('admin-pass').value;
  if(p===SHOP.adminPass){ toast('Welcome, Admin! 🌿'); unlock(); }
  else { toast('Incorrect password','error'); document.getElementById('admin-pass').value=''; }
});
function adminLogout(){ sessionStorage.removeItem('vbb-admin'); toast('Logged out of admin'); setTimeout(()=>location.href='index.html',700); }

/* ---- Panels ---- */
function showPanel(name, btn){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+name).classList.add('active');
  document.querySelectorAll('.admin-nav button[data-panel]').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  document.getElementById('admin-sidebar').classList.remove('open');
}

/* ---- Load all data ---- */
async function loadAll(){
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  await Promise.all([loadProducts(), loadOrders(), loadMessages(), loadCustomers(), loadLedger()]);
  renderDashboard();
}

async function loadProducts(){
  try{ const r=await apiList('products','?limit=1000'); DATA.products=(r.data||[]).filter(p=>!p.deleted); renderProducts(); }catch{}
}
async function loadOrders(){
  try{ const r=await apiList('orders','?limit=1000'); DATA.orders=(r.data||[]).filter(o=>!o.deleted).sort((a,b)=>b.created_at-a.created_at); renderOrders(); }catch{}
}
async function loadMessages(){
  try{ const r=await apiList('messages','?limit=1000'); DATA.messages=(r.data||[]).filter(m=>!m.deleted).sort((a,b)=>b.created_at-a.created_at); renderMessages(); }catch{}
}
async function loadCustomers(){
  try{ const r=await apiList('users','?limit=1000'); DATA.customers=(r.data||[]).filter(u=>!u.deleted); renderCustomers(); }catch{}
}

/* ---- Dashboard ---- */
function renderDashboard(){
  const revenue=DATA.orders.reduce((s,o)=>s+(o.total||0),0);
  const newMsgs=DATA.messages.filter(m=>m.status==='new').length;
  
  // Calculate total outstanding dues
  let totalDues = 0;
  (DATA.ledger || []).forEach(item => {
    totalDues += Number(item.due || 0);
  });

  document.getElementById('stat-cards').innerHTML=`
    ${statCard('fa-box','#3d7a44',DATA.products.length,'Products')}
    ${statCard('fa-bag-shopping','#e85d92',DATA.orders.length,'Orders')}
    ${statCard('fa-indian-rupee-sign','#768C37',inr(revenue),'Total Sales')}
    ${statCard('fa-users','#2f5233',DATA.customers.length,'Customers')}
    ${statCard('fa-file-invoice-dollar','#e65100',inr(totalDues),'Outstanding Dues')}
    ${statCard('fa-envelope','#d6457f',newMsgs,'New Messages')}`;
  const recent=DATA.orders.slice(0,5);
  document.getElementById('recent-orders').innerHTML = recent.length
    ? recent.map(o=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)"><span><strong>${o.customer_name||'—'}</strong> <small style="color:var(--text-soft)">${new Date(o.created_at).toLocaleDateString('en-IN')}</small></span><span style="font-weight:700;color:var(--green-600)">${inr(o.total)}</span></div>`).join('')
    : '<p style="color:var(--text-soft)">No orders yet.</p>';
}
function statCard(ic,color,num,lbl){ return `<div class="stat-card"><div class="ico" style="background:${color}"><i class="fa-solid ${ic}"></i></div><div class="num">${num}</div><div class="lbl">${lbl}</div></div>`; }

/* ---- Products table ---- */
function renderProducts(){
  const tb=document.getElementById('products-tbody');
  if(!DATA.products.length){ tb.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--text-soft);padding:30px">No products yet. Click "Add Product".</td></tr>'; return; }
  tb.innerHTML=DATA.products.map(p=>`<tr>
    <td><img class="tbl-img" src="${p.image||'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100'}" alt=""></td>
    <td>${p.name}</td><td>${p.brand||'-'}</td><td>${p.category||'-'}</td><td>${inr(p.price)}</td>
    <td>${p.stock??'-'}</td><td>${p.featured?'<span class="pill pill-green">Yes</span>':'<span class="pill pill-grey">No</span>'}</td>
    <td class="tbl-actions"><button class="edit-btn" onclick="editProduct('${p.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button><button class="del-btn" onclick="deleteProduct('${p.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button></td>
  </tr>`).join('');
}

function openProductForm(){
  document.getElementById('pf-title').textContent='Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('pf-id').value='';
  document.getElementById('pf-stock').value=50; document.getElementById('pf-rating').value=4.5;
  openModal('product-modal');
}
function editProduct(id){
  const p=DATA.products.find(x=>x.id===id); if(!p)return;
  document.getElementById('pf-title').textContent='Edit Product';
  document.getElementById('pf-id').value=p.id;
  document.getElementById('pf-name').value=p.name||'';
  document.getElementById('pf-brand').value=p.brand||'Indofil';
  document.getElementById('pf-category').value=p.category||'Vegetable Seeds';
  document.getElementById('pf-price').value=p.price||'';
  document.getElementById('pf-mrp').value=p.mrp||'';
  document.getElementById('pf-unit').value=p.unit||'';
  document.getElementById('pf-stock').value=p.stock??50;
  document.getElementById('pf-image').value=p.image||'';
  document.getElementById('pf-short').value=p.short_desc||'';
  document.getElementById('pf-desc').value=p.description||'';
  document.getElementById('pf-specs').value=(p.specialities||[]).join(', ');
  document.getElementById('pf-tags').value=(p.tags||[]).join(', ');
  document.getElementById('pf-rating').value=p.rating||4.5;
  document.getElementById('pf-featured').checked=!!p.featured;
  openModal('product-modal');
}
async function deleteProduct(id){
  if(!confirm('Delete this product?'))return;
  try{ await apiDelete('products',id); DATA.products=DATA.products.filter(p=>p.id!==id); renderProducts(); renderDashboard(); toast('Product deleted','info'); }
  catch{ toast('Delete failed','error'); }
}
document.getElementById('product-form').addEventListener('submit', async e=>{
  e.preventDefault();
  const id=document.getElementById('pf-id').value;
  const data={
    name:document.getElementById('pf-name').value,
    brand:document.getElementById('pf-brand').value,
    category:document.getElementById('pf-category').value,
    price:+document.getElementById('pf-price').value,
    mrp:+document.getElementById('pf-mrp').value||0,
    unit:document.getElementById('pf-unit').value,
    stock:+document.getElementById('pf-stock').value||0,
    image:document.getElementById('pf-image').value,
    short_desc:document.getElementById('pf-short').value,
    description:document.getElementById('pf-desc').value,
    specialities:document.getElementById('pf-specs').value.split(',').map(s=>s.trim()).filter(Boolean),
    tags:document.getElementById('pf-tags').value.split(',').map(s=>s.trim()).filter(Boolean),
    rating:+document.getElementById('pf-rating').value||4.5,
    featured:document.getElementById('pf-featured').checked
  };
  try{
    if(id){ await apiUpdate('products',id,data); toast('Product updated'); }
    else { await apiCreate('products',data); toast('Product added'); }
    closeModal('product-modal'); await loadProducts(); renderDashboard();
  }catch{ toast('Save failed','error'); }
});

/* ---- Orders ---- */
const ORDER_STATUSES = ['pending','processing','shipped','delivered','cancelled'];

function renderOrders(){
  const tb=document.getElementById('orders-tbody');
  const countEl=document.getElementById('orders-count');
  if(countEl) countEl.textContent=DATA.orders.length ? `${DATA.orders.length} order${DATA.orders.length>1?'s':''}` : '';
  if(!DATA.orders.length){ tb.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--text-soft);padding:30px">No orders yet.</td></tr>'; return; }
  tb.innerHTML=DATA.orders.map(o=>{
    let itemCount=0;
    try{ itemCount=JSON.parse(o.items||'[]').length; }catch{}
    const s=(o.status||'pending').toLowerCase();
    return `<tr>
    <td>${new Date(o.created_at).toLocaleDateString('en-IN')}</td><td>${o.customer_name||'-'}</td><td>${o.customer_phone||'-'}</td>
    <td>${itemCount} item${itemCount!==1?'s':''}</td>
    <td>${inr(o.total)}</td>
    <td><select class="status-select s-${s}" onchange="quickUpdateStatus('${o.id}',this.value,this)" title="Change status">
      ${ORDER_STATUSES.map(st=>`<option value="${st}" ${s===st?'selected':''}>${st.charAt(0).toUpperCase()+st.slice(1)}</option>`).join('')}
    </select></td>
    <td class="tbl-actions"><button class="edit-btn" onclick="viewOrder('${o.id}')" title="View Details" style="color:var(--text-soft)"><i class="fa-solid fa-eye"></i></button><button class="edit-btn" onclick="editOrder('${o.id}')" title="Edit Order"><i class="fa-solid fa-pen"></i></button><button class="del-btn" onclick="deleteRow('orders','${o.id}',loadOrders)" title="Delete"><i class="fa-solid fa-trash"></i></button></td>
  </tr>`;
  }).join('');
}

async function quickUpdateStatus(id, status, selectEl){
  try{
    await apiPatch('orders',id,{status});
    const o=DATA.orders.find(x=>x.id===id);
    if(o) o.status=status;
    // Update select styling
    selectEl.className='status-select s-'+status;
    toast(`Order status → ${status.charAt(0).toUpperCase()+status.slice(1)}`);
    renderDashboard();
  }catch{ toast('Status update failed','error'); }
}

function viewOrder(id){
  const o=DATA.orders.find(x=>x.id===id); if(!o)return;
  let items=[]; try{ items=JSON.parse(o.items||'[]'); }catch{}
  const s=(o.status||'pending').toLowerCase();
  document.getElementById('order-detail').innerHTML=`
    <h3 style="margin-bottom:4px">Order Details</h3>
    <p style="color:var(--text-soft);font-size:.82rem;margin-bottom:18px">Order ID: ${String(o.id).slice(-8)} • ${new Date(o.created_at).toLocaleString('en-IN')}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px">
      <div><small style="color:var(--text-soft)">Customer</small><p style="font-weight:600">${o.customer_name||'-'}</p></div>
      <div><small style="color:var(--text-soft)">Phone</small><p style="font-weight:600">${o.customer_phone||'-'}</p></div>
      <div><small style="color:var(--text-soft)">Email</small><p style="font-weight:600">${o.customer_email||'-'}</p></div>
      <div><small style="color:var(--text-soft)">Address</small><p style="font-weight:600">${o.address||'-'}</p></div>
    </div>
    <h4 style="margin-bottom:10px"><i class="fa-solid fa-box" style="color:var(--primary)"></i> Items Ordered</h4>
    <table style="margin-bottom:18px"><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>
      ${items.map(i=>`<tr><td>${i.name||'Product'}</td><td>${i.qty||1}</td><td>${inr((i.price||0)*(i.qty||1))}</td></tr>`).join('')}
    </tbody></table>
    <p style="text-align:right;font-size:1.2rem;font-weight:700;margin-bottom:18px">Total: ${inr(o.total)}</p>
    <h4 style="margin-bottom:10px"><i class="fa-solid fa-route" style="color:var(--primary)"></i> Update Status</h4>
    <div class="form-group">
      <select id="order-status" class="status-select s-${s}" style="width:100%;padding:10px 16px;font-size:.9rem">
        ${ORDER_STATUSES.map(st=>`<option value="${st}" ${s===st?'selected':''}>${st.charAt(0).toUpperCase()+st.slice(1)}</option>`).join('')}
      </select>
    </div>
    <button class="btn btn-primary btn-block" onclick="updateOrderStatus('${o.id}')"><i class="fa-solid fa-floppy-disk"></i> Save Status</button>
    <a class="btn btn-ghost btn-block" style="margin-top:8px" href="https://wa.me/91${(o.customer_phone||'').replace(/\\D/g,'')}" target="_blank"><i class="fa-brands fa-whatsapp"></i> Message Customer</a>`;
  openModal('order-modal');
}

async function updateOrderStatus(id){
  const status=document.getElementById('order-status').value;
  try{ await apiPatch('orders',id,{status}); toast('Order status updated to: '+status.charAt(0).toUpperCase()+status.slice(1)); closeModal('order-modal'); await loadOrders(); renderDashboard(); }
  catch{ toast('Update failed','error'); }
}

/* ---- Messages ---- */
function renderMessages(){
  const tb=document.getElementById('messages-tbody');
  if(!DATA.messages.length){ tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--text-soft);padding:30px">No messages yet.</td></tr>'; return; }
  tb.innerHTML=DATA.messages.map(m=>`<tr>
    <td>${new Date(m.created_at).toLocaleDateString('en-IN')}</td><td>${m.name||'-'}</td><td>${m.subject||'-'}</td>
    <td>${m.phone||m.email||'-'}</td><td>${m.status==='new'?'<span class="pill pill-pink">New</span>':'<span class="pill pill-green">'+(m.status||'read')+'</span>'}</td>
    <td class="tbl-actions"><button class="edit-btn" onclick="viewMsg('${m.id}')"><i class="fa-solid fa-eye"></i></button><button class="del-btn" onclick="deleteRow('messages','${m.id}',loadMessages)"><i class="fa-solid fa-trash"></i></button></td>
  </tr>`).join('');
}
function viewMsg(id){
  const m=DATA.messages.find(x=>x.id===id); if(!m)return;
  if(m.status==='new'){ apiPatch('messages',id,{status:'read'}).then(loadMessages); }
  document.getElementById('msg-detail').innerHTML=`
    <h3 style="margin-bottom:14px">${m.subject||'Message'}</h3>
    <p><strong>From:</strong> ${m.name||'-'}</p>
    <p><strong>Phone:</strong> ${m.phone||'-'}</p>
    <p><strong>Email:</strong> ${m.email||'-'}</p>
    <p><strong>Date:</strong> ${new Date(m.created_at).toLocaleString('en-IN')}</p>
    <div style="margin:14px 0;padding:14px;background:var(--bg-alt);border-radius:12px">${m.message||''}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a class="btn btn-ghost btn-sm" href="mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject||'')}"><i class="fa-solid fa-reply"></i> Email</a>
      <a class="btn btn-ghost btn-sm" href="https://wa.me/91${(m.phone||'').replace(/\D/g,'')}" target="_blank"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      <button class="btn btn-primary btn-sm" onclick="apiPatch('messages','${m.id}',{status:'resolved'}).then(()=>{toast('Marked resolved');closeModal('msg-modal');loadMessages();})">Mark Resolved</button>
    </div>`;
  openModal('msg-modal');
}

/* ---- Customers ---- */
function renderCustomers(){
  const tb=document.getElementById('customers-tbody');
  if(!DATA.customers.length){ tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--text-soft);padding:30px">No customers yet.</td></tr>'; return; }
  tb.innerHTML=DATA.customers.map(u=>`<tr>
    <td>${u.name||'-'}</td><td>${u.email||'-'}</td><td>${u.phone||'-'}</td>
    <td>${u.provider==='google'?'<span class="pill pill-green"><i class="fa-brands fa-google"></i> Google</span>':'<span class="pill pill-grey">Email</span>'}</td>
    <td>${u.role||'customer'}</td>
    <td class="tbl-actions">
      <button class="edit-btn" onclick="viewCustomerLedger('${u.name}','${u.phone}','${u.email}')" title="View Customer Ledger"><i class="fa-solid fa-file-invoice-dollar"></i> View Ledger</button>
    </td>
  </tr>`).join('');
}

async function deleteRow(table,id,reload){ if(!confirm('Delete this entry?'))return; try{ await apiDelete(table,id); toast('Deleted','info'); await reload(); renderDashboard(); }catch{ toast('Delete failed','error'); } }

/* ---- Ledger Operations ---- */
async function loadLedger() {
  try {
    const r = await apiList('ledger', '?limit=1000');
    if ((!r.data || r.data.length === 0) && !localStorage.getItem('vbb-ledger')) {
      initializeMockLedger();
    }
    DATA.ledger = (r.data || []).sort((a,b) => new Date(b.date) - new Date(a.date));
    if (DATA.ledger.length === 0) {
      DATA.ledger = JSON.parse(localStorage.getItem('vbb-ledger') || '[]');
    }
    renderLedger();
  } catch(e) {
    console.error('Failed to load ledger from API. Trying local storage backup.', e);
    try {
      if (!localStorage.getItem('vbb-ledger')) {
        initializeMockLedger();
      }
      DATA.ledger = JSON.parse(localStorage.getItem('vbb-ledger') || '[]');
      renderLedger();
    } catch(err) {}
  }
}

function initializeMockLedger() {
  const sample = [
    {
      id: 'L-1',
      customer_id: 'guest-1',
      customer_name: 'Ramesh Singh',
      customer_phone: '9876543210',
      customer_email: 'ramesh@gmail.com',
      date: '2026-05-15',
      bill_no: 'VBB-2026-012',
      description: 'Purchased Indofil M-45 Fungicide & Clause Seeds',
      debit: 5200,
      credit: 3000,
      due: 2200
    },
    {
      id: 'L-2',
      customer_id: 'guest-1',
      customer_name: 'Ramesh Singh',
      customer_phone: '9876543210',
      customer_email: 'ramesh@gmail.com',
      date: '2026-05-20',
      bill_no: 'VBB-2026-019',
      description: 'Cash Payment received',
      debit: 0,
      credit: 2200,
      due: 0
    },
    {
      id: 'L-3',
      customer_id: 'guest-2',
      customer_name: 'Sunita Devi',
      customer_phone: '8899001122',
      customer_email: 'sunita@outlook.com',
      date: '2026-05-28',
      bill_no: 'VBB-2026-033',
      description: 'Purchased Seminis Hybrid Tomato Seeds & Fertilizers',
      debit: 3500,
      credit: 1500,
      due: 2000
    }
  ];
  localStorage.setItem('vbb-ledger', JSON.stringify(sample));
}

function renderLedger() {
  const tb = document.getElementById('ledger-tbody-admin');
  if(!tb) return;
  if(!DATA.ledger || !DATA.ledger.length) {
    tb.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-soft);padding:30px">No ledger transactions yet. Click "Add Transaction".</td></tr>';
    return;
  }
  tb.innerHTML = DATA.ledger.map(item => {
    const cName = item.customer_name || 'Manual Customer';
    const hasDue = Number(item.due || 0) > 0;
    return `<tr>
      <td>${new Date(item.date).toLocaleDateString('en-IN')}</td>
      <td>
        <strong>${cName}</strong><br>
        <small style="color:var(--text-soft)">${item.customer_phone || ''}</small>
      </td>
      <td><span style="font-family:monospace;font-weight:600;background:var(--bg);padding:4px 8px;border-radius:4px;border:1px solid var(--border);">${item.bill_no || 'N/A'}</span></td>
      <td>${item.description || '—'}</td>
      <td style="font-weight:700;color:var(--pink-600)">${Number(item.debit) > 0 ? inr(item.debit) : '—'}</td>
      <td style="font-weight:700;color:var(--green-600)">${Number(item.credit) > 0 ? inr(item.credit) : '—'}</td>
      <td>
        ${hasDue ? `<span class="pill pill-pink" style="background:#fff3e0;color:#e65100"><i class="fa-solid fa-triangle-exclamation"></i> ${inr(item.due)}</span>` : `<span class="pill pill-green"><i class="fa-solid fa-circle-check"></i> Paid</span>`}
      </td>
      <td class="tbl-actions">
        <button class="edit-btn" onclick="editLedger('${item.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="del-btn" onclick="deleteLedger('${item.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

function openLedgerForm() {
  document.getElementById('lf-title').textContent = 'Add Ledger Transaction';
  document.getElementById('ledger-form').reset();
  document.getElementById('lf-id').value = '';
  document.getElementById('lf-date').value = new Date().toISOString().substring(0, 10);
  
  // Populate customer dropdown
  const select = document.getElementById('lf-customer-select');
  select.innerHTML = '<option value="">-- Choose Registered Customer --</option><option value="manual">-- Manual / Guest Customer Entry --</option>';
  DATA.customers.forEach(c => {
    if (c.role !== 'admin') {
      select.innerHTML += `<option value="${c.id}" data-name="${c.name}" data-phone="${c.phone||''}" data-email="${c.email||''}">${c.name} (${c.phone || c.email || 'No Phone/Email'})</option>`;
    }
  });
  
  document.getElementById('lf-manual-fields').style.display = 'none';
  
  openModal('ledger-modal');
}

function onAdminCustomerSelectChange() {
  const select = document.getElementById('lf-customer-select');
  const val = select.value;
  const manualFields = document.getElementById('lf-manual-fields');
  
  const nameInput = document.getElementById('lf-name');
  const phoneInput = document.getElementById('lf-phone');
  const emailInput = document.getElementById('lf-email');
  
  if (val === 'manual') {
    manualFields.style.display = 'block';
    nameInput.required = true;
    nameInput.value = '';
    phoneInput.value = '';
    emailInput.value = '';
  } else {
    manualFields.style.display = 'none';
    nameInput.required = false;
    if (val) {
      const opt = select.options[select.selectedIndex];
      nameInput.value = opt.getAttribute('data-name') || '';
      phoneInput.value = opt.getAttribute('data-phone') || '';
      emailInput.value = opt.getAttribute('data-email') || '';
    } else {
      nameInput.value = '';
      phoneInput.value = '';
      emailInput.value = '';
    }
  }
}

function calculateModalDue() {
  const deb = Number(document.getElementById('lf-debit').value || 0);
  const cre = Number(document.getElementById('lf-credit').value || 0);
  document.getElementById('lf-due').value = Math.max(0, deb - cre);
}

document.getElementById('ledger-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('lf-id').value;
  
  const select = document.getElementById('lf-customer-select');
  let customerId = select.value;
  let customerName = '';
  let customerPhone = '';
  let customerEmail = '';
  
  if (customerId === 'manual') {
    customerName = document.getElementById('lf-name').value.trim();
    customerPhone = document.getElementById('lf-phone').value.trim();
    customerEmail = document.getElementById('lf-email').value.trim();
    customerId = 'guest-' + Date.now();
  } else {
    const opt = select.options[select.selectedIndex];
    customerName = opt.getAttribute('data-name') || '';
    customerPhone = opt.getAttribute('data-phone') || '';
    customerEmail = opt.getAttribute('data-email') || '';
  }
  
  const data = {
    customer_id: customerId,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    date: document.getElementById('lf-date').value,
    bill_no: document.getElementById('lf-bill').value.trim(),
    description: document.getElementById('lf-desc').value.trim(),
    debit: Number(document.getElementById('lf-debit').value || 0),
    credit: Number(document.getElementById('lf-credit').value || 0),
    due: Number(document.getElementById('lf-due').value || 0)
  };
  
  try {
    if (id) {
      await apiUpdate('ledger', id, data);
      toast('Ledger transaction updated');
    } else {
      await apiCreate('ledger', data);
      toast('Ledger transaction added');
    }
    closeModal('ledger-modal');
    await loadLedger();
    renderDashboard();
  } catch (err) {
    console.error('API Ledger save failed. Saving to local storage.', err);
    // Local storage fallback for simulation
    try {
      let localLedger = JSON.parse(localStorage.getItem('vbb-ledger') || '[]');
      if (id) {
        localLedger = localLedger.map(item => item.id === id ? { ...item, ...data } : item);
      } else {
        data.id = 'L-' + Date.now();
        localLedger.push(data);
      }
      localStorage.setItem('vbb-ledger', JSON.stringify(localLedger));
      toast('Saved locally successfully');
      closeModal('ledger-modal');
      await loadLedger();
      renderDashboard();
    } catch (e) {
      toast('Save failed', 'error');
    }
  }
});

function editLedger(id) {
  const item = DATA.ledger.find(x => x.id === id);
  if (!item) return;
  
  document.getElementById('lf-title').textContent = 'Edit Ledger Transaction';
  document.getElementById('lf-id').value = item.id;
  
  // Populate customer dropdown
  const select = document.getElementById('lf-customer-select');
  select.innerHTML = '<option value="">-- Choose Registered Customer --</option><option value="manual">-- Manual / Guest Customer Entry --</option>';
  DATA.customers.forEach(c => {
    if (c.role !== 'admin') {
      select.innerHTML += `<option value="${c.id}" data-name="${c.name}" data-phone="${c.phone||''}" data-email="${c.email||''}">${c.name} (${c.phone || c.email || 'No Phone/Email'})</option>`;
    }
  });
  
  const manualFields = document.getElementById('lf-manual-fields');
  
  // Determine if it was manual or registered
  const isRegistered = DATA.customers.some(c => c.id === item.customer_id);
  if (isRegistered) {
    select.value = item.customer_id;
    manualFields.style.display = 'none';
  } else {
    select.value = 'manual';
    manualFields.style.display = 'block';
  }
  
  document.getElementById('lf-name').value = item.customer_name || '';
  document.getElementById('lf-phone').value = item.customer_phone || '';
  document.getElementById('lf-email').value = item.customer_email || '';
  
  document.getElementById('lf-date').value = item.date ? item.date.substring(0, 10) : '';
  document.getElementById('lf-bill').value = item.bill_no || '';
  document.getElementById('lf-desc').value = item.description || '';
  document.getElementById('lf-debit').value = item.debit || 0;
  document.getElementById('lf-credit').value = item.credit || 0;
  document.getElementById('lf-due').value = item.due || 0;
  
  openModal('ledger-modal');
}

async function deleteLedger(id) {
  if (!confirm('Are you sure you want to delete this transaction from the ledger?')) return;
  try {
    await apiDelete('ledger', id);
    DATA.ledger = DATA.ledger.filter(x => x.id !== id);
    renderLedger();
    renderDashboard();
    toast('Transaction deleted', 'info');
  } catch (err) {
    console.error('API delete failed. Trying local storage.', err);
    try {
      let localLedger = JSON.parse(localStorage.getItem('vbb-ledger') || '[]');
      localLedger = localLedger.filter(x => x.id !== id);
      localStorage.setItem('vbb-ledger', JSON.stringify(localLedger));
      DATA.ledger = DATA.ledger.filter(x => x.id !== id);
      renderLedger();
      renderDashboard();
      toast('Deleted locally', 'info');
    } catch (e) {
      toast('Delete failed', 'error');
    }
  }
}

function filterAdminLedger() {
  const query = document.getElementById('admin-ledger-search').value.trim().toLowerCase();
  const filterType = document.getElementById('admin-ledger-filter').value;
  const tb = document.getElementById('ledger-tbody-admin');
  if (!tb) return;
  
  let filtered = DATA.ledger;
  
  if (query) {
    filtered = filtered.filter(item => {
      const name = (item.customer_name || '').toLowerCase();
      const phone = (item.customer_phone || '').toLowerCase();
      const bill = (item.bill_no || '').toLowerCase();
      return name.includes(query) || phone.includes(query) || bill.includes(query);
    });
  }
  
  if (filterType === 'due') {
    filtered = filtered.filter(item => Number(item.due || 0) > 0);
  }
  
  if (!filtered.length) {
    tb.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-soft);padding:30px">No matching ledger records.</td></tr>';
    return;
  }
  
  tb.innerHTML = filtered.map(item => {
    const cName = item.customer_name || 'Manual Customer';
    const hasDue = Number(item.due || 0) > 0;
    return `<tr>
      <td>${new Date(item.date).toLocaleDateString('en-IN')}</td>
      <td>
        <strong>${cName}</strong><br>
        <small style="color:var(--text-soft)">${item.customer_phone || ''}</small>
      </td>
      <td><span style="font-family:monospace;font-weight:600;background:var(--bg);padding:4px 8px;border-radius:4px;border:1px solid var(--border);">${item.bill_no || 'N/A'}</span></td>
      <td>${item.description || '—'}</td>
      <td style="font-weight:700;color:var(--pink-600)">${Number(item.debit) > 0 ? inr(item.debit) : '—'}</td>
      <td style="font-weight:700;color:var(--green-600)">${Number(item.credit) > 0 ? inr(item.credit) : '—'}</td>
      <td>
        ${hasDue ? `<span class="pill pill-pink" style="background:#fff3e0;color:#e65100"><i class="fa-solid fa-triangle-exclamation"></i> ${inr(item.due)}</span>` : `<span class="pill pill-green"><i class="fa-solid fa-circle-check"></i> Paid</span>`}
      </td>
      <td class="tbl-actions">
        <button class="edit-btn" onclick="editLedger('${item.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="del-btn" onclick="deleteLedger('${item.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

function viewCustomerLedger(name, phone, email) {
  // Switch to ledger panel
  const ledgerBtn = document.querySelector('.admin-nav button[data-panel="ledger"]');
  showPanel('ledger', ledgerBtn);
  
  // Set search field to customer's name
  const searchInput = document.getElementById('admin-ledger-search');
  if (searchInput) {
    searchInput.value = name || phone || email || '';
    filterAdminLedger();
  }
}

/* ---- Order CRUD Operations ---- */
function openOrderForm(orderId = null) {
  const title = document.getElementById('of-title');
  const form = document.getElementById('order-form');
  const itemsContainer = document.getElementById('of-items-container');
  
  form.reset();
  itemsContainer.innerHTML = '';
  
  // Populate customer dropdown select
  const select = document.getElementById('of-customer-select');
  select.innerHTML = '<option value="">-- Choose Registered Customer --</option><option value="manual">-- Manual / Guest Customer Entry --</option>';
  DATA.customers.forEach(c => {
    if (c.role !== 'admin') {
      select.innerHTML += `<option value="${c.id}" data-name="${c.name}" data-phone="${c.phone||''}" data-email="${c.email||''}">${c.name} (${c.phone || c.email || 'No Phone/Email'})</option>`;
    }
  });

  const manualFields = document.getElementById('of-manual-fields');

  if (orderId) {
    title.textContent = 'Edit Order';
    document.getElementById('of-id').value = orderId;
    
    const o = DATA.orders.find(x => x.id === orderId);
    if (o) {
      // Find if customer is registered
      const exCust = DATA.customers.find(c => 
        (o.customer_email && c.email && c.email.toLowerCase() === o.customer_email.toLowerCase()) ||
        (o.customer_phone && c.phone && c.phone.replace(/\s/g,'') === o.customer_phone.replace(/\s/g,''))
      );

      if (exCust) {
        select.value = exCust.id;
        manualFields.style.display = 'none';
      } else {
        select.value = 'manual';
        manualFields.style.display = 'block';
      }

      document.getElementById('of-name').value = o.customer_name || '';
      document.getElementById('of-phone').value = o.customer_phone || '';
      document.getElementById('of-email').value = o.customer_email || '';
      document.getElementById('of-status').value = (o.status || 'pending').toLowerCase();
      document.getElementById('of-address').value = o.address || '';
      
      let items = [];
      try {
        items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      } catch(e) {}
      
      if (items && items.length) {
        items.forEach(it => {
          addOrderItemRow(it.id, it.qty || 1);
        });
      } else {
        addOrderItemRow();
      }
    }
  } else {
    title.textContent = 'Add Order';
    document.getElementById('of-id').value = '';
    document.getElementById('of-status').value = 'pending';
    select.value = '';
    manualFields.style.display = 'none';
    addOrderItemRow();
  }
  
  calculateOrderFormTotal();
  openModal('order-form-modal');
}

function onAdminOrderCustomerSelectChange() {
  const select = document.getElementById('of-customer-select');
  const val = select.value;
  const manualFields = document.getElementById('of-manual-fields');
  
  const nameInput = document.getElementById('of-name');
  const phoneInput = document.getElementById('of-phone');
  const emailInput = document.getElementById('of-email');
  
  if (val === 'manual') {
    manualFields.style.display = 'block';
    nameInput.required = true;
    phoneInput.required = true;
    nameInput.value = '';
    phoneInput.value = '';
    emailInput.value = '';
  } else {
    manualFields.style.display = 'none';
    nameInput.required = false;
    phoneInput.required = false;
    if (val) {
      const opt = select.options[select.selectedIndex];
      nameInput.value = opt.getAttribute('data-name') || '';
      phoneInput.value = opt.getAttribute('data-phone') || '';
      emailInput.value = opt.getAttribute('data-email') || '';
    } else {
      nameInput.value = '';
      phoneInput.value = '';
      emailInput.value = '';
    }
  }
}

function addOrderItemRow(selectedProductId = null, quantity = 1) {
  const container = document.getElementById('of-items-container');
  const rowId = 'oi-row-' + Date.now() + '-' + Math.floor(Math.random()*1000);
  
  const row = document.createElement('div');
  row.className = 'form-row order-item-input-row';
  row.id = rowId;
  row.style.alignItems = 'center';
  row.style.background = 'var(--bg)';
  row.style.padding = '10px';
  row.style.borderRadius = '8px';
  row.style.border = '1px solid var(--border)';
  row.style.marginBottom = '6px';
  row.style.gridTemplateColumns = '2.5fr 1fr 1.2fr auto';

  // Product Options
  const prodOptions = DATA.products.map(p => 
    `<option value="${p.id}" ${selectedProductId === p.id ? 'selected' : ''}>${p.name} (${p.unit || ''}) — ${inr(p.price)}</option>`
  ).join('');

  row.innerHTML = `
    <div class="form-group" style="margin-bottom:0">
      <select class="oi-prod-select" onchange="calculateOrderFormTotal()" style="width:100%" required>
        <option value="">-- Select Product --</option>
        ${prodOptions}
      </select>
    </div>
    <div class="form-group" style="margin-bottom:0">
      <input type="number" class="oi-qty-input" value="${quantity}" min="1" oninput="calculateOrderFormTotal()" style="width:100%" required>
    </div>
    <div class="oi-subtotal-display" style="font-weight:700;color:var(--primary);text-align:right;font-size:.9rem;padding:0 8px;">
      ₹0
    </div>
    <div style="display:flex;justify-content:center;">
      <button type="button" class="del-btn" onclick="removeOrderItemRow('${rowId}')" title="Remove Item" style="color:var(--pink-600);border:none;background:none;cursor:pointer;font-size:1.1rem;padding:6px;"><i class="fa-solid fa-trash"></i></button>
    </div>
  `;
  container.appendChild(row);
  calculateOrderFormTotal();
}

function removeOrderItemRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    row.remove();
    calculateOrderFormTotal();
  }
}

function calculateOrderFormTotal() {
  const container = document.getElementById('of-items-container');
  const rows = container.querySelectorAll('.order-item-input-row');
  let overallTotal = 0;
  
  rows.forEach(row => {
    const select = row.querySelector('.oi-prod-select');
    const qtyInput = row.querySelector('.oi-qty-input');
    const subtotalEl = row.querySelector('.oi-subtotal-display');
    
    const productId = select.value;
    const qty = Number(qtyInput.value || 0);
    
    let subtotal = 0;
    if (productId) {
      const prod = DATA.products.find(p => p.id === productId);
      if (prod) {
        subtotal = Number(prod.price) * qty;
      }
    }
    subtotalEl.textContent = inr(subtotal);
    overallTotal += subtotal;
  });
  
  document.getElementById('of-total-display').textContent = inr(overallTotal);
}

document.getElementById('order-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('of-id').value;
  
  const select = document.getElementById('of-customer-select');
  const custVal = select.value;
  
  let customerName = '';
  let customerPhone = '';
  let customerEmail = '';
  
  if (custVal === 'manual') {
    customerName = document.getElementById('of-name').value.trim();
    customerPhone = document.getElementById('of-phone').value.trim();
    customerEmail = document.getElementById('of-email').value.trim();
  } else if (custVal) {
    const opt = select.options[select.selectedIndex];
    customerName = opt.getAttribute('data-name') || '';
    customerPhone = opt.getAttribute('data-phone') || '';
    customerEmail = opt.getAttribute('data-email') || '';
  } else {
    toast('Please select a customer or choose manual entry', 'error');
    return;
  }
  
  const container = document.getElementById('of-items-container');
  const rows = container.querySelectorAll('.order-item-input-row');
  
  const items = [];
  let overallTotal = 0;
  
  rows.forEach(row => {
    const selectEl = row.querySelector('.oi-prod-select');
    const qtyInput = row.querySelector('.oi-qty-input');
    
    const productId = selectEl.value;
    const qty = Number(qtyInput.value || 1);
    
    if (productId) {
      const prod = DATA.products.find(p => p.id === productId);
      if (prod) {
        const itemTotal = Number(prod.price) * qty;
        overallTotal += itemTotal;
        items.push({
          id: prod.id,
          name: prod.name,
          price: Number(prod.price),
          image: prod.image || '',
          unit: prod.unit || '',
          qty: qty
        });
      }
    }
  });
  
  if (items.length === 0) {
    toast('Please add at least one product item to the order', 'error');
    return;
  }
  
  const orderData = {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    address: document.getElementById('of-address').value.trim(),
    status: document.getElementById('of-status').value,
    items: JSON.stringify(items),
    total: overallTotal,
    created_at: id ? undefined : Date.now(),
  };
  
  try {
    if (id) {
      const ex = DATA.orders.find(o => o.id === id);
      if (ex) orderData.created_at = ex.created_at || ex.createdAt || Date.now();
      
      await apiUpdate('orders', id, orderData);
      toast('Order updated successfully');
    } else {
      orderData.created_at = Date.now();
      await apiCreate('orders', orderData);
      toast('Order created successfully');
    }
    closeModal('order-form-modal');
    await loadOrders();
    renderDashboard();
  } catch (err) {
    console.error('API Order save failed. Saving locally.', err);
    try {
      let localOrders = JSON.parse(localStorage.getItem('vbb-orders') || '[]');
      if (id) {
        const ex = DATA.orders.find(o => o.id === id);
        orderData.id = id;
        orderData.created_at = ex ? (ex.created_at || ex.createdAt) : Date.now();
        localOrders = localOrders.map(o => o.id === id ? { ...o, ...orderData } : o);
      } else {
        orderData.id = 'O-' + Date.now();
        orderData.created_at = Date.now();
        localOrders.push(orderData);
      }
      localStorage.setItem('vbb-orders', JSON.stringify(localOrders));
      
      toast('Saved locally successfully');
      closeModal('order-form-modal');
      await loadOrders();
      renderDashboard();
    } catch(e) {
      toast('Save failed', 'error');
    }
  }
});

