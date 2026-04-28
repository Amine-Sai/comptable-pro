/**
 * RZ Soutnance - Accounting Prototype Core Logic
 * Handles state, navigation, and core modules.
 */

// ─── PERSISTENCE ───
function loadState() {
  const s = localStorage.getItem('scf_accounting_state_v3_modular');
  if (s) {
    try {
      const loaded = JSON.parse(s);
      if (loaded && typeof loaded === 'object') {
        state = { ...state, ...loaded };
        // Ensure critical arrays exist
        state.journal = state.journal || [];
        state.invoices = state.invoices || [];
        state.inventory = state.inventory || [];
      }
    } catch (e) { console.error("Error loading state:", e); }
  }
}
function saveState() { localStorage.setItem('scf_accounting_state_v3_modular', JSON.stringify(state)); }

// ─── LOGIN SYSTEM ───
function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('login-user').value;
  const p = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');

  if (u === 'admin' && p === 'admin') {
    document.getElementById('login-overlay').style.display = 'none';
    toast('تم تسجيل الدخول بنجاح', 'success');
  } else {
    err.style.display = 'block';
    toast('بيانات الدخول غير صحيحة', 'error');
  }
}

// ─── MODAL CONTROLS ───
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function openManualModal() {
  const modal = document.getElementById('manual-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  const dateEl = document.getElementById('manual-date');
  if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];

  const container = document.getElementById('manual-lines');
  if (container) {
    container.innerHTML = '';
    addManualLine();
  }
}

// Close modal on clicking outside or pressing Escape
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
  }
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
  }
});

function addManualLine() {
  const container = document.getElementById('manual-lines');
  const line = document.createElement('div');
  line.className = 'form-grid manual-line';
  line.style = 'margin-bottom:10px; grid-template-columns: 2fr 1fr 1fr 40px;';

  let options = '<option value="">— اختر الحساب —</option>';
  Object.keys(ACCOUNTS).sort().forEach(code => {
    options += `<option value="${code}">${code} - ${ACCOUNTS[code].nameShort}</option>`;
  });

  line.innerHTML = `
    <div class="form-group">
      <select class="account">${options}</select>
    </div>
    <div class="form-group">
      <input type="number" class="debit" value="0" step="0.01" onfocus="this.select()">
    </div>
    <div class="form-group">
      <input type="number" class="credit" value="0" step="0.01" onfocus="this.select()">
    </div>
    <div class="form-group" style="justify-content: flex-end;">
      <button class="btn btn-ghost" style="padding:10px;" onclick="this.closest('.manual-line').remove()"><i class="fas fa-trash"></i></button>
    </div>
  `;
  container.appendChild(line);
}

function saveManualEntry() {
  const date = document.getElementById('manual-date').value;
  const ref = document.getElementById('manual-ref').value.trim() || 'JV-MANUAL';
  const desc = document.getElementById('manual-desc').value.trim() || 'قيد يدوي';

  const lines = document.querySelectorAll('.manual-line');
  let errorMsg = '';
  let totalDebit = 0;
  let totalCredit = 0;
  const entriesToAdd = [];

  lines.forEach(line => {
    const acc = line.querySelector('.account').value;
    const deb = parseFloat(line.querySelector('.debit').value) || 0;
    const cre = parseFloat(line.querySelector('.credit').value) || 0;

    if (!acc && (deb !== 0 || cre !== 0)) { valid = false; return; }
    if (deb === 0 && cre === 0) return;

    totalDebit += deb;
    totalCredit += cre;

    entriesToAdd.push({
      id: getNextJournalId() + entriesToAdd.length,
      date, ref, description: desc, account: acc,
      debit: deb, credit: cre
    });
  });

  if (errorMsg) {
    toast(errorMsg, 'error');
    return;
  }

  if (entriesToAdd.length === 0) {
    toast('يرجى إضافة بند واحد على الأقل بمبلغ صحيح', 'error');
    return;
  }

  // if (Math.abs(totalDebit - totalCredit) > 0.01) {
  //   toast(`القيد غير متوازن! الفرق: ${fmt(Math.abs(totalDebit - totalCredit))}`, 'error');
  //   return;
  // }

  entriesToAdd.forEach(e => state.journal.push(e));
  saveState();
  toast('تم حفظ القيد اليدوي بنجاح', 'success');
  closeModal('manual-modal');
  refreshPage('journal');
  refreshPage('dashboard');
}

function getNextJournalId() {
  return state.journal.length > 0 ? Math.max(...state.journal.map(j => j.id)) + 1 : 1;
}

// ─── NAVIGATION ───
const pageTitles = {
  dashboard: ['لوحة التحكم', 'نظرة عامة على البيانات المحاسبية'],
  invoices: ['الفوترة الإلكترونية', 'إدارة فواتير المبيعات'],
  inventory: ['المخزون', 'إدارة مخازن الجامعة'],
  journal: ['دفتر اليومية', 'القيود المحاسبية'],
  ledger: ['دفتر الأستاذ العام', 'تفاصيل الحسابات'],
  trial: ['ميزان المراجعة', 'التحقق من توازن الحسابات'],
  equity: ['تغير الأموال الخاصة', 'بيان التغيرات في الأموال الخاصة'],
  balancesheet: ['الميزانية', 'قائمة المركز المالي'],
  incomestatement: ['حساب النتائج', 'الأداء المالي للفترة'],
  cashflow: ['سيولة الخزينة', 'تدفقات الأموال النقدي'],
  einvoice: ['الفاتورة الإلكترونية', 'عرض الفواتير الرسمية'],
  debts: ['تنبيهات الديون', 'متابعة المستحقات']
};

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  const titleEl = document.getElementById('page-title');
  const subtitleEl = document.getElementById('page-subtitle');
  if (titleEl && subtitleEl) {
    const [t, s] = pageTitles[page] || ['', ''];
    titleEl.textContent = t;
    subtitleEl.textContent = s;
  }

  refreshPage(page);
}

function refreshPage(page) {
  try {
    const renderMap = {
      dashboard: typeof renderDashboard === 'function' ? renderDashboard : null,
      invoices: typeof renderInvoicePage === 'function' ? renderInvoicePage : null,
      inventory: typeof renderInventory === 'function' ? renderInventory : null,
      journal: typeof renderJournal === 'function' ? renderJournal : null,
      ledger: typeof renderLedger === 'function' ? renderLedger : null,
      trial: typeof renderTrialBalance === 'function' ? renderTrialBalance : null,
      balancesheet: typeof renderBalanceSheet === 'function' ? renderBalanceSheet : null,
      incomestatement: typeof renderIncomeStatement === 'function' ? renderIncomeStatement : null,
      cashflow: typeof renderCashFlow === 'function' ? renderCashFlow : null,
      einvoice: typeof renderEInvoicePage === 'function' ? renderEInvoicePage : null,
      debts: typeof renderDebts === 'function' ? renderDebts : null,
      equity: typeof renderEquity === 'function' ? renderEquity : null
    };
    if (renderMap[page]) {
      renderMap[page]();
    } else {
      console.warn(`No render function for page: ${page}`);
    }
  } catch (err) {
    console.error(`Error refreshing page ${page}:`, err);
    toast(`حدث خطأ أثناء تحميل الصفحة: ${page}`, 'error');
  }
}

// ─── TOAST ───
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const colors = { success: 'emerald', error: 'rose', info: 'indigo' };
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}" style="color:var(--accent-${colors[type] || 'indigo'})"></i><span style="font-size:0.85rem;">${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

function showResetModal() { openModal('reset-modal'); }
function resetAllData() {
  localStorage.removeItem('scf_accounting_state_v3_modular');
  location.reload();
}

// ─── INVENTORY MODULE ───
function renderInventory() {
  const el = document.getElementById('inventory-list');
  if (!el) return;
  if (state.inventory.length === 0) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-boxes-stacked"></i><h4>لا توجد منتجات</h4></div>`;
    return;
  }
  let html = `<table><thead><tr><th>المنتج</th><th>المخزون</th><th>التكلفة</th><th>البيع</th></tr></thead><tbody>`;
  state.inventory.forEach(p => {
    html += `<tr><td>${p.name}</td><td>${p.qty}</td><td>${fmt(p.cost)}</td><td>${fmt(p.price)}</td></tr>`;
  });
  html += '</tbody></table>';
  el.innerHTML = html;
}

function addProduct() {
  const name = document.getElementById('prod-name').value.trim();
  const qty = parseInt(document.getElementById('prod-qty').value) || 0;
  const cost = parseFloat(document.getElementById('prod-cost').value) || 0;
  const price = parseFloat(document.getElementById('prod-price').value) || 0;
  if (!name) return;
  state.inventory.push({ name, qty, cost, price, initialQty: qty });
  saveState();
  renderInventory();
}

// ─── INVOICE MODULE ───
function renderInvoicePage() {
  const numEl = document.getElementById('inv-number');
  if (numEl) numEl.value = `FAC-${String(state.nextInvoiceNum).padStart(4, '0')}`;
  const dateEl = document.getElementById('inv-date');
  if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];

  const body = document.getElementById('line-items-body');
  if (body) body.innerHTML = '';
  addLineItem();
  renderInvoiceList();
}

function addLineItem() {
  const body = document.getElementById('line-items-body');
  if (!body) return;
  const tr = document.createElement('tr');
  let options = '<option value="">— اختر المنتج —</option>';
  state.inventory.forEach((p, idx) => {
    options += `<option value="${idx}">${p.name}</option>`;
  });
  tr.innerHTML = `
    <td><select onchange="liProductChange(this)">${options}</select></td>
    <td><input type="number" class="qty" value="1" min="1" oninput="calcLineTotals(this)"></td>
    <td><input type="number" class="price" value="0" step="0.01" oninput="calcLineTotals(this)"></td>
    <td class="mono line-total">0.00</td>
    <td><button class="btn btn-ghost" onclick="this.closest('tr').remove(); calcInvTotals();"><i class="fas fa-trash"></i></button></td>
  `;
  body.appendChild(tr);
}

function liProductChange(sel) {
  const tr = sel.closest('tr');
  const idx = sel.value;
  if (idx !== '') {
    const p = state.inventory[idx];
    tr.querySelector('.price').value = p.price;
  }
  calcLineTotals(tr.querySelector('.qty'));
}

function calcLineTotals(input) {
  const tr = input.closest('tr');
  const q = parseFloat(tr.querySelector('.qty').value) || 0;
  const p = parseFloat(tr.querySelector('.price').value) || 0;
  tr.querySelector('.line-total').textContent = fmt(q * p);
  calcInvTotals();
}

function calcInvTotals() {
  let ht = 0;
  document.querySelectorAll('#line-items-body tr').forEach(tr => {
    const q = parseFloat(tr.querySelector('.qty').value) || 0;
    const p = parseFloat(tr.querySelector('.price').value) || 0;
    ht += q * p;
  });

  const remiseCommPct = parseFloat(document.getElementById('inv-remise-comm').value) || 0;
  const apresComm = ht * (1 - remiseCommPct / 100);
  const remiseFinPct = parseFloat(document.getElementById('inv-remise-fin').value) || 0;
  const netHt = apresComm * (1 - remiseFinPct / 100);
  const tvaPct = parseFloat(document.getElementById('inv-tva').value) || 0;
  const tvaAmt = netHt * (tvaPct / 100);
  const ttc = netHt + tvaAmt;

  document.getElementById('inv-montant-ht').textContent = fmt(ht);
  document.getElementById('inv-apres-comm').textContent = fmt(apresComm);
  document.getElementById('inv-net-ht').textContent = fmt(netHt);
  document.getElementById('inv-tva-amount').textContent = fmt(tvaAmt);
  document.getElementById('inv-ttc').textContent = fmt(ttc);
}

function saveInvoice() {
  const client = document.getElementById('inv-client').value.trim();
  if (!client) { toast('يرجى إدخال اسم العميل', 'error'); return; }

  const items = [];
  let ht = 0;
  document.querySelectorAll('#line-items-body tr').forEach(tr => {
    const sel = tr.querySelector('select');
    if (sel.value !== '') {
      const qty = parseInt(tr.querySelector('.qty').value) || 0;
      const price = parseFloat(tr.querySelector('.price').value) || 0;
      const total = qty * price;

      const invIdx = parseInt(sel.value);
      items.push({
        name: state.inventory[invIdx].name,
        qty, price, total
      });

      // Update inventory quantity
      state.inventory[invIdx].qty = Math.max(0, state.inventory[invIdx].qty - qty);

      ht += total;
    }
  });

  if (items.length === 0) { toast('يرجى إضافة بند واحد على الأقل', 'error'); return; }

  const remiseCommPct = parseFloat(document.getElementById('inv-remise-comm').value) || 0;
  const apresComm = ht * (1 - remiseCommPct / 100);
  const remCommAmount = ht - apresComm;

  const remiseFinPct = parseFloat(document.getElementById('inv-remise-fin').value) || 0;
  const netHt = apresComm * (1 - remiseFinPct / 100);
  const remFinAmount = apresComm - netHt;

  const tvaPct = parseFloat(document.getElementById('inv-tva').value) || 0;
  const tvaAmt = netHt * (tvaPct / 100);
  const ttc = netHt + tvaAmt;

  const inv = {
    id: `FAC-${String(state.nextInvoiceNum).padStart(4, '0')}`,
    date: document.getElementById('inv-date').value,
    client, items, totalHT: ht, netHT: netHt, tva: tvaAmt, ttc,
    tvaRate: tvaPct, tvaAmount: tvaAmt,
    remComm: remiseCommPct, remCommAmount: remCommAmount,
    remFin: remiseFinPct, remFinAmount: remFinAmount,
    status: document.getElementById('inv-status').value
  };

  state.invoices.push(inv);

  // Create Journal Entries
  const jId = getNextJournalId();
  state.journal.push({ id: jId, date: inv.date, ref: inv.id, description: `فاتورة مبيعات - ${inv.client}`, account: '411', debit: inv.ttc, credit: 0 });
  state.journal.push({ id: jId + 1, date: inv.date, ref: inv.id, description: `إيرادات مبيعات`, account: '701', debit: 0, credit: inv.netHT });
  if (tvaAmt > 0) {
    state.journal.push({ id: jId + 2, date: inv.date, ref: inv.id, description: `TVA محصلة`, account: '4457', debit: 0, credit: tvaAmt });
  }

  state.nextInvoiceNum++;
  saveState();
  toast('تم حفظ الفاتورة وترحيل القيود بنجاح', 'success');
  renderInvoicePage();
  updateDebtBadge();
}

function markAsPaid(idx) {
  state.invoices[idx].status = 'paid';
  saveState();
  toast('تم تسجيل الدفع بنجاح', 'success');
  refreshPage('debts');
  refreshPage('dashboard');
  updateDebtBadge();
}

function renderInvoiceList() {
  const el = document.getElementById('invoice-list');
  if (!el) return;
  if (state.invoices.length === 0) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-file-invoice"></i><h4>لا توجد فواتير</h4></div>`;
    return;
  }
  let html = `<table><thead><tr><th>الرقم</th><th>العميل</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>`;
  state.invoices.slice().reverse().forEach(inv => {
    html += `<tr>
      <td class="mono">${inv.id}</td>
      <td>${inv.client}</td>
      <td class="mono">${fmt(inv.ttc)}</td>
      <td><span class="badge ${inv.status === 'paid' ? 'badge-success' : 'badge-warning'}">${inv.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}</span></td>
    </tr>`;
  });
  html += '</tbody></table>';
  el.innerHTML = html;
}

function updateDebtBadge() {
  const badge = document.getElementById('debt-badge');
  if (!badge) return;
  const count = state.invoices.filter(i => i.status === 'unpaid').length;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Attach navigation listeners
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) navigateTo(page);
    });
  });

  navigateTo('dashboard');

  if (typeof updateDebtBadge === 'function') updateDebtBadge();
});
