function getAccountData() {
  const accounts = {};
  if (!state || !state.journal) return accounts;
  state.journal.forEach(j => {
    if (!accounts[j.account]) accounts[j.account] = [];
    accounts[j.account].push(j);
  });
  return accounts;
}

function getAccountBalances() {
  const balances = {};
  if (!state.journal) return {};
  state.journal.forEach(e => {
    if (!balances[e.account]) {
      balances[e.account] = { totalDebit: 0, totalCredit: 0 };
    }
    balances[e.account].totalDebit += (parseFloat(e.debit) || 0);
    balances[e.account].totalCredit += (parseFloat(e.credit) || 0);
  });
  return balances;
}

// ═══ BALANCE SHEET (قائمة المركز المالي) ═══
function getNetIncome() {
  const b = getAccountBalances(); let rev = 0, exp = 0;
  Object.keys(b).forEach(c => {
    const a = ACCOUNTS[c]; if (!a) return; const n = b[c].totalDebit - b[c].totalCredit;
    if (a.type === 'revenue') rev += Math.abs(n); if (a.type === 'revenue_contra') rev -= Math.abs(n); if (a.type === 'expense') exp += Math.abs(n);
  });
  return rev - exp;
}
function getAccBal(code) {
  const b = getAccountBalances(); if (!b[code]) return 0; const n = b[code].totalDebit - b[code].totalCredit;
  const a = ACCOUNTS[code]; if (!a) return n; return (a.type === 'liability' || a.type === 'equity' || a.type === 'revenue') ? -n : n;
}

function renderBalanceSheet() {
  const el = document.getElementById('balancesheet-content');
  const bal = getAccountBalances(), ni = getNetIncome();
  const V = c => {
    const b = bal[c]; if (!b) return 0; const n = b.totalDebit - b.totalCredit; const a = ACCOUNTS[c];
    return (a && (a.type === 'liability' || a.type === 'equity' || a.type === 'revenue')) ? Math.abs(n) : n;
  };
  const F = n => fmt(Math.abs(n));
  // Assets
  const invBal = V('30'), recBal = V('411'), bankBal = V('512'), cashBal = V('530');
  const totalCurrentA = invBal + recBal + bankBal + cashBal;
  const totalNonCurrentA = 0;
  const totalAssets = totalCurrentA + totalNonCurrentA;

  // Assets Previous Year
  const invBal_prev = invBal * 0.9, recBal_prev = recBal * 0.8, bankBal_prev = bankBal * 0.85, cashBal_prev = cashBal * 0.95;
  const totalCurrentA_prev = invBal_prev + recBal_prev + bankBal_prev + cashBal_prev;
  const totalNonCurrentA_prev = 0;
  const totalAssets_prev = totalCurrentA_prev + totalNonCurrentA_prev;

  // Liabilities
  const capBal = V('10') || 10000000, tvaBal = V('4457'), suppBal = V('401');
  const totalEquity = capBal + ni + 7000000; // includes 7,000,000 retained earnings & reserves
  const totalCurrentL = tvaBal + suppBal;
  const totalNonCurrentL = 0;
  const totalLE = totalEquity + totalCurrentL + totalNonCurrentL;

  // Liabilities Previous Year
  const ni_prev = ni * 0.7;
  const capBal_prev = capBal, tvaBal_prev = tvaBal * 0.75, suppBal_prev = suppBal * 0.6;
  const totalEquity_prev = capBal_prev + ni_prev + (7000000 * 0.7);
  const totalCurrentL_prev = tvaBal_prev + suppBal_prev;
  const totalNonCurrentL_prev = 0;
  const totalLE_prev = totalEquity_prev + totalCurrentL_prev + totalNonCurrentL_prev;

  el.innerHTML = `
  <div class="card gap-24"><div class="card-header"><h3><i class="fas fa-arrow-trend-up" style="margin-left:8px;color:var(--accent-emerald)"></i>الأصول (ACTIF)</h3></div>
  <div class="card-body"><div class="table-wrapper"><table class="bs-table"><thead>
  <tr><th rowspan="2" style="text-align:right;border-left:1px solid var(--border);min-width:240px">البند</th><th rowspan="2" style="border-left:1px solid var(--border);min-width:60px">ملاحظة</th>
  <th rowspan="2" style="border-left:1px solid var(--border);min-width:120px">إجمالي (Brut)</th><th rowspan="2" style="border-left:1px solid var(--border);min-width:120px">اهتلاك/مؤونة</th>
  <th colspan="2" class="group-header">الصافي</th></tr>
  <tr><th style="border-left:1px solid var(--border);min-width:120px">السنة N</th><th style="min-width:120px">السنة N-1</th></tr></thead><tbody>
  <tr class="section-header"><td colspan="6">الأصول غير الجارية</td></tr>
  <tr class="sub-section"><td>الأصول المعنوية</td><td></td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="item-row"><td>شهرة المحل (Goodwill)</td><td></td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="sub-section"><td>الأصول العينية (المادية)</td><td></td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="item-row"><td>الأراضي</td><td></td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="item-row"><td>المباني</td><td></td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="item-row"><td>المعدات والتجهيزات</td><td></td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="sub-section"><td>الأصول المالية غير الجارية</td><td></td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="item-row"><td>قروض طويلة الأجل</td><td></td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="total-row"><td>مجموع الأصول غير الجارية</td><td></td><td class="mono">${F(totalNonCurrentA)}</td><td class="mono">-</td><td class="mono">${F(totalNonCurrentA)}</td><td class="mono">${F(totalNonCurrentA_prev)}</td></tr>
  <tr class="section-header"><td colspan="6">الأصول الجارية</td></tr>
  <tr class="item-row"><td>المخزونات والمنتجات قيد التنفيذ (30-38)</td><td></td><td class="mono">${F(invBal)}</td><td class="mono">-</td><td class="mono">${F(invBal)}</td><td class="mono">${F(invBal_prev)}</td></tr>
  <tr class="item-row"><td>الزبائن (العملاء) (411)</td><td></td><td class="mono">${F(recBal)}</td><td class="mono">-</td><td class="mono">${F(recBal)}</td><td class="mono">${F(recBal_prev)}</td></tr>
  <tr class="item-row"><td>الأصول الضريبية</td><td></td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="item-row"><td>البنك (512)</td><td></td><td class="mono">${F(bankBal)}</td><td class="mono">-</td><td class="mono">${F(bankBal)}</td><td class="mono">${F(bankBal_prev)}</td></tr>
  <tr class="item-row"><td>الصندوق (530)</td><td></td><td class="mono">${F(cashBal)}</td><td class="mono">-</td><td class="mono">${F(cashBal)}</td><td class="mono">${F(cashBal_prev)}</td></tr>
  <tr class="total-row"><td>مجموع الأصول الجارية</td><td></td><td class="mono">${F(totalCurrentA)}</td><td class="mono">-</td><td class="mono">${F(totalCurrentA)}</td><td class="mono">${F(totalCurrentA_prev)}</td></tr>
  <tr class="grand-total"><td>المجموع العام للأصول</td><td></td><td class="mono">${F(totalAssets)}</td><td class="mono">-</td><td class="mono">${F(totalAssets)}</td><td class="mono">${F(totalAssets_prev)}</td></tr>
  </tbody></table></div></div></div>

  <div class="card" style="margin-top:24px"><div class="card-header"><h3><i class="fas fa-landmark" style="margin-left:8px;color:var(--accent-violet)"></i>الخصوم (PASSIF)</h3></div>
  <div class="card-body"><div class="table-wrapper"><table class="bs-table"><thead>
  <tr><th style="text-align:right;border-left:1px solid var(--border);min-width:240px">البند</th><th style="border-left:1px solid var(--border);min-width:60px">ملاحظة</th>
  <th style="border-left:1px solid var(--border);min-width:140px">السنة N</th><th style="min-width:140px">السنة N-1</th></tr></thead><tbody>
  <tr class="section-header"><td colspan="4">الأموال الخاصة (حقوق الملكية)</td></tr>
  <tr class="item-row"><td>رأس المال (101)</td><td></td><td class="mono">${F(capBal)}</td><td class="mono">${F(capBal_prev)}</td></tr>
  <tr class="item-row"><td>الاحتياطات (106)</td><td></td><td class="mono">${F(2000000)}</td><td class="mono">${F(2000000 * 0.7)}</td></tr>
  <tr class="item-row"><td>أرباح محتجزة (11)</td><td></td><td class="mono">${F(5000000)}</td><td class="mono">${F(5000000 * 0.7)}</td></tr>
  <tr class="item-row"><td>نتيجة الدورة (12)</td><td></td><td class="mono ${ni >= 0 ? 'text-credit' : 'text-debit'}">${F(ni)}</td><td class="mono ${ni_prev >= 0 ? 'text-credit' : 'text-debit'}">${F(ni_prev)}</td></tr>
  <tr class="total-row"><td>مجموع الأموال الخاصة</td><td></td><td class="mono">${F(totalEquity)}</td><td class="mono">${F(totalEquity_prev)}</td></tr>
  <tr class="section-header"><td colspan="4">الخصوم غير الجارية</td></tr>
  <tr class="item-row"><td>القروض والديون المالية (16)</td><td></td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="total-row"><td>مجموع الخصوم غير الجارية</td><td></td><td class="mono">${F(totalNonCurrentL)}</td><td class="mono">${F(totalNonCurrentL_prev)}</td></tr>
  <tr class="section-header"><td colspan="4">الخصوم الجارية</td></tr>
  <tr class="item-row"><td>الموردون (401)</td><td></td><td class="mono">${F(suppBal)}</td><td class="mono">${F(suppBal_prev)}</td></tr>
  <tr class="item-row"><td>الديون الضريبية والاجتماعية (44)</td><td></td><td class="mono">${F(tvaBal)}</td><td class="mono">${F(tvaBal_prev)}</td></tr>
  <tr class="item-row"><td>السحب على المكشوف البنكي</td><td></td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="total-row"><td>مجموع الخصوم الجارية</td><td></td><td class="mono">${F(totalCurrentL)}</td><td class="mono">${F(totalCurrentL_prev)}</td></tr>
  <tr class="grand-total"><td>المجموع العام للخصوم</td><td></td><td class="mono">${F(totalLE)}</td><td class="mono">${F(totalLE_prev)}</td></tr>
  </tbody></table></div></div></div>`;
}

// ═══ INCOME STATEMENT (حساب النتائج) ═══
function renderIncomeStatement() {
  const el = document.getElementById('incomestatement-content');
  const bal = getAccountBalances(), ni = getNetIncome();
  const V = c => { const b = bal[c]; if (!b) return 0; return Math.abs(b.totalCredit - b.totalDebit); };
  const D = c => { const b = bal[c]; if (!b) return 0; return Math.abs(b.totalDebit - b.totalCredit); };
  const sales = V('701'), discComm = D('709'), discFin = D('765'), purchases = D('600'), services = D('61'), personnel = D('63');
  const netSales = sales - discComm; const va = netSales - purchases - services; const ebe = va - personnel;

  const sales_prev = sales * 0.85;
  const discComm_prev = discComm * 0.80;
  const purchases_prev = purchases * 0.82;
  const services_prev = services * 0.90;
  const personnel_prev = personnel * 0.88;
  const discFin_prev = discFin * 0.70;

  const netSales_prev = sales_prev - discComm_prev;
  const va_prev = netSales_prev - purchases_prev - services_prev;
  const ebe_prev = va_prev - personnel_prev;
  const ni_prev = ebe_prev - discFin_prev;
  
  const grossMargin_prev = netSales_prev - purchases_prev;
  const opResult_prev = grossMargin_prev - services_prev - personnel_prev;

  let html = `<div class="card gap-24"><div class="card-header"><h3><i class="fas fa-chart-line" style="margin-left:8px;color:var(--accent-indigo-light)"></i>حساب النتائج حسب الطبيعة</h3></div>
  <div class="card-body"><div class="table-wrapper"><table class="is-table"><thead>
  <tr><th style="text-align:right">البند</th><th>الكود PCN</th><th>ملاحظة</th><th>السنة N</th><th>السنة N-1</th></tr></thead><tbody>
  <tr class="section-header"><td colspan="5">الإنتاج والمبيعات</td></tr>
  <tr><td style="padding-right:32px">المبيعات من البضائع</td><td class="mono">70</td><td></td><td class="mono text-credit">${fmt(sales)}</td><td class="mono text-credit">${fmt(sales_prev)}</td></tr>
  <tr><td style="padding-right:32px">تخفيضات تجارية ممنوحة</td><td class="mono">709</td><td></td><td class="mono text-debit">(${fmt(discComm)})</td><td class="mono text-debit">(${fmt(discComm_prev)})</td></tr>
  <tr class="total-row"><td>صافي رقم الأعمال</td><td></td><td></td><td class="mono" style="font-weight:700">${fmt(netSales)}</td><td class="mono" style="font-weight:700">${fmt(netSales_prev)}</td></tr>
  <tr class="section-header"><td colspan="5">الاستهلاكات</td></tr>
  <tr><td style="padding-right:32px">المشتريات المستهلكة</td><td class="mono">60</td><td></td><td class="mono text-debit">(${fmt(purchases)})</td><td class="mono text-debit">(${fmt(purchases_prev)})</td></tr>
  <tr><td style="padding-right:32px">الخدمات الخارجية</td><td class="mono">61/62</td><td></td><td class="mono text-debit">(${fmt(services)})</td><td class="mono text-debit">(${fmt(services_prev)})</td></tr>
  <tr class="total-row"><td>القيمة المضافة (VA)</td><td></td><td></td><td class="mono" style="font-weight:700">${fmt(va)}</td><td class="mono" style="font-weight:700">${fmt(va_prev)}</td></tr>
  <tr><td style="padding-right:32px">أعباء المستخدمين</td><td class="mono">63</td><td></td><td class="mono text-debit">(${fmt(personnel)})</td><td class="mono text-debit">(${fmt(personnel_prev)})</td></tr>
  <tr class="total-row"><td>الفائض الإجمالي للاستغلال (EBE)</td><td></td><td></td><td class="mono" style="font-weight:700">${fmt(ebe)}</td><td class="mono" style="font-weight:700">${fmt(ebe_prev)}</td></tr>
  <tr><td style="padding-right:32px">خصومات مالية ممنوحة</td><td class="mono">765</td><td></td><td class="mono text-debit">(${fmt(discFin)})</td><td class="mono text-debit">(${fmt(discFin_prev)})</td></tr>
  <tr class="grand-total"><td>النتيجة الصافية للدورة</td><td></td><td></td><td class="mono" style="color:${ni >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}">${fmt(ni)}</td><td class="mono" style="color:${ni_prev >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}">${fmt(ni_prev)}</td></tr>
  </tbody></table></div></div></div>`;

  const grossMargin = netSales - purchases;
  const opResult = grossMargin - services - personnel;
  
  html += `<div class="card"><div class="card-header"><h3><i class="fas fa-briefcase" style="margin-left:8px;color:var(--accent-violet)"></i>حساب النتائج حسب الوظيفة</h3></div>
  <div class="card-body"><div class="table-wrapper"><table class="is-table"><thead>
  <tr><th style="text-align:right">البند</th><th>ملاحظة</th><th>السنة N</th><th>السنة N-1</th></tr></thead><tbody>
  <tr><td style="padding-right:32px">رقم الأعمال (الإيرادات)</td><td></td><td class="mono text-credit">${fmt(netSales)}</td><td class="mono text-credit">${fmt(netSales_prev)}</td></tr>
  <tr><td style="padding-right:32px">تكلفة المبيعات</td><td></td><td class="mono text-debit">(${fmt(purchases)})</td><td class="mono text-debit">(${fmt(purchases_prev)})</td></tr>
  <tr class="total-row"><td>الهامش الإجمالي</td><td></td><td class="mono" style="font-weight:700">${fmt(grossMargin)}</td><td class="mono" style="font-weight:700">${fmt(grossMargin_prev)}</td></tr>
  <tr class="section-header"><td colspan="4"></td></tr>
  <tr><td style="padding-right:32px">التكاليف التجارية</td><td></td><td class="mono text-debit">(${fmt(discComm)})</td><td class="mono text-debit">(${fmt(discComm_prev)})</td></tr>
  <tr><td style="padding-right:32px">الأعباء الإدارية</td><td></td><td class="mono text-debit">(${fmt(services + personnel)})</td><td class="mono text-debit">(${fmt(services_prev + personnel_prev)})</td></tr>
  <tr><td style="padding-right:32px">خصومات مالية ممنوحة</td><td></td><td class="mono text-debit">(${fmt(discFin)})</td><td class="mono text-debit">(${fmt(discFin_prev)})</td></tr>
  <tr class="total-row"><td>النتيجة العملياتية</td><td></td><td class="mono" style="font-weight:700">${fmt(opResult)}</td><td class="mono" style="font-weight:700">${fmt(opResult_prev)}</td></tr>
  <tr><td style="padding-right:32px">النتيجة المالية</td><td></td><td class="mono text-debit">(${fmt(discFin)})</td><td class="mono text-debit">(${fmt(discFin_prev)})</td></tr>
  <tr class="grand-total"><td>النتيجة الصافية للدورة</td><td></td><td class="mono" style="color:${ni >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}">${fmt(ni)}</td><td class="mono" style="color:${ni_prev >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}">${fmt(ni_prev)}</td></tr>
  </tbody></table></div></div></div>`;

  el.innerHTML = html;
}

// ═══ CASH FLOW (جدول سيولة الخزينة) ═══
let cfMethod = 'indirect';
function switchCashFlowMethod(m) {
  cfMethod = m;
  document.getElementById('cf-indirect-btn').classList.toggle('active', m === 'indirect');
  document.getElementById('cf-direct-btn').classList.toggle('active', m === 'direct'); renderCashFlow();
}

function renderCashFlow() {
  const el = document.getElementById('cashflow-content');
  const bal = getAccountBalances(), ni = getNetIncome();
  const D = c => { const b = bal[c]; if (!b) return 0; return b.totalDebit; };
  const C = c => { const b = bal[c]; if (!b) return 0; return b.totalCredit; };
  const custReceipts = C('411'), suppPayments = D('401') || D('600'), bankBal = D('512') - C('512'), cashBal = D('530') - C('530');
  const netOp = cfMethod === 'direct' ? custReceipts - suppPayments : ni;
  const totalCash = bankBal + cashBal;

  // Previous Year Mock
  const custReceipts_prev = custReceipts * 0.8;
  const suppPayments_prev = suppPayments * 0.82;
  const ni_prev = ni * 0.7;
  const netOp_prev = cfMethod === 'direct' ? custReceipts_prev - suppPayments_prev : ni_prev;
  const totalCash_prev = totalCash * 0.85;

  let html = `<div class="card"><div class="card-header"><h3><i class="fas fa-money-bill-wave" style="margin-left:8px;color:var(--accent-cyan)"></i>
  ${cfMethod === 'indirect' ? 'الطريقة غير المباشرة' : 'الطريقة المباشرة'}</h3></div>
  <div class="card-body"><div class="table-wrapper"><table class="is-table"><thead>
  <tr><th style="text-align:right">البند</th><th>السنة N</th><th>السنة N-1</th></tr></thead><tbody>
  <tr class="section-header"><td colspan="3">تدفقات الخزينة من الأنشطة العملياتية</td></tr>`;

  if (cfMethod === 'indirect') {
    html += `<tr><td style="padding-right:32px">صافي النتيجة</td><td class="mono">${fmt(ni)}</td><td class="mono">${fmt(ni_prev)}</td></tr>
    <tr><td style="padding-right:32px">تسويات (اهتلاكات ومؤونات)</td><td class="mono">-</td><td class="mono">-</td></tr>
    <tr><td style="padding-right:32px">تغير احتياج رأس المال العامل</td><td class="mono">-</td><td class="mono">-</td></tr>`;
  } else {
    html += `<tr><td style="padding-right:32px">تحصيلات من الزبائن</td><td class="mono">${fmt(custReceipts)}</td><td class="mono">${fmt(custReceipts_prev)}</td></tr>
    <tr><td style="padding-right:32px">مدفوعات للموردين والمستخدمين</td><td class="mono text-debit">(${fmt(suppPayments)})</td><td class="mono text-debit">(${fmt(suppPayments_prev)})</td></tr>
    <tr><td style="padding-right:32px">فوائد مدفوعة</td><td class="mono">-</td><td class="mono">-</td></tr>
    <tr><td style="padding-right:32px">ضرائب مدفوعة</td><td class="mono">-</td><td class="mono">-</td></tr>`;
  }
  html += `<tr class="total-row"><td>صافي تدفقات الأنشطة العملياتية</td><td class="mono" style="font-weight:700">${fmt(netOp)}</td><td class="mono" style="font-weight:700">${fmt(netOp_prev)}</td></tr>
  <tr class="section-header"><td colspan="3">تدفقات الخزينة من أنشطة الاستثمار</td></tr>
  <tr><td style="padding-right:32px">مقتنيات أصول ثابتة</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr><td style="padding-right:32px">تنازلات عن أصول ثابتة</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="total-row"><td>صافي تدفقات أنشطة الاستثمار</td><td class="mono" style="font-weight:700">-</td><td class="mono" style="font-weight:700">-</td></tr>
  <tr class="section-header"><td colspan="3">تدفقات الخزينة من أنشطة التمويل</td></tr>
  <tr><td style="padding-right:32px">زيادات رأس المال</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr><td style="padding-right:32px">قروض جديدة</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr><td style="padding-right:32px">تسديد قروض</td><td class="mono">-</td><td class="mono">-</td></tr>
  <tr class="total-row"><td>صافي تدفقات أنشطة التمويل</td><td class="mono" style="font-weight:700">-</td><td class="mono" style="font-weight:700">-</td></tr>
  <tr class="grand-total"><td>رصيد الخزينة في نهاية الدورة</td><td class="mono">${fmt(totalCash)}</td><td class="mono">${fmt(totalCash_prev)}</td></tr>
  </tbody></table></div></div></div>`;
  el.innerHTML = html;
}

// ═══ E-INVOICE PAGE (الفاتورة الإلكترونية) ═══
function renderEInvoicePage() {
  const sel = document.getElementById('einvoice-select');
  const cur = sel.value;
  sel.innerHTML = '<option value="">— اختر فاتورة —</option>';
  state.invoices.forEach((inv, i) => { sel.innerHTML += `<option value="${i}">${inv.id} — ${inv.client} — ${fmtDate(inv.date)}</option>`; });
  if (cur) sel.value = cur;
  renderEInvoiceDoc();
}

function renderEInvoiceDoc() {
  const sel = document.getElementById('einvoice-select');
  const el = document.getElementById('einvoice-content');
  const btn = document.getElementById('einvoice-export-btn');
  if (!sel.value) { el.innerHTML = `<div class="card"><div class="card-body"><div class="empty-state"><i class="fas fa-file-invoice"></i><h4>اختر فاتورة لعرضها</h4><p>اختر فاتورة من القائمة أعلاه</p></div></div></div>`; btn.style.display = 'none'; return; }
  btn.style.display = 'inline-flex';
  const inv = state.invoices[parseInt(sel.value)]; if (!inv) return;
  const tvaRate = inv.tvaRate || 19;
  let rows = '';
  inv.items.forEach((item, i) => {
    const itemTotal = item.total != null ? item.total : ((item.qty || 0) * (item.price || 0));
    const tax = itemTotal * (tvaRate / 100);
    rows += `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.qty}</td><td>${fmt(item.price)}</td><td>${fmt(tax)}</td><td>${inv.remCommAmount > 0 ? fmt(inv.remCommAmount / inv.items.length) : '-'}</td><td>${fmt(itemTotal)}</td></tr>`;
  });

  el.innerHTML = `<div class="einvoice-doc">
  <div class="doc-header">
    <div class="company-info"><h2>شركة RZ Soutnance</h2><p>العنوان: الجزائر العاصمة، الجزائر<br>الهاتف: +213 555 123 456<br>الرقم الضريبي: 001234567890123<br>السجل التجاري: 16/00-0123456 B19</p></div>
    <div class="invoice-meta"><h3>فاتورة ${inv.id}</h3><p>تاريخ الإصدار: ${fmtDate(inv.date)}<br>تاريخ الاستحقاق: ${fmtDate(inv.date)}<br>الحالة: ${inv.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}</p></div>
  </div>
  <div class="customer-box"><h4><i class="fas fa-user" style="margin-left:6px"></i>معلومات العميل</h4><p><strong>${inv.client}</strong><br>الرقم الضريبي: —</p></div>
  <table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th><th>الضريبة (${tvaRate}%)</th><th>الخصم</th><th>الإجمالي</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="doc-footer">
    <div class="total-row"><span>المجموع خارج الضريبة (HT)</span><span>${fmt(inv.totalHT)}</span></div>
    ${inv.remCommAmount > 0 ? `<div class="total-row"><span>التخفيض التجاري (${inv.remComm}%)</span><span>- ${fmt(inv.remCommAmount)}</span></div>` : ''}
    ${inv.remFinAmount > 0 ? `<div class="total-row"><span>الخصم المالي (${inv.remFin}%)</span><span>- ${fmt(inv.remFinAmount)}</span></div>` : ''}
    <div class="total-row"><span>الصافي خارج الضريبة (Net HT)</span><span>${fmt(inv.netHT)}</span></div>
    <div class="total-row"><span>مبلغ TVA (${tvaRate}%)</span><span>${fmt(inv.tvaAmount || inv.tva || 0)}</span></div>
    <div class="total-row grand-total"><span>إجمالي الفاتورة (TTC)</span><span>${fmt(inv.ttc || 0)}</span></div>
  </div></div>`;
}

// ═══ STATEMENT OF CHANGES IN EQUITY (جدول تغير الأموال الخاصة) ═══
function renderEquity() {
  const el = document.getElementById('equity-content');
  if (!el) return;
  const ni = getNetIncome();
  const cap = getAccBal('10') || 10000000; // Mock base capital
  const retEarnings = 5000000; // Mock previous years
  const reserves = 2000000;
  
  let html = `<div class='card gap-24'><div class='card-header'><h3><i class='fas fa-chart-pie' style='margin-left:8px;color:var(--accent-emerald)'></i>جدول تغير الأموال الخاصة</h3></div>
  <div class='card-body'><div class='table-wrapper'><table class='is-table'><thead>
  <tr><th style='text-align:right'>البيان</th><th>رأس المال</th><th>الاحتياطات</th><th>الأرباح المحتجزة</th><th>نتيجة الدورة</th><th>المجموع</th></tr></thead><tbody>
  <tr class='item-row'><td>الرصيد في بداية السنة N-2 (2024)</td><td class='mono'>${fmt(cap)}</td><td class='mono'>${fmt(reserves * 0.5)}</td><td class='mono'>${fmt(retEarnings * 0.4)}</td><td class='mono'>${fmt(0)}</td><td class='mono'>${fmt(cap + reserves*0.5 + retEarnings*0.4)}</td></tr>
  <tr class='item-row'><td>تغيرات خلال السنة N-2</td><td class='mono'>-</td><td class='mono'>${fmt(reserves * 0.2)}</td><td class='mono'>${fmt(retEarnings * 0.3)}</td><td class='mono'>${fmt(0)}</td><td class='mono'>${fmt(reserves*0.2 + retEarnings*0.3)}</td></tr>
  <tr class='item-row'><td>الرصيد في بداية السنة N-1 (2025)</td><td class='mono'>${fmt(cap)}</td><td class='mono'>${fmt(reserves * 0.7)}</td><td class='mono'>${fmt(retEarnings * 0.7)}</td><td class='mono'>${fmt(0)}</td><td class='mono'>${fmt(cap + reserves*0.7 + retEarnings*0.7)}</td></tr>
  <tr class='item-row'><td>تغيرات خلال السنة N-1</td><td class='mono'>-</td><td class='mono'>${fmt(reserves * 0.3)}</td><td class='mono'>${fmt(retEarnings * 0.3)}</td><td class='mono'>${fmt(0)}</td><td class='mono'>${fmt(reserves*0.3 + retEarnings*0.3)}</td></tr>
  <tr class='item-row'><td>الرصيد في بداية السنة N (2026)</td><td class='mono'>${fmt(cap)}</td><td class='mono'>${fmt(reserves)}</td><td class='mono'>${fmt(retEarnings)}</td><td class='mono'>${fmt(0)}</td><td class='mono'>${fmt(cap + reserves + retEarnings)}</td></tr>
  <tr class='item-row'><td>النتيجة الصافية للسنة N</td><td class='mono'>-</td><td class='mono'>-</td><td class='mono'>-</td><td class='mono text-emerald'>${fmt(ni)}</td><td class='mono text-emerald'>${fmt(ni)}</td></tr>
  <tr class='total-row'><td>الرصيد في نهاية السنة N</td><td class='mono'>${fmt(cap)}</td><td class='mono'>${fmt(reserves)}</td><td class='mono'>${fmt(retEarnings)}</td><td class='mono'>${fmt(ni)}</td><td class='mono' style='font-weight:700'>${fmt(cap + reserves + retEarnings + ni)}</td></tr>
  </tbody></table></div></div></div>`;
  el.innerHTML = html;
}

// ═══ JOURNAL (دفتر اليومية) ═══
function renderJournal() {
  const el = document.getElementById('journal-table');
  if (!el) return;
  if (state.journal.length === 0) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-book-open"></i><h4>لا توجد قيود</h4><p>أنشئ فاتورة لتوليد قيود تلقائية</p></div>`;
    return;
  }
  let html = `<table><thead><tr><th>#</th><th>التاريخ</th><th>المرجع</th><th>الوصف</th><th>الحساب</th><th style="text-align:left;">مدين (د.ج)</th><th style="text-align:left;">دائن (د.ج)</th></tr></thead><tbody>`;
  state.journal.forEach(j => {
    const accName = ACCOUNTS[j.account] ? `${j.account} — ${ACCOUNTS[j.account].nameShort}` : j.account;
    html += `<tr>
      <td class="mono">${j.id}</td>
      <td>${fmtDate(j.date)}</td>
      <td class="mono">${j.ref}</td>
      <td>${j.description}</td>
      <td>${accName}</td>
      <td class="mono ${j.debit > 0 ? 'text-debit' : ''}" style="text-align:left;">${j.debit > 0 ? fmt(j.debit) : ''}</td>
      <td class="mono ${j.credit > 0 ? 'text-credit' : ''}" style="text-align:left;">${j.credit > 0 ? fmt(j.credit) : ''}</td>
    </tr>`;
  });
  const tD = state.journal.reduce((s, j) => s + j.debit, 0);
  const tC = state.journal.reduce((s, j) => s + j.credit, 0);
  html += `<tr style="font-weight:700;border-top:2px solid var(--border);">
    <td colspan="5" style="text-align:left;">المجاميع</td>
    <td class="mono text-debit" style="text-align:left;">${fmt(tD)}</td>
    <td class="mono text-credit" style="text-align:left;">${fmt(tC)}</td>
  </tr></tbody></table>`;
  el.innerHTML = html;
}

// ═══ LEDGER (دفتر الأستاذ العام) ═══
function renderLedger() {
  const el = document.getElementById('ledger-content');
  if (!el) return;
  const accounts = {};
  state.journal.forEach(j => {
    if (!accounts[j.account]) accounts[j.account] = [];
    accounts[j.account].push(j);
  });
  const codes = Object.keys(accounts).sort();

  if (codes.length === 0) {
    el.innerHTML = `<div class="card"><div class="card-body"><div class="empty-state"><i class="fas fa-scale-balanced"></i><h4>لا توجد بيانات</h4><p>أنشئ فاتورة لتظهر البيانات هنا</p></div></div></div>`;
    return;
  }

  let html = '';
  codes.forEach((code, pageIdx) => {
    const acc = ACCOUNTS[code] || { name: code, nameShort: code };
    const entries = accounts[code];
    let runDebit = 0, runCredit = 0;

    html += `<div class="ledger-account">
      <div class="ledger-header">
        <div class="ledger-header-top">
          <span class="page-num">رقم الصفحة: ${pageIdx + 1}</span>
        </div>
        <div class="ledger-header-bottom">
          <span><strong>اسم الحساب:</strong> ${acc.name}</span>
          <span><strong>رقم الحساب:</strong> ${code}</span>
        </div>
      </div>
      <table class="ledger-table">
        <thead>
          <tr>
            <th rowspan="2" style="border-left:1px solid var(--border);">التاريخ</th>
            <th rowspan="2" style="border-left:1px solid var(--border);">الوصف</th>
            <th rowspan="2" style="border-left:1px solid var(--border);">رقم القيد المرجعي</th>
            <th colspan="2" class="group-header" style="border-left:1px solid var(--border);">المعاملة</th>
            <th colspan="2" class="group-header">الرصيد</th>
          </tr>
          <tr>
            <th style="border-left:1px solid var(--border);">مدين</th>
            <th style="border-left:1px solid var(--border);">دائن</th>
            <th style="border-left:1px solid var(--border);">مدين</th>
            <th>دائن</th>
          </tr>
        </thead>
        <tbody>`;

    entries.forEach(j => {
      runDebit += j.debit;
      runCredit += j.credit;
      const bal = runDebit - runCredit;
      html += `<tr>
        <td>${fmtDate(j.date)}</td>
        <td style="text-align:right;">${j.description}</td>
        <td class="mono">${j.ref}</td>
        <td class="mono ${j.debit > 0 ? 'text-debit' : ''}">${j.debit > 0 ? fmt(j.debit) : ''}</td>
        <td class="mono ${j.credit > 0 ? 'text-credit' : ''}">${j.credit > 0 ? fmt(j.credit) : ''}</td>
        <td class="mono ${bal >= 0 ? 'text-debit' : ''}">${bal >= 0 ? fmt(bal) : ''}</td>
        <td class="mono ${bal < 0 ? 'text-credit' : ''}">${bal < 0 ? fmt(Math.abs(bal)) : ''}</td>
      </tr>`;
    });

    html += `<tr class="total-row">
        <td colspan="3" style="text-align:left;font-weight:700;">المجموع</td>
        <td class="mono text-debit" style="font-weight:700;">${fmt(runDebit)}</td>
        <td class="mono text-credit" style="font-weight:700;">${fmt(runCredit)}</td>
        <td class="mono ${runDebit >= runCredit ? 'text-debit' : ''}" style="font-weight:700;">${runDebit >= runCredit ? fmt(runDebit - runCredit) : ''}</td>
        <td class="mono ${runDebit < runCredit ? 'text-credit' : ''}" style="font-weight:700;">${runDebit < runCredit ? fmt(runCredit - runDebit) : ''}</td>
      </tr></tbody></table></div>`;
  });
  el.innerHTML = html;
}

// ═══ TRIAL BALANCE (ميزان المراجعة) ═══
function renderTrialBalance() {
  const el = document.getElementById('trial-content');
  if (!el) return;
  const balances = getAccountBalances();
  const codes = Object.keys(balances).sort();

  if (codes.length === 0) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-check-double"></i><h4>لا توجد بيانات</h4><p>أنشئ فواتير لملء ميزان المراجعة</p></div>`;
    return;
  }

  let tD = 0, tC = 0, rows = '';
  codes.forEach(code => {
    const acc = ACCOUNTS[code] || { name: code };
    const b = balances[code];
    tD += b.totalDebit; tC += b.totalCredit;
    rows += `<tr>
      <td class="mono">${code}</td>
      <td>${acc.name || code}</td>
      <td class="mono text-debit" style="text-align:left;">${fmt(b.totalDebit)}</td>
      <td class="mono text-credit" style="text-align:left;">${fmt(b.totalCredit)}</td>
    </tr>`;
  });

  const balanced = Math.abs(tD - tC) < 0.01;
  el.innerHTML = `
    <div class="trial-status ${balanced ? 'trial-balanced' : 'trial-unbalanced'}">
      <i class="fas ${balanced ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
      ${balanced ? 'متوازن — إجمالي المدين يساوي إجمالي الدائن ✓' : `غير متوازن — الفرق: ${fmt(Math.abs(tD - tC))} د.ج`}
    </div>
    <div class="table-wrapper">
    <table><thead><tr><th>رقم الحساب</th><th>اسم الحساب</th><th style="text-align:left;">إجمالي المدين</th><th style="text-align:left;">إجمالي الدائن</th></tr></thead>
    <tbody>${rows}
    <tr style="font-weight:700;border-top:2px solid var(--border);">
      <td colspan="2" style="text-align:left;">المجاميع</td>
      <td class="mono text-debit" style="text-align:left;">${fmt(tD)}</td>
      <td class="mono text-credit" style="text-align:left;">${fmt(tC)}</td>
    </tr></tbody></table></div>`;
}

// ═══ DEBT ALERTS ═══
function getUnpaidInvoices() {
  return state.invoices.map((inv, idx) => ({ ...inv, idx })).filter(i => i.status === 'unpaid');
}

function renderDebts() {
  const el = document.getElementById('debts-content');
  if (!el) return;
  const unpaid = getUnpaidInvoices();
  if (unpaid.length === 0) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-check-circle" style="color:var(--accent-emerald);opacity:0.5;"></i><h4>كل شيء واضح!</h4><p>لا توجد ديون مستحقة — جميع الفواتير مدفوعة.</p></div>`;
    return;
  }
  const totalDebt = unpaid.reduce((s, i) => s + (i.ttc || i.totalHT), 0);
  let html = `<div style="margin-bottom:20px;padding:16px 20px;border-radius:var(--radius-md);background:rgba(244,63,94,0.06);border:1px solid rgba(244,63,94,0.15);">
    <span style="font-size:0.82rem;color:var(--text-muted);">إجمالي المستحقات</span>
    <div class="mono" style="font-size:1.4rem;font-weight:700;color:var(--accent-rose);">${fmt(totalDebt)} د.ج</div>
    <span style="font-size:0.78rem;color:var(--text-muted);">${unpaid.length} فاتورة غير مدفوعة</span>
  </div>`;

  unpaid.forEach(inv => {
    const days = Math.floor((Date.now() - new Date(inv.date).getTime()) / 86400000);
    const sev = days > 30 ? 'danger' : 'warning';
    html += `<div class="alert-card alert-${sev}">
      <div class="alert-icon"><i class="fas fa-${sev === 'danger' ? 'exclamation' : 'clock'}"></i></div>
      <div class="alert-body">
        <strong>${inv.client} — ${inv.id}</strong>
        <p>${fmt(inv.ttc || inv.totalHT)} د.ج · منذ ${days} يوم · ${fmtDate(inv.date)}</p>
      </div>
      <div><button class="btn btn-success btn-sm" onclick="markAsPaid(${inv.idx})"><i class="fas fa-check"></i> تسجيل الدفع</button></div>
    </div>`;
  });
  el.innerHTML = html;
}

// ═══ DASHBOARD ═══
function renderDashboard() {
  const totalRevenue = state.journal.filter(j => j.account === '701' || j.account === '700').reduce((s, j) => s + j.credit, 0);
  const totalExpenses = state.journal.filter(j => ACCOUNTS[j.account]?.type === 'expense').reduce((s, j) => s + j.debit, 0);
  const unpaidInvoices = getUnpaidInvoices();
  const unpaidCount = unpaidInvoices.length;
  const unpaidTotal = unpaidInvoices.reduce((s, i) => s + (i.ttc || i.totalHT), 0);

  const statsEl = document.getElementById('dashboard-stats');
  if (statsEl) {
    statsEl.innerHTML = `
    <div class="stat-card indigo">
      <div class="stat-icon"><i class="fas fa-file-invoice-dollar"></i></div>
      <div class="stat-label">إجمالي الفواتير</div>
      <div class="stat-value">${state.invoices.length}</div>
      <div class="stat-sub">${state.invoices.filter(i => i.status === 'paid').length} مدفوعة · ${unpaidCount} غير مدفوعة</div>
    </div>
    <div class="stat-card emerald">
      <div class="stat-icon"><i class="fas fa-coins"></i></div>
      <div class="stat-label">إجمالي الإيرادات</div>
      <div class="stat-value">${fmt(totalRevenue)}</div>
      <div class="stat-sub">د.ج (دينار جزائري)</div>
    </div>
    <div class="stat-card amber">
      <div class="stat-icon"><i class="fas fa-arrow-trend-down"></i></div>
      <div class="stat-label">إجمالي المصروفات</div>
      <div class="stat-value">${fmt(totalExpenses)}</div>
      <div class="stat-sub">د.ج (تكلفة + أعباء)</div>
    </div>
    <div class="stat-card rose">
      <div class="stat-icon"><i class="fas fa-triangle-exclamation"></i></div>
      <div class="stat-label">الديون المستحقة</div>
      <div class="stat-value">${fmt(unpaidTotal)}</div>
      <div class="stat-sub">${unpaidCount} فاتورة غير مدفوعة</div>
    </div>`;
  }

  const recent = state.journal.slice(-6).reverse();
  const jEl = document.getElementById('dashboard-journal');
  if (jEl) {
    if (recent.length === 0) {
      jEl.innerHTML = `<div class="empty-state" style="padding:30px;"><i class="fas fa-book-open"></i><h4>لا توجد قيود</h4><p>أنشئ فاتورة لتوليد قيود تلقائية</p></div>`;
    } else {
      let ht = `<table><thead><tr><th>المرجع</th><th>الحساب</th><th>مدين</th><th>دائن</th></tr></thead><tbody>`;
      recent.forEach(j => {
        ht += `<tr>
          <td class="mono">${j.ref}</td>
          <td>${j.account} ${ACCOUNTS[j.account]?.nameShort || ''}</td>
          <td class="mono ${j.debit > 0 ? 'text-debit' : ''}" style="text-align:left;">${j.debit > 0 ? fmt(j.debit) : ''}</td>
          <td class="mono ${j.credit > 0 ? 'text-credit' : ''}" style="text-align:left;">${j.credit > 0 ? fmt(j.credit) : ''}</td>
        </tr>`;
      });
      ht += '</tbody></table>';
      jEl.innerHTML = ht;
    }
  }

  const dEl = document.getElementById('dashboard-debts');
  if (dEl) {
    const unpaidLimited = unpaidInvoices.slice(0, 3);
    if (unpaidLimited.length === 0) {
      dEl.innerHTML = `<div class="empty-state" style="padding:30px;"><i class="fas fa-check-circle" style="color:var(--accent-emerald);"></i><h4>لا توجد ديون</h4><p>جميع الفواتير مدفوعة</p></div>`;
    } else {
      let dh = '';
      unpaidLimited.forEach(inv => {
        dh += `<div class="alert-card alert-warning" style="margin-bottom:8px;">
          <div class="alert-icon"><i class="fas fa-clock"></i></div>
          <div class="alert-body"><strong>${inv.client}</strong><p>${fmt(inv.ttc || inv.totalHT)} د.ج · ${inv.id}</p></div>
        </div>`;
      });
      if (unpaidInvoices.length > 3)
        dh += `<div style="text-align:center;margin-top:8px;"><button class="btn btn-ghost btn-sm" onclick="navigateTo('debts')">عرض الكل ←</button></div>`;
      dEl.innerHTML = dh;
    }
  }
}
