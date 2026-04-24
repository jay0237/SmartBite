Smart Bite — Food Delivery Platform

A full-stack food delivery web app built with React, Node.js, Express, and MongoDB.

Features

- Full cart system with Redux
- JWT authentication with OTP email verification
- Razorpay payment integration (UPI, Cards, Wallets)
- Order receipt emails via Nodemailer
- Real-time order tracking with auto-advance timeline
- Admin panel — manage orders, menu, users
- Fully responsive dark UI
- Integrated AI Chatbot System(with Gemini API)

Tech Stack

Frontend: React, Redux Toolkit, Framer Motion, Reactstrap  
Backend: Node.js, Express, MongoDB (Atlas), Mongoose  
Auth:** JWT + bcrypt + OTP via Nodemailer  
Payments: Razorpay  

Setup Guidence:

### 1. Clone the repo
```bash
git clone https://github.com/jay0237/SmartBite.git
cd SmartBite
```

### 2. Frontend setup
```bash
npm install
cp .env.example .env.local
# Fill in your values in .env.local
npm start
```

### 3. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run seed    # Seeds DB with admin + products
npm run dev     # Starts API on port 5001
```

### 4. Default admin credentials
```
Email: admin@smartbite.com
Password: admin123
```

##  Environment Variables

See `.env.example` and `backend/.env.example` for required variables.

- **MongoDB Atlas** — [cloud.mongodb.com](https://cloud.mongodb.com)
- **Razorpay** — [razorpay.com](https://razorpay.com) → Settings → API Keys
- **Gmail App Password** — Google Account → Security → App Passwords
