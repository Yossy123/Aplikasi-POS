# 🚀 Simple POS Frontend

Frontend application for the **Simple POS** system, built with **React.js** and **Vite**. This project provides a modern, responsive, and user-friendly interface for managing Point of Sale (POS) operations, including product management, transactions, authentication, and receipt printing.

---

## ✨ Features

* 🖥️ **Responsive Interface** – Optimized for desktop and touchscreen devices.
* ⚡ **Real-Time POS Experience** – Fast product search, quick cart management, and stock validation.
* 🧾 **Receipt Printing** – Supports thermal printer printing and PDF receipt generation.
* 🎨 **Modern UI** – Built with Tailwind CSS for a clean and responsive design.
* 🔐 **Authentication** – Secure login integrated with the Laravel Sanctum backend.
* 🔄 **REST API Integration** – Communicates seamlessly with the Laravel backend using Axios.

---

## 🛠️ Technology Stack

| Technology  | Version            |
| ----------- | ------------------ |
| Framework   | React.js           |
| Build Tool  | Vite               |
| Styling     | Tailwind CSS v4    |
| Routing     | React Router       |
| HTTP Client | Axios              |
| Libraries   | html2canvas, jsPDF |

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Navigate to the Frontend Directory

```bash
cd frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

Create a `.env` file in the project root and configure the backend API URL.

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

## 📂 Project Structure

```text
src/
├── assets/
├── components/
├── layouts/
├── pages/
├── services/
├── hooks/
├── context/
├── routes/
└── utils/
```

---

## 🔗 Backend Requirement

This frontend depends on the **Simple POS Backend** API.

Before running the frontend, make sure the Laravel backend is running:

```bash
php artisan serve --port=8000
```

and the API base URL in your `.env` matches the backend address.

---

## 📜 License

This project is developed for educational purposes and as part of the **Simple POS** application.
