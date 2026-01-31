# UAS - SPA Manajemen Menu (Rumah Makan Padang)

Prototype Single Page Application (SPA) menggunakan Vue 3 (CDN) + Tailwind CSS (Play CDN). Aplikasi ini adalah *mock* CRUD (data disimpan in-memory) untuk keperluan UI dan demonstrasi fitur.

## Cara Menjalankan

Cara cepat: buka `index.html` di browser (direkomendasikan menaruhnya pada server lokal). Contoh menjalankan server sederhana:

- Dengan Node (jika terpasang):
  - Instal: `npm install -g serve`
  - Jalankan: `serve .`

- Dengan Python 3:
  - Jalankan: `python -m http.server 5173`
  - Lalu buka: `http://localhost:5173`

## Fitur yang telah disediakan

- Tampilan responsif dengan Tailwind CSS ✅
- Komponen modular: `Navbar`, `CardItem`, `FormInput`, `Footer` ✅
- Mock CRUD (Tambah, Edit, Hapus) — terhubung ke MockAPI endpoint (CRUD via network) ✅

**Endpoint:** `https://697b85bd0e6ff62c3c5c53d4.mockapi.io/Menu` (data dimuat saat aplikasi dibuka)

## Struktur berkas

- `index.html` — entry point
- `src/main.js` — aplikasi utama + store sederhana
- `src/components/` — komponen UI

---

Menjalankan dengan Node (Express) + proxy ke MockAPI ✅

Untuk menjalankan aplikasi dengan server Node yang juga mem-proxy request API (untuk menghindari CORS dan memudahkan pengembangan):

1. Install dependensi:

   npm install

2. Jalankan server:

   npm start

   Server akan berjalan di http://localhost:3000 dan mem-proxy semua request `GET/POST/PUT/DELETE` ke endpoint MockAPI asli.

Catatan: file `server.js` di root adalah server Express sederhana yang melakukan proxy dari `/api/*` ke `https://697b85bd0e6ff62c3c5c53d4.mockapi.io/`. Pastikan Anda memanggil endpoint menggunakan path yang dimulai dengan `/api/` (aplikasi sudah diatur demikian).

Admin & Autentikasi
- Default admin dibuat otomatis saat server dijalankan: **username**: `bemis`, **password**: `L1nux3r`.
- Password disimpan dalam bentuk hashed (bcrypt) di file lokal `admins.json` pada server.
- Login dilakukan melalui endpoint `POST /auth/login` (body: `{ "username", "password" }`) — server akan memverifikasi password yang di-hash.
- Setelah login berhasil server mengeluarkan token (selama 1 jam). Frontend menyimpan token dan mengirimkan header **`x-admin-username`** dan **`x-admin-token`** pada request POST/PUT/DELETE ke `/api/Menu`.
- Ini meningkatkan keamanan dibanding memverifikasi password di frontend, tetapi masih untuk demo saja; gunakan solusi otentikasi yang lebih matang (HTTPS, token signing, refresh tokens) untuk produksi.