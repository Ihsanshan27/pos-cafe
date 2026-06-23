# Security Hardening Task List

## Done

- [x] Menutup privilege escalation pada registrasi publik.
- [x] Menghapus opsi pemilihan role dari form registrasi frontend.
- [x] Memaksa role registrasi publik menjadi role non-privileged di backend.
- [x] Menambahkan rate limit sederhana untuk endpoint `POST /auth/register` dan `POST /auth/login`.
- [x] Menambahkan rate limit sederhana untuk endpoint `POST /public/order/:outletSlug/:tableCode`.
- [x] Menghapus fallback `JWT_SECRET` hardcoded dari backend dan mewajibkan environment variable.
- [x] Membatasi CORS ke origin yang diizinkan melalui `CORS_ORIGINS`.
- [x] Menambahkan header hardening dasar: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, dan `Permissions-Policy`.
- [x] Mengaktifkan `forbidNonWhitelisted` pada validation pipe global.
- [x] Memperketat DTO transaksi: minimal 1 item, quantity integer minimal 1, dan pembatasan panjang catatan/nama customer.
- [x] Membuat DTO khusus untuk public order agar validasi body benar-benar diterapkan.
- [x] Menutup kebocoran hash password pada response transaksi dengan sanitasi object user.
- [x] Menutup kebocoran hash password pada response shift dengan sanitasi object user.
- [x] Menyatukan helper sanitasi user agar field `password` tidak ikut keluar dari response sensitif.
- [x] Menambahkan RBAC eksplisit pada endpoint transaksi.
- [x] Menambahkan RBAC eksplisit pada endpoint shift.
- [x] Menambahkan pembatasan akses transaksi berbasis outlet untuk user non-owner.
- [x] Menambahkan pembatasan akses shift berbasis outlet/user untuk user non-owner.
- [x] Membatasi update status kitchen ke role yang diizinkan dan outlet yang sesuai.
- [x] Membatasi manager agar tidak bisa membuat, mengubah, atau menghapus user privileged (`OWNER`/`MANAGER`).
- [x] Memindahkan penyimpanan token frontend dari `localStorage` ke `sessionStorage` untuk mengurangi persistensi token di browser.
- [x] Menghilangkan hardcoded password database dari `docker-compose.yml` dan menggantinya dengan environment variable.

## Verified

- [x] `backend`: `npm.cmd run build`

## Follow-up

- [ ] Rotasi `JWT_SECRET`, `DATABASE_URL`, dan kredensial PostgreSQL yang pernah tersimpan di file lokal/repo sebelumnya.
- [ ] Pertimbangkan migrasi token auth dari bearer token di storage browser ke cookie `HttpOnly` + `Secure`.
- [ ] Pertimbangkan audit trail untuk aksi sensitif seperti reset demo data, restore backup, dan perubahan role user.
- [ ] Selesaikan error TypeScript frontend yang sudah ada di `frontend/src/pages/DashboardPage.tsx` agar build frontend kembali hijau.
