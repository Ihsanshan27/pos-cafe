# Dokumentasi Sistem: SHN COFFEE (Smart POS Cafe)

Dokumen ini berisi rangkuman teknis, arsitektur, dan rincian fitur dari sistem *Point of Sale* (POS) modern khusus *Food & Beverage* (Cafe/Coffee Shop) yang telah dikembangkan. Sistem ini dirancang secara spesifik untuk menangani skalabilitas kafe, manajemen inventaris yang presisi, serta alur kerja dapur (KDS) yang terpadu.

---

## 1. Arsitektur & Tech Stack

Sistem ini dibangun menggunakan arsitektur *Client-Server* modern berbasis Monorepo (*Frontend* dan *Backend* terpisah namun berada dalam satu *project* besar).

### Backend (API Server)
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Keamanan**: JWT Authentication, Role-based Access Control (RBAC), bcrypt (Password Hashing)

### Frontend (Client Application)
- **Framework**: React.js (Vite + TypeScript)
- **State Management**: TanStack Query (React Query)
- **Styling**: Vanilla CSS dengan variabel CSS kustom untuk dukungan *Theme/Dark Mode* masa depan.
- **Ikon & UI**: Lucide React
- **Ekspor Data**: `xlsx` (Excel) dan `jspdf` + `jspdf-autotable` (PDF)

---

## 2. Fitur Utama Sistem

Aplikasi ini dibagi menjadi beberapa modul besar yang saling terintegrasi:

### A. Point of Sale (POS) & Kasir
- **Katalog Cerdas**: Pencarian menu *real-time* dan penyaringan berdasarkan Kategori.
- **Manajemen Keranjang**: Menambah pesanan, mengurangi jumlah, dan menyisipkan catatan khusus (misal: "Less Sugar", "Extra Shot").
- **Tipe Pesanan**: Mendukung `DINE_IN` (beserta input Nomor Meja) dan `TAKEAWAY` (beserta input Nama Pelanggan).
- **Diskon & Pajak (PB1)**:
  - Diskon dapat dipilih secara dinamis (Nominal Tetap atau Persentase).
  - Pajak Pembangunan 1 (PB1) dihitung secara eksklusif dan dapat dihidupkan/dimatikan melalui Pengaturan Admin.
- **Checkout Cepat**: Mencatat metode pembayaran (`CASH`, `QRIS`, `DEBIT`, `EWALLET`).
- **Cetak Struk**: Format *receipt* termal (*monospace*) langsung dari *browser*.

### B. Kitchen Display System (KDS)
Layar antarmuka khusus untuk area dapur/barista yang tidak memerlukan kertas fisik (*paperless*).
- **Kanban Board 3-Kolom**: Tampilan KDS dibagi menjadi:
  1. **Pesanan Masuk** (Status `PENDING`)
  2. **Sedang Diproses** (Status `IN_PROGRESS`)
  3. **Selesai** (Status `DONE`)
- **Auto-Fetch**: Memuat pesanan berstatus baru secara otomatis.
- **Audio Notifikasi**: Memutar suara "*Ding!*" secara otomatis ketika ada pesanan baru masuk agar koki segera sadar.
- **Order Tracking**: Visualisasi pesanan berdasarkan tipe (Warna biru untuk Dine-In, oranye untuk Takeaway). Barista dapat memencet tombol "Proses" lalu "Selesai" untuk menggeser pesanan antar kolom.

### C. Manajemen Inventaris Lanjutan (Advanced Inventory)
- **Bahan Baku (Ingredients)**: Pencatatan stok bahan baku dasar beserta satuan ukurnya (misal: gram, ml, pcs).
- **Komposisi Resep (Bill of Materials)**: Setiap Menu dapat dikaitkan dengan satu atau lebih Bahan Baku (contoh: 1 Kopi Susu = 15gr Kopi + 120ml Susu).
- **Pengurangan Stok Otomatis**: Setiap kali transaksi berhasil (Checkout), stok bahan baku akan langsung dipotong sesuai komposisi resep menu yang terjual.
- **Inventory Logging**: Semua pergerakan stok kini dicatat secara mendetail di menu `Inventory Logs`. Pencatatan meliputi stok masuk (`IN`), keluar (`OUT`), penjualan (`SALE`), pembatalan/retur (`VOID`), hingga penyesuaian opname (`ADJUSTMENT`).
- **Void Transaction**: Jika transaksi dibatalkan (di-*void*), sistem akan otomatis mengembalikan (*restock*) bahan baku ke gudang dan mencatat log tipe `VOID`.

### D. Laporan Pendapatan (Reports & Analytics)
- **Dashboard Analitik**: Melihat total pendapatan, jumlah transaksi, ringkasan kas masuk/keluar, dan menu paling laris.
- **Ekspor Excel & PDF**: Seluruh riwayat pesanan (termasuk pajak dan diskon) serta total kuantitas menu yang terjual dapat diekspor menjadi laporan `.xlsx` atau `.pdf` berdasarkan filter rentang tanggal.

### E. Manajemen Keuangan & Operasional
- **Sistem Shift Kasir**: Kasir harus membuka *Shift* (memasukkan uang modal/laci) sebelum bisa mulai berjualan.
- **Pengeluaran (Expenses)**: Pencatatan pengeluaran harian toko (misal: beli es batu, bayar token listrik).
- **Manajemen Diskon**: Pembuatan kode/nama diskon yang bisa diterapkan saat *checkout*.

### F. Pengaturan & Hak Akses (RBAC)
- **Role Terpusat**: Terdapat empat level peran dasar:
  - `OWNER`: Akses penuh ke seluruh sistem dan pengaturan toko.
  - `MANAGER`: Akses ke operasional kasir, inventaris, diskon, dan pengguna.
  - `CASHIER`: Akses ke kasir (POS), pelanggan, transaksi, dan KDS.
  - `BARISTA`: Akses eksklusif hanya untuk layar Kitchen Display System (KDS).
- **Pengaturan Toko**: Owner dapat mengganti Nama Toko, Alamat, Nomor Telepon, Status Pajak PB1, hingga menutup gerbang Registrasi akun baru.
- **Pengaturan Akun**: Setiap pengguna dapat mengganti Nama, Email, dan Password mereka secara mandiri melalui rute `/profile`.

### G. Customer Relationship Management (CRM)
- **Database Pelanggan**: Pencatatan profil pelanggan (Nama, Nomor Telepon, Email).
- **Sistem Poin (Loyalty Points)**: Pelanggan yang didaftarkan saat transaksi kasir akan mendapatkan poin reward otomatis (1 Poin per kelipatan transaksi Rp 10.000).
- **Sistem Tier**: Pelanggan dikelompokkan dalam kategori Tier (`BRONZE`, `SILVER`, `GOLD`).

---

## 3. Struktur Database (ERD Singkat)

Model utama yang digunakan dalam Prisma:
1. **User**: Menyimpan data pegawai (Email, Password Hash, Role).
2. **Shift**: Mencatat sesi buka kasir (Starting Cash, Status).
3. **Menu**: Data produk jualan (Nama, Harga, SKU, Kategori).
4. **Category**: Kategori Menu (Kopi, Teh, Makanan).
5. **Ingredient**: Bahan baku mentah (Susu, Kopi Biji) beserta total stok.
6. **MenuIngredient**: Tabel relasi (*pivot*) yang mendefinisikan resep (Menu A butuh Ingredient B sebanyak X kuantitas).
7. **InventoryLog**: Mencatat secara riwayat setiap perubahan stok pada tiap `Ingredient`.
8. **Customer**: Profil pengguna/member beserta poin *reward* loyalitasnya.
9. **Transaction**: Data keranjang *checkout* (Total Harga, Pajak, Diskon, Metode Pembayaran, terkait Pelanggan tertentu).
10. **TransactionItem**: Rincian menu yang dibeli di dalam satu transaksi.
11. **Discount**: *Voucher* atau promosi yang tersedia.
12. **Expense**: Pengeluaran operasional toko.
13. **Setting**: Key-Value untuk pengaturan global (Tax Rate, Store Name, dll).

---

## 4. Cara Menjalankan Project

## 4. Cara Menjalankan Project

Project ini saat ini dijalankan menggunakan **Docker Compose** secara penuh (*database*, *backend*, dan *frontend* berjalan di dalam *container*).

### A. Menjalankan Seluruh Aplikasi via Docker Compose

Pastikan **Docker Desktop** sudah aktif.

1. **Jalankan semua layanan (Database, Backend, Frontend)**
   ```bash
   docker compose up -d
   ```

2. **Akses Aplikasi**
   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:3000`
   - **PostgreSQL**: `localhost:5433` (Credential: `pos_user` / `pos_password`)

3. **Melihat log container**
   ```bash
   docker compose logs -f
   ```
   *(Untuk melihat log spesifik: `docker compose logs -f backend` atau `docker compose logs -f frontend`)*

4. **Menghentikan aplikasi**
   ```bash
   docker compose down
   ```

### B. Penting: Mengubah Skema Database (Prisma) di Docker

Karena aplikasi backend berjalan di dalam Docker, folder `node_modules` menggunakan *anonymous volume*. Oleh karena itu, jika Anda melakukan perubahan pada `backend/prisma/schema.prisma`, perintah `prisma generate` **wajib** dieksekusi di *dalam container*.

**Langkah-langkah jika mengubah schema.prisma:**
1. Sinkronkan skema ke database (boleh dijalankan dari lokal):
   ```bash
   cd backend
   npx prisma db push
   # atau npx prisma migrate dev --name <nama_migrasi>
   ```
2. Generate ulang Prisma Client **di dalam container backend**:
   ```bash
   docker exec pos_fnb_backend npx prisma generate
   ```
3. Restart *backend* agar kode terbaru dan Prisma Client yang baru dimuat:
   ```bash
   docker compose restart backend
   ```

## 5. Akun Default Seed

Jika database sudah di-*seed*, akun default yang tersedia adalah:

| Role | Email | Password |
|---|---|---|
| `OWNER` | `owner@shn.com` | `password123` |
| `MANAGER` | `manager@shn.com` | `password123` |
| `CASHIER` | `cashier@shn.com` | `password123` |
| `BARISTA` | `barista@shn.com` | `password123` |

Catatan:
- Akun di atas hanya tersedia jika proses seed sudah dijalankan.
- Sumber data akun default ini berasal dari file `backend/prisma/seed.ts`.
- Untuk mengisi akun default dan data awal, jalankan:
  ```bash
  cd backend
  npm run seed
  ```

---

**Catatan**: *Dokumentasi ini dibuat secara dinamis menyesuaikan fitur yang telah dirilis hingga fase penyelesaian KDS dan Pajak PB1.*
