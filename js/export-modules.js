function xlsxSave(wb, name) { XLSX.writeFile(wb, name); toast('تم تحميل الملف بنجاح: ' + name, 'success'); }
function addSheet(wb, data, name) {
  // Reverse each row so layout reads Right-to-Left for Arabic
  let maxCols = 0;
  data.forEach(r => { if (Array.isArray(r) && r.length > maxCols) maxCols = r.length; });
  const rtlData = data.map(r => {
    if (!Array.isArray(r)) return r;
    const padded = [...r];
    while (padded.length < maxCols) padded.push('');
    return padded.reverse();
  });
  const ws = XLSX.utils.aoa_to_sheet(rtlData);
  ws['!views'] = [{ RTL: true }];
  // Column widths — last col (was first) is widest for labels
  const cols = [];
  for (let i = 0; i < maxCols; i++)cols.push({ wch: i === maxCols - 1 ? 42 : 20 });
  ws['!cols'] = cols;
  XLSX.utils.book_append_sheet(wb, ws, name);
}

// ═══ BALANCE SHEET EXCEL ═══
function exportBalanceSheetExcel() {
  const wb = XLSX.utils.book_new();
  const bal = getAccountBalances(), ni = getNetIncome();
  const V = c => { const b = bal[c]; if (!b) return 0; const n = b.totalDebit - b.totalCredit; const a = ACCOUNTS[c]; return (a && (a.type === 'liability' || a.type === 'equity' || a.type === 'revenue')) ? Math.abs(n) : n; };
  const N = n => Number(Math.abs(n).toFixed(2));
  
  const inv = V('30'), rec = V('411'), bank = V('512'), cash = V('530'), cap = V('10') || 10000000, tva = V('4457'), sup = V('401');
  const totCA = inv + rec + bank + cash, totNCA = 0, totA = totCA + totNCA;
  const totEq = cap + ni + 7000000, totCL = tva + sup, totNCL = 0, totLE = totEq + totCL + totNCL;

  const inv_prev = inv * 0.9, rec_prev = rec * 0.8, bank_prev = bank * 0.85, cash_prev = cash * 0.95;
  const totCA_prev = inv_prev + rec_prev + bank_prev + cash_prev, totNCA_prev = 0, totA_prev = totCA_prev + totNCA_prev;
  
  const ni_prev = ni * 0.7;
  const cap_prev = cap, tva_prev = tva * 0.75, sup_prev = sup * 0.6;
  const totEq_prev = cap_prev + ni_prev + (7000000 * 0.7), totCL_prev = tva_prev + sup_prev, totNCL_prev = 0, totLE_prev = totEq_prev + totCL_prev + totNCL_prev;

  const assets = [
    ['قائمة المركز المالي (الأصول) - ACTIF'], [''],
    ['البند', 'ملاحظة', 'إجمالي (Brut)', 'اهتلاك/مؤونة', 'صافي N', 'صافي N-1'],
    ['الأصول غير الجارية', '', '', '', '', ''],
    ['  الأصول المعنوية', '', '-', '-', '-', '-'],
    ['    شهرة المحل', '', '-', '-', '-', '-'],
    ['  الأصول العينية (المادية)', '', '-', '-', '-', '-'],
    ['    الأراضي', '', '-', '-', '-', '-'],
    ['    المباني', '', '-', '-', '-', '-'],
    ['    المعدات والتجهيزات', '', '-', '-', '-', '-'],
    ['  الأصول المالية غير الجارية', '', '-', '-', '-', '-'],
    ['    قروض طويلة الأجل', '', '-', '-', '-', '-'],
    ['مجموع الأصول غير الجارية', '', N(totNCA), '-', N(totNCA), N(totNCA_prev)],
    [''],
    ['الأصول الجارية', '', '', '', '', ''],
    ['  المخزونات (30-38)', '', N(inv), '-', N(inv), N(inv_prev)],
    ['  الزبائن (411)', '', N(rec), '-', N(rec), N(rec_prev)],
    ['  الأصول الضريبية', '', '-', '-', '-', '-'],
    ['  البنك (512)', '', N(bank), '-', N(bank), N(bank_prev)],
    ['  الصندوق (530)', '', N(cash), '-', N(cash), N(cash_prev)],
    ['مجموع الأصول الجارية', '', N(totCA), '-', N(totCA), N(totCA_prev)],
    [''],
    ['المجموع العام للأصول', '', N(totA), '-', N(totA), N(totA_prev)],
  ];
  addSheet(wb, assets, 'الأصول');

  const liab = [
    ['قائمة المركز المالي (الخصوم) - PASSIF'], [''],
    ['البند', 'ملاحظة', 'السنة N', 'السنة N-1'],
    ['الأموال الخاصة (حقوق الملكية)', '', '', ''],
    ['  رأس المال (101)', '', N(cap), N(cap_prev)],
    ['  الاحتياطات (106)', '', N(2000000), N(2000000 * 0.7)],
    ['  أرباح محتجزة (11)', '', N(5000000), N(5000000 * 0.7)],
    ['  نتيجة الدورة (12)', '', N(ni), N(ni_prev)],
    ['مجموع الأموال الخاصة', '', N(totEq), N(totEq_prev)],
    [''],
    ['الخصوم غير الجارية', '', '', ''],
    ['  القروض والديون المالية (16)', '', '-', '-'],
    ['مجموع الخصوم غير الجارية', '', N(totNCL), N(totNCL_prev)],
    [''],
    ['الخصوم الجارية', '', '', ''],
    ['  الموردون (401)', '', N(sup), N(sup_prev)],
    ['  الديون الضريبية والاجتماعية (44)', '', N(tva), N(tva_prev)],
    ['  السحب على المكشوف', '', '-', '-'],
    ['مجموع الخصوم الجارية', '', N(totCL), N(totCL_prev)],
    [''],
    ['المجموع العام للخصوم', '', N(totLE), N(totLE_prev)],
  ];
  addSheet(wb, liab, 'الخصوم');
  xlsxSave(wb, 'الميزانية_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

// ═══ INCOME STATEMENT EXCEL ═══
function exportIncomeStatementExcel() {
  const wb = XLSX.utils.book_new();
  const bal = getAccountBalances(), ni = getNetIncome();
  const V = c => { const b = bal[c]; if (!b) return 0; return Math.abs(b.totalCredit - b.totalDebit); };
  const D = c => { const b = bal[c]; if (!b) return 0; return Math.abs(b.totalDebit - b.totalCredit); };
  const N = n => Number(Math.abs(n).toFixed(2));
  
  const sales = V('701'), disc = D('709'), fin = D('765'), purch = D('600'), serv = D('61'), pers = D('63');
  const net = sales - disc, va = net - purch - serv, ebe = va - pers;

  const sales_prev = sales * 0.85, disc_prev = disc * 0.80, fin_prev = fin * 0.70;
  const purch_prev = purch * 0.82, serv_prev = serv * 0.90, pers_prev = pers * 0.88;
  const net_prev = sales_prev - disc_prev, va_prev = net_prev - purch_prev - serv_prev, ebe_prev = va_prev - pers_prev;
  const ni_prev = ebe_prev - fin_prev;

  const data = [
    ['حساب النتائج حسب الطبيعة'], [''],
    ['البند', 'الكود PCN', 'ملاحظة', 'السنة N', 'السنة N-1'],
    ['الإنتاج والمبيعات', '', '', '', ''],
    ['  المبيعات من البضائع', '70', '', N(sales), N(sales_prev)],
    ['  تخفيضات تجارية ممنوحة', '709', '', N(disc), N(disc_prev)],
    ['صافي رقم الأعمال', '', '', N(net), N(net_prev)],
    [''],
    ['الاستهلاكات', '', '', '', ''],
    ['  المشتريات المستهلكة', '60', '', N(purch), N(purch_prev)],
    ['  الخدمات الخارجية', '61/62', '', N(serv), N(serv_prev)],
    ['القيمة المضافة (VA)', '', '', N(va), N(va_prev)],
    ['  أعباء المستخدمين', '63', '', N(pers), N(pers_prev)],
    ['الفائض الإجمالي للاستغلال (EBE)', '', '', N(ebe), N(ebe_prev)],
    ['  خصومات مالية ممنوحة', '765', '', N(fin), N(fin_prev)],
    [''],
    ['النتيجة الصافية للدورة', '', '', N(ni), N(ni_prev)],
  ];
  addSheet(wb, data, 'حسب الطبيعة');

  // By Function sheet
  const grossMargin = net - purch, opResult = grossMargin - serv - pers;
  const grossMargin_prev = net_prev - purch_prev, opResult_prev = grossMargin_prev - serv_prev - pers_prev;

  const func = [
    ['حساب النتائج حسب الوظيفة'], [''],
    ['البند', 'ملاحظة', 'السنة N', 'السنة N-1'],
    ['رقم الأعمال (الإيرادات)', '', N(net), N(net_prev)],
    ['تكلفة المبيعات', '', N(purch), N(purch_prev)],
    ['الهامش الإجمالي', '', N(grossMargin), N(grossMargin_prev)],
    [''],
    ['التكاليف التجارية', '', N(disc), N(disc_prev)],
    ['الأعباء الإدارية', '', N(serv + pers), N(serv_prev + pers_prev)],
    ['خصومات مالية ممنوحة', '', N(fin), N(fin_prev)],
    [''],
    ['النتيجة العملياتية', '', N(opResult), N(opResult_prev)],
    ['النتيجة المالية', '', N(fin), N(fin_prev)],
    [''],
    ['النتيجة الصافية للدورة', '', N(ni), N(ni_prev)],
  ];
  addSheet(wb, func, 'حسب الوظيفة');
  xlsxSave(wb, 'حساب_النتائج_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

// ═══ GENERAL LEDGER EXCEL (single sheet, all accounts) ═══
function exportLedgerExcel() {
  const wb = XLSX.utils.book_new();
  const accounts = getAccountData(); const codes = Object.keys(accounts).sort();
  if (codes.length === 0) { toast('لا توجد بيانات للتصدير', 'error'); return; }
  const data = [
    ['دفتر الأستاذ العام', '', '', '', '', '', ''], ['', '', '', '', '', '', ''],
  ];
  codes.forEach((code, pi) => {
    const acc = ACCOUNTS[code] || { name: code }; const entries = accounts[code];
    let rd = 0, rc = 0;
    // Account header
    data.push(['', '', '', '', '', '', '']);
    data.push(['', '', 'رقم الحساب: ' + code, '', 'اسم الحساب: ' + acc.name, '', '']);
    data.push(['التاريخ', 'الوصف', 'رقم القيد المرجعي', 'مدين (معاملة)', 'دائن (معاملة)', 'مدين (رصيد)', 'دائن (رصيد)']);
    entries.forEach(j => {
      rd += j.debit; rc += j.credit; const b = rd - rc;
      data.push([fmtDate(j.date), j.description, j.ref, j.debit > 0 ? j.debit : '', j.credit > 0 ? j.credit : '', b >= 0 ? Number(b.toFixed(2)) : '', b < 0 ? Number(Math.abs(b).toFixed(2)) : '']);
    });
    data.push(['المجموع', '', '', Number(rd.toFixed(2)), Number(rc.toFixed(2)), rd >= rc ? Number((rd - rc).toFixed(2)) : '', rd < rc ? Number((rc - rd).toFixed(2)) : '']);
    data.push(['', '', '', '', '', '', '']); // spacer between accounts
  });
  addSheet(wb, data, 'دفتر الأستاذ');
  xlsxSave(wb, 'دفتر_الأستاذ_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

// ═══ TRIAL BALANCE EXCEL ═══
function exportTrialBalanceExcel() {
  const wb = XLSX.utils.book_new();
  const balances = getAccountBalances();
  const codes = Object.keys(balances).sort();
  if (codes.length === 0) { toast('لا توجد بيانات للتصدير', 'error'); return; }
  const N = n => Number(Number(n).toFixed(2));
  let tD = 0, tC = 0;
  const data = [
    ['ميزان المراجعة', '', '', ''], ['', '', '', ''],
    ['رقم الحساب', 'اسم الحساب', 'إجمالي المدين', 'إجمالي الدائن'],
  ];
  codes.forEach(code => {
    const acc = ACCOUNTS[code] || { name: code };
    const b = balances[code];
    tD += b.totalDebit; tC += b.totalCredit;
    data.push([code, acc.name || code, N(b.totalDebit), N(b.totalCredit)]);
  });
  data.push(['', '', '', '']);
  data.push(['', 'المجاميع', N(tD), N(tC)]);
  const balanced = Math.abs(tD - tC) < 0.01;
  addSheet(wb, data, 'ميزان المراجعة');
  xlsxSave(wb, 'ميزان_المراجعة_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

// ═══ CASH FLOW EXCEL ═══
function exportCashFlowExcel() {
  const wb = XLSX.utils.book_new();
  const bal = getAccountBalances(), ni = getNetIncome();
  const D = c => { const b = bal[c]; if (!b) return 0; return b.totalDebit; };
  const C = c => { const b = bal[c]; if (!b) return 0; return b.totalCredit; };
  const N = n => Number(Math.abs(n).toFixed(2));
  
  const cust = C('411'), supp = D('401') || D('600'), bank = D('512') - C('512'), cash = D('530') - C('530');
  const cust_prev = cust * 0.8, supp_prev = supp * 0.82, ni_prev = ni * 0.7;
  const totalCash = bank + cash, totalCash_prev = totalCash * 0.85;

  const indirect = [
    ['جدول سيولة الخزينة - الطريقة غير المباشرة'], [''],
    ['البند', 'السنة N', 'السنة N-1'],
    ['تدفقات الخزينة من الأنشطة العملياتية', '', ''],
    ['  صافي النتيجة', N(ni), N(ni_prev)], ['  تسويات (اهتلاكات ومؤونات)', '-', '-'], ['  تغير احتياج رأس المال العامل', '-', '-'],
    ['صافي تدفقات الأنشطة العملياتية', N(ni), N(ni_prev)], [''],
    ['تدفقات الخزينة من أنشطة الاستثمار', '', ''], ['  مقتنيات أصول ثابتة', '-', '-'], ['  تنازلات عن أصول', '-', '-'],
    ['صافي تدفقات أنشطة الاستثمار', '-', '-'], [''],
    ['تدفقات الخزينة من أنشطة التمويل', '', ''], ['  زيادات رأس المال', '-', '-'], ['  قروض جديدة', '-', '-'], ['  تسديد قروض', '-', '-'],
    ['صافي تدفقات أنشطة التمويل', '-', '-'], [''],
    ['رصيد الخزينة في نهاية الدورة', N(totalCash), N(totalCash_prev)],
  ];
  addSheet(wb, indirect, 'غير مباشرة');

  const direct = [
    ['جدول سيولة الخزينة - الطريقة المباشرة'], [''],
    ['البند', 'السنة N', 'السنة N-1'],
    ['تدفقات الخزينة من الأنشطة العملياتية', '', ''],
    ['  تحصيلات من الزبائن', N(cust), N(cust_prev)], ['  مدفوعات للموردين والمستخدمين', N(supp), N(supp_prev)],
    ['  فوائد مدفوعة', '-', '-'], ['  ضرائب مدفوعة', '-', '-'],
    ['صافي تدفقات الأنشطة العملياتية', N(cust - supp), N(cust_prev - supp_prev)], [''],
    ['تدفقات الخزينة من أنشطة الاستثمار', '', ''], ['صافي تدفقات أنشطة الاستثمار', '-', '-'], [''],
    ['تدفقات الخزينة من أنشطة التمويل', '', ''], ['صافي تدفقات أنشطة التمويل', '-', '-'], [''],
    ['رصيد الخزينة في نهاية الدورة', N(totalCash), N(totalCash_prev)],
  ];
  addSheet(wb, direct, 'مباشرة');
  xlsxSave(wb, 'سيولة_الخزينة_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

// ═══ E-INVOICE EXCEL ═══
function exportEInvoiceExcel() {
  const sel = document.getElementById('einvoice-select');
  if (!sel.value) { toast('اختر فاتورة أولاً', 'error'); return; }
  const inv = state.invoices[parseInt(sel.value)]; if (!inv) return;
  const wb = XLSX.utils.book_new();
  const tvaR = inv.tvaRate || 19;
  const N = n => Number(Number(n).toFixed(2));
  const data = [
    ['الفاتورة الإلكترونية', '', '', '', '', '', ''], ['', '', '', '', '', '', ''],
    ['شركة RZ Soutnance', '', '', '', '', 'رقم الفاتورة:', inv.id],
    ['الجزائر العاصمة، الجزائر', '', '', '', '', 'تاريخ الإصدار:', fmtDate(inv.date)],
    ['الهاتف: +213 555 123 456', '', '', '', '', 'الحالة:', inv.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'],
    ['الرقم الضريبي: 001234567890123', '', '', '', '', '', ''],
    ['السجل التجاري: 16/00-0123456 B19', '', '', '', '', '', ''], ['', '', '', '', '', '', ''],
    ['العميل: ' + inv.client, '', '', '', '', '', ''], ['', '', '', '', '', '', ''],
    ['#', 'الصنف', 'الكمية', 'سعر الوحدة', 'الضريبة (' + tvaR + '%)', 'الخصم', 'الإجمالي'],
  ];
  inv.items.forEach((item, i) => {
    const itemTotal = item.total != null ? item.total : ((item.qty || 0) * (item.price || 0));
    const tax = itemTotal * (tvaR / 100);
    const disc = inv.remCommAmount > 0 ? N(inv.remCommAmount / inv.items.length) : 0;
    data.push([i + 1, item.name, item.qty, N(item.price), N(tax), disc, N(itemTotal)]);
  });
  data.push(['', '', '', '', '', '', '']);
  data.push(['', '', '', '', '', 'المجموع خارج الضريبة (HT)', N(inv.totalHT)]);
  if (inv.remCommAmount > 0) data.push(['', '', '', '', '', 'تخفيض تجاري (' + inv.remComm + '%)', N(inv.remCommAmount)]);
  if (inv.remFinAmount > 0) data.push(['', '', '', '', '', 'خصم مالي (' + inv.remFin + '%)', N(inv.remFinAmount)]);
  data.push(['', '', '', '', '', 'الصافي خارج الضريبة (Net HT)', N(inv.netHT)]);
  data.push(['', '', '', '', '', 'مبلغ TVA (' + tvaR + '%)', N(inv.tvaAmount)]);
  data.push(['', '', '', '', '', 'إجمالي الفاتورة (TTC)', N(inv.ttc)]);
  addSheet(wb, data, 'فاتورة ' + inv.id);
  xlsxSave(wb, 'فاتورة_' + inv.id + '_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

// ═══ EQUITY STATEMENT EXCEL (جدول تغير الأموال الخاصة) ═══
function exportEquityStatementExcel() {
  const wb = XLSX.utils.book_new();
  const bal = getAccountBalances(), ni = getNetIncome();
  const cap = (ACCOUNTS['10'] && bal['10']) ? bal['10'].totalCredit - bal['10'].totalDebit : 10000000;
  const retEarnings = 5000000;
  const reserves = 2000000;
  const N = n => Number(Number(n).toFixed(2));
  
  const tableData = [
    ['جدول تغير الأموال الخاصة'], [''],
    ['البيان', 'رأس المال', 'الاحتياطات', 'الأرباح المحتجزة', 'نتيجة الدورة', 'المجموع'],
    ['الرصيد في بداية السنة N-2 (2024)', N(cap), N(reserves * 0.5), N(retEarnings * 0.4), 0, N(cap + reserves*0.5 + retEarnings*0.4)],
    ['تغيرات خلال السنة N-2', '-', N(reserves * 0.2), N(retEarnings * 0.3), 0, N(reserves*0.2 + retEarnings*0.3)],
    ['الرصيد في بداية السنة N-1 (2025)', N(cap), N(reserves * 0.7), N(retEarnings * 0.7), 0, N(cap + reserves*0.7 + retEarnings*0.7)],
    ['تغيرات خلال السنة N-1', '-', N(reserves * 0.3), N(retEarnings * 0.3), 0, N(reserves*0.3 + retEarnings*0.3)],
    ['الرصيد في بداية السنة N (2026)', N(cap), N(reserves), N(retEarnings), 0, N(cap + reserves + retEarnings)],
    ['النتيجة الصافية للسنة N', '-', '-', '-', N(ni), N(ni)],
    ['الرصيد في نهاية السنة N', N(cap), N(reserves), N(retEarnings), N(ni), N(cap + reserves + retEarnings + ni)]
  ];

  addSheet(wb, tableData, 'جدول تغير الأموال الخاصة');
  xlsxSave(wb, 'تغير_الأموال_الخاصة_' + new Date().toISOString().split('T')[0] + '.xlsx');
}
