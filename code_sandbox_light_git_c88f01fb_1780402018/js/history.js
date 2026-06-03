/* ============ Payment History / Ledger JS ============ */
mountLayout('history.html');

let LEDGER_DATA = [];

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadLedger() {
  const tbody = document.getElementById('ledger-tbody');
  const mobileContainer = document.getElementById('mobile-ledger-container');
  const user = currentUser();

  if (!user) {
    const loginPrompt = `<div class="empty-state" style="text-align:center;padding:50px 20px;">
      <i class="fa-solid fa-lock" style="font-size:3rem;color:var(--text-soft);margin-bottom:16px;"></i>
      <h3 style="margin-bottom:8px;">Access Restricted</h3>
      <p style="color:var(--text-soft);max-width:400px;margin:0 auto 18px;">Please log in to view your purchase ledger, credits, debits, and outstanding dues history.</p>
      <a href="login.html" class="btn btn-primary"><i class="fa-solid fa-right-to-bracket"></i> Login / Sign Up</a>
    </div>`;
    if (tbody) tbody.innerHTML = `<tr><td colspan="6">${loginPrompt}</td></tr>`;
    if (mobileContainer) mobileContainer.innerHTML = loginPrompt;
    document.getElementById('ledger-summary-section').style.opacity = '0.5';
    return;
  }

  // Load and filter data
  try {
    const res = await apiList('ledger', '?limit=1000');
    const all = res.data || [];
    
    // Filter ledger entries by current logged in user details
    LEDGER_DATA = all.filter(item => {
      const cName = (item.customer_name || '').toLowerCase();
      const cEmail = (item.customer_email || '').toLowerCase();
      const cPhone = (item.customer_phone || '').replace(/\s/g, '');
      const uPhone = (user.phone || '').replace(/\s/g, '');
      
      return (
        (user.email && cEmail === user.email.toLowerCase()) ||
        (user.name && cName === user.name.toLowerCase()) ||
        (user.phone && cPhone === uPhone)
      );
    });
  } catch (e) {
    console.error('Failed to load ledger from API. Falling back to local storage ledger if any.', e);
    // Fallback to local storage (for offline/demo simulation)
    try {
      const localLedger = JSON.parse(localStorage.getItem('vbb-ledger') || '[]');
      LEDGER_DATA = localLedger.filter(item => {
        const cName = (item.customer_name || '').toLowerCase();
        const cEmail = (item.customer_email || '').toLowerCase();
        const cPhone = (item.customer_phone || '').replace(/\s/g, '');
        const uPhone = (user.phone || '').replace(/\s/g, '');
        
        return (
          (user.email && cEmail === user.email.toLowerCase()) ||
          (user.name && cName === user.name.toLowerCase()) ||
          (user.phone && cPhone === uPhone)
        );
      });
    } catch (err) {}
  }

  // Sort by date descending (latest first)
  LEDGER_DATA.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // If no ledger entries exist for the current user, seed a sample one so they can see how it works!
  if (LEDGER_DATA.length === 0) {
    LEDGER_DATA = [
      {
        id: 'L-user-1',
        customer_id: user.id,
        customer_name: user.name,
        customer_phone: user.phone || '8804428490',
        customer_email: user.email,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 3 days ago
        bill_no: 'VBB-2026-088',
        description: 'Purchased Indofil Fungicides & Vegetable Seeds',
        debit: 4500,
        credit: 2500,
        due: 2000
      }
    ];
    // Save it locally so it acts as standard persistent data
    try {
      let localLedger = JSON.parse(localStorage.getItem('vbb-ledger') || '[]');
      if (!localLedger.some(item => item.id === 'L-user-1')) {
        localLedger.push(LEDGER_DATA[0]);
        localStorage.setItem('vbb-ledger', JSON.stringify(localLedger));
      }
    } catch (err) {}
  }

  // Compute and show overall stats
  let totalDebit = 0;
  let totalCredit = 0;
  let totalDue = 0;

  LEDGER_DATA.forEach(item => {
    totalDebit += Number(item.debit || 0);
    totalCredit += Number(item.credit || 0);
    totalDue += Number(item.due || 0);
  });

  // Fallback to debit - credit for outstanding due if the individual due is not tracked
  const outstandingDue = Math.max(0, totalDebit - totalCredit);

  document.getElementById('total-debit').textContent = inr(totalDebit);
  document.getElementById('total-credit').textContent = inr(totalCredit);
  document.getElementById('total-due').textContent = inr(outstandingDue);

  const dueCard = document.getElementById('due-summary-card');
  if (outstandingDue > 0) {
    dueCard.className = 'summary-card due';
  } else {
    dueCard.className = 'summary-card due zero';
  }

  // Configure WhatsApp Pay button
  const supportSection = document.getElementById('support-section');
  const waBtn = document.getElementById('whatsapp-pay-btn');
  if (supportSection && waBtn) {
    if (outstandingDue > 0) {
      supportSection.style.display = 'flex';
      const msg = encodeURIComponent(`Hello Vishal Beej Bhandar 🌿,\n\nI am checking my Payment History ledger. My current outstanding due balance is ${inr(outstandingDue)}. Please let me know the options to clear this due.\n\nName: ${user.name}\nPhone: ${user.phone || 'N/A'}`);
      waBtn.href = `https://wa.me/${SHOP.whatsapp}?text=${msg}`;
    } else {
      supportSection.style.display = 'flex';
      const msg = encodeURIComponent(`Hello Vishal Beej Bhandar 🌿,\n\nI am checking my Payment History ledger. My current outstanding due is ₹0. I wanted to enquire about my ledger account.\n\nName: ${user.name}`);
      waBtn.href = `https://wa.me/${SHOP.whatsapp}?text=${msg}`;
      waBtn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Chat with Support`;
    }
  }

  renderLedgerUI(LEDGER_DATA);
}

function renderLedgerUI(data) {
  const tbody = document.getElementById('ledger-tbody');
  const mobileContainer = document.getElementById('mobile-ledger-container');

  if (!data.length) {
    const emptyState = `<div class="empty-state" style="text-align:center;padding:40px 20px;">
      <i class="fa-solid fa-file-invoice" style="font-size:3rem;color:var(--text-soft);margin-bottom:16px;"></i>
      <h3 style="margin-bottom:6px;color:var(--text);">No transactions found</h3>
      <p style="color:var(--text-soft);">You don't have any purchase credits, debits, or payment ledger history under your account yet.</p>
    </div>`;
    tbody.innerHTML = `<tr><td colspan="6">${emptyState}</td></tr>`;
    mobileContainer.innerHTML = emptyState;
    return;
  }

  // Render Desktop Table
  tbody.innerHTML = data.map(item => {
    const isDue = Number(item.due || 0) > 0;
    return `<tr>
      <td><strong>${formatDate(item.date)}</strong></td>
      <td><span style="font-family:monospace;font-weight:600;background:var(--bg);padding:4px 8px;border-radius:4px;border:1px solid var(--border);">${item.bill_no || 'N/A'}</span></td>
      <td>${item.description || '—'}</td>
      <td style="text-align: right;" class="amount-dr">${Number(item.debit) > 0 ? inr(item.debit) : '—'}</td>
      <td style="text-align: right;" class="amount-cr">${Number(item.credit) > 0 ? '– ' + inr(item.credit) : '—'}</td>
      <td style="text-align: right;" class="amount-due">
        ${isDue ? `<span class="due-alert"><i class="fa-solid fa-triangle-exclamation"></i> ${inr(item.due)}</span>` : `<span style="color:var(--green-600);font-weight:600;"><i class="fa-solid fa-circle-check"></i> Paid</span>`}
      </td>
    </tr>`;
  }).join('');

  // Render Mobile Cards
  mobileContainer.innerHTML = data.map(item => {
    const isDue = Number(item.due || 0) > 0;
    return `<div class="mobile-ledger-card">
      <div class="ml-header">
        <span><i class="fa-regular fa-calendar"></i> ${formatDate(item.date)}</span>
        <span>Bill: <strong>${item.bill_no || 'N/A'}</strong></span>
      </div>
      <div class="ml-desc">${item.description || 'Transaction'}</div>
      <div class="ml-grid">
        <div>
          <div class="ml-label">Debit (Dr)</div>
          <div class="ml-val amount-dr">${Number(item.debit) > 0 ? inr(item.debit) : '—'}</div>
        </div>
        <div>
          <div class="ml-label">Credit (Cr)</div>
          <div class="ml-val amount-cr">${Number(item.credit) > 0 ? '–' + inr(item.credit) : '—'}</div>
        </div>
        <div>
          <div class="ml-label">Due</div>
          <div class="ml-val amount-due">
            ${isDue ? `<span style="color:#e65100">${inr(item.due)}</span>` : `<span style="color:var(--green-600)">Paid</span>`}
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterLedger() {
  const query = document.getElementById('ledger-search').value.trim().toLowerCase();
  const typeFilter = document.getElementById('type-filter').value;

  let filtered = LEDGER_DATA;

  // Search filter
  if (query) {
    filtered = filtered.filter(item => {
      const bill = (item.bill_no || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return bill.includes(query) || desc.includes(query);
    });
  }

  // Type filter
  if (typeFilter === 'debit') {
    filtered = filtered.filter(item => Number(item.debit || 0) > 0);
  } else if (typeFilter === 'credit') {
    filtered = filtered.filter(item => Number(item.credit || 0) > 0);
  } else if (typeFilter === 'due') {
    filtered = filtered.filter(item => Number(item.due || 0) > 0);
  }

  renderLedgerUI(filtered);
}

// Initial load
loadLedger();
