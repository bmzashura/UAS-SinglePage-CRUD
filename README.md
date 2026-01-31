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

## Struktur berkas (baru)

Folder proyek kini diorganisir untuk workflow profesional:

- `index.html` — entry point (Vite)
- `src/` — kode sumber frontend
  - `src/main.js` — entry Vite
  - `src/App.vue` — root SFC
  - `src/components/` — Vue SFC components (`Navbar.vue`, `CardItem.vue`, `FormInput.vue`, `Login.vue`, `Footer.vue`)
  - `src/services/` — service logic (auth, API helpers) (`auth.js`)
  - `src/styles/` — Tailwind/CSS entry (`index.css`)
- `server/` — server-side files (Express proxy, auth)
  - `server/server.js` — Express server (auth, proxy)
  - `server/sessions.json` — persisted sessions (ignored in VCS)

Deprecated JS components moved to `archive/` for history.

Lanjutkan dengan menjalankan `npm install` lalu `npm run server` dan `npm run dev` (di terminal terpisah) untuk memulai server dan dev frontend.

---

Menjalankan dengan Node (Express) + proxy ke MockAPI ✅

Untuk pengembangan (direkomendasikan):

1. Install dependensi:

   npm install

2a. Jalankan server API/proxy (Express) di terminal pertama:

   npm run server

   Server akan berjalan di http://localhost:3000 dan mem-proxy semua request `/api/*` ke MockAPI.

2b. Jalankan frontend dev server (Vite) di terminal kedua:

   npm run dev

   Vite dev server akan berjalan di http://localhost:5173 dan mem-proxy `/api` ke http://localhost:3000 (lihat `vite.config.js`).

Untuk produksi / preview build:

- Build: `npm run build` (membuat folder `dist`)
- Preview (Vite): `npm run preview` (opsional)
- Atau jalankan server Express untuk serve `dist`: `npm start` — server akan menyajikan folder `dist` jika ada.

Catatan: file `server.js` di root adalah server Express yang melakukan proxy dari `/api/*` ke `https://697b85bd0e6ff62c3c5c53d4.mockapi.io/` dan juga menyediakan endpoint auth (`/auth/login`). Pastikan Anda memanggil endpoint menggunakan path yang dimulai dengan `/api/` (aplikasi sudah diatur demikian).

Admin & Autentikasi
- Default admin dibuat otomatis saat server dijalankan: **username**: `bemis`, **password**: `L1nux3r`.
- Password disimpan dalam bentuk hashed (bcrypt) pada resource `/admin` di MockAPI.
- Login dilakukan melalui endpoint `POST /auth/login` (body: `{ "username", "password" }`) — server akan memverifikasi password yang di-hash dengan MockAPI.
- Setelah login berhasil server mengeluarkan token (selama 1 jam). Frontend menyimpan token dan mengirimkan header **`x-admin-username`** dan **`x-admin-token`** pada request POST/PUT/DELETE ke `/api/Menu`.
- Session token sekarang dipersist ke file `sessions.json` pada server sehingga token dapat bertahan setelah restart server selama belum kedaluwarsa.
- Ini meningkatkan keamanan dibanding memverifikasi password di frontend, tetapi masih untuk demo saja; gunakan solusi otentikasi yang lebih matang (HTTPS, token signing, refresh tokens) untuk produksi.