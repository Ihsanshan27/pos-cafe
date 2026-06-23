# Selling Feature Roadmap

Dokumen ini merangkum fitur yang paling layak diprioritaskan agar POS F&B ini lebih siap dijual ke bisnis nyata, bukan sekadar dipakai internal/demo.

Tanggal acuan: `2026-06-08`

## 0. Update Status Terbaru

Per update terbaru, tiga fitur prioritas utama berikut sudah masuk dalam bentuk `MVP`:
- `Multi-Outlet basic`
- `Supplier & Purchase Order basic`
- `QR Table Ordering basic`

Artinya roadmap ini sekarang berubah fungsi dari:
- daftar fitur yang ingin dibangun

menjadi:
- catatan status fitur yang sudah masuk
- daftar gap lanjutan untuk membuat ketiga fitur itu lebih matang dan lebih siap dijual

## 1. Tujuan

Fokus roadmap ini:
- menaikkan nilai jual produk
- menjawab kebutuhan operasional outlet F&B sungguhan
- menutup gap yang biasanya ditanyakan calon pembeli

## 2. Prioritas Utama

### A. Multi-Branch / Multi-Outlet

Kenapa penting:
- Banyak bisnis akan langsung tanya apakah sistem bisa dipakai lebih dari 1 cabang.
- Ini fitur pembeda besar antara POS basic dan POS yang siap dijual.

Yang ideal ada:
- data `outlet`
- user per outlet
- stok per outlet
- menu/harga per outlet
- transaksi per outlet
- laporan filter per outlet
- settings per outlet atau global + override outlet

Nilai jual:
- bisa masuk ke bisnis yang punya lebih dari 1 lokasi
- lebih mudah dijadikan paket berlangganan per cabang

Status saat ini:
- `MVP Implemented`
- sudah ada data `outlet`
- sudah ada assignment outlet ke `user`, `shift`, `transaction`, dan `expense`
- sudah ada outlet switcher di frontend
- sudah ada halaman admin outlet
- belum ada stok per outlet
- belum ada menu/harga per outlet
- belum ada settings per outlet
- belum ada reporting per outlet yang mendalam

Prioritas:
- `Sangat Tinggi`

### B. Supplier & Purchase Order

Kenapa penting:
- Inventory tanpa pembelian bahan biasanya terasa belum lengkap.
- Owner butuh tahu bahan datang dari siapa, berapa harga beli, dan histori restock.

Yang ideal ada:
- master supplier
- purchase order
- status PO: `DRAFT`, `ORDERED`, `RECEIVED`, `CANCELLED`
- receiving barang
- update stok otomatis dari receiving
- histori harga beli bahan
- hutang supplier sederhana jika ingin lanjut

Nilai jual:
- bikin inventory terasa operasional
- cocok untuk coffee shop, resto, bakery, dan central kitchen

Status saat ini:
- `MVP Implemented`
- sudah ada master `supplier`
- sudah ada `purchase order`
- sudah ada status `DRAFT`, `ORDERED`, `RECEIVED`, `CANCELLED`
- saat `RECEIVED`, stok ingredient bertambah otomatis
- sistem juga membuat `inventory log` otomatis saat receiving
- belum ada edit detail PO yang lengkap
- belum ada partial receiving yang lebih kaya
- belum ada hutang supplier / invoice tracking

Prioritas:
- `Sangat Tinggi`

### C. QR Table Ordering / Online Ordering

Kenapa penting:
- Ini fitur yang sangat mudah dijelaskan saat demo.
- Customer bisa scan QR, lihat menu, lalu order langsung ke POS/KDS.

Yang ideal ada:
- QR per meja
- halaman menu publik
- order masuk ke POS/KDS
- status order realtime
- opsi bayar di kasir atau bayar online
- support takeaway pre-order

Nilai jual:
- modern
- langsung terasa manfaatnya
- cocok untuk dine-in dan takeaway

Status saat ini:
- `MVP Implemented`
- sudah ada route publik order per outlet dan meja
- customer sudah bisa buka menu publik dan kirim order
- order sudah masuk ke transaksi backend dan ikut terbaca di KDS
- belum ada QR image generator otomatis
- belum ada pembayaran online
- belum ada status realtime ke customer
- belum ada flow takeaway pre-order

Prioritas:
- `Sangat Tinggi`

## 3. Prioritas Menengah

## 2A. Gap Lanjutan dari 3 Fitur Utama

### A1. Multi-Outlet Lanjutan

Yang paling penting berikutnya:
- stok per outlet
- mutasi stok antar outlet
- menu aktif/nonaktif per outlet
- harga menu per outlet
- dashboard dan report per outlet
- settings per outlet

Prioritas:
- `Sangat Tinggi`

### B1. Purchase Order Lanjutan

Yang paling penting berikutnya:
- edit PO setelah dibuat
- partial receiving per item
- lampiran invoice
- histori perubahan status PO
- supplier payable / hutang supplier
- ringkasan pembelian per periode

Prioritas:
- `Tinggi`

### C1. QR Ordering Lanjutan

Yang paling penting berikutnya:
- generate QR image otomatis
- custom landing page per outlet
- status order untuk customer
- panggil waiter / request bill
- pembayaran QRIS online
- order note per item yang lebih nyaman

Prioritas:
- `Tinggi`

## 3. Prioritas Menengah

### D. Promo Engine yang Lebih Lengkap

Contoh fitur:
- `Buy 1 Get 1`
- bundling menu
- happy hour
- diskon kategori
- diskon member
- voucher minimum belanja
- promo terjadwal

Kenapa penting:
- bisnis F&B sering butuh promo fleksibel
- loyalty akan terasa lebih kuat kalau dipadukan promo

Status saat ini:
- `Baru ada diskon basic`

Prioritas:
- `Tinggi`

### E. Audit Trail Lengkap

Contoh event:
- ubah harga menu
- ubah stok manual
- void transaksi
- ubah settings
- reset data
- restore backup

Kenapa penting:
- owner ingin tahu siapa melakukan apa
- sangat penting saat dipakai banyak kasir/manager

Status saat ini:
- `Masih terbatas`

Prioritas:
- `Tinggi`

### F. Shift Closing & Cash Reconciliation

Yang ideal ada:
- expected cash
- actual cash
- selisih kas
- catatan selisih
- cash in / cash out
- approval manager

Kenapa penting:
- ini kebutuhan harian operasional kasir
- membantu owner percaya ke sistem

Status saat ini:
- `Sudah ada shift basic, belum lengkap`

Prioritas:
- `Tinggi`

### G. Dashboard Owner yang Lebih Tajam

Yang ideal ada:
- top selling menu
- menu paling untung
- jam ramai
- repeat customer
- gross profit
- food cost trend
- stok kritis
- transaksi void / cancel

Kenapa penting:
- owner beli sistem bukan hanya buat kasir, tapi buat ambil keputusan

Status saat ini:
- `Perlu diperdalam`

Prioritas:
- `Tinggi`

## 4. Prioritas Pelengkap

### H. WhatsApp Receipt / CRM Follow-up

Contoh:
- kirim struk digital
- kirim poin loyalty
- kirim promo sederhana

Prioritas:
- `Menengah`

### I. Hardware Readiness

Contoh:
- printer kasir
- printer dapur
- cash drawer
- barcode scanner
- customer display

Prioritas:
- `Menengah`

### J. Offline Mode + Sync

Kenapa penting:
- banyak calon user akan tanya ini
- sangat kuat untuk jualan

Catatan:
- implementasinya cukup kompleks

Prioritas:
- `Menengah ke Tinggi`

## 5. Rekomendasi Roadmap 30-60-90 Hari

### 30 Hari

Fokus:
- stok per outlet
- outlet-aware reporting
- QR generator otomatis
- audit trail basic

Target hasil:
- tiga fitur MVP utama terasa lebih matang dan lebih enak didemo

### 60 Hari

Fokus:
- menu/harga per outlet
- partial receiving PO
- status order customer dari QR ordering

Target hasil:
- sistem lebih siap dijual ke bisnis multi-cabang dan dine-in modern

### 90 Hari

Fokus:
- pembayaran online untuk QR order
- supplier payable sederhana
- promo engine lanjutan

Target hasil:
- produk punya flow operasional dan demo sales yang jauh lebih kuat

## 6. Paket Fitur untuk Dijual

### Paket Basic

Isi:
- POS
- menu
- kategori
- discount basic
- customer
- loyalty basic
- inventory basic
- KDS
- app settings

Cocok untuk:
- warung modern
- booth minuman
- coffee stall

### Paket Pro

Isi:
- semua paket basic
- supplier
- purchase order
- multi-outlet basic
- audit trail
- shift closing lengkap
- dashboard owner

Cocok untuk:
- coffee shop
- cafe
- bakery
- resto skala kecil-menengah

### Paket Enterprise / Multi Outlet

Isi:
- semua paket pro
- stok per outlet
- mutasi antar outlet
- laporan per cabang
- QR ordering
- online ordering
- role & approval lebih lengkap

Cocok untuk:
- brand dengan banyak cabang
- group F&B

## 7. Rekomendasi Paling Worth Dibangun Dulu

Tiga fitur paling strategis ini sekarang sudah masuk sebagai MVP:

1. `Supplier & Purchase Order`
2. `Multi-Branch / Multi-Outlet`
3. `QR Table Ordering / Online Ordering`

Alasannya:
- paling mudah menaikkan persepsi value
- paling relevan untuk operasional bisnis nyata
- paling enak dipakai sebagai bahan demo/sales

Fokus rekomendasi berikutnya:

1. `Stok per outlet`
2. `QR generator otomatis + customer order status`
3. `PO receiving yang lebih lengkap`

## 8. Catatan

Fitur yang sudah kuat di project saat ini:
- POS dine in / takeaway
- KDS
- app settings owner
- tax & pricing settings
- loyalty basic
- inventory log
- backup / restore
- feature access control
- outlet basic
- supplier basic
- purchase order basic
- QR table ordering basic

Artinya, pondasi inti sudah cukup bagus. Yang perlu dikejar berikutnya adalah fitur yang membuat calon pembeli merasa:

- sistem ini aman dipakai harian
- sistem ini cocok untuk bisnis yang tumbuh
- sistem ini punya nilai lebih dibanding POS basic

## 9. Ringkasan Status

| Area | Status | Catatan |
|---|---|---|
| Multi-Outlet | `MVP Implemented` | Outlet sudah ada, tapi stok/menu/settings per outlet belum ada |
| Supplier | `MVP Implemented` | Master supplier sudah ada |
| Purchase Order | `MVP Implemented` | Create PO + receiving stok sudah ada |
| QR Table Ordering | `MVP Implemented` | Public order page sudah ada, tapi QR image generator dan payment online belum ada |
| Promo Engine Advanced | `Belum` | Masih diskon basic |
| Audit Trail Lengkap | `Belum` | Masih perlu diperluas |
| Shift Closing Lengkap | `Belum` | Masih shift basic |
| Offline Mode | `Belum` | Belum mulai |
