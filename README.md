# ShipSmart — Meesho Image Optimiser

A full-stack production platform for Meesho sellers to upload product images and receive 12 shipping-optimised variants with AI background removal.

---

## Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS            |
| Backend   | Node.js + Express                         |
| Database  | PostgreSQL via Prisma ORM                 |
| Storage   | Cloudflare R2 (S3-compatible) or local    |
| Auth      | JWT (jsonwebtoken + bcrypt)               |
| Images    | Sharp.js + Remove.bg API                  |
| Payments  | Razorpay                                  |
| Hosting   | Vercel (frontend) + Railway (backend)     |

---

## Local Development Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd shipsmart
npm run install:all
```

### 2. Set up PostgreSQL

Option A — local:
```bash
# macOS
brew install postgresql && brew services start postgresql
createdb shipsmart

# Ubuntu/Debian
sudo apt install postgresql
sudo -u postgres createdb shipsmart
```

Option B — Railway (recommended for production):
- Create account at https://railway.app
- New Project → Add Database → PostgreSQL
- Copy the DATABASE_URL from the connect tab

### 3. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
```
DATABASE_URL="postgresql://..."
JWT_SECRET="generate-with: openssl rand -base64 32"
REMOVEBG_API_KEY="get from https://www.remove.bg/api"
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
STORAGE_DRIVER="local"  # use "r2" in production
```

### 4. Configure frontend environment

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

### 5. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 6. Start development servers

```bash
# From the root:
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:5000/api/health
```

---

## Production Deployment

### Backend → Railway

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your repo → set **Root Directory** to `backend`
3. Add a PostgreSQL plugin (Railway provides it free)
4. Set all environment variables in the Railway dashboard:

| Variable                | Value                                |
|-------------------------|--------------------------------------|
| DATABASE_URL            | (auto-set by Railway PostgreSQL)     |
| JWT_SECRET              | (32+ char random string)             |
| REMOVEBG_API_KEY        | (from remove.bg dashboard)           |
| RAZORPAY_KEY_ID         | (rzp_live_... for production)        |
| RAZORPAY_KEY_SECRET     | (from Razorpay dashboard)            |
| RAZORPAY_WEBHOOK_SECRET | (set in Razorpay → Webhooks)         |
| STORAGE_DRIVER          | r2                                   |
| R2_ACCOUNT_ID           | (Cloudflare account ID)              |
| R2_ACCESS_KEY_ID        | (R2 API token)                       |
| R2_SECRET_ACCESS_KEY    | (R2 API token secret)                |
| R2_BUCKET_NAME          | shipsmart-images                     |
| R2_PUBLIC_URL           | https://pub-xxxx.r2.dev              |
| FRONTEND_URL            | https://your-app.vercel.app          |
| NODE_ENV                | production                           |

5. Railway runs `npm run db:deploy && npm start` on deploy (see railway.toml)

Your backend URL will be: `https://your-service.up.railway.app`

### Frontend → Vercel

1. Go to https://vercel.com → New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables:

| Variable              | Value                                     |
|-----------------------|-------------------------------------------|
| VITE_API_URL          | https://your-service.up.railway.app/api   |
| VITE_RAZORPAY_KEY_ID  | rzp_live_xxxxxxxxxxxx                     |

6. Deploy!

---

## Storage: Cloudflare R2 Setup

1. Go to https://dash.cloudflare.com → R2 Storage
2. Create bucket: `shipsmart-images`
3. Settings → Enable public access → copy the public URL
4. Manage R2 API Tokens → Create token with Object Read & Write
5. Add the credentials to Railway env vars

---

## Razorpay Setup

1. Create account at https://razorpay.com
2. Dashboard → Settings → API Keys → Generate test keys
3. For webhooks: Settings → Webhooks → Add
   - URL: `https://your-service.up.railway.app/api/payment/webhook`
   - Events: `payment.failed`, `payment.captured`
   - Secret: set this as RAZORPAY_WEBHOOK_SECRET
4. Switch to Live keys before going live

---

## Project Structure

```
shipsmart/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/index.js        # All env config
│   │   ├── controllers/           # Route handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── image.controller.js
│   │   │   ├── payment.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/            # Auth, upload, rate limit
│   │   ├── routes/                # Express routers
│   │   ├── services/
│   │   │   ├── image.service.js   # Core: 12 variant generation
│   │   │   ├── removebg.service.js# Remove.bg API
│   │   │   ├── razorpay.service.js# Payment processing
│   │   │   └── storage.service.js # R2 / local storage
│   │   └── utils/
│   │       ├── jwt.js
│   │       ├── response.js
│   │       └── score.js           # Shipping score algorithm
│   ├── .env.example
│   ├── package.json
│   └── railway.toml
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/Layout.jsx   # Sidebar navigation
    │   │   ├── ui/                 # ScoreBadge, Skeleton
    │   │   ├── upload/             # DropZone, ProcessingProgress
    │   │   └── variants/           # VariantCard
    │   ├── context/authStore.js    # Zustand auth state
    │   ├── lib/
    │   │   ├── api.js              # Axios client + endpoints
    │   │   └── razorpay.js         # Razorpay checkout helper
    │   └── pages/
    │       ├── LandingPage.jsx
    │       ├── LoginPage.jsx
    │       ├── RegisterPage.jsx
    │       ├── DashboardPage.jsx
    │       ├── UploadPage.jsx      # Single + bulk upload
    │       ├── UploadDetailPage.jsx# 12-variant grid
    │       ├── HistoryPage.jsx
    │       ├── PricingPage.jsx     # Razorpay integration
    │       └── ProfilePage.jsx
    ├── .env.example
    ├── vite.config.js
    └── vercel.json
```

---

## API Endpoints

| Method | Route                          | Auth | Description                  |
|--------|--------------------------------|------|------------------------------|
| POST   | /api/auth/register             | —    | Register new user            |
| POST   | /api/auth/login                | —    | Login, get JWT               |
| GET    | /api/auth/me                   | ✓    | Get current user             |
| POST   | /api/images/upload             | ✓    | Upload single image          |
| POST   | /api/images/upload-bulk        | ✓    | Upload up to 20 images       |
| GET    | /api/images                    | ✓    | List uploads (paginated)     |
| GET    | /api/images/:id                | ✓    | Get upload + all 12 variants |
| GET    | /api/images/:id/download       | ✓    | Download ZIP of all variants |
| DELETE | /api/images/:id                | ✓    | Delete upload                |
| GET    | /api/payment/plans             | —    | Get all plan details         |
| POST   | /api/payment/initiate          | ✓    | Create Razorpay order        |
| POST   | /api/payment/verify            | ✓    | Verify payment + activate    |
| GET    | /api/payment/history           | ✓    | Payment history              |
| POST   | /api/payment/webhook           | —    | Razorpay webhook (raw body)  |
| GET    | /api/user/profile              | ✓    | Full profile + quota         |
| PUT    | /api/user/profile              | ✓    | Update name                  |
| PUT    | /api/user/change-password      | ✓    | Change password              |
| GET    | /api/user/dashboard            | ✓    | Stats + recent uploads       |

---

## Shipping Score Algorithm

Each of the 12 image variants is scored out of 100:

| Factor                    | Points | Reason                                                  |
|---------------------------|--------|---------------------------------------------------------|
| File size < 80 KB         | 35     | Smallest files prevent Meesho's auto-resize             |
| File size 80–150 KB       | 30     | Still well within safe range                            |
| File size 150–200 KB      | 26     | Acceptable                                              |
| White background          | 20     | Avoids "oversized product" category detection           |
| Square 1:1 ratio          | 20     | Signals compact packaging to volumetric estimator       |
| Exact 1080×1080 px        | 20     | Meesho's recommended listing spec                       |
| Proper brightness         | 5      | Reduces returns → lower weighted shipping tier          |

Score 85–100 → Estimated 0–500g slab → ₹20–35 saved per order  
Score 70–84 → 500g–1kg slab → ₹10–20 saved per order  
Score 55–69 → 1–2kg slab → ₹0–10 saved per order

---

## Support

Email: support@shipsmart.in
