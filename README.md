# 🛒 Aplikasi Kasir

Aplikasi Kasir adalah sistem **Point of Sale (POS)** berbasis web yang dirancang untuk memudahkan pengelolaan transaksi penjualan, inventaris produk, dan manajemen pengguna. Proyek ini dikembangkan dengan arsitektur yang terstruktur sehingga mudah dipelihara, dikembangkan, dan diintegrasikan dengan fitur-fitur baru.

---

## 🚀 Fitur Utama

* 📦 **Manajemen Produk**
  CRUD produk untuk mengelola data inventaris secara lengkap.

* 👤 **Manajemen Pengguna**
  Sistem autentikasi dengan dukungan **Role-Based Access Control (RBAC)**, seperti **Admin** dan **Kasir**.

* 💳 **Sistem Transaksi**
  Proses transaksi penjualan yang cepat, mudah, dan akurat.

* 💰 **Multi-Metode Pembayaran**
  Mendukung berbagai metode pembayaran, seperti **Cash** dan **QRIS**.

* 🏗️ **Arsitektur Clean Code**
  Menggunakan **Service–Repository Pattern** untuk meningkatkan maintainability, scalability, dan kemudahan pengembangan.

---

## 🛠️ Teknologi yang Digunakan

### Backend

* Laravel *(versi menyesuaikan)*
* PHP

### Frontend

* React

### Database

* MySQL

### Build Tools

* Vite

---

## 📦 Instalasi

### Prasyarat

Pastikan perangkat Anda telah terpasang:

* PHP **8.2** atau lebih baru
* Composer
* Node.js & NPM
* MySQL

### 1. Clone Repository

```bash
git clone https://github.com/Yossy123/Aplikasi-POS.git
cd "aplikasi kasir"
```

### 2. Setup Backend (Laravel)

```bash
cd backend

cp .env.example .env

# Konfigurasi database pada file .env

composer install

php artisan key:generate

php artisan migrate --seed

php artisan serve
```

### 3. Setup Frontend

```bash
cd ../frontend

npm install

npm run dev
```

---

## 📂 Struktur Proyek

```text
Aplikasi-POS/
├── backend/     # Laravel Application (API & Business Logic)
├── frontend/    # Frontend Application (User Interface)
└── README.md
```

---

## 🌿 Branch

| Branch     | Deskripsi             |
| ---------- | --------------------- |
| `main`     | Branch utama          |
| `frontend` | Pengembangan frontend |
| `backend`  | Pengembangan backend  |

---

## 🤝 Kontribusi

Kontribusi selalu terbuka.

1. Fork repository.
2. Buat branch baru sesuai fitur yang dikembangkan.
3. Commit perubahan.
4. Push ke repository Anda.
5. Ajukan Pull Request.

---

<div align="center">

Dibuat dengan ❤️ oleh **Yossy Indra Kusuma**

</div>
