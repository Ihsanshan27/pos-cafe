# Analisis Bisnis & Proposal Pengembangan: Smart POS Cafe

Dokumen ini disusun sebagai respons atas permintaan klien untuk membangun sistem Smart POS Cafe (*Coffee Shop*) berskala menengah-besar (mendukung *multi-branch*), dengan *role* yang komprehensif, fitur inventaris, CRM, hingga aplikasi *mobile* menggunakan Flutter.

---

## 1. Analisis Bisnis & Keuntungan Strategis

Klien meminta sistem komprehensif yang mirip dengan Moka POS/Majoo. Berita baiknya: **Kita sudah memiliki sekitar 60-70% dari *core engine* aplikasi ini** (berdasarkan aplikasi POS yang baru saja kita bangun). 

Kita bisa menawarkan *Minimum Viable Product* (MVP) dalam waktu yang sangat cepat karena fondasi (NestJS + React + Prisma + PostgreSQL) sudah mapan, lalu fokus mengembangkan fitur lanjutannya (*Gap*).

**Nilai Jual untuk Klien:**
1. **Time-to-Market Cepat**: Modul Kasir, Diskon, Pajak, KDS, dan Laporan Dasar sudah siap didemokan.
2. **Kustomisasi Penuh**: Berbeda dengan SaaS (Moka/Majoo) yang kaku, sistem ini dibangun *custom* 100% milik klien, memungkinkan penambahan fitur CRM unik.
3. **No Monthly Subscription**: Bebas dari biaya langganan bulanan karena sistem akan menjadi aset klien.

---

## 2. Gap Analysis (Sistem Saat Ini vs Kebutuhan Klien)

### A. Fitur yang SUDAH TERSEDIA (Siap Pakai / Siap Demo)
- **Tech Stack Core**: NestJS, PostgreSQL, Prisma, React.
- **Modul POS**: Buat Pesanan, Diskon/Voucher, Pajak PB1, Multi-Payment (CASH, QRIS, DEBIT, EWALLET).
- **Modul KDS**: Tampilan layar dapur (Pesanan Masuk, Selesai) lengkap dengan notifikasi suara.
- **Inventory (Basic)**: Komposisi Resep (BOM) & Pemotongan stok otomatis (*Stock Keluar*).
- **Report (Basic)**: Penjualan Harian, Produk Terlaris, Ekspor Excel/PDF.

### B. Fitur yang PERLU DIKEMBANGKAN (*The Gap*)
1. **Arsitektur Multi-Cabang (Scalability)**: Menambahkan entitas `Branch` / `Store`. Setiap Transaksi, Stok, dan Pegawai harus terikat pada spesifik cabang.
2. **Role & Akses (RBAC Lanjutan)**: Menambah *role* `OWNER` (Akses semua cabang), `MANAGER` (Akses 1 cabang), dan `BARISTA` (Akses khusus KDS).
3. **POS Lanjutan**: Fitur *Split Bill* (bayar pisah).
4. **CRM & Loyalty**: Modul `Customer` dengan poin *reward*, riwayat transaksi pelanggan, dan keanggotaan.
5. **Inventory Lanjutan**: Formulir *Stock Opname*, Surat Jalan (*Stock Masuk/Keluar* manual antar cabang).
6. **Mobile App**: Pembuatan aplikasi Kasir / Owner berbasis **Flutter** yang mengonsumsi REST API dari NestJS.
7. **Migrasi UI**: Klien meminta *TailwindCSS*. Kita perlu melakukan migrasi *styling* dari *Vanilla CSS* ke Tailwind.

---

## 3. Struktur Database Tambahan (ERD Plan)

Untuk mendukung *Multi-Branch* dan *CRM*, kita perlu melakukan *upgrade* pada skema Prisma:

- **`Branch`**: `id`, `name`, `address`
- **`User`**: Tambahkan `branchId` (opsional untuk Owner), Ubah *enum* Role menjadi `OWNER, MANAGER, CASHIER, BARISTA`.
- **`Customer`**: `id`, `name`, `phone`, `email`, `pointBalance`, `tier` (CRM).
- **`InventoryLog`**: `id`, `ingredientId`, `branchId`, `type` (IN/OUT/ADJUSTMENT), `qty`, `notes` (Catatan Stock Masuk/Keluar).
- **`Transaction`**: Tambahkan `branchId` dan `customerId` (jika pelanggan *member*).

---

## 4. Roadmap Pengembangan (Estimasi: 2 - 3 Bulan)

Sebagai *Project Manager*, berikut usulan *timeline* yang bisa Anda berikan ke klien:

| Fase | Durasi | Fokus Pekerjaan |
|---|---|---|
| **Fase 1: Core Restructuring** | Minggu 1-2 | Migrasi ke TailwindCSS, Integrasi Arsitektur Multi-Cabang di Backend (Schema Update). |
| **Fase 2: CRM & Inventory Plus** | Minggu 3-4 | Pembuatan sistem *Membership*, Point Reward, fitur *Split Bill*, dan *Stock Opname*. |
| **Fase 3: Analytics & Reporting** | Minggu 5 | Laporan Multi-Cabang, Jam Ramai (*Peak Hours*), Penjualan Bulanan, Integrasi *Role* Manager & Owner. |
| **Fase 4: Mobile App (Flutter)** | Minggu 6-9 | Pembuatan aplikasi Android/iOS dengan Flutter untuk Kasir dan aplikasi *Dashboard* untuk Owner. |
| **Fase 5: UAT & Deployment** | Minggu 10 | Testing, perbaikan *bug*, setup server (AWS/GCP), dan *Training* ke staf klien. |

---

## 5. Langkah Selanjutnya Untuk Anda

1. **Rapikan & Pamerkan**: Gunakan kode sumber yang sudah kita buat (*pos-fnb*) sebagai **Purwarupa (Prototype)**. Demokan ke klien bahwa Anda *sudah punya barangnya* dan tinggal mengembangkannya ke tahap *Enterprise / Multi-branch*. Ini akan sangat meyakinkan klien!
2. **Kirimkan Proposal**: Anda bisa menyalin isi dokumen ini (sesuaikan bahasanya) ke dalam format PDF/PowerPoint untuk dipresentasikan.
3. **Minta Persetujuan Kontrak**: Pastikan ruang lingkup (*scope*) terkunci hanya pada daftar di atas agar *budget* dan waktu tidak bengkak.
4. **Mulai Eksekusi Tahap 1**: Jika klien *deal*, kita bisa langsung mulai dengan mengubah skema database menjadi *Multi-Branch* dan menginstal *TailwindCSS*.
