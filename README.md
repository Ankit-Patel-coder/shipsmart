<div align="center">

<img src="https://img.shields.io/badge/ShipSmart-Meesho%20Image%20Optimiser-e84c3d?style=for-the-badge&logoColor=white" />

# 🚀 ShipSmart — Meesho Image Optimiser

**Upload one product image. Get 12 shipping-optimised variants instantly.**
Built specifically for Meesho sellers to reduce shipping charges automatically.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-shipsmart--virid.vercel.app-e84c3d?style=flat-square)](https://shipsmart-virid.vercel.app)
[![Backend](https://img.shields.io/badge/API-Railway-blueviolet?style=flat-square)](https://railway.app)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 What is ShipSmart?

Meesho calculates shipping charges using **volumetric weight**:

```
Volumetric Weight = (Length × Width × Height) ÷ 5000
```

A white-background, square **1080×1080 px** image under **200 KB** signals a compact, standard product to Meesho's system — keeping you in the **lowest shipping slab** and saving **₹20–35 per order**.

ShipSmart automates this entire process:
1. Upload any product photo
2. AI removes the background
3. Get 12 perfectly optimised variants
4. Each variant shows a Shipping Score (0–100)
5. Pick the best one and list on Meesho

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎨 **AI Background Removal** | Removes messy backgrounds using Remove.bg API |
| 📦 **12 Variants Generated** | Different crops, brightness, colours, and compressions |
| 📊 **Shipping Score (0–100)** | Each variant scored for Meesho shipping optimisation |
| 💾 **Download JPG / ZIP** | Download individual images or all 12 as a ZIP |
| 📤 **Bulk Upload** | Upload up to 20 products at once |
| 👤 **User Accounts** | Register, login, upload history, profile |
| 💳 **Razorpay Payments** | Subscription plans with Razorpay integration |
| 📱 **Fully Responsive** | Works on mobile, tablet, and desktop |

---

## 🖼️ The 12 Variants Explained

| # | Variant | Description |
|---|---|---|
| 1 | **Meesho Standard** | White BG · 1080×1080 · Centred |
| 2 | **Ultra Compressed** | Smallest file · Max compression |
| 3 | **Bright & Vivid** | Brightness +30% · Saturation +15% |
| 4 | **High Contrast** | Contrast boost · Product edges pop |
| 5 | **Colour Vivid** | Saturation +50% · Rich colours |
| 6 | **Close Crop** | Zoomed 20% · Product fills frame |
| 7 | **Wide Padding** | Extra whitespace · Category-safe |
| 8 | **Warm Natural** | Warm tone · Great for apparel |
| 9 | **Cool Studio** | Cool tone · Great for electronics |
| 10 | **Sharp Detail** | Enhanced sharpness · Texture clarity |
| 11 | **Soft Apparel** | Gentle processing · Ideal for fabric |
| 12 | **Listing Mini** | 800px · Mobile-first · Fast-load |

---

## 📊 Shipping Score Algorithm

Each variant is scored out of **100 points**:

```
+35 pts → File size under 80 KB     (prevents Meesho auto-resize)
+20 pts → White background           (avoids oversized category)
+20 pts → Square 1:1 ratio           (signals compact packaging)
+20 pts → Exact 1080×1080 px         (Meesho recommended spec)
+5 pts  → Proper brightness          (reduces returns)

Score 85-100 → 0-500g slab  → ₹20-35 saved per order
Score 70-84  → 500g-1kg     → ₹10-20 saved per order
Score 55-69  → 1-2kg slab   → ₹0-10 saved per order
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — Fast modern frontend
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Smooth animations
- **TanStack Query** — Server state management
- **Zustand** — Client state management
- **React Dropzone** — Drag & drop uploads

### Backend
- **Node.js** + **Express** — REST API server
- **Sharp.js** — Server-side image processing
- **Prisma ORM** — Database management
- **PostgreSQL** — Production database (hosted on Railway)
- **Multer** — File upload handling
- **JWT + bcrypt** — Authentication

### Image Storage
Images are stored as **base64 data URLs** directly in PostgreSQL.
This means:
- ✅ Zero external storage service needed
- ✅ Works perfectly on Railway free tier
- ✅ No Cloudflare, no S3, no AWS needed
- ✅ Simple and reliable for getting started

### Integrations
- **Remove.bg API** — AI background removal
- **Razorpay** — Indian payment gateway

### Hosting
- **Vercel** — Frontend (free tier)
- **Railway** — Backend + PostgreSQL (free tier)

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
Make sure you have these installed:
- [Node.js v18+](https://nodejs.org) — JavaScript runtime
- [Git](https://git-scm.com) — Version control

### Step 1 — Clone the repository
```bash
git clone https://github.com/Ankit-Patel-coder/shipsmart.git
cd shipsmart
```

### Step 2 — Install dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

### Step 3 — Get your API keys (all free)

| Service | Where to get | Free tier |
|---|---|---|
| **Remove.bg** | https://www.remove.bg/api | 50 images/day free |
| **Razorpay** | https://razorpay.com → API Keys | Free test keys |
| **Railway PostgreSQL** | https://railway.app | Free tier available |

### Step 4 — Set up environment files

**Backend** — create `backend/.env`:
```env
DATABASE_URL="your_postgresql_url_from_railway"
JWT_SECRET="any_random_string_minimum_32_characters"
REMOVEBG_API_KEY="your_remove_bg_key"
RAZORPAY_KEY_ID="rzp_test_your_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="any_random_string"
STORAGE_DRIVER="local"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT=5000
```

> ⚠️ Never commit your `.env` file — it's already in `.gitignore`

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
```

### Step 5 — Set up the database
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### Step 6 — Run the app

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# ✅ Running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# ✅ Running at http://localhost:5173
```

Open **http://localhost:5173** in your browser 🎉

---

## 🌐 Deployment Guide (Free Hosting)

This project is deployed completely free using:
- **Railway** for backend + PostgreSQL database
- **Vercel** for frontend

### Deploy Backend to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo → set **Root Directory** to `backend`
4. Add a **PostgreSQL** database from Railway dashboard
5. Go to **Variables** tab → add these:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your_random_secret_here
REMOVEBG_API_KEY=your_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_secret
STORAGE_DRIVER=local
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
```

6. Go to **Settings** → set **Start Command**:
```
npm run db:deploy && npm start
```
7. Railway auto-deploys on every push ✅

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `VITE_API_URL` = `https://your-railway-url.up.railway.app/api`
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay test key
4. Click **Deploy** ✅

---

## 📁 Project Structure

```
shipsmart/
├── backend/                         # Node.js + Express API
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── src/
│   │   ├── config/index.js          # All environment config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Register, login, JWT
│   │   │   ├── image.controller.js  # Upload, variants, download
│   │   │   ├── payment.controller.js# Razorpay orders & verification
│   │   │   └── user.controller.js   # Profile, dashboard stats
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── upload.middleware.js # Multer file handling
│   │   │   └── rateLimit.middleware.js
│   │   ├── routes/                  # Express routers
│   │   ├── services/
│   │   │   ├── image.service.js     # ⭐ Core: 12 variant generation
│   │   │   ├── removebg.service.js  # AI background removal
│   │   │   ├── razorpay.service.js  # Payment processing
│   │   │   └── storage.service.js   # Base64 / local storage
│   │   └── utils/
│   │       ├── score.js             # ⭐ Shipping score algorithm
│   │       ├── jwt.js               # Token helpers
│   │       └── response.js          # API response helpers
│   ├── .env.example                 # Example env file (no real keys)
│   ├── railway.toml                 # Railway deployment config
│   └── package.json
│
└── frontend/                        # React + Vite app
    ├── src/
    │   ├── components/
    │   │   ├── layout/Layout.jsx    # Sidebar navigation
    │   │   ├── ui/                  # ScoreBadge, Skeleton
    │   │   ├── upload/              # DropZone, ProcessingProgress
    │   │   └── variants/            # VariantCard with lightbox
    │   ├── context/authStore.js     # Zustand auth state
    │   ├── lib/
    │   │   ├── api.js               # Axios client + all endpoints
    │   │   └── razorpay.js          # Razorpay checkout helper
    │   └── pages/
    │       ├── LandingPage.jsx      # Public landing page
    │       ├── LoginPage.jsx
    │       ├── RegisterPage.jsx
    │       ├── DashboardPage.jsx    # Stats + recent uploads
    │       ├── UploadPage.jsx       # Single + bulk upload
    │       ├── UploadDetailPage.jsx # 12-variant grid view
    │       ├── HistoryPage.jsx      # All uploads history
    │       ├── PricingPage.jsx      # Plans + Razorpay payment
    │       └── ProfilePage.jsx      # Account + password settings
    ├── .env.example
    ├── vercel.json
    └── package.json
```

---

## 🔌 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Create new account |
| POST | `/api/auth/login` | ❌ | Login, get JWT token |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/images/upload` | ✅ | Upload single image → 12 variants |
| POST | `/api/images/upload-bulk` | ✅ | Upload up to 20 images |
| GET | `/api/images` | ✅ | List all uploads (paginated) |
| GET | `/api/images/:id` | ✅ | Get upload + all 12 variants |
| GET | `/api/images/:id/download` | ✅ | Download ZIP of all variants |
| DELETE | `/api/images/:id` | ✅ | Delete upload |
| GET | `/api/payment/plans` | ❌ | Get all plan details |
| POST | `/api/payment/initiate` | ✅ | Create Razorpay order |
| POST | `/api/payment/verify` | ✅ | Verify payment + activate plan |
| POST | `/api/payment/webhook` | ❌ | Razorpay webhook handler |
| GET | `/api/user/profile` | ✅ | Get profile + quota |
| PUT | `/api/user/profile` | ✅ | Update name |
| PUT | `/api/user/change-password` | ✅ | Change password |
| GET | `/api/user/dashboard` | ✅ | Stats + recent uploads |

---

## 💰 Pricing Plans

| Plan | Price | Credits | Best for |
|---|---|---|---|
| **Free** | ₹0 | 10 credits | Try it out |
| **Starter** | ₹499/month | 200 credits/month | Small sellers |
| **Pro** | ₹999/month | 1,000 credits/month | Growing sellers |
| **Unlimited** | ₹1,999/month | Unlimited | Power sellers |

> 1 credit = 1 product image uploaded = 12 optimised variants generated

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Remove.bg](https://remove.bg) — AI background removal API
- [Sharp.js](https://sharp.pixelplumbing.com) — High-performance image processing
- [Razorpay](https://razorpay.com) — Indian payment gateway
- [Railway](https://railway.app) — Simple backend + PostgreSQL hosting
- [Vercel](https://vercel.com) — Frontend hosting
- [Prisma](https://prisma.io) — Next-generation ORM

---

<div align="center">

**Built with ❤️ for Meesho sellers across India**

⭐ If this project helped you, please give it a star on GitHub!

</div>
