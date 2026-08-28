# POS F&B (Point of Sales - Food & Beverage)

Aplikasi Point of Sales (POS) modern yang dirancang khusus untuk bisnis Food & Beverage (F&B) seperti kafe, restoran, dan kedai. Aplikasi ini mengelola penjualan, inventarisasi bahan baku, manajemen pengguna, hingga pengaturan diskon dan laporan.

## 🚀 Tech Stack

Aplikasi ini dibagi menjadi dua bagian utama: Backend dan Frontend.

**Frontend:**
- [React](https://reactjs.org/) dengan [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/) untuk styling
- [React Query (@tanstack/react-query)](https://tanstack.com/query) untuk state management & data fetching
- [Recharts](https://recharts.org/) untuk visualisasi grafik/chart
- [Socket.io-client](https://socket.io/) untuk realtime update

**Backend:**
- [NestJS](https://nestjs.com/) (Framework Node.js)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/) untuk database utama
- Autentikasi JWT (JSON Web Token) & enkripsi Bcrypt
- Socket.io untuk komunikasi realtime

**Infrastruktur:**
- [Docker & Docker Compose](https://www.docker.com/)

---

## 🛠️ Cara Menjalankan Aplikasi (Getting Started)

Ada dua cara untuk menjalankan aplikasi ini: menggunakan Docker (direkomendasikan untuk uji coba cepat) atau menjalankannya secara manual untuk keperluan *development*.

### 1. Menggunakan Docker (Cara Paling Cepat)

Pastikan Anda sudah menginstall Docker dan Docker Compose di sistem Anda.

1. Clone repository ini.
2. Buka terminal di folder utama (*root*) project.
3. Jalankan perintah berikut:
   ```bash
   docker-compose up -d --build
   ```
4. Docker akan otomatis men-setup Database PostgreSQL, Backend, dan Frontend.
5. Akses aplikasi melalui browser:
   - **Frontend:** `http://localhost:5173`
   - **Backend API:** `http://localhost:3000`

### 2. Setup Manual (Untuk Development)

Jika ingin memodifikasi kode, disarankan untuk menjalankan Backend dan Frontend secara manual.

#### A. Setup Database (PostgreSQL)
Pastikan Anda memiliki server PostgreSQL yang berjalan, lalu buat database baru (misalnya `pos_fnb`).

#### B. Setup Backend
1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `backend/` dengan referensi berikut:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/pos_fnb?schema=public
   JWT_SECRET=rahasia_super_aman_anda
   PORT=3000
   ```
   *(Sesuaikan `username` dan `password` dengan PostgreSQL Anda).*
4. Sinkronisasi skema Prisma ke Database:
   ```bash
   npx prisma db push
   ```
   *(Opsional) Jika Anda memiliki file seeder, jalankan `npm run seed`.*
5. Jalankan server Backend:
   ```bash
   npm run start:dev
   ```

#### C. Setup Frontend
1. Buka tab terminal baru, masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `frontend/` (jika diperlukan) untuk mengatur URL API:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```
4. Jalankan server Frontend:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:5173` di browser Anda.

---

## ✨ Fitur Utama
- **Manajemen Kasir / POS:** Proses transaksi penjualan yang cepat dan responsif.
- **Manajemen Inventaris & Bahan Baku (Ingredients):** Lacak stok masuk/keluar dan pergerakan bahan baku.
- **Manajemen Supplier:** Kelola data pemasok barang.
- **Pengaturan Diskon:** Buat dan terapkan diskon untuk transaksi.
- **Manajemen Pengguna & Role (Role-based Access):** Batasi akses tiap karyawan berdasarkan rolenya.
- **Pengaturan Sistem:** Atur timeout sesi, keamanan akun (force password change), dan operasional toko lainnya.
- **Realtime Updates:** Notifikasi atau sinkronisasi data seketika dengan WebSockets.

## 🔒 Keamanan & Kontribusi
- Credential seperti password database dan rahasia JWT **tidak boleh** di-commit ke repositori ini. Selalu gunakan file `.env` yang secara otomatis diabaikan oleh `.gitignore`.
