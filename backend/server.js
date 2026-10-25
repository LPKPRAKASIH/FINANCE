const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const FRONTEND_DIR = path.resolve(__dirname, '..', 'frontend');
const STORE_PATH = path.resolve(process.env.FINANCE_STORE_PATH || path.join(__dirname, 'data', 'store.json'));
const ACCOUNT_TYPES = new Set(['BANK', 'E_WALLET', 'INVESTMENT', 'CASH']);
const SCOPES = new Set(['personal', 'business', 'shared']);
const TRANSACTION_TYPES = new Set(['income', 'expense']);
const INPUT_METHODS = new Set(['manual', 'text', 'voice', 'ocr']);

let store;

try {
  store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  if (!Array.isArray(store.accounts) || !Array.isArray(store.transactions)) {
    throw new Error('store.json harus berisi daftar accounts dan transactions.');
  }
} catch (error) {
  console.error(`Gagal membaca data backend dari ${STORE_PATH}.`, error);
  process.exit(1);
}

app.use((request, response, next) => {
  const origin = request.get('origin');
  if (origin) {
    let parsedOrigin;
    try {
      parsedOrigin = new URL(origin);
    } catch (error) {
      return response.status(403).json({ error: 'Origin request tidak valid.' });
    }

    const isLocalDevelopmentOrigin = ['localhost', '127.0.0.1'].includes(parsedOrigin.hostname);
    const isSameOrigin = origin === `${request.protocol}://${request.get('host')}`;
    if (!isLocalDevelopmentOrigin && !isSameOrigin) {
      return response.status(403).json({ error: 'Origin ini tidak diizinkan mengakses API.' });
    }

    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (request.method === 'OPTIONS') return response.sendStatus(204);
  return next();
});

app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/accounts', (request, response) => {
  response.json(store.accounts);
});

app.post('/api/accounts', (request, response) => {
  const { name, type, balance, scope } = request.body || {};
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 60
    || !ACCOUNT_TYPES.has(type)
    || typeof balance !== 'number' || !Number.isFinite(balance) || balance < 0
    || !SCOPES.has(scope)) {
    return response.status(400).json({ error: 'Nama, jenis akun, saldo awal, atau peruntukan akun tidak valid.' });
  }

  const account = {
    id: `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'account'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    userId: 'demo-user',
    name: name.trim(),
    type,
    balance,
    scope,
    createdAt: new Date().toISOString(),
    rate: '+0.0%',
    isPos: true
  };
  const nextStore = { ...store, accounts: [...store.accounts, account] };

  try {
    const temporaryPath = `${STORE_PATH}.${process.pid}.tmp`;
    fs.writeFileSync(temporaryPath, `${JSON.stringify(nextStore, null, 2)}\n`, 'utf8');
    fs.renameSync(temporaryPath, STORE_PATH);
    store = nextStore;
  } catch (error) {
    console.error('Gagal menyimpan akun baru ke backend.', error);
    return response.status(500).json({ error: 'Akun gagal disimpan. Data sebelumnya tetap dipertahankan.' });
  }

  return response.status(201).json(account);
});

app.get('/api/transactions', (request, response) => {
  response.json(store.transactions);
});

app.post('/api/transactions', (request, response) => {
  const { desc, category, accountId, amount, type, scope, method, date } = request.body || {};
  const account = store.accounts.find(item => item.id === accountId);
  const parsedDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00Z`)
    : null;
  const dateIsValid = parsedDate && !Number.isNaN(parsedDate.getTime())
    && parsedDate.toISOString().slice(0, 10) === date;

  if (typeof desc !== 'string' || !desc.trim()
    || typeof category !== 'string' || !category.trim()
    || !Number.isFinite(Number(amount)) || Number(amount) <= 0
    || !account
    || !TRANSACTION_TYPES.has(type)
    || !SCOPES.has(scope) || scope === 'shared'
    || !INPUT_METHODS.has(method)
    || !dateIsValid) {
    return response.status(400).json({ error: 'Data transaksi tidak valid. Periksa deskripsi, kategori, nominal, rekening, entitas, metode input, dan tanggal.' });
  }
  if (!ACCOUNT_TYPES.has(account.type)) {
    return response.status(400).json({ error: 'Tipe rekening tidak valid.' });
  }
  if (account.scope !== 'shared' && account.scope !== scope) {
    return response.status(400).json({ error: 'Entitas transaksi tidak sesuai dengan peruntukan rekening.' });
  }

  const numericAmount = Number(amount);
  const transaction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: 'demo-user',
    desc: desc.trim(),
    category: category.trim(),
    accountId: account.id,
    amount: numericAmount,
    type,
    scope,
    method,
    date,
    createdAt: new Date().toISOString()
  };
  const nextStore = {
    accounts: store.accounts.map(item => item.id === account.id
      ? { ...item, balance: item.balance + (type === 'income' ? numericAmount : -numericAmount) }
      : item),
    transactions: [transaction, ...store.transactions]
  };

  try {
    const temporaryPath = `${STORE_PATH}.${process.pid}.tmp`;
    fs.writeFileSync(temporaryPath, `${JSON.stringify(nextStore, null, 2)}\n`, 'utf8');
    fs.renameSync(temporaryPath, STORE_PATH);
    store = nextStore;
  } catch (error) {
    console.error('Gagal menyimpan perubahan transaksi ke backend.', error);
    return response.status(500).json({ error: 'Transaksi gagal disimpan. Data sebelumnya tetap dipertahankan.' });
  }

  return response.status(201).json({ transaction, accounts: store.accounts });
});

app.use('/api', (request, response) => {
  response.status(404).json({ error: 'Endpoint API tidak ditemukan.' });
});

app.use(express.static(FRONTEND_DIR));

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({ error: 'Format JSON request tidak valid.' });
  }
  console.error('Kesalahan backend yang tidak tertangani.', error);
  return response.status(500).json({ error: 'Terjadi kesalahan pada backend.' });
});

app.listen(PORT, () => {
  console.log(`Finansial backend berjalan di http://localhost:${PORT}`);
});
