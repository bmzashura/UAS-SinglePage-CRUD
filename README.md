# UAS - SPA Manajemen Menu (Rumah Makan Padang)

Prototype Single Page Application (SPA) menggunakan Vue 3 (CDN) + Tailwind CSS (Play CDN). Aplikasi ini adalah *mock* CRUD (data disimpan in-memory) untuk keperluan UI dan demonstrasi fitur.


## Cara Install & Menjalankan

### 1. Install Dependensi

```bash
npm install
```

### 2. Jalankan Mode Development (Frontend & Backend Sekaligus)

```bash
npm run dev:all
```

Script ini akan otomatis menjalankan backend (Express, port 3000) dan frontend (Vite, port 5173) secara paralel. Anda cukup membuka http://localhost:5173 di browser.

### Alternatif Manual (Jika ingin terminal terpisah)

Terminal 1:
```bash
npm run server
```
Terminal 2:
```bash
npm run dev
```

### Build & Preview (Opsional untuk produksi)

```bash
npm run build
npm run preview
```

Untuk produksi, jalankan `npm start` (Express akan serve folder `dist`).

## Fitur yang telah disediakan

- Tampilan responsif dengan Tailwind CSS ✅
- Komponen modular: `Navbar`, `CardItem`, `FormInput`, `Footer` ✅
- Mock CRUD (Tambah, Edit, Hapus) — terhubung ke MockAPI endpoint (CRUD via network) ✅

**Endpoint:** `https://697b85bd0e6ff62c3c5c53d4.mockapi.io/Menu` (data dimuat saat aplikasi dibuka)


## Struktur Folder & File Penting

```
UAS-SinglePage-CRUD/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.cjs
├── postcss.config.cjs
├── src/
│   ├── App.vue                # Root Vue SFC
│   ├── main.js                # Entry point Vite
│   ├── styles/
│   │   └── index.css          # Tailwind CSS entry
│   ├── components/
│   │   ├── Navbar.vue         # Header & branding
│   │   ├── CardItem.vue       # Kartu menu makanan/minuman
│   │   ├── FormInput.vue      # Form tambah/edit menu
│   │   ├── Footer.vue         # Footer aplikasi
│   │   └── Ornament.vue       # Ornamen SVG dekoratif
│   └── services/
│       └── imgbb.js           # Helper upload gambar ke ImgBB (via server proxy)
├── server/
│   ├── server.js              # Express server (proxy, upload, fallback)
│   ├── menu-store.js          # Fallback penyimpanan menu lokal (JSON)
│   └── data/
│       └── menu.json          # Data menu lokal (fallback)
├── image/
│   └── logo.png               # Logo aplikasi
└── README.md
```

## Arsitektur Aplikasi

- **Frontend:** Vue 3 (SFC), Vite, Tailwind CSS.
  - Komponen utama: Navbar, CardItem, FormInput, Footer, Ornament.
  - State dikelola dengan `reactive`/`ref` (tanpa Vuex).
  - Upload gambar: file diubah ke base64, dikirim ke backend (`/upload`), backend mengunggah ke ImgBB, URL disimpan ke MockAPI.
  - Fallback: Jika MockAPI gagal, data menu disimpan/diambil dari file lokal (`server/data/menu.json`).

- **Backend:** Node.js + Express.
  - Proxy endpoint `/api/*` ke MockAPI.
  - Endpoint `/upload` untuk upload gambar ke ImgBB (menghindari expose API key di frontend).
  - Fallback CRUD: Jika MockAPI down, operasi CRUD dilakukan ke file lokal.
  - CORS diaktifkan untuk pengembangan.

- **Build Tools:** Vite (dev server, build), Tailwind CSS (utility-first styling), Nodemon (dev server backend).

---

Tidak ada autentikasi, aplikasi bersifat publik.
Semua perubahan menu langsung tersimpan ke MockAPI (atau fallback ke file lokal jika offline).
Logo dan tema warna menyesuaikan branding Rumah Makan Padang (maroon/emas).
Untuk upload gambar, gunakan file PNG/JPG, atau masukkan URL gambar langsung.

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

Catatan: server entry adalah `server/server.js` (Express) — ia mem-proxy `/api/*` ke MockAPI. Aplikasi CRUD sekarang bersifat publik (tidak memerlukan login) sehingga Anda dapat membuat, memperbarui, dan menghapus menu secara langsung.

Data Schema (required fields)
- Setiap item `Menu` harus memenuhi skema berikut:
  - `nama` (String) — nama menu
  - `harga` (Number) — harga dalam Rupiah
  - `kategori` (String) — kategori menu
- `foto` (String) — URL ke foto (opsional, tapi disarankan); aplikasi menyediakan upload gambar ke ImgBB dan menyimpan URL hasil upload ke MockAPI.
- `isReady` (Boolean) — status ketersediaan (true = tersedia)

Catatan: MockAPI akan menyimpan fields seperti dikirim. Saat menambah/ubah item, Anda dapat memasukkan URL gambar langsung atau pilih file untuk diunggah — aplikasi akan mengunggah file ke ImgBB dan menggunakan URL yang dikembalikan.