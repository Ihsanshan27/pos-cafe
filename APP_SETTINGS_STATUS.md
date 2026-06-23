# App Settings Status

Dokumen ini merangkum fitur `App Settings` pada project POS F&B, dibagi menjadi:
- yang sudah diimplementasi
- yang belum diimplementasi

Status dibedakan menjadi:
- `Implemented`: sudah ada di backend dan/atau frontend
- `Persisted Only`: sudah bisa disimpan, tetapi belum tentu dipakai di alur lain
- `Not Implemented`: belum ada implementasi

## 1. Sudah Diimplementasi

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Nama toko | `STORE_NAME` | `Implemented` | Sudah ada di halaman settings, bisa disimpan, dan dipakai di sidebar, login, receipt, serta nama file report. |
| Alamat toko | `STORE_ADDRESS` | `Implemented` | Sudah ada di halaman settings, bisa disimpan, dan dipakai di receipt. |
| No. telepon / WhatsApp toko | `STORE_PHONE` | `Implemented` | Sudah ada di halaman settings, bisa disimpan, dan dipakai di login serta receipt. |
| Logo toko | `STORE_LOGO_URL` | `Implemented` | Sudah bisa upload file logo ke folder image aplikasi, tersimpan sebagai path `/img/...`, dan dipakai untuk branding di sidebar, login, serta receipt. |
| Header struk custom | `RECEIPT_HEADER` | `Implemented` | Sudah ada field settings dan tampil di receipt POS maupun transaksi. |
| Footer struk | `RECEIPT_FOOTER` | `Implemented` | Sudah ada di halaman settings, bisa disimpan, dan dipakai di receipt POS serta transaksi. |
| NPWP / info legal usaha | `STORE_TAX_ID` | `Implemented` | Sudah ada field settings dan tampil di receipt sebagai info legal usaha. |
| Aktif/nonaktif PB1 | `TAX_ENABLED` | `Implemented` | Sudah ada sebelumnya dan dipakai untuk pengaturan pajak. |
| Persentase PB1 | `TAX_RATE` | `Implemented` | Sudah ada sebelumnya dan dipakai untuk pengaturan pajak. |
| Harga termasuk pajak | `TAX_INCLUSIVE` | `Implemented` | Owner bisa pilih apakah harga menu sudah termasuk PB1 atau PB1 ditambahkan saat checkout. |
| Mode pembulatan total | `ROUNDING_MODE` | `Implemented` | Mendukung `NONE`, `NEAREST`, `UP`, dan `DOWN`. |
| Nominal pembulatan | `ROUNDING_STEP` | `Implemented` | Menentukan kelipatan pembulatan total transaksi. |
| Warning stok minimum | `LOW_STOCK_THRESHOLD` | `Implemented` | Threshold stok global bisa diatur owner dan dipakai untuk indikator stok serta validasi stok kritis. |
| Blok jual saat stok kurang | `BLOCK_SALE_ON_LOW_STOCK` | `Implemented` | POS/backend bisa menolak penjualan jika stok bahan akan turun di bawah threshold global. |
| Notes wajib saat adjustment | `REQUIRE_ADJUSTMENT_NOTE` | `Implemented` | Inventory adjustment manual wajib menyertakan catatan saat setting ini aktif. |
| Loyalty aktif/nonaktif | `LOYALTY_ENABLED` | `Implemented` | Owner bisa mengaktif/nonaktifkan accrual point customer secara global. |
| Rasio poin loyalty | `POINTS_PER_SPEND` | `Implemented` | Owner bisa menentukan berapa rupiah belanja yang setara dengan 1 poin. |
| Threshold tier silver | `SILVER_MIN_POINTS` | `Implemented` | Owner bisa menentukan batas poin minimum untuk tier `SILVER`. |
| Threshold tier gold | `GOLD_MIN_POINTS` | `Implemented` | Owner bisa menentukan batas poin minimum untuk tier `GOLD`. |
| Izinkan registrasi akun baru | `ALLOW_REGISTRATION` | `Implemented` | Sudah ada endpoint khusus dan sudah masuk ke halaman settings baru. |
| Ambil semua settings | - | `Implemented` | Backend sudah punya endpoint `GET /settings` untuk owner. |
| Simpan banyak settings sekaligus | - | `Implemented` | Backend sudah punya endpoint `PATCH /settings` untuk owner. |
| Halaman settings per section | - | `Implemented` | UI sekarang dibagi ke `Store Profile`, `Tax & Checkout`, `Security & Access`, dan `POS Behavior`. |
| Reset perubahan form | - | `Implemented` | Tombol reset mengembalikan nilai form ke data awal. |
| Indikator perubahan belum disimpan | - | `Implemented` | UI menampilkan status apakah ada perubahan yang belum disimpan. |
| Default order type POS | `DEFAULT_ORDER_TYPE` | `Implemented` | Owner bisa atur default `DINE_IN` atau `TAKEAWAY`, dan POS membacanya saat dibuka/reset setelah checkout. |
| Wajib nomor meja untuk dine-in | `REQUIRE_TABLE_NUMBER` | `Implemented` | Sudah ada setting owner, validasi frontend, dan validasi backend transaksi. |
| Wajib nama customer untuk takeaway | `REQUIRE_CUSTOMER_NAME` | `Implemented` | Sudah ada setting owner, validasi frontend, dan validasi backend transaksi. |
| Konfirmasi sebelum checkout | `CONFIRM_BEFORE_CHECKOUT` | `Implemented` | Owner bisa atur apakah checkout perlu modal konfirmasi atau langsung submit. |
| Konfirmasi sebelum void | `CONFIRM_BEFORE_VOID` | `Implemented` | Owner bisa atur apakah void transaksi perlu prompt konfirmasi atau langsung dieksekusi. |
| Auto print setelah bayar | `AUTO_PRINT_RECEIPT` | `Implemented` | Owner bisa mengaktifkan auto print receipt setelah checkout berhasil. |
| Aktifkan/nonaktifkan metode pembayaran tertentu | `ENABLED_PAYMENT_METHODS` | `Implemented` | Owner bisa memilih metode pembayaran yang muncul di POS, dan backend juga menolak method yang sedang dinonaktifkan. |
| Default payment method | `DEFAULT_PAYMENT_METHOD` | `Implemented` | POS membaca default payment method dari app settings saat dibuka/reset. |
| Instruksi QRIS | `QRIS_PAYMENT_NOTE` | `Implemented` | Catatan QRIS bisa diisi dari settings dan tampil di POS saat metode QRIS dipilih. |
| Suara notifikasi KDS | `KDS_SOUND_ENABLED` | `Implemented` | Owner bisa mengaktif/nonaktifkan bunyi order baru di KDS. |
| Interval auto-refresh KDS | `KDS_REFRESH_INTERVAL` | `Implemented` | KDS membaca interval refresh dari app settings. |
| Auto-hide pesanan selesai | `KDS_DONE_HIDE_MINUTES` | `Implemented` | Pesanan done di KDS bisa disembunyikan otomatis setelah melewati durasi tertentu. |
| Highlight notes item | `KDS_HIGHLIGHT_NOTES` | `Implemented` | Catatan item di KDS bisa dibuat lebih menonjol lewat settings. |
| Session timeout | `SESSION_TIMEOUT_MINUTES` | `Implemented` | Frontend melakukan auto logout saat idle sesuai jumlah menit yang diatur. |
| Force change password | `FORCE_PASSWORD_CHANGE` | `Implemented` | User diarahkan ke halaman profile untuk mengganti password sebelum membuka modul lain, dan status wajib ganti password sekarang dipersist di backend/database per user. |
| Granular feature access | `DISABLED_FEATURES` | `Implemented` | Owner bisa mematikan modul tertentu agar hilang dari sidebar dan rutenya terkunci. |
| Export backup dari settings | - | `Implemented` | Settings owner sekarang bisa export backup JSON dari data aplikasi. |
| Restore backup dari settings | - | `Implemented` | Owner sekarang bisa restore file backup JSON dari halaman settings. |
| Reset demo/sample data | - | `Implemented` | Owner bisa reset data demo/operasional dari halaman settings dengan konfirmasi. |
| Retensi inventory log | `LOG_RETENTION_DAYS` | `Implemented` | Owner bisa mengatur retensi khusus untuk data `InventoryLog` dan menjalankan cleanup log stok lama dari settings. |
| Versi aplikasi | `APP_VERSION` | `Implemented` | Versi aplikasi tampil di section system info dan bisa disimpan dari app settings. |
| Metadata pricing per transaksi | - | `Implemented` | Sistem sekarang menyimpan metadata tax/rounding per transaksi agar histori tetap akurat meski setting pricing berubah. |

## 2. Sudah Tersambung ke UI / Receipt

Bagian ini menegaskan area pemakaian aktual untuk setting toko yang sebelumnya baru sebatas tersimpan.

| Setting / Fitur | Key | Status | Catatan |
|---|---|---|---|
| Nama toko dipakai di header/sidebar | `STORE_NAME` | `Implemented` | Sudah dipakai di sidebar, login page, judul receipt, dan nama file report. |
| Logo toko dipakai di branding utama | `STORE_LOGO_URL` | `Implemented` | Sudah tampil di sidebar, login page, dan header receipt saat diisi. |
| Alamat toko dipakai di struk | `STORE_ADDRESS` | `Implemented` | Sudah tampil di receipt POS dan halaman transaksi. |
| No. telepon dipakai di struk / kontak toko | `STORE_PHONE` | `Implemented` | Sudah tampil di login page dan receipt. |
| Header struk dipakai di print receipt | `RECEIPT_HEADER` | `Implemented` | Sudah tampil di receipt POS dan halaman transaksi. |
| Footer struk dipakai di print receipt | `RECEIPT_FOOTER` | `Implemented` | Sudah dipakai di receipt POS dan halaman transaksi. |
| Info legal usaha dipakai di struk | `STORE_TAX_ID` | `Implemented` | Sudah tampil di receipt POS dan halaman transaksi. |
| Pricing POS membaca tax & rounding settings | `TAX_ENABLED`, `TAX_RATE`, `TAX_INCLUSIVE`, `ROUNDING_MODE`, `ROUNDING_STEP` | `Implemented` | Kalkulasi total di POS sekarang mengikuti app settings. |
| Behavior checkout dan void membaca app settings | `CONFIRM_BEFORE_CHECKOUT`, `CONFIRM_BEFORE_VOID` | `Implemented` | POS dan halaman transaksi sekarang mengikuti kebutuhan konfirmasi sesuai setting owner. |
| Auto print checkout membaca app settings | `AUTO_PRINT_RECEIPT` | `Implemented` | Setelah transaksi sukses di POS, receipt bisa langsung diprint otomatis. |
| Payment method POS membaca app settings | `ENABLED_PAYMENT_METHODS`, `DEFAULT_PAYMENT_METHOD`, `QRIS_PAYMENT_NOTE` | `Implemented` | POS hanya menampilkan metode aktif, memakai default method, dan menampilkan catatan QRIS saat relevan. |
| KDS membaca app settings | `KDS_SOUND_ENABLED`, `KDS_REFRESH_INTERVAL`, `KDS_DONE_HIDE_MINUTES`, `KDS_HIGHLIGHT_NOTES` | `Implemented` | Kitchen page sekarang mengikuti setting sound, refresh, hide done, dan highlight notes. |
| Inventory & POS membaca setting stok | `LOW_STOCK_THRESHOLD`, `BLOCK_SALE_ON_LOW_STOCK`, `REQUIRE_ADJUSTMENT_NOTE` | `Implemented` | Ingredients page, inventory log manual, POS, dan backend transaksi sekarang mengikuti rule stok dari owner settings. |
| Customer loyalty membaca app settings | `LOYALTY_ENABLED`, `POINTS_PER_SPEND`, `SILVER_MIN_POINTS`, `GOLD_MIN_POINTS` | `Implemented` | Checkout customer, perolehan poin, dan tier customer sekarang mengikuti konfigurasi loyalty dari settings. |
| Security/app access membaca app settings | `SESSION_TIMEOUT_MINUTES`, `FORCE_PASSWORD_CHANGE`, `DISABLED_FEATURES` | `Implemented` | Timeout sesi, pemaksaan ganti password, dan penguncian modul sekarang berjalan dari app settings. |
| Backup & system actions tersedia di settings | `LOG_RETENTION_DAYS`, `APP_VERSION` | `Implemented` | Export backup, restore backup, cleanup inventory log lama, reset demo data, dan info versi sudah tersedia di halaman settings owner. |
| Histori transaksi menyimpan pricing metadata | `TAX_ENABLED`, `TAX_RATE`, `TAX_INCLUSIVE`, `ROUNDING_MODE`, `ROUNDING_STEP` | `Implemented` | Metadata pricing per transaksi sekarang ikut dipakai di receipt/summary report agar histori lebih stabil. |

## 3. Catatan UI POS

Per 2026-06-08, area order di halaman POS juga sudah dirapikan agar item yang dipilih lebih mudah terlihat:

| Perubahan UI | Status | Keterangan |
|---|---|---|
| Ringkasan order di footer cart | `Implemented` | Footer cart sekarang lebih ringkas dan fokus ke total + summary order. |
| Pengaturan order dipindah ke modal | `Implemented` | `Dine In/Takeaway`, customer, diskon, dan payment dipindah ke modal `Pengaturan Order`. |
| Tombol `Atur Order` | `Implemented` | Kasir bisa buka detail order saat perlu tanpa menutupi daftar item. |
| Validasi checkout diarahkan ke modal order | `Implemented` | Jika data wajib belum lengkap, checkout akan mengarahkan user ke pengaturan order dulu. |
| Modal order membaca app settings | `Implemented` | Default order type, wajib nomor meja, dan wajib nama customer sekarang mengikuti app settings. |
| Ringkasan tax & rounding di checkout | `Implemented` | Footer cart dan modal konfirmasi menampilkan PB1 inclusive/exclusive serta adjustment rounding bila ada. |
| Konfirmasi checkout configurable | `Implemented` | Kasir bisa langsung checkout tanpa modal konfirmasi jika setting dimatikan. |
| Auto print receipt setelah checkout | `Implemented` | Receipt bisa otomatis dibuka ke dialog print setelah transaksi berhasil. |

## 4. Status Per Section

Per 2026-06-08, item yang sebelumnya tersisa pada section `Inventory` dan `Customer & Loyalty` juga sudah selesai diimplementasi.

### A. Store Profile

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Semua item Store Profile prioritas awal | `STORE_LOGO_URL`, `RECEIPT_HEADER`, `STORE_TAX_ID` | `Implemented` | Sudah ada field settings, upload logo, dan sudah dipakai di area branding/receipt. |

### B. Tax & Pricing

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Harga termasuk pajak | `TAX_INCLUSIVE` | `Implemented` | Sudah configurable dari settings owner dan dipakai di kalkulasi POS/backend transaksi. |
| Pembulatan total transaksi | `ROUNDING_MODE` | `Implemented` | Sudah configurable dan dipakai pada total akhir checkout. |
| Nominal pembulatan | `ROUNDING_STEP` | `Implemented` | Sudah configurable sebagai kelipatan rounding total. |

### C. POS Behavior

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Default order type | `DEFAULT_ORDER_TYPE` | `Implemented` | Sudah configurable dari settings owner dan dibaca oleh POS. |
| Wajib nomor meja untuk dine-in | `REQUIRE_TABLE_NUMBER` | `Implemented` | Sudah divalidasi di frontend dan backend. |
| Wajib nama customer untuk takeaway | `REQUIRE_CUSTOMER_NAME` | `Implemented` | Sudah divalidasi di frontend dan backend. |
| Konfirmasi sebelum checkout | `CONFIRM_BEFORE_CHECKOUT` | `Implemented` | Sudah configurable dan dipakai di alur checkout POS. |
| Konfirmasi sebelum void | `CONFIRM_BEFORE_VOID` | `Implemented` | Sudah configurable dan dipakai di halaman transaksi. |
| Auto print setelah bayar | `AUTO_PRINT_RECEIPT` | `Implemented` | Sudah configurable dan dipakai setelah checkout sukses di POS. |

### D. Payment

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Aktifkan/nonaktifkan metode pembayaran tertentu | `ENABLED_PAYMENT_METHODS` | `Implemented` | Owner bisa mengatur metode aktif, POS hanya menampilkan metode tersebut, dan backend ikut memvalidasi. |
| Default payment method | `DEFAULT_PAYMENT_METHOD` | `Implemented` | Sudah configurable dan dipakai saat POS dibuka maupun sesudah checkout/reset order. |
| Instruksi QRIS | `QRIS_PAYMENT_NOTE` | `Implemented` | Sudah ada field catatan pembayaran dan dipakai saat QRIS dipilih di POS. |

### E. Kitchen / KDS

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Suara notifikasi on/off | `KDS_SOUND_ENABLED` | `Implemented` | KDS hanya memainkan bunyi order baru jika setting ini aktif. |
| Interval auto-refresh | `KDS_REFRESH_INTERVAL` | `Implemented` | Sudah configurable dari settings owner dan dipakai oleh query refresh KDS. |
| Auto-hide pesanan selesai | `KDS_DONE_HIDE_MINUTES` | `Implemented` | Pesanan done di KDS akan disembunyikan otomatis setelah melewati durasi yang ditentukan. |
| Highlight notes item | `KDS_HIGHLIGHT_NOTES` | `Implemented` | Tampilan catatan item di KDS bisa dibuat lebih menonjol lewat setting owner. |

### F. Inventory

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Warning stok minimum | `LOW_STOCK_THRESHOLD` | `Implemented` | Threshold global sekarang bisa diatur dari settings owner dan dipakai untuk badge stok di halaman Ingredients serta warning stok menu di POS. |
| Blok jual saat stok kurang | `BLOCK_SALE_ON_LOW_STOCK` | `Implemented` | Owner bisa memblok checkout jika transaksi membuat stok bahan turun di bawah threshold, dan POS menandai menu yang terdampak. |
| Notes wajib saat adjustment | `REQUIRE_ADJUSTMENT_NOTE` | `Implemented` | Inventory log manual tipe `ADJUSTMENT` sekarang wajib punya catatan jika setting diaktifkan, baik di frontend maupun backend. |

### G. Customer & Loyalty

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Loyalty aktif/nonaktif | `LOYALTY_ENABLED` | `Implemented` | Owner bisa mengaktif/nonaktifkan accrual point global dari halaman settings. |
| Rasio poin | `POINTS_PER_SPEND` | `Implemented` | Rasio poin sekarang configurable, misalnya 1 poin per Rp10.000 total belanja. |
| Threshold tier silver | `SILVER_MIN_POINTS` | `Implemented` | Batas tier silver sekarang configurable dan dipakai saat resolve tier customer. |
| Threshold tier gold | `GOLD_MIN_POINTS` | `Implemented` | Batas tier gold sekarang configurable dan dipakai saat resolve tier customer. |

### H. Security & Access

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Session timeout | `SESSION_TIMEOUT_MINUTES` | `Implemented` | Frontend melakukan auto logout saat user idle sesuai jumlah menit yang dikonfigurasi owner. |
| Force change password first login | `FORCE_PASSWORD_CHANGE` | `Implemented` | User dipaksa menuju profile untuk mengganti password sebelum membuka modul lain, dan statusnya divalidasi dari backend/database. |
| Granular feature access | `DISABLED_FEATURES` | `Implemented` | Owner bisa disable modul tertentu agar hilang dari sidebar dan route-nya terkunci. |

### I. Backup & System

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Export backup dari settings | - | `Implemented` | Owner bisa export backup JSON berisi data utama aplikasi langsung dari halaman settings. |
| Restore backup dari settings | - | `Implemented` | Owner bisa import kembali file backup JSON untuk memulihkan data operasional dan settings. |
| Reset demo/sample data | - | `Implemented` | Owner bisa reset data operasional/demo lewat action khusus dengan konfirmasi. |
| Retensi log | `LOG_RETENTION_DAYS` | `Implemented` | Owner bisa simpan retensi khusus inventory log dan menjalankan cleanup log stok lama dari settings. |
| Versi aplikasi | `APP_VERSION` | `Implemented` | System info sekarang menampilkan versi package dan app version yang disimpan di settings. |

### J. Audit / Pricing Metadata

| Setting / Fitur | Key | Status | Keterangan |
|---|---|---|---|
| Simpan metadata pricing per transaksi | - | `Implemented` | Saat checkout, sistem menyimpan snapshot subtotal, taxable amount, tax mode, tax rate, rounding step, dan rounding adjustment per transaksi. |

## 5. Referensi Implementasi Saat Ini

- Halaman settings: [frontend/src/pages/SettingsPage.tsx](frontend/src/pages/SettingsPage.tsx)
- API settings frontend: [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
- Access rule helper frontend: [frontend/src/lib/featureAccess.ts](frontend/src/lib/featureAccess.ts)
- Hook public settings frontend: [frontend/src/hooks/useAppPublicSettings.ts](frontend/src/hooks/useAppPublicSettings.ts)
- Sidebar branding: [frontend/src/components/Sidebar.tsx](frontend/src/components/Sidebar.tsx)
- Login branding: [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx)
- POS receipt + order settings UI: [frontend/src/pages/POSPage.tsx](frontend/src/pages/POSPage.tsx)
- Kitchen page behavior: [frontend/src/pages/KitchenPage.tsx](frontend/src/pages/KitchenPage.tsx)
- App route access guard: [frontend/src/App.tsx](frontend/src/App.tsx)
- Auth/session handling: [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)
- Profile password change flow: [frontend/src/pages/ProfilePage.tsx](frontend/src/pages/ProfilePage.tsx)
- Transactions receipt/report branding: [frontend/src/pages/TransactionsPage.tsx](frontend/src/pages/TransactionsPage.tsx)
- Frontend pricing util: [frontend/src/lib/pricing.ts](frontend/src/lib/pricing.ts)
- Auth backend: [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)
- JWT profile hydration: [backend/src/auth/jwt.strategy.ts](backend/src/auth/jwt.strategy.ts)
- Backend transaksi validation: [backend/src/transactions/transactions.service.ts](backend/src/transactions/transactions.service.ts)
- Backend transaksi module wiring: [backend/src/transactions/transactions.module.ts](backend/src/transactions/transactions.module.ts)
- Backend pricing util: [backend/src/transactions/pricing.util.ts](backend/src/transactions/pricing.util.ts)
- Controller settings backend: [backend/src/settings/settings.controller.ts](backend/src/settings/settings.controller.ts)
- Service settings backend: [backend/src/settings/settings.service.ts](backend/src/settings/settings.service.ts)

## 6. Rekomendasi Prioritas Berikutnya

Per 2026-06-08, seluruh daftar utama pada dokumen ini sudah terimplementasi. Prioritas berikutnya yang paling masuk akal:

1. Pertimbangkan validasi/preview restore backup sebelum import dijalankan, agar owner bisa melihat ringkasan dampak restore lebih dulu.
2. Pertimbangkan migrasi penyimpanan `pricing metadata` dan `password-change marker` ke tabel/domain khusus jika nanti ingin audit trail yang lebih formal.
3. Pertimbangkan restore user accounts terkelola bila suatu saat backup juga perlu memulihkan environment secara lebih penuh, bukan hanya data operasional.
4. Pertimbangkan rule loyalty lanjutan seperti expiry point, manual adjustment point, atau promo multiplier per periode jika CRM ingin dibuat lebih kaya.
