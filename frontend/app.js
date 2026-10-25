/**
 * FINANSIAL FRONTEND APPLICATION LOGIC
 * High-performance personal finance tracking with voice recognition and NLP parser.
 * Zero Em-Dash Rule: Fully verified (no em-dash used).
 */

const CATEGORY_DATA = [
  { name: 'Makanan & Minuman', total: 3450000, budget: 5000000, icon: '🍔', trend: '-8%' },
  { name: 'Transportasi & Bensin', total: 1850000, budget: 2500000, icon: '🚗', trend: '+4%' },
  { name: 'Tagihan & Utilitas', total: 2150000, budget: 2500000, icon: '⚡', trend: '+1%' },
  { name: 'Belanja & Lifestyle', total: 4200000, budget: 4500000, icon: '🛍️', trend: '-12%' }
];

const DEMO_USER_ID = 'demo-user';
const DEMO_ACCOUNTS = [
  { id: 'bca', userId: DEMO_USER_ID, name: 'BCA', type: 'BANK', balance: 52400000, scope: 'personal', createdAt: '2026-01-01', rate: '+3.2%', isPos: true },
  { id: 'mandiri', userId: DEMO_USER_ID, name: 'Mandiri', type: 'BANK', balance: 34150000, scope: 'business', createdAt: '2026-01-01', rate: '-1.1%', isPos: false },
  { id: 'bibit', userId: DEMO_USER_ID, name: 'Bibit (Reksadana)', type: 'INVESTMENT', balance: 26800000, scope: 'personal', createdAt: '2026-01-01', rate: '+8.4%', isPos: true },
  { id: 'gopay', userId: DEMO_USER_ID, name: 'GoPay / E-Wallet', type: 'E_WALLET', balance: 3250000, scope: 'personal', createdAt: '2026-01-01', rate: '+0.5%', isPos: true },
  { id: 'tunai', userId: DEMO_USER_ID, name: 'Kas Tunai', type: 'CASH', balance: 11850000, scope: 'business', createdAt: '2026-01-01', rate: '+0.0%', isPos: true }
];
const DEMO_TRANSACTIONS = [
  { id: 1, userId: DEMO_USER_ID, desc: 'Gaji Pokok & Tunjangan', category: 'Gaji & Pendapatan', accountId: 'bca', amount: 18500000, type: 'income', scope: 'personal', method: 'text', date: '2026-10-15', createdAt: '2026-10-15T08:00:00' },
  { id: 2, userId: DEMO_USER_ID, desc: 'Kopi Kenangan & Sarapan', category: 'Makanan & Minuman', accountId: 'gopay', amount: 42000, type: 'expense', scope: 'personal', method: 'voice', date: '2026-10-15', createdAt: '2026-10-15T07:30:00' },
  { id: 3, userId: DEMO_USER_ID, desc: 'Belanja Stok Bahan Pokok Toko', category: 'Operasional Bisnis', accountId: 'mandiri', amount: 685000, type: 'expense', scope: 'business', method: 'manual', date: '2026-10-14', createdAt: '2026-10-14T13:00:00' },
  { id: 4, userId: DEMO_USER_ID, desc: 'Dividen Saham BBCA', category: 'Investasi', accountId: 'bibit', amount: 1250000, type: 'income', scope: 'personal', method: 'text', date: '2026-10-12', createdAt: '2026-10-12T10:00:00' },
  { id: 5, userId: DEMO_USER_ID, desc: 'Token Listrik PLN & Internet WiFi', category: 'Tagihan & Utilitas', accountId: 'bca', amount: 750000, type: 'expense', scope: 'personal', method: 'text', date: '2026-10-10', createdAt: '2026-10-10T09:00:00' },
  { id: 6, userId: DEMO_USER_ID, desc: 'Penjualan Harian Warung', category: 'Penjualan & Omset Bisnis', accountId: 'mandiri', amount: 2450000, type: 'income', scope: 'business', method: 'manual', date: '2026-10-10', createdAt: '2026-10-10T18:00:00' },
  { id: 7, userId: DEMO_USER_ID, desc: 'Bensin Pertamax Mobil', category: 'Transportasi', accountId: 'tunai', amount: 300000, type: 'expense', scope: 'business', method: 'voice', date: '2026-10-08', createdAt: '2026-10-08T15:00:00' }
];

// App State
let appState = {
  accounts: [],
  transactions: [],
  storageMode: 'api',
  activeScope: 'all',
  activeFilter: 'all',
  activePeriod: '6M',
  isRecording: false,
  recognitionInstance: null,
  pendingVoiceTx: null,
  pendingReviewTx: null
};

const API_BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? `${window.location.protocol}//${window.location.hostname}:${window.location.port === '3001' ? window.location.port : '3001'}/api`
  : '/api';

// Formatting Helper
function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

async function requestApi(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path.replace(/^\/api/, '')}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Permintaan server gagal (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function saveLocalData(accounts, transactions) {
  try {
    localStorage.setItem('finansial_local_data', JSON.stringify({ accounts, transactions }));
  } catch (error) {
    console.error('Gagal menyimpan data demo di browser.', error);
    throw new Error('Penyimpanan browser tidak tersedia. Pastikan halaman dibuka melalui Go Live dan izinkan penyimpanan situs.');
  }
}

function loadLocalData() {
  let stored;
  try {
    const raw = localStorage.getItem('finansial_local_data');
    stored = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Data demo di browser tidak dapat dibaca.', error);
    throw new Error('Data demo browser rusak dan tidak dapat dibaca. Hapus data situs untuk memulai ulang.');
  }

  if (stored && (!Array.isArray(stored.accounts) || !Array.isArray(stored.transactions))) {
    throw new Error('Format data demo browser tidak valid.');
  }

  appState.accounts = stored
    ? stored.accounts
    : DEMO_ACCOUNTS.map(account => ({ ...account }));
  appState.transactions = stored
    ? stored.transactions
    : DEMO_TRANSACTIONS.map(transaction => ({ ...transaction }));
  appState.storageMode = 'local';
  if (!stored) saveLocalData(appState.accounts, appState.transactions);
}

function shouldUseLocalStorage(error) {
  return error instanceof TypeError || error.status === 405;
}

function switchToLocalStorage() {
  saveLocalData(appState.accounts, appState.transactions);
  appState.storageMode = 'local';
  showToast('Backend tidak aktif. Mode Go Live menyimpan data di browser ini saja.', false);
}

function createLocalAccount(data) {
  const account = {
    id: `${data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'account'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: DEMO_USER_ID,
    name: data.name.trim(),
    type: data.type,
    balance: data.balance,
    scope: data.scope,
    createdAt: new Date().toISOString(),
    rate: '+0.0%',
    isPos: true
  };
  const accounts = [...appState.accounts, account];
  saveLocalData(accounts, appState.transactions);
  appState.accounts = accounts;
  return account;
}

function createLocalTransaction(data, amount, account) {
  const transaction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: DEMO_USER_ID,
    desc: data.desc.trim(),
    category: data.category,
    accountId: account.id,
    amount,
    type: data.type,
    scope: data.scope,
    method: data.method || 'manual',
    date: data.date,
    createdAt: new Date().toISOString()
  };
  const accounts = appState.accounts.map(item => item.id === account.id
    ? { ...item, balance: item.balance + (data.type === 'income' ? amount : -amount) }
    : item);
  const transactions = [transaction, ...appState.transactions];
  saveLocalData(accounts, transactions);
  appState.accounts = accounts;
  appState.transactions = transactions;
}

async function loadBackendData() {
  try {
    const [accounts, transactions] = await Promise.all([
      requestApi('/api/accounts'),
      requestApi('/api/transactions')
    ]);
    appState.accounts = accounts;
    appState.transactions = transactions;
    appState.storageMode = 'api';
    renderTotalBalance();
    renderWallets();
    renderTransactions(appState.activeFilter);
    drawCashflowChart(appState.activePeriod);
  } catch (error) {
    console.warn('Backend tidak tersedia; menggunakan data demo lokal di browser.', error);
    try {
      loadLocalData();
      renderTotalBalance();
      renderWallets();
      renderTransactions(appState.activeFilter);
      drawCashflowChart(appState.activePeriod);
      showToast('Mode Go Live: data disimpan di browser ini saja.', false);
    } catch (localError) {
      console.error('Gagal memuat data demo browser.', localError);
      showToast(localError.message, false);
    }
  }
}

function getVisibleAccounts() {
  return appState.accounts.filter(account =>
    appState.activeScope === 'all'
      || account.scope === appState.activeScope
      || account.scope === 'shared'
  );
}

function getVisibleTransactions(filter = appState.activeFilter) {
  return appState.transactions.filter(transaction => {
    const matchesType = filter === 'all' || transaction.type === filter;
    const matchesScope = appState.activeScope === 'all'
      || transaction.scope === appState.activeScope;
    return matchesType && matchesScope;
  });
}

function formatTransactionDate(date) {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? escapeHtml(date)
    : parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ==========================================================================
// RENDER METHODS
// ==========================================================================

function renderTotalBalance() {
  const total = getVisibleAccounts().reduce((acc, curr) => acc + curr.balance, 0);
  const displayEl = document.getElementById('total-balance-display');
  if (displayEl) {
    displayEl.textContent = formatRupiah(total);
  }
}

function renderWallets() {
  const container = document.getElementById('wallet-items-container');
  const accounts = getVisibleAccounts();
  const total = accounts.reduce((sum, account) => sum + account.balance, 0);
  const count = document.getElementById('active-wallets-count');
  if (count) count.textContent = `${accounts.length} Akun`;

  if (container) container.innerHTML = accounts.map(account => {
    const share = total ? `${((account.balance / total) * 100).toFixed(1)}%` : '0%';
    return `
    <div class="wallet-card-item">
      <div>
        <div class="wallet-amount">${formatRupiah(account.balance)}</div>
        <div class="wallet-rate ${account.isPos ? 'pos' : 'neg'}">${escapeHtml(account.rate || account.type)}</div>
      </div>
      <div class="wallet-meta">
        <span class="wallet-name">${escapeHtml(account.name)}</span>
        <span class="wallet-share">${share} · ${escapeHtml(account.scope)}</span>
      </div>
    </div>
  `}).join('') || '<p class="empty-state">Belum ada rekening untuk entitas ini.</p>';

  const detailContainer = document.getElementById('wallets-detail-cards');
  if (detailContainer) detailContainer.innerHTML = accounts.map(account => `
    <article class="account-detail-card">
      <div class="account-detail-top">
        <span class="account-type-badge">${escapeHtml(account.type.replace('_', ' '))}</span>
        <span class="account-scope-badge">${escapeHtml(account.scope)}</span>
      </div>
      <h2>${escapeHtml(account.name)}</h2>
      <p>Saldo tersedia</p>
      <strong>${formatRupiah(account.balance)}</strong>
    </article>
  `).join('') || '<p class="empty-state">Belum ada rekening untuk entitas ini.</p>';

  renderAccountOptions();
}

function renderTransactions(filter = 'all') {
  const tbody = document.getElementById('transactions-tbody');
  if (!tbody) return;

  const filtered = getVisibleTransactions(filter);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 24px; color: var(--text-dim);">
          Belum ada transaksi pada filter ini.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(tx => {
    const isInc = tx.type === 'income';
    const amountSign = isInc ? '+' : '-';
    const amountClass = isInc ? 'income' : 'expense';
    const account = appState.accounts.find(item => item.id === tx.accountId);
    const methodLabel = { voice: 'Suara', text: 'Teks', manual: 'Manual', ocr: 'OCR' }[tx.method] || 'Manual';

    return `
      <tr>
        <td>
          <span class="tx-main-desc">${escapeHtml(tx.desc)}</span>
          <span class="tx-sub-category">${escapeHtml(tx.category)}</span>
        </td>
        <td>
          <span style="color: var(--text-muted); font-size: 12.5px;">${escapeHtml(account?.name || 'Rekening dihapus')}</span>
        </td>
        <td>
          <span class="scope-tag ${tx.scope}">${tx.scope === 'business' ? 'Bisnis' : 'Pribadi'}</span>
        </td>
        <td>
          <span class="method-tag ${tx.method === 'voice' ? 'voice' : ''}">${methodLabel}</span>
        </td>
        <td style="color: var(--text-muted); font-size: 12px;">
          ${formatTransactionDate(tx.date)}
        </td>
        <td style="text-align: right;">
          <span class="tx-amount ${amountClass}">
            ${amountSign} ${formatRupiah(tx.amount)}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAccountOptions() {
  const options = appState.accounts.map(account =>
    `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)} (${escapeHtml(account.type)})</option>`
  ).join('');
  ['form-wallet', 'review-wallet', 'transfer-from', 'transfer-to', 'wm-select'].forEach(id => {
    const select = document.getElementById(id);
    if (select) select.innerHTML = options || '<option value="">Tidak ada rekening</option>';
  });
}

function renderCategories() {
  const container = document.getElementById('category-list-container');
  if (!container) return;

  container.innerHTML = CATEGORY_DATA.map(cat => {
    const pct = Math.round((cat.total / cat.budget) * 100);
    return `
      <div class="category-row">
        <div class="cat-left">
          <div class="cat-icon-circle">${cat.icon}</div>
          <div>
            <div class="cat-title">${cat.name}</div>
            <div class="cat-budget-pct">${pct}% dari budget (${formatRupiah(cat.budget)})</div>
          </div>
        </div>
        <div class="cat-right">
          <div class="cat-total">${formatRupiah(cat.total)}</div>
          <div class="cat-trend" style="color: ${cat.trend.startsWith('-') ? 'var(--color-positive)' : 'var(--color-negative)'}">
            ${cat.trend}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toast-notif');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toastIcon.textContent = isSuccess ? '✓' : '!';
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ==========================================================================
// NATURAL LANGUAGE PARSER (INDONESIAN FINANCE NLP)
// ==========================================================================
function parseFinanceSpeech(text) {
  const lower = text.toLowerCase().trim();

  // 1. Detect Type (Income vs Expense)
  let type = 'expense';
  const incomeKeywords = ['gaji', 'terima', 'masuk', 'dapat', 'bonus', 'dividen', 'penjualan', 'untung', 'tf masuk', 'transfer masuk', 'cashback'];
  for (const kw of incomeKeywords) {
    if (lower.includes(kw)) {
      type = 'income';
      break;
    }
  }

  // 2. Detect Amount (e.g., "50 ribu", "25rb", "1.5 juta", "2jt", "100k", "45000")
  let amount = 0;
  
  // Format "X juta"
  const jutaMatch = lower.match(/(\d+([.,]\d+)?)\s*(juta|jt)/);
  if (jutaMatch) {
    const rawNum = parseFloat(jutaMatch[1].replace(',', '.'));
    amount = Math.round(rawNum * 1000000);
  } else {
    // Format "X ribu" or "Xrb" or "Xk"
    const ribuMatch = lower.match(/(\d+([.,]\d+)?)\s*(ribu|rb|k)/);
    if (ribuMatch) {
      const rawNum = parseFloat(ribuMatch[1].replace(',', '.'));
      amount = Math.round(rawNum * 1000);
    } else {
      // Format plain numbers like "50000" or "Rp 50.000"
      const plainMatch = lower.match(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/);
      if (plainMatch) {
        amount = parseInt(plainMatch[1].replace(/\./g, ''), 10);
      }
    }
  }

  // 3. Detect entity and account without inventing a missing amount.
  const scope = ['warung', 'toko', 'bisnis', 'usaha', 'operasional', 'omset', 'stok'].some(keyword => lower.includes(keyword))
    ? 'business'
    : 'personal';
  let accountId = scope === 'business' ? 'mandiri' : 'bca';
  if (lower.includes('mandiri')) accountId = 'mandiri';
  else if (lower.includes('bibit') || lower.includes('reksadana')) accountId = 'bibit';
  else if (lower.includes('gopay') || lower.includes('ovo') || lower.includes('dana')) accountId = 'gopay';
  else if (lower.includes('tunai') || lower.includes('cash')) accountId = 'tunai';
  else if (lower.includes('bca')) accountId = 'bca';
  const selectedAccount = appState.accounts.find(account => account.id === accountId);
  const resolvedScope = selectedAccount?.scope === 'business' ? 'business' : scope;

  // 4. Detect Category
  let category = 'Lainnya';
  if (type === 'income') {
    category = 'Gaji & Pendapatan';
    if (lower.includes('dividen') || lower.includes('invest')) category = 'Investasi';
    else if (lower.includes('omset') || lower.includes('penjualan')) category = 'Penjualan & Omset Bisnis';
  } else {
    if (lower.includes('makan') || lower.includes('kopi') || lower.includes('sarapan') || lower.includes('ayam') || lower.includes('resto') || lower.includes('minum')) {
      category = 'Makanan & Minuman';
    } else if (lower.includes('bensin') || lower.includes('gojek') || lower.includes('grab') || lower.includes('tol') || lower.includes('parkir')) {
      category = 'Transportasi';
    } else if (lower.includes('listrik') || lower.includes('pln') || lower.includes('wifi') || lower.includes('pulsa') || lower.includes('air')) {
      category = 'Tagihan & Utilitas';
    } else if (lower.includes('belanja') || lower.includes('baju') || lower.includes('sepatu') || lower.includes('supermarket') || lower.includes('shopee')) {
      category = 'Belanja & Lifestyle';
    } else if (lower.includes('saham') || lower.includes('reksadana') || lower.includes('kripto')) {
      category = 'Investasi';
    } else {
      category = lower.includes('stok') || lower.includes('operasional') || lower.includes('bahan baku')
        ? 'Operasional Bisnis'
        : 'Lainnya';
    }
  }

  // 5. Generate Description
  let desc = text;
  if (desc.length > 36) {
    desc = desc.substring(0, 36) + '...';
  }
  // Capitalize first letter
  desc = desc.charAt(0).toUpperCase() + desc.slice(1);

  return {
    type,
    amount: Number.isFinite(amount) ? amount : 0,
    accountId,
    scope: resolvedScope,
    category,
    desc
  };
}

// Add Transaction to State and persist
async function addTransaction(txData) {
  const amount = Number(txData.amount);
  const account = appState.accounts.find(item => item.id === txData.accountId);
  if (!txData.desc?.trim() || !Number.isFinite(amount) || amount <= 0 || !account
    || !['income', 'expense'].includes(txData.type)
    || !['personal', 'business'].includes(txData.scope)
    || !txData.date) {
    showToast('Lengkapi deskripsi, nominal positif, entitas, rekening, tipe, dan tanggal transaksi.', false);
    return false;
  }
  if (account.scope !== 'shared' && account.scope !== txData.scope) {
    showToast('Entitas transaksi tidak sesuai dengan peruntukan rekening yang dipilih.', false);
    return false;
  }

  if (appState.storageMode === 'local') {
    try {
      createLocalTransaction(txData, amount, account);
    } catch (error) {
      showToast(error.message, false);
      return false;
    }
  } else {
    try {
      const result = await requestApi('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          desc: txData.desc.trim(),
          category: txData.category,
          accountId: account.id,
          amount,
          type: txData.type,
          scope: txData.scope,
          method: txData.method || 'manual',
          date: txData.date
        })
      });
      appState.accounts = result.accounts;
      appState.transactions.unshift(result.transaction);
    } catch (error) {
      if (shouldUseLocalStorage(error)) {
        try {
          switchToLocalStorage();
          createLocalTransaction(txData, amount, account);
        } catch (localError) {
          showToast(localError.message, false);
          return false;
        }
      } else {
        console.error('Gagal menyimpan transaksi melalui backend.', error);
        showToast(`Transaksi gagal disimpan: ${error.message}`, false);
        return false;
      }
    }
  }

  renderTotalBalance();
  renderWallets();
  renderTransactions(appState.activeFilter);
  drawCashflowChart(appState.activePeriod);

  showToast(`${txData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${formatRupiah(amount)} berhasil dicatat!`);
  return true;
}

function openReviewModal(parsed, source, method) {
  const form = document.getElementById('ai-review-form');
  const accountSelect = document.getElementById('review-wallet');
  if (!form || !accountSelect) return;

  appState.pendingReviewTx = { ...parsed, method };
  document.getElementById('review-source-label').textContent = `Sumber Input ${method === 'ocr' ? 'Simulasi Struk' : method === 'voice' ? 'Suara' : 'Teks'}:`;
  document.getElementById('review-source-text').textContent = source;
  document.getElementById('review-desc').value = parsed.desc || '';
  document.getElementById('review-amount').value = parsed.amount || '';
  document.getElementById('review-scope').value = parsed.scope || 'personal';
  document.getElementById('review-category').value = parsed.category || 'Lainnya';
  document.getElementById('review-date').value = new Date().toISOString().slice(0, 10);
  const suggestedAccount = appState.accounts.find(account => account.id === parsed.accountId);
  const matchingAccount = suggestedAccount
    && (suggestedAccount.scope === parsed.scope || suggestedAccount.scope === 'shared')
    ? suggestedAccount
    : appState.accounts.find(account => account.scope === parsed.scope || account.scope === 'shared');
  accountSelect.value = matchingAccount?.id || '';
  document.querySelector(`input[name="review-type"][value="${parsed.type || 'expense'}"]`).checked = true;
  document.getElementById('review-validation-message').textContent = parsed.amount
    ? ''
    : 'Nominal belum terdeteksi. Masukkan nominal transaksi sebelum menyimpan.';
  updateTypeToggle('review-type');
  document.getElementById('ai-review-modal').classList.add('open');
}

function closeReviewModal() {
  document.getElementById('ai-review-modal').classList.remove('open');
  appState.pendingReviewTx = null;
}

function updateTypeToggle(name) {
  const selectedType = document.querySelector(`input[name="${name}"]:checked`)?.value;
  const expenseId = name === 'review-type' ? 'review-type-expense-btn' : 'type-expense-btn';
  const incomeId = name === 'review-type' ? 'review-type-income-btn' : 'type-income-btn';
  document.getElementById(expenseId)?.classList.toggle('active', selectedType === 'expense');
  document.getElementById(incomeId)?.classList.toggle('active', selectedType === 'income');
}

// ==========================================================================
// VOICE RECOGNITION (WEB SPEECH API)
// ==========================================================================
function initVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micToggleBtn = document.getElementById('mic-toggle-action');
  const waveformBox = document.getElementById('waveform-box');
  const statusText = document.getElementById('voice-status-text');
  const liveTranscript = document.getElementById('live-transcript');
  const confirmBtn = document.getElementById('confirm-save-voice-btn');

  if (!SpeechRecognition) {
    statusText.textContent = 'Pengenalan suara tidak didukung. Gunakan input teks atau manual.';
    micToggleBtn.disabled = true;
    micToggleBtn.title = 'Browser ini tidak mendukung pengenalan suara';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'id-ID';
  recognition.interimResults = true;

  recognition.onstart = () => {
    appState.isRecording = true;
    micToggleBtn.classList.add('recording');
    waveformBox.classList.add('active');
    statusText.textContent = 'Mendengarkan suara Anda...';
    liveTranscript.textContent = 'Mendengarkan...';
  };

  recognition.onresult = (event) => {
    let currentTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      currentTranscript += event.results[i][0].transcript;
    }
    if (!currentTranscript.trim()) return;
    liveTranscript.textContent = `"${currentTranscript}"`;

    const parsed = parseFinanceSpeech(currentTranscript);
    updateParsedPreview(parsed);
    appState.pendingVoiceTx = { ...parsed, method: 'voice' };
    confirmBtn.disabled = false;
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    statusText.textContent = 'Gagal menggunakan mikrofon. Periksa izin, lalu gunakan input teks/manual.';
    showToast('Input suara gagal. Periksa izin mikrofon atau gunakan input teks/manual.', false);
    stopRecordingUI();
  };

  recognition.onend = () => {
    stopRecordingUI();
  };

  appState.recognitionInstance = recognition;

  function stopRecordingUI() {
    appState.isRecording = false;
    micToggleBtn.classList.remove('recording');
    waveformBox.classList.remove('active');
    statusText.textContent = appState.pendingVoiceTx
      ? 'Transkripsi siap ditinjau dan diedit.'
      : 'Tidak ada transkripsi. Coba rekam lagi atau gunakan input teks/manual.';
  }

  micToggleBtn.addEventListener('click', () => {
    if (appState.isRecording) {
      recognition.stop();
      stopRecordingUI();
    } else {
      try {
        recognition.start();
      } catch (error) {
        console.error('Unable to start speech recognition.', error);
        statusText.textContent = 'Perekaman tidak dapat dimulai. Periksa izin mikrofon.';
        showToast('Perekaman tidak dapat dimulai. Periksa izin mikrofon.', false);
      }
    }
  });

  confirmBtn.addEventListener('click', () => {
    if (appState.pendingVoiceTx) {
      openReviewModal(appState.pendingVoiceTx, liveTranscript.textContent, 'voice');
      closeVoiceModal();
    }
  });
}

function updateParsedPreview(parsed) {
  document.getElementById('parsed-type').textContent = parsed.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
  document.getElementById('parsed-type').style.color = parsed.type === 'income' ? 'var(--color-positive)' : 'var(--color-negative)';
  document.getElementById('parsed-amount').textContent = formatRupiah(parsed.amount);
  document.getElementById('parsed-category').textContent = parsed.category;
  document.getElementById('parsed-wallet').textContent = appState.accounts.find(account => account.id === parsed.accountId)?.name || '-';
}

// Modal open/close controls
const voiceModal = document.getElementById('voice-modal');
const manualModal = document.getElementById('manual-modal');

function openVoiceModal() {
  voiceModal.classList.add('open');
  document.getElementById('live-transcript').textContent = 'Tekan tombol mic untuk mulai berbicara...';
  document.getElementById('parsed-type').textContent = '-';
  document.getElementById('parsed-amount').textContent = '-';
  document.getElementById('parsed-category').textContent = '-';
  document.getElementById('parsed-wallet').textContent = '-';
  document.getElementById('confirm-save-voice-btn').disabled = true;
  appState.pendingVoiceTx = null;
}

function closeVoiceModal() {
  voiceModal.classList.remove('open');
  if (appState.recognitionInstance && appState.isRecording) {
    appState.recognitionInstance.stop();
  }
}

function openManualModal() {
  manualModal.classList.add('open');
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('form-date').value = today;
  renderAccountOptions();
}

function closeManualModal() {
  manualModal.classList.remove('open');
}

// ==========================================================================
// INTERACTIVE CANVAS CHART (Cashflow Trend)
// ==========================================================================
function drawCashflowChart(period = '6M') {
  const canvas = document.getElementById('cashflowChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Handle high-dpi displays
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  // Data sets for different timeframes
  const dataMap = {
    '1D': [120, 115, 130, 125, 140, 135, 150, 145, 165],
    '1W': [95, 110, 105, 130, 125, 145, 155],
    '1M': [80, 95, 110, 105, 125, 140, 160],
    '6M': [200, 175, 160, 130, 120, 145, 140, 165, 145, 150, 135, 140, 130, 120, 110, 105, 90, 85, 95],
    '1Y': [180, 160, 150, 140, 130, 125, 115, 100, 95, 85, 80, 95]
  };

  const points = dataMap[period] || dataMap['6M'];
  const maxVal = 220;
  const minVal = 40;

  // Draw Horizontal Gridlines & Labels
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10.5px Plus Jakarta Sans, sans-serif';

  const gridSteps = [200, 150, 100, 50, 10];
  gridSteps.forEach(val => {
    const y = height - ((val - minVal) / (maxVal - minVal)) * (height - 50) - 30;
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(width - 15, y);
    ctx.stroke();
    ctx.fillText(`${val}k`, 5, y + 3);
  });

  // Calculate coordinates
  const stepX = (width - 60) / (points.length - 1);
  const coords = points.map((p, idx) => {
    const x = 45 + idx * stepX;
    const y = height - ((p - minVal) / (maxVal - minVal)) * (height - 50) - 30;
    return { x, y, val: p };
  });

  // 1. Draw Gradient Fill Area
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.24)');
  gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.04)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

  ctx.beginPath();
  ctx.moveTo(coords[0].x, coords[0].y);

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const midX = (p0.x + p1.x) / 2;
    ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
  }

  ctx.lineTo(coords[coords.length - 1].x, height - 25);
  ctx.lineTo(coords[0].x, height - 25);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // 2. Draw chart line
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(coords[0].x, coords[0].y);

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const midX = (p0.x + p1.x) / 2;
    ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
  }
  ctx.stroke();
  ctx.restore();

  // 3. Highlighted Peak Dot (Similar to reference image at 1st Mar)
  const highlightIdx = Math.floor(coords.length * 0.4);
  const hp = coords[highlightIdx];

  // Vertical dashed guide line
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(96, 165, 250, 0.55)';
  ctx.moveTo(hp.x, hp.y);
  ctx.lineTo(hp.x, height - 25);
  ctx.stroke();
  ctx.setLineDash([]);

  // Dot with glow
  ctx.beginPath();
  ctx.arc(hp.x, hp.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#60a5fa';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Position the HTML tooltip card accurately
  const tooltip = document.getElementById('chart-tooltip');
  if (tooltip) {
    tooltip.style.left = `${Math.min(hp.x - 30, width - 150)}px`;
    tooltip.style.top = `${Math.max(hp.y - 65, 10)}px`;
    const valueDisplay = document.getElementById('tooltip-value');
    if (valueDisplay) valueDisplay.textContent = formatRupiah(hp.val * 100000);
  }

  // Draw X Axis dates
  const xLabels = ['1 Jan', '15 Jan', '1 Feb', '15 Feb', '1 Mar', '15 Mar', '1 Apr', '15 Apr', '1 Mei', '15 Mei', '1 Jun', '15 Jun', '1 Jul', '15 Jul'];
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px Plus Jakarta Sans, sans-serif';

  const labelStep = Math.max(1, Math.floor(coords.length / 7));
  for (let i = 0; i < coords.length; i += labelStep) {
    const label = xLabels[i % xLabels.length];
    ctx.fillText(label, coords[i].x - 12, height - 8);
  }
}

// ==========================================================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadBackendData();
  renderCategories();
  drawCashflowChart('6M');
  initVoiceRecognition();

  // Window resize re-draws chart
  window.addEventListener('resize', () => {
    drawCashflowChart(appState.activePeriod);
  });

  // Open Voice Modal Buttons
  document.getElementById('topbar-voice-btn')?.addEventListener('click', openVoiceModal);
  document.getElementById('sidebar-voice-btn')?.addEventListener('click', openVoiceModal);
  document.getElementById('close-voice-modal-btn')?.addEventListener('click', closeVoiceModal);
  document.getElementById('cancel-voice-btn')?.addEventListener('click', closeVoiceModal);

  // Manual Transaction Modal
  document.getElementById('open-add-transaction-btn')?.addEventListener('click', openManualModal);
  document.getElementById('close-manual-modal-btn')?.addEventListener('click', closeManualModal);
  document.getElementById('cancel-manual-btn')?.addEventListener('click', closeManualModal);

  const addAccountModal = document.getElementById('add-account-modal');
  const addAccountForm = document.getElementById('add-account-form');
  const closeAddAccountModal = () => {
    addAccountModal?.classList.remove('open');
    addAccountModal?.setAttribute('aria-hidden', 'true');
  };
  document.getElementById('add-wallet-trigger-btn')?.addEventListener('click', () => {
    addAccountForm?.reset();
    document.getElementById('new-account-balance').value = '0';
    document.getElementById('add-account-error').textContent = '';
    addAccountModal?.classList.add('open');
    addAccountModal?.setAttribute('aria-hidden', 'false');
    document.getElementById('new-account-name')?.focus();
  });
  ['close-add-account-modal-btn', 'cancel-add-account-btn'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', closeAddAccountModal)
  );
  addAccountForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const submitButton = document.getElementById('save-new-account-btn');
    const errorMessage = document.getElementById('add-account-error');
    submitButton.disabled = true;
    errorMessage.textContent = '';
    try {
      const accountData = {
        name: document.getElementById('new-account-name').value,
        type: document.getElementById('new-account-type').value,
        scope: document.getElementById('new-account-scope').value,
        balance: Number(document.getElementById('new-account-balance').value)
      };
      let account;
      if (appState.storageMode === 'local') {
        account = createLocalAccount(accountData);
      } else {
        try {
          account = await requestApi('/api/accounts', {
            method: 'POST',
            body: JSON.stringify(accountData)
          });
          appState.accounts.push(account);
        } catch (error) {
          if (!shouldUseLocalStorage(error)) throw error;
          switchToLocalStorage();
          account = createLocalAccount(accountData);
        }
      }
      if (account.scope === 'shared') {
        appState.activeScope = 'all';
      } else {
        appState.activeScope = account.scope;
      }
      document.querySelectorAll('#scope-switcher [data-scope]').forEach(button =>
        button.classList.toggle('active', button.dataset.scope === appState.activeScope)
      );
      renderTotalBalance();
      renderWallets();
      closeAddAccountModal();
      addAccountForm.reset();
      showToast(`Akun ${account.name} berhasil ditambahkan.`);
    } catch (error) {
      console.error('Gagal menambahkan akun ke backend.', error);
      errorMessage.textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });

  const appLayout = document.querySelector('.app-layout');
  const sidebarToggle = document.getElementById('sidebar-toggle-btn');
  sidebarToggle?.addEventListener('click', () => {
    const hidden = appLayout.classList.toggle('sidebar-hidden');
    const label = hidden ? 'Tampilkan menu samping' : 'Sembunyikan menu samping';
    sidebarToggle.setAttribute('aria-expanded', String(!hidden));
    sidebarToggle.setAttribute('aria-label', label);
    sidebarToggle.title = label;
    requestAnimationFrame(() => drawCashflowChart(appState.activePeriod));
  });

  // Manual Form Submit
  const manualForm = document.getElementById('manual-tx-form');
  manualForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saved = await addTransaction({
      desc: document.getElementById('form-desc').value,
      amount: Number(document.getElementById('form-amount').value),
      accountId: document.getElementById('form-wallet').value,
      category: document.getElementById('form-category').value,
      type: document.querySelector('input[name="tx-type"]:checked').value,
      scope: document.getElementById('form-scope').value,
      date: document.getElementById('form-date').value,
      method: 'manual'
    });

    if (saved) {
      manualForm.reset();
      closeManualModal();
    }
  });

  ['tx-type', 'review-type'].forEach(name => {
    document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
      input.addEventListener('change', () => updateTypeToggle(name));
    });
  });

  const reviewForm = document.getElementById('ai-review-form');
  reviewForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const saved = await addTransaction({
      desc: document.getElementById('review-desc').value,
      amount: Number(document.getElementById('review-amount').value),
      accountId: document.getElementById('review-wallet').value,
      category: document.getElementById('review-category').value,
      type: document.querySelector('input[name="review-type"]:checked').value,
      scope: document.getElementById('review-scope').value,
      date: document.getElementById('review-date').value,
      method: appState.pendingReviewTx?.method || 'text'
    });
    if (saved) closeReviewModal();
  });
  document.getElementById('close-review-modal-btn')?.addEventListener('click', closeReviewModal);
  document.getElementById('cancel-review-btn')?.addEventListener('click', closeReviewModal);

  document.getElementById('review-scope')?.addEventListener('change', event => {
    const preferredAccount = appState.accounts.find(account => account.scope === event.target.value);
    if (preferredAccount) document.getElementById('review-wallet').value = preferredAccount.id;
  });
  document.getElementById('review-wallet')?.addEventListener('change', event => {
    const account = appState.accounts.find(item => item.id === event.target.value);
    if (account && account.scope !== 'shared') document.getElementById('review-scope').value = account.scope;
  });
  document.getElementById('form-scope')?.addEventListener('change', event => {
    const preferredAccount = appState.accounts.find(account => account.scope === event.target.value);
    if (preferredAccount) document.getElementById('form-wallet').value = preferredAccount.id;
  });
  document.getElementById('form-wallet')?.addEventListener('change', event => {
    const account = appState.accounts.find(item => item.id === event.target.value);
    if (account && account.scope !== 'shared') document.getElementById('form-scope').value = account.scope;
  });

  // AI command is parsed locally and must be reviewed before saving.
  const aiInput = document.getElementById('ai-command-input');
  const aiSubmitBtn = document.getElementById('topbar-submit-btn');

  function handleAiInputSubmit() {
    const val = aiInput?.value.trim();
    if (!val) return;

    const parsed = parseFinanceSpeech(val);
    openReviewModal(parsed, val, 'text');
    aiInput.value = '';
  }

  aiSubmitBtn?.addEventListener('click', handleAiInputSubmit);
  aiInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleAiInputSubmit();
    }
  });

  document.querySelectorAll('#scope-switcher [data-scope]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('#scope-switcher [data-scope]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      appState.activeScope = button.dataset.scope;
      renderTotalBalance();
      renderWallets();
      renderTransactions(appState.activeFilter);
    });
  });

  // Filter Transactions Tabs
  const filterTabs = document.querySelectorAll('.filter-tab[data-filter]');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');
      appState.activeFilter = filter;
      renderTransactions(filter);
    });
  });

  // Chart Timeframe Pills
  const timePills = document.querySelectorAll('.time-pill');
  timePills.forEach(pill => {
    pill.addEventListener('click', () => {
      timePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const period = pill.getAttribute('data-period');
      appState.activePeriod = period;
      drawCashflowChart(period);
    });
  });

  // Topbar Pill navigation active toggles
  const topbarPills = document.querySelectorAll('.topbar-pills .pill-btn');
  topbarPills.forEach(pill => {
    pill.addEventListener('click', () => {
      topbarPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const view = pill.dataset.view;
      document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
      document.getElementById(`view-${view}-section`)?.classList.add('active');
      document.querySelectorAll('.nav-item[data-view]').forEach(item =>
        item.classList.toggle('active', item.dataset.view === view)
      );
    });
  });

  document.querySelectorAll('.sidebar-nav .nav-item[data-view]').forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      document.querySelector(`.topbar-pills [data-view="${item.dataset.view}"]`)?.click();
    });
  });

  const ocrModal = document.getElementById('ocr-modal');
  const openOcrModal = () => ocrModal?.classList.add('open');
  ['topbar-ocr-btn', 'sidebar-ocr-btn'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', openOcrModal)
  );
  ['close-ocr-modal-btn', 'cancel-ocr-btn'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', () => ocrModal?.classList.remove('open'))
  );
  document.getElementById('trigger-file-select-btn')?.addEventListener('click', () =>
    document.getElementById('ocr-file-input')?.click()
  );
  document.querySelectorAll('.preset-btn[data-preset]').forEach(button => {
    button.addEventListener('click', () => {
      const presets = {
        business: { desc: 'Contoh simulasi: Bahan baku toko', amount: 480000, accountId: 'mandiri', scope: 'business', category: 'Operasional Bisnis', type: 'expense' },
        supermarket: { desc: 'Contoh simulasi: Belanja supermarket keluarga', amount: 295000, accountId: 'bca', scope: 'personal', category: 'Belanja & Lifestyle', type: 'expense' },
        cafe: { desc: 'Contoh simulasi: Kafe dan klien', amount: 125000, accountId: 'mandiri', scope: 'business', category: 'Operasional Bisnis', type: 'expense' }
      };
      const parsed = presets[button.dataset.preset];
      if (parsed) {
        ocrModal?.classList.remove('open');
        openReviewModal(parsed, `${parsed.desc} · Data demonstrasi, bukan hasil OCR`, 'ocr');
      }
    });
  });
  document.getElementById('ocr-file-input')?.addEventListener('change', event => {
    if (event.target.files?.length) {
      showToast('OCR gambar belum tersedia. Gunakan contoh simulasi atau catat transaksi manual.', false);
      event.target.value = '';
    }
  });

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target !== modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      if (modal.id === 'voice-modal') closeVoiceModal();
      if (modal.id === 'ai-review-modal') closeReviewModal();
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(modal => modal.classList.remove('open'));
      document.querySelectorAll('.modal-backdrop').forEach(modal => modal.setAttribute('aria-hidden', 'true'));
      closeVoiceModal();
      closeReviewModal();
    }
  });
});
