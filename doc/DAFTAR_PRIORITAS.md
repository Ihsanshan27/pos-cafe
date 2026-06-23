# Daftar Prioritas Pengembangan & Perbaikan POS F&B SHN Coffee

Dokumen ini berisi daftar fitur dan perbaikan yang perlu ditambahkan atau ditingkatkan pada sistem, diurutkan dari yang paling prioritas (krusial untuk operasional nyata/nilai jual) hingga pelengkap.

---

## 1. Ringkasan Skala Prioritas

| No | Fitur / Perbaikan | Prioritas | Estimasi Kompleksitas | Komponen Utama |
|---|---|---|---|---|
| 1 | **Multi-Outlet: Stok per Cabang (Inventory)** | ⭐⭐⭐⭐⭐ *Sangat Tinggi* | Tinggi | Database, Backend API, Stock Logic |
| 2 | **Multi-Outlet: Harga & Aktif Menu per Cabang** | ⭐⭐⭐⭐⭐ *Sangat Tinggi* | Menengah | Database, POS Page, Backend API |
| 3 | **Rekonsiliasi Kas & Tutup Shift Kasir Lengkap** | ⭐⭐⭐⭐ *Tinggi* | Menengah | Backend Shift, POS Cart Closing UI |
| 4 | **KDS Real-Time via WebSockets** | ⭐⭐⭐⭐ *Tinggi* | Menengah | NestJS Gateway, Frontend KDS |
| 5 | **QR Ordering Lanjutan & Online Payment Gateway** | ⭐⭐⭐⭐ *Tinggi* | Tinggi | Midtrans/Xendit, Public Order Route |
| 6 | **Audit Trail / Log Aktivitas Admin** | ⭐⭐⭐ *Menengah* | Rendah-Menengah | Backend Middleware, Database, Admin Page |
| 7 | **Pengamanan JWT via Cookie HttpOnly** | ⭐⭐⭐ *Menengah* | Menengah | Backend Auth Cookie, Axios Client |
| 8 | **Offline Mode (IndexedDB Sync)** | ⭐⭐ *Rendah-Menengah* | Sangat Tinggi | Service Worker, Dexie.js Frontend |
| 9 | **Integrasi Printer Thermal Thermal (ESC/POS)** | ⭐ *Rendah* | Menengah | WebBluetooth/WebUSB, Print Service |

---

## 2. Detail Detail Prioritas & Panduan Implementasi Teknis

### 1. Multi-Outlet: Desentralisasi Stok Bahan Baku (Sangat Tinggi)
* **Mengapa Krusial**: Saat ini stok di `Ingredient.stockQuantity` bersifat global. Jika Outlet A dan Outlet B memakai bahan yang sama, stoknya bercampur. Operasional kafe nyata mewajibkan stok bahan terpisah di tiap cabang.
* **Langkah Teknis**:
  * Pecah stok dari tabel `Ingredient` ke tabel baru, misalnya `OutletIngredient` (terkait `outletId` dan `ingredientId`).
  * Perbarui logika pengurangan stok otomatis pasca transaksi di [transactions.service.ts](file:///e:/KULIAH%20S1%20TEKNIK%20INFORMATIKA/KULIAH/SKRIPSI/pos-fnb/backend/src/transactions/transactions.service.ts).
  * Perbarui histori log stok di [inventory-logs](file:///e:/KULIAH%20S1%20TEKNIK%20INFORMATIKA/KULIAH/SKRIPSI/pos-fnb/backend/src/inventory-logs) agar melacak stok per outlet.
* **Status**: 🟢 Selesai (2026-06-23)

### 2. Multi-Outlet: Ketersediaan & Harga Menu per Cabang (Sangat Tinggi)
* **Mengapa Krusial**: Saat ini menu (`Menu.sellingPrice`) memiliki harga yang sama di semua outlet. Selain itu, jika salah satu bahan habis di Outlet A, menu tersebut harusnya dinonaktifkan di Outlet A saja tanpa mempengaruhi Outlet B.
* **Langkah Teknis**:
  * Buat tabel `OutletMenu` untuk meng-override harga (`sellingPrice`) dan status aktif (`isActive`) menu per outlet.
  * Sesuaikan kueri pemanggilan menu di kasir POS agar membaca setting dari `OutletMenu` cabang tersebut.
* **Status**: 🟢 Selesai (2026-06-23)

### 3. Rekonsiliasi Kasir & Tutup Shift Lengkap (Tinggi)
* **Mengapa Krusial**: Saat ini tutup shift kasir di [shifts.service.ts](file:///e:/KULIAH%20S1%20TEKNIK%20INFORMATIKA/KULIAH/SKRIPSI/pos-fnb/backend/src/shifts/shifts.service.ts) hanya menerima angka fisik dari kasir tanpa menghitung jumlah uang yang seharusnya ada (Expected Cash). Ini memudahkan manipulasi kas tanpa ketahuan owner.
* **Langkah Teknis**:
  * Hitung total transaksi kas (`CASH`) yang masuk selama shift berjalan, tambahkan modal awal (`startingCash`), kurangi pengeluaran kas (`Expense`), dan hitung selisihnya (*variance*).
  * Simpan field `expectedEndingCash`, `cashVariance`, dan `closingNotes` ke tabel `Shift`.
* **Status**: 🟢 Selesai (2026-06-23)
  * Mengintegrasikan penghitungan otomatis untuk total kas masuk, total non-kas, total pengeluaran, ekspektasi kas akhir, selisih kas (*variance*), dan jumlah transaksi.
  * Menambahkan dialog Tutup Shift di kasir untuk rekonsiliasi kas aktual dan input catatan shift.

### 4. KDS Real-Time Menggunakan WebSockets (Tinggi)
* **Mengapa Krusial**: Polling berkala di [KitchenPage.tsx](file:///e:/KULIAH%20S1%20TEKNIK%20INFORMATIKA/KULIAH/SKRIPSI/pos-fnb/frontend/src/pages/KitchenPage.tsx) (misal setiap 3-5 detik) membebani server dan database secara tidak perlu serta membuat pesanan dari kasir/QR meja telat masuk ke layar dapur.
* **Langkah Teknis**:
  * Implementasikan NestJS WebSocket Gateway (Socket.io) di backend.
  * Emit event `order_created` saat checkout berhasil, dan update status `kitchenStatus` secara real-time di browser barista tanpa refresh query berulang.
* **Status**: 🟢 Selesai (2026-06-23)
  * Menambahkan NestJS WebSocket Gateway (`KdsGateway`) menggunakan Socket.io.
  * Memperbarui halaman Kitchen/Dapur agar terhubung via WebSocket, menerima update real-time pesanan baru/perubahan status tanpa polling, dengan status koneksi live/offline dan fallback polling otomatis.

### 5. QR Table Ordering Lanjutan & Payment Gateway (Tinggi)
* **Mengapa Krusial**: Modul scan QR meja publik sudah ada secara basic, namun belum ada QR generator otomatis, status realtime pelacakan makanan untuk customer, serta pembayaran online (QRIS/E-Wallet langsung di meja).
* **Langkah Teknis**:
  * Pasang package QR generator untuk memudahkan admin mencetak kode QR per meja.
  * Integrasikan API Payment Gateway (misal Midtrans/Xendit) untuk memproses pembayaran non-tunai di halaman order publik.
* **Status**: 🔴 Belum Dimulai

* **Status**: 🟢 Selesai (2026-06-23)
  * Menambahkan model `AuditLog` di Prisma.
  * Mencatat otomatis aktivitas update harga menu, void transaksi, restore backup, dan reset data beserta nama user, email, detail perubahan (data lama vs baru), IP Address, dan tanggal.
  * Menampilkan tabel Audit Trail real-time dan konfigurasi retensi log audit (AUDIT_LOG_RETENTION_DAYS) di halaman Settings (Owner Only).

### 7. Keamanan Sesi: Cookie HttpOnly (Menengah)
* **Mengapa Krusial**: Token JWT disimpan di `sessionStorage` frontend ([api.ts](file:///e:/KULIAH%20S1%20TEKNIK%20INFORMATIKA/KULIAH/SKRIPSI/pos-fnb/frontend/src/lib/api.ts)). Jika web terkena serangan XSS (injeksi script jahat), token dapat dicuri dengan mudah.
* **Langkah Teknis**:
  * Konfigurasi backend auth agar mengirimkan JWT via cookie ber-flag `HttpOnly`, `Secure`, dan `SameSite=Strict`.
  * Ubah interceptor Axios di frontend agar tidak lagi membaca dari storage browser, melainkan otomatis menggunakan cookie browser.
* **Status**: 🟢 Selesai (2026-06-23)
  * Menggunakan `cookie-parser` di NestJS backend dan konfigurasi CORS `credentials: true`.
  * Autentikasi JWT dikirim via cookie ber-flag `HttpOnly` dan `SameSite=Strict`, diatur masa kedaluwarsanya dinamis lewat admin.
  * Modifikasi Axios interceptor di frontend dengan `withCredentials: true` dan menghapus pengiriman header Token JWT secara manual untuk proteksi penuh terhadap pencurian token via XSS.

---

## 3. Cara Memulai Pengerjaan
Untuk melakukan perbaikan/penambahan di atas, alur kerja yang direkomendasikan adalah:
1. Mulai dari perubahan skema database di [schema.prisma](file:///e:/KULIAH%20S1%20TEKNIK%20INFORMATIKA/KULIAH/SKRIPSI/pos-fnb/backend/prisma/schema.prisma).
2. Jalankan perintah `npx prisma db push` di folder `/backend` untuk menyinkronkan database PostgreSQL Anda.
3. Update service terkait di backend.
4. Sesuaikan endpoint API di frontend ([api.ts](file:///e:/KULIAH%20S1%20TEKNIK%20INFORMATIKA/KULIAH/SKRIPSI/pos-fnb/frontend/src/lib/api.ts)).
5. Sesuaikan tampilan UI pada halaman terkait.
