# 💳 PayNest – Full Stack Digital Payment & Chat Platform

PayNest is a full-stack MERN application that combines **digital payments, real-time chat, and admin control systems** into one powerful platform. It simulates a modern fintech ecosystem with secure transactions and live communication.

---

## 🚀 Features

### 🔐 Authentication

* User Signup & Login (JWT Auth)
* Secure password hashing (bcrypt)

### 💰 Wallet & Transactions

* Send money to users
* Real-time balance updates
* Transaction history (Sent & Received)

### 💬 Real-Time Chat

* One-to-one messaging using Socket.IO
* Persistent chat (stored in MongoDB)
* Emoji support & file attachments
* Messages remain after refresh

### 🛡️ Admin Panel

* View all users
* Block / Unblock users
* Delete users
* Role management (User ↔ Admin)
* Fraud detection (suspicious transactions)
* Transaction approval system

### 📊 Analytics Dashboard

* User growth tracking
* Transaction insights
* Export data (CSV)

---

## 🛠️ Tech Stack

### Frontend (FE)

* React (Vite)
* Tailwind CSS
* Axios

### Backend (BE)

* Node.js
* Express.js
* MongoDB (Atlas)
* Mongoose

### Real-Time

* Socket.IO

---

## 📂 Project Structure

```
PayNest/
│
├── fe/        # Frontend (React)
├── be/        # Backend (Node + Express)
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repo

```bash
git clone https://github.com/your-username/paynest.git
cd paynest
```

---

### 2️⃣ Backend Setup

```bash
cd be
npm install
```

Create `.env` file:

```env
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret
PORT=5002
```

Run backend:

```bash
node server.js
```

---

## 🧪 Testing

* Open two browsers (Chrome + Incognito)
* Login with different users
* Test:

  * Chat (real-time)
  * Send money
  * Transactions

---

## 🔥 Future Enhancements

* ✅ Typing indicator
* ✅ Seen / Delivered status
* ✅ Group chat
* ✅ Push notifications
* ✅ Payment gateway integration

---

## 👩‍💻 Author

**Sahithya Hegde**

---
