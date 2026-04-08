# FoodieDelight - Full-Stack Food Ordering Platform

FoodieDelight is a comprehensive, modern web application built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides a complete ecosystem for food ordering, supporting three distinct user roles: **Admins**, **Restaurant Partners**, and standard **Customers**.

## Project Live Link

Click 👉 https://foodie-delight-chi.vercel.app

## 🌟 Key Features

### User Features (Customers)
*   **Secure Authentication:** Email OTP verification during registration, secure login, and "Forgot Password" functionality via email reset links.
*   **Modern Menu Browsing:** Beautiful, responsive UI with a glassmorphism design. Includes filtering (Veg/Non-Veg, categories) and animated interactions.
*   **Cart & Checkout:** Persistent shopping cart, shipping address management, and seamless order placement.
*   **Order Management:** Track order statuses (Pending, Preparing, Out for Delivery, Delivered, Rejected) in real-time.
*   **Flexible Cancellations:** Customers can cancel their orders within a 5-minute grace period after placing them.

### Restaurant Partner Features
*   **Partner Onboarding:** Potential restaurants can submit an application with supporting details and documents (PDFs, images) to become a partner.
*   **Dedicated Dashboard:** A private workspace to manage their specific menu items and incoming orders.
*   **Menu Control:** Add, edit, delete, or temporarily toggle food availability ("Mark Unavailable") so customers cannot order out-of-stock items.
*   **Order Fulfillment:** Update order statuses as they progress (Preparing, Out for Delivery) or explicitly "Reject" an order if unable to fulfill it.

### Admin Features
*   **Global Dashboard:** A supreme control panel to oversee the entire platform.
*   **Application Management:** Review, approve, or reject incoming Restaurant Partner applications. Rejections securely email the applicant with the specific reason (e.g., "Documents illegible").
*   **Global Food Control:** View all foods on the platform, precisely filtered by category or specific Restaurant owner. Admins can edit, delete, or quickly "Mark Unavailable" any item platform-wide. Bulk import foods via CSV/Excel.
*   **Global Order Oversight:** Monitor all platform orders, update statuses manually if needed, and export Order Data to Excel (.xlsx) for reporting.

## 🛠️ Tech Stack

*   **Frontend:** React.js, React Router, Context API (State Management), Framer Motion (Animations), React Toastify (Notifications), Axios.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB, Mongoose ORM.
*   **Authentication & Security:** JSON Web Tokens (JWT), Bcrypt.js (Password Hashing), Crypto (OTP generation).
*   **File Uploads:** Multer (Local storage for partner application documents and image references).
*   **Emails:** Nodemailer (SMTP transport for OTPs, password resets, and approval/rejection notices).

## 📁 System Architecture & Directory Structure

```text
food-ordering-system/
├── backend/                  # Express/Node API Environment
│   ├── config/               # Database connection strings (db.js)
│   ├── controllers/          # Business logic (authController, foodController, etc.)
│   ├── middleware/           # System Gatekeepers (protect, adminAuth, multer uploads)
│   ├── models/               # Mongoose schemas (User.js, Food.js, Order.js, Application.js)
│   ├── routes/               # Express endpoints (authRoutes, foodRoutes, etc.)
│   ├── uploads/              # Local storage for partner documents and assets
│   ├── .env                  # Deeply sensitive backend variables
│   └── server.js             # Root application bootstrap file
│
└── frontend/                 # React UI Environment
    ├── src/
    │   ├── components/       # Reusable UI architecture (FoodCard, Navbar, Modals)
    │   ├── context/          # State managers (AuthContext, CartContext)
    │   ├── pages/            # View architecture (Home, AdminDashboard, Login)
    │   ├── App.jsx           # Master layout wrapper and router definitions
    │   └── main.jsx          # React DOM injection point
```

---

## 🚀 Getting Started

Follow these instructions to run the project locally on your machine.

### Prerequisites
*   Node.js installed (v16+)
*   MongoDB instance (Local or Atlas)
*   An SMTP Email account (e.g., Gmail with App Passwords enabled) for testing emails.

### 1. Installation

1. Clone or download this repository.
2. Open a terminal and install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Open a second terminal and install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### 2. Environment Variables

Create a **`.env`** file inside the `backend/` directory and configure the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key

# Email Configuration (for OTPs and Notifications)
SMTP_SERVICE=gmail
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_NAME="FoodieDelight"
FROM_EMAIL=your_email@gmail.com
```

Create a **`.env`** file inside the `frontend/` directory and configure following:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Running the Application

1. **Start the Backend Server (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```
   *(Runs on http://localhost:5000)*

2. **Start the Frontend Client (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```
   *(Runs on http://localhost:5173)*

### 4. Creating the First Admin
1. Register a standard user account through the frontend UI.
2. Open your MongoDB database (using MongoDB Compass or Mongo Shell).
3. Find your user document in the `users` collection and change the `role` field from `"user"` to `"admin"`.
4. Log back in to access the Admin Dashboard.

---
*Developed with modern web standards, focusing on speed, security, and an exceptional user experience.*
