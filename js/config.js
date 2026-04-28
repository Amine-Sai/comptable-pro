let state = {
  invoices: [],
  journal: [
    { id: 1, date: '2024-01-10', ref: 'GRANT-24', description: 'منحة التسيير الوزارية 2024', account: '512', debit: 120000000, credit: 0 },
    { id: 2, date: '2024-01-10', ref: 'GRANT-24', description: 'منحة التسيير الوزارية 2024', account: '741', debit: 0, credit: 120000000 },
    { id: 3, date: '2025-01-10', ref: 'GRANT-25', description: 'منحة التسيير الوزارية 2025', account: '512', debit: 140000000, credit: 0 },
    { id: 4, date: '2025-01-10', ref: 'GRANT-25', description: 'منحة التسيير الوزارية 2025', account: '741', debit: 0, credit: 140000000 },
    { id: 5, date: '2026-01-10', ref: 'GRANT-26', description: 'استلام منحة التسيير الوزارية للسنة الحالية', account: '512', debit: 150000000, credit: 0 },
    { id: 6, date: '2026-01-10', ref: 'GRANT-26', description: 'استلام منحة التسيير الوزارية للسنة الحالية', account: '741', debit: 0, credit: 150000000 },
    { id: 7, date: '2026-02-15', ref: 'PROC-IT', description: 'اقتناء أجهزة إعلام آلي لمكتبة التكنولوجيا', account: '218', debit: 5420000, credit: 0 },
    { id: 8, date: '2026-02-15', ref: 'PROC-IT', description: 'التزام بالدفع لمورد الأجهزة', account: '401', debit: 0, credit: 5420000 },
    { id: 9, date: '2026-03-05', ref: 'MAINT-03', description: 'صيانة وتصليح مخابر حرم الجامعة', account: '615', debit: 1850000, credit: 0 },
    { id: 10, date: '2026-03-05', ref: 'MAINT-03', description: 'تسديد مصاريف الصيانة', account: '512', debit: 0, credit: 1850000 },
    { id: 11, date: '2026-04-12', ref: 'OPU-SALES', description: 'مبيعات ديوان المطبوعات الجامعية', account: '530', debit: 625000, credit: 0 },
    { id: 12, date: '2026-04-12', ref: 'OPU-SALES', description: 'مبيعات ديوان المطبوعات الجامعية', account: '700', debit: 0, credit: 625000 },
    { id: 13, date: '2026-04-25', ref: 'PAYROLL', description: 'أجور ورواتب أساتذة وعمال الجامعة', account: '631', debit: 35000000, credit: 0 },
    { id: 14, date: '2026-04-25', ref: 'PAYROLL', description: 'تسديد الأجور', account: '512', debit: 0, credit: 35000000 }
  ],
  inventory: [
    { name: 'حاسوب محمول HP ProBook 450', qty: 25, cost: 85000, price: 120000, initialQty: 25 },
    { name: 'طابعة Canon G3420', qty: 40, cost: 18000, price: 28000, initialQty: 40 },
    { name: 'لوحة مفاتيح ميكانيكية RGB', qty: 100, cost: 3500, price: 6500, initialQty: 100 }
  ],
  nextInvoiceNum: 1,
  nextJournalNum: 15
};

const ACCOUNTS = {
  '10': { name: 'رأس المال الاجتماعي', nameShort: 'رأس المال', type: 'equity', cls: 1 },
  '12': { name: 'نتيجة السنة المالية', nameShort: 'النتيجة', type: 'equity', cls: 1 },
  '218': { name: 'معدات الإعلام الآلي', nameShort: 'معدات', type: 'asset', cls: 2 },
  '30': { name: 'مخزون البضائع', nameShort: 'المخزون', type: 'asset', cls: 3 },
  '401': { name: 'الموردون (الدائنون)', nameShort: 'الموردون', type: 'liability', cls: 4 },
  '411': { name: 'العملاء (المدينون)', nameShort: 'العملاء', type: 'asset', cls: 4 },
  '4457': { name: 'TVA محصلة (على المبيعات)', nameShort: 'TVA محصلة', type: 'liability', cls: 4 },
  '512': { name: 'البنك', nameShort: 'البنك', type: 'asset', cls: 5 },
  '530': { name: 'الصندوق', nameShort: 'الصندوق', type: 'asset', cls: 5 },
  '600': { name: 'مشتريات البضائع', nameShort: 'المشتريات', type: 'expense', cls: 6 },
  '61': { name: 'خدمات خارجية', nameShort: 'خدمات', type: 'expense', cls: 6 },
  '615': { name: 'الصيانة والتصليحات', nameShort: 'الصيانة', type: 'expense', cls: 6 },
  '63': { name: 'أعباء المستخدَمين', nameShort: 'أعباء', type: 'expense', cls: 6 },
  '631': { name: 'أجور ورواتب', nameShort: 'رواتب', type: 'expense', cls: 6 },
  '700': { name: 'المبيعات', nameShort: 'مبيعات', type: 'revenue', cls: 7 },
  '701': { name: 'مبيعات البضائع', nameShort: 'المبيعات', type: 'revenue', cls: 7 },
  '709': { name: 'تخفيضات تجارية ممنوحة', nameShort: 'تخفيض تجاري', type: 'revenue_contra', cls: 7 },
  '741': { name: 'إعانات الاستغلال', nameShort: 'إعانات', type: 'revenue', cls: 7 },
  '765': { name: 'خصوم مالية ممنوحة', nameShort: 'خصم مالي', type: 'expense', cls: 7 }
};

function fmt(n) { 
  return Number(n).toLocaleString('ar-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
}

function fmtDate(d) { 
  return new Date(d).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric' }); 
}
