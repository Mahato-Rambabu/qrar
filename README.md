# QRAR — Restaurant Ordering SaaS Platform

A multi-tenant SaaS platform enabling restaurants to manage menus, orders, and offers through a centralized system. Built solo from scratch — currently live with **2+ paying restaurant clients**.

🔗 **[Live Demo](https://qrar-lyart.vercel.app)** · **[Dashboard](https://qrar-lyart.vercel.app/dashboard)**

---

## ✨ Features

- **Multi-tenant architecture** — each restaurant gets its own isolated data and custom menu
- **QR-based ordering** — customers scan a QR code to view the menu and place orders instantly
- **Restaurant dashboard** — manage menu items, categories, offers, and incoming orders in real time
- **Secure authentication** — JWT-based auth with role separation (admin vs customer)
- **API security** — rate limiting, CORS policies, and input validation on all endpoints
- **Image management** — Cloudinary integration for scalable menu image storage

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Dashboard | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| Image Storage | Cloudinary |
| Deployment | Vercel (frontend) · Render (backend) · MongoDB Atlas (DB) |

---

## 🏗 Architecture

```
├── Frontend/        # Customer-facing menu & ordering UI (React)
├── Dashboard/       # Restaurant admin panel (React)
├── Backend/         # REST API server (Node/Express)
│   ├── routes/      # API route handlers
│   ├── models/      # MongoDB schemas
│   ├── middleware/  # Auth, rate limiting, validation
│   └── controllers/ # Business logic
```

---

## 🔐 Security Implementation

- JWT authentication with token expiry and refresh logic
- Rate limiting on all public API endpoints to prevent abuse
- CORS configured per tenant domain
- Input sanitization and validation on all POST/PUT routes

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### Installation

```bash
# Clone the repo
git clone https://github.com/Mahato-Rambabu/qrar.git
cd qrar

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install

# Install dashboard dependencies
cd ../Dashboard
npm install
```

### Environment Variables

Create a `.env` file in the `Backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=5000
```

### Run Locally

```bash
# Start backend
cd Backend && npm run dev

# Start frontend (new terminal)
cd Frontend && npm run dev

# Start dashboard (new terminal)
cd Dashboard && npm run dev
```

---

## 👤 Author

**Rambabu Mahato**  
[Portfolio](https://personal-portfolio-ten-psi-52.vercel.app/) · [LinkedIn](https://linkedin.com/in/mahatorambabu) · [GitHub](https://github.com/Mahato-Rambabu)

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
