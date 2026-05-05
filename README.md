# Smart Bite — AI-Powered Food Delivery Platform

Smart Bite is a full-stack, AI-powered food delivery web application built with modern technologies. It combines seamless ordering, intelligent recommendations, and a complete restaurant discovery system to deliver a premium user experience similar to top platforms like Zomato and Swiggy.

---

## Features

### Core Features

* Full cart system with Redux Toolkit
* JWT authentication with OTP email verification
* Razorpay payment integration (UPI, Cards, Wallets)
* Order receipt emails via Nodemailer
* Real-time order tracking with auto-advance timeline
* Admin panel — manage orders, menu, users
* Fully responsive dark UI
* restaurent listing

---

### Restaurant Discovery System (NEW 🚀)

* Complete restaurant listing system
* Advanced filtering:

  * Cuisine
  * Rating
  * Delivery time
* Real-time search functionality
* Restaurant detail pages with full menu browsing
* Category-based food exploration
* Add-to-cart directly from menu

---

###  UI/UX Experience

* Modern Zomato/Swiggy-inspired design
* Smooth animations using Framer Motion
* Skeleton loading states
* Error & empty state handling
* Mobile-first responsive design (4 breakpoints)
* Touch-friendly interactions

---

### AI Features

* Integrated AI chatbot (Gemini API)
* Smart food suggestions (extensible to mood-based recommendations)
* Personalized user experience (based on future enhancements)
* you can got  a recomendation from ai and order it throught the help of ai.
* even when user feel confuse ai suggest a food from menu list.user easily interact with them
---

## Tech Stack

### Frontend

* React.js
* Redux Toolkit
* Framer Motion
* Reactstrap

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose

### Authentication

* JWT + bcrypt
* OTP verification via Nodemailer

### Payments

* Razorpay Payment Methods

---

## Restaurant System Overview

* 7 REST API endpoints (CRUD + Search + Filter)
* Advanced query filtering & sorting
* Scalable MongoDB schema
* Redux-based state management
* API service abstraction layer

### Sample Restaurants Included

* Pizzeria Bella (Italian) ⭐ 4.8
* Spice Route (Indian) ⭐ 4.6
* Dragon Wok (Chinese) ⭐ 4.5
* Taco Fiesta (Mexican) ⭐ 4.4
* Sushi Paradise (Japanese) ⭐ 4.7
* Burger Barn (American) ⭐ 4.3

---

## Setup Guide

### 1. Clone Repository

```bash
git clone https://github.com/jay0237/SmartBite.git
cd SmartBite
```

---

### 2. Frontend Setup

```bash
npm install
cp .env.example .env.local
npm start
```

---

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

---

### 4. Seed Restaurant Data

```bash
curl -X POST http://localhost:5001/api/admin/seed-restaurants
```

---

### 5. Access App

```
Frontend: http://localhost:3000
Restaurants: http://localhost:3000/restaurants
```

---

## 🔑 Environment Variables

Refer to:

* `.env.example`
* `backend/.env.example`

Required services:

* MongoDB Atlas
* Razorpay API Keys
* Gmail App Password (for Nodemailer)

---

## 📁 Project Stats

* 3000+ lines of code
* 21+ new files
* 7 API endpoints
* Fully documented system
* Production-ready architecture

---

## 🎯 Key Highlights

✔ Advanced restaurant discovery system
✔ Real-time search & filtering
✔ AI-powered chatbot integration
✔ Scalable backend architecture
✔ Clean and modern UI/UX
✔ Fully responsive design

---

## Future Enhancements

* Mood-based AI food recommendations
* Live delivery tracking (maps integration)
* Wallet & rewards system
* Reviews & ratings system
* Vendor dashboard for restaurants

---

## Author

**Jay Joshi**
Computer Engineering Student | Full-Stack Developer | UI/UX Enthusiast

---

## Note

This project is built as a **production-ready full-stack application** showcasing real-world architecture, scalable design, and modern UI/UX practices.

---

If you like this project, consider giving it a star on GitHub!
