# Finansial Dashboard

Aplikasi dashboard keuangan dengan frontend statis (HTML/CSS/JavaScript) dan backend API Node.js/Express.

## Struktur folder

```text
FINANCE/
├── frontend/
│   ├── index.html       # Struktur dashboard dan modal
│   ├── styles.css       # Tampilan dan responsive layout
│   └── app.js           # Interaksi UI, grafik, parsing input teks/suara
├── backend/
│   ├── server.js         # API Express dan penyajian frontend
│   └── data/
│       └── store.json   # Data akun/transaksi demo yang persisten
├── package.json
└── README.md
```

## Menjalankan aplikasi tanpa PowerShell (Go Live)

1. Buka `frontend/index.html` di VS Code.
2. Klik kanan lalu pilih **Open with Live Server** (atau tekan tombol **Go Live**).
3. Jika backend tidak aktif, dashboard otomatis menggunakan data demo dan menyimpan akun/transaksi di browser yang sama (`localStorage`).

Mode Go Live tidak memerlukan `npm install` maupun `npm start`. Data lokal browser tidak dibagikan ke perangkat/browser lain.

## Menjalankan dengan backend Express (opsional)

Jika Node.js/npm tersedia, jalankan dari folder proyek:

```powershell
npm install
npm start
```

Buka `http://localhost:3001` untuk menggunakan penyimpanan backend di `backend/data/store.json`.

Go Live juga otomatis menggunakan backend saat server tersebut aktif; jika tidak aktif, aplikasi beralih ke penyimpanan browser.

## Pemisahan tanggung jawab

### Frontend

- Menampilkan dashboard dan mengelola interaksi/modal.
- Mem-parsing input teks dan transkripsi suara di browser untuk mengisi modal review.
- Mengambil data akun dan transaksi dari backend melalui `GET /api/accounts` dan `GET /api/transactions`.
- Beralih ke mock data dan `localStorage` browser jika backend tidak aktif.
- Menambahkan akun dari halaman Dompet melalui form nama penyedia, jenis, peruntukan, dan saldo awal.
- Menyembunyikan atau membuka sidebar dari tombol menu di header agar ruang dashboard lebih luas.
- Mengirim transaksi yang telah dikonfirmasi melalui `POST /api/transactions`.

### Backend

- Menyajikan frontend dari folder `frontend/`.
- Menyediakan API akun/transaksi pada origin yang sama.
- Menyimpan akun baru melalui `POST /api/accounts`.
- Memvalidasi transaksi, memperbarui saldo akun, dan menyimpan perubahan di `backend/data/store.json`.
- Memulai data demo dari `backend/data/store.json`.

Data pada mode Go Live dan data backend adalah dua penyimpanan terpisah; menambahkan akun/transaksi pada satu mode tidak otomatis menyalinnya ke mode lain.

Endpoint health check: `GET /api/health`.

Penyimpanan JSON ini adalah backend demo lokal untuk prototipe, bukan database multi-user/produksi. Belum ada autentikasi, otorisasi pengguna, pengubahan/penghapusan akun, transfer antar rekening, maupun OCR gambar.
