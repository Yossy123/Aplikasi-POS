# 🚀 Simple POS Backend

Backend API for the **Simple POS** application, built with **Laravel 12**. This project provides a secure, scalable, and stateless REST API to support Point of Sale (POS) operations, including authentication, product management, transactions, and payment processing.

---

## ✨ Features

* 🔐 **Stateless REST API** – Designed for high performance and scalability.
* 🛡️ **Laravel Sanctum Authentication** – Secure token-based authentication.
* 🏗️ **Clean Architecture** – Implements the **Controller → Service → Repository** pattern for better maintainability.
* 💳 **Extensible Payment System** – Uses the **Strategy Design Pattern** to support multiple payment methods such as Cash and QRIS.
* 👥 **Role-Based Access Control (RBAC)** – Restricts access based on user roles (Admin & Cashier).
* 📦 **RESTful API** – Standardized endpoints for seamless frontend integration.

---

## 🛠️ Technology Stack

| Technology     | Version         |
| -------------- | --------------- |
| Framework      | Laravel 12      |
| Language       | PHP 8.3+        |
| Database       | MySQL           |
| Authentication | Laravel Sanctum |

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Navigate to the Backend Directory

```bash
cd backend
```

### 3. Install Dependencies

```bash
composer install
```

### 4. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

Update your database configuration in the `.env` file:

```env
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5. Run Database Migration & Seeder

```bash
php artisan migrate:fresh --seed
```

### 6. Start the Development Server

```bash
php artisan serve --port=8000
```

The API will be available at:

```text
http://127.0.0.1:8000
```

---

## 🔑 Default Credentials

After running the database seeder, you can log in using the default accounts provided by the seeder.

| Role    | Email                  | Password               |
| ------- | ---------------------- | ---------------------- |
| Admin   | *(see DatabaseSeeder)* | *(see DatabaseSeeder)* |
| Cashier | *(see DatabaseSeeder)* | *(see DatabaseSeeder)* |

> Update this table according to the credentials defined in your `DatabaseSeeder`.

---

## 📂 Project Structure

```
app/
├── Http/
│   └── Controllers/
├── Services/
├── Repositories/
├── Models/
└── Strategies/
    └── Payments/
```

---

## 📜 License

This project is developed for educational purposes and as part of the **Simple POS** application.
