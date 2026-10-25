# Product Requirement Document (PRD)

## Nama Produk
**Finansial — Dashboard Keuangan Pribadi & Bisnis Keluarga**

## 1. Ringkasan Produk
Finansial adalah dashboard untuk mencatat dan memantau keuangan pribadi serta arus kas bisnis keluarga dalam satu aplikasi. Pengguna dapat melihat saldo rekening, transaksi, anggaran, dan target keuangan, dengan pemisahan data berdasarkan entitas pribadi atau bisnis.

Antarmuka prototipe menggunakan Bahasa Indonesia dan tema gelap. Pencatatan transaksi dirancang mendukung formulir manual, perintah teks, suara, serta pemindaian struk. Hasil ekstraksi otomatis harus dapat ditinjau dan dikoreksi sebelum transaksi disimpan.

### Tujuan
- Menyatukan pemantauan saldo dan arus kas dari beberapa rekening.
- Memisahkan transaksi pribadi dari transaksi bisnis keluarga.
- Mempermudah pencatatan transaksi dan mengurangi kesalahan melalui verifikasi pengguna.
- Membantu pengguna mengendalikan pengeluaran dan memantau target finansial.

### Pengguna Sasaran
- Individu yang mengelola beberapa rekening, dompet digital, uang tunai, atau investasi.
- Pemilik atau pengelola bisnis keluarga yang perlu membedakan keuangan usaha dan pribadi.
- Anggota keluarga yang bertanggung jawab mengawasi anggaran dan target bersama.

## 2. Ruang Lingkup dan Navigasi

### Navigasi Utama
1. **Dashboard / Ringkasan** — saldo gabungan, rekening aktif, tren arus kas, transaksi terkini, dan ringkasan anggaran.
2. **Dompet & Arus Kas** — rincian rekening, saldo, riwayat arus kas, dan transfer antar rekening.
3. **Analisis Finansial** — metrik pemasukan/pengeluaran, rasio tabungan, distribusi kategori, dan perbandingan pribadi dengan bisnis.
4. **Anggaran & Target** — plafon pengeluaran kategori, pengingat anggaran, dan target tabungan.

### Pemilih Entitas
Pengguna dapat memilih tampilan **Semua**, **Pribadi**, atau **Bisnis**. Pilihan ini harus diterapkan secara konsisten pada saldo, transaksi, grafik, analisis, anggaran, dan rekening yang ditampilkan. Rekening dengan peruntukan bersama dapat muncul pada tampilan gabungan dan mengikuti aturan alokasi yang ditetapkan.

### Header
- Bilah input cepat untuk menulis perintah transaksi.
- Tombol untuk memulai input suara dan membuka pemindai struk.
- Akses ke profil dan tindakan cepat lain yang tersedia pada antarmuka.

## 3. Persyaratan Fungsional

### 3.1 Dashboard
- Menampilkan saldo seluruh rekening dalam lingkup entitas yang dipilih.
- Menampilkan kartu saldo per rekening/dompet aktif, termasuk nama, jenis, saldo, dan proporsi terhadap total.
- Menyajikan grafik pemasukan dan pengeluaran dengan rentang `1H` (hari), `1M` (minggu), `1B` (bulan), `6B` (enam bulan), dan `1T` (tahun).
- Menampilkan tooltip nilai dan tanggal pada grafik.
- Menyediakan riwayat transaksi yang dapat difilter menjadi **Semua**, **Pemasukan**, dan **Pengeluaran**.
- Setiap baris transaksi menampilkan deskripsi, kategori, rekening, entitas, metode input, tanggal, dan nominal bertanda positif/negatif.
- Menampilkan progres anggaran kategori dan notifikasi ketika ambang batas tercapai.
- Menyediakan tindakan untuk mencatat transaksi dan mengelola saldo rekening.

### 3.2 Dompet & Arus Kas
- Mendukung rekening bertipe `BANK`, `E_WALLET`, `INVESTMENT`, dan `CASH`.
- Pengguna dapat melihat dan memperbarui saldo rekening, tipe rekening, dan peruntukannya: pribadi, bisnis, atau bersama.
- Pengguna dapat mencatat transfer antar rekening dengan rekening sumber, rekening tujuan, dan nominal.
- Transfer internal mengurangi saldo rekening sumber dan menambah saldo rekening tujuan, tetapi tidak dihitung sebagai pemasukan atau pengeluaran maupun mengubah laba bersih.
- Perubahan saldo, daftar rekening, dan transaksi harus konsisten di seluruh tampilan.

### 3.3 Pencatatan Transaksi
Transaksi memiliki tipe pemasukan atau pengeluaran dan setidaknya menyimpan deskripsi, nominal, kategori, rekening, entitas, metode input, dan tanggal transaksi.

#### Input manual
- Form menyediakan tipe transaksi, deskripsi, nominal rupiah, entitas, rekening, kategori, dan tanggal.
- Data wajib divalidasi sebelum disimpan; nominal harus lebih besar dari nol.
- Setelah berhasil disimpan, transaksi, saldo rekening, ringkasan, dan grafik terkait diperbarui.

#### Input teks
- Perintah teks berbahasa Indonesia dapat berisi deskripsi, nominal, jenis transaksi, kategori, dan rekening.
- Sistem menampilkan hasil parsing dalam modal tinjauan yang dapat diedit.
- Transaksi hanya disimpan setelah pengguna mengonfirmasi hasilnya.
- Jika data penting tidak dapat dikenali, sistem meminta pengguna melengkapinya dan tidak mengarang nilai nominal.

#### Input suara
- Pengguna dapat memulai dan menghentikan perekaman dari tombol suara.
- Transkripsi Bahasa Indonesia ditampilkan kepada pengguna.
- Sistem mem-parsing transkripsi dan menampilkan tipe, nominal, kategori, rekening, deskripsi, dan entitas untuk ditinjau.
- Pengguna harus dapat mengedit hasil sebelum menyimpan.
- Jika browser tidak mendukung pengenalan suara atau izin mikrofon ditolak, aplikasi menjelaskan kendala dan menawarkan input teks/manual; simulasi hanya boleh digunakan dalam mode demo yang dinyatakan dengan jelas.

#### Pemindaian struk (OCR)
- Pengguna dapat memilih atau mengunggah gambar struk.
- Sistem mengekstrak teks/nominal yang tersedia, mem-parsing informasi transaksi, lalu menampilkan hasil pada modal tinjauan yang sama.
- Pengguna dapat mengoreksi hasil sebelum menyimpan.
- Contoh struk untuk demonstrasi harus diberi label sebagai data simulasi, bukan hasil OCR sungguhan.

### 3.4 Analisis Finansial
- Menampilkan total pemasukan dan pengeluaran untuk periode yang dipilih.
- Menampilkan rasio tabungan bersih dengan definisi dan periode perhitungan yang konsisten.
- Menampilkan kontribusi arus kas bisnis.
- Menampilkan distribusi pengeluaran per kategori.
- Membandingkan jumlah atau proporsi arus kas pribadi dan bisnis sesuai filter entitas.
- Nilai dan persentase harus dihitung dari data transaksi aktual, bukan angka contoh statis.

### 3.5 Anggaran dan Target
- Pengguna dapat membuat atau memperbarui plafon anggaran per kategori dan periode.
- Pengguna dapat mengatur ambang notifikasi (default 80%; opsi 90% dan 100% tersedia pada UI).
- Sistem menghitung pemakaian dari transaksi pengeluaran dalam periode dan entitas terkait.
- Notifikasi diberikan saat ambang yang ditentukan tercapai dan saat anggaran mencapai atau melewati 100%.
- Pengguna dapat membuat target finansial dengan nama, nominal target, progres dana, dan entitas/peruntukan.
- Tampilan menunjukkan jumlah terkumpul, sisa target, dan persentase progres.

## 4. Model Data

Model konseptual berikut menggambarkan kebutuhan produk dan tidak mengharuskan penggunaan backend tertentu.

### `users`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID / String | Kunci utama |
| `name` | String | Nama pengguna |
| `email` | String | Email pengguna |
| `created_at` | Timestamp | Waktu pembuatan |

### `accounts`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID / String | Kunci utama |
| `user_id` | UUID / String | Pemilik rekening |
| `name` | String | Nama rekening/dompet |
| `type` | Enum | `BANK`, `E_WALLET`, `INVESTMENT`, `CASH` |
| `balance` | Decimal | Saldo terkini |
| `scope` | Enum | `PERSONAL`, `BUSINESS`, `SHARED` |
| `created_at` | Timestamp | Waktu pembuatan |

### `categories`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID / String | Kunci utama |
| `name` | String | Nama kategori |
| `icon` | String | Ikon opsional |
| `type` | Enum | `INCOME`, `EXPENSE`, atau kategori yang relevan untuk keduanya |

### `transactions`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID / String | Kunci utama |
| `user_id` | UUID / String | Pemilik transaksi |
| `account_id` | UUID / String | Rekening terkait |
| `category_id` | UUID / String | Kategori transaksi |
| `description` | String | Deskripsi transaksi |
| `amount` | Decimal | Nominal positif; arah ditentukan oleh `type` |
| `type` | Enum | `INCOME` atau `EXPENSE` |
| `scope` | Enum | `PERSONAL` atau `BUSINESS` |
| `input_method` | Enum | `VOICE`, `TEXT`, `MANUAL`, `OCR` |
| `transaction_date` | Date / Timestamp | Tanggal transaksi |
| `created_at` | Timestamp | Waktu pencatatan |

### `transfers`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID / String | Kunci utama |
| `from_account_id` | UUID / String | Rekening sumber |
| `to_account_id` | UUID / String | Rekening tujuan |
| `amount` | Decimal | Nominal transfer positif |
| `transfer_date` | Date / Timestamp | Tanggal transfer |
| `created_at` | Timestamp | Waktu pencatatan |

### `budgets`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID / String | Kunci utama |
| `user_id` | UUID / String | Pemilik anggaran |
| `category_id` | UUID / String | Kategori pengeluaran |
| `scope` | Enum | `PERSONAL` atau `BUSINESS` |
| `limit_amount` | Decimal | Plafon anggaran |
| `period` | Enum | `WEEKLY`, `MONTHLY` |
| `alert_threshold` | Decimal | Rasio notifikasi, misalnya `0.8` |

### `financial_goals`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID / String | Kunci utama |
| `user_id` | UUID / String | Pemilik target |
| `name` | String | Nama target |
| `target_amount` | Decimal | Nominal yang ingin dicapai |
| `saved_amount` | Decimal | Dana yang sudah terkumpul |
| `scope` | Enum | `PERSONAL`, `BUSINESS`, atau `SHARED` |
| `created_at` | Timestamp | Waktu pembuatan |

## 5. Persyaratan Non-Fungsional dan Teknis
- Antarmuka responsif, berbahasa Indonesia, dan konsisten dengan tema gelap yang digunakan.
- Nilai rupiah diformat sesuai konvensi lokal Indonesia.
- Komponen input dapat digunakan dengan keyboard dan memiliki label yang jelas.
- Kesalahan validasi, penyimpanan, dan izin/perangkat input harus disampaikan dengan jelas kepada pengguna.
- Perhitungan saldo, arus kas, anggaran, dan analisis harus dapat ditelusuri ke data sumbernya.
- Prototipe frontend saat ini menggunakan HTML, CSS, JavaScript, Canvas, dan `localStorage`; belum ada backend atau API persisten.
- Penyimpanan browser hanya sesuai untuk prototipe satu pengguna. Sinkronisasi lintas perangkat, autentikasi, dan API merupakan keputusan/fase pengembangan lanjutan.
- Parser saat ini merupakan heuristik lokal, bukan layanan AI/LLM. Integrasi layanan eksternal memerlukan keputusan privasi dan persetujuan terpisah.

## 6. Kriteria Penerimaan Utama
1. Pengguna dapat melihat saldo, transaksi, anggaran, dan analisis untuk pilihan entitas yang sama tanpa data pribadi dan bisnis tercampur.
2. Pencatatan manual menyimpan semua nilai formulir yang dipilih, termasuk tanggal dan entitas.
3. Input teks, suara, dan OCR tidak menyimpan hasil parsing sebelum pengguna meninjau dan mengonfirmasi.
4. Koreksi pengguna pada hasil parsing menjadi nilai yang disimpan.
5. Pemasukan menambah saldo rekening dan pengeluaran menguranginya sesuai nominal.
6. Transfer memperbarui dua saldo rekening tanpa mengubah total aset gabungan atau metrik pemasukan/pengeluaran.
7. Pemakaian anggaran dihitung dari pengeluaran pada kategori, periode, dan entitas yang sesuai; notifikasi mengikuti ambang yang dikonfigurasi.
8. Nilai KPI, grafik, distribusi kategori, dan progres target berasal dari data yang disimpan dan diperbarui setelah perubahan.
9. Kegagalan dukungan browser, izin mikrofon, parsing, atau penyimpanan tidak menghasilkan transaksi sukses palsu dan menampilkan pesan yang dapat ditindaklanjuti.

## 7. Baseline Prototipe dan Kesenjangan terhadap Persyaratan
Status berikut merangkum implementasi frontend saat PRD ini diselaraskan. Keberadaan komponen visual tidak berarti alur tersebut sudah berfungsi.

| Area | Kondisi pada prototipe | Kesenjangan utama |
|---|---|---|
| Dashboard dan rekening | Kartu saldo, daftar rekening, grafik Canvas, serta daftar transaksi memakai state akun/transaksi demo dan persistensi `localStorage`; saldo dan daftar mengikuti filter entitas. | Grafik dan beberapa ringkasan masih berupa contoh; analisis, anggaran, transfer, dan pengelolaan rekening belum seluruhnya terhubung ke state. |
| Input teks | Parser heuristik membuka modal tinjauan yang dapat diedit dan baru menyimpan setelah konfirmasi; nominal yang tidak terbaca dibiarkan kosong. | Akurasi kategori, rekening, dan entitas masih bergantung pada heuristik lokal. |
| Input suara | Web Speech API digunakan bila tersedia; transkripsi masuk ke modal tinjauan/edit sebelum disimpan. | Browser tanpa dukungan atau izin mikrofon yang sesuai diarahkan ke input teks/manual; pengenalan suara bergantung dukungan browser. |
| Input manual | Form menyimpan tipe, deskripsi, nominal, entitas, rekening, kategori, tanggal, serta metode input manual dan memperbarui saldo. | Belum ada dukungan backend atau sinkronisasi antarperangkat. |
| Pemilih entitas | Kontrol Semua/Pribadi/Bisnis memfilter saldo akun, kartu rekening, dan daftar transaksi. | Filter belum diterapkan konsisten pada grafik, analisis, anggaran, dan seluruh ringkasan. |
| Transfer rekening | Form transfer tersedia pada tampilan Dompet & Arus Kas. | Belum ada alur penyimpanan dan pembaruan saldo yang berfungsi. |
| Anggaran dan target | Komponen ringkasan, target contoh, dan modal pengaturan anggaran tersedia. | Pengaturan, perhitungan, persistensi, dan notifikasi belum terhubung ke data transaksi. |
| Analisis finansial | Panel KPI, distribusi kategori, dan perbandingan entitas tersedia. | Nilai belum dihitung konsisten dari data transaksi yang tersimpan. |
| OCR | Contoh struk simulasi yang diberi label mengisi modal tinjauan/edit dan hanya disimpan setelah konfirmasi. | Pemrosesan OCR/parsing gambar unggahan belum diimplementasikan; unggahan menampilkan pemberitahuan batasan. |
| Backend | Tidak tersedia pada prototipe. | Autentikasi, API, sinkronisasi, dan penyimpanan server belum termasuk implementasi saat ini. |

## 8. Batasan dan Hal di Luar Cakupan Prototipe
- Koneksi langsung ke rekening bank atau penyedia e-wallet.
- Akuntansi bisnis penuh, pajak, faktur, dan rekonsiliasi bank.
- Kolaborasi multi-pengguna dengan hak akses dan persetujuan keluarga.
- Integrasi AI/LLM atau OCR cloud sebelum kebijakan privasi, biaya, dan persetujuan pengguna ditetapkan.
