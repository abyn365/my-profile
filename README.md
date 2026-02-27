# Abyan's Profile

A personal profile website with an admin panel for managing achievements. Built with Next.js 14 App Router.

## Features

- 🏆 Achievement showcase with year-based grouping
- 🔐 Secure admin panel with JWT authentication
- 🔒 Password hashing with bcrypt (12 salt rounds)
- 📱 Responsive design with dark/light mode
- ⚡ Next.js App Router with Server Components
- 🎨 Animated particles and smooth transitions

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/abyn365/my-profile
cd abyan-profile
npm install
```

### 2. Set Environment Variables

Create `.env.local`:

```
JWT_SECRET=your-strong-random-secret-key
```

Generate a strong secret:
```bash
openssl rand -base64 32
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Setup Admin Account

1. Visit `/admin`
2. Create your admin password (must meet security requirements)
3. Login with your password

### 5. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abyn365/my-profile)

## Enable Persistent Storage (Recommended)

Without persistent storage, achievements reset on each deployment.

1. Go to your Vercel project dashboard
2. Navigate to **Storage** > **Create Database**
3. Select **KV** (Redis)
4. Connect it to your project
5. Redeploy

## API Endpoints

### Public

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Profile page |
| `/api/achievements` | GET | Get all achievements |
| `/admin` | GET | Admin panel |

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/status` | GET | Check if admin is setup |
| `/api/auth/setup` | POST | Create admin account |
| `/api/auth/login` | POST | Login and get JWT token |

### Admin (Requires Authentication)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/achievements` | GET | Get all achievements |
| `/api/admin/achievements` | POST | Add new achievement |
| `/api/admin/achievements` | PUT | Update achievement |
| `/api/admin/achievements` | DELETE | Delete achievement |
| `/api/admin/achievements` | PATCH | Batch update all |

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: 2-hour token expiration
- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Authorization Header**: Bearer token required for admin endpoints
- **Input Validation**: All inputs are validated server-side

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Profile page (Server Component)
│   ├── page.module.css     # Profile styles
│   ├── ProfilePage.tsx     # Profile client component
│   ├── globals.css         # Global styles
│   ├── admin/
│   │   ├── page.tsx        # Admin page
│   │   ├── AdminPanel.tsx  # Admin client component
│   │   └── admin.module.css
│   └── api/
│       ├── achievements/    # Public achievements API
│       ├── auth/
│       │   ├── login/       # Login endpoint
│       │   ├── setup/       # Admin setup endpoint
│       │   └── status/      # Auth status check
│       └── admin/
│           └── achievements/ # Admin CRUD operations
├── lib/
│   ├── auth.ts             # Authentication utilities
│   └── achievements.ts     # Data storage layer
├── data/
│   └── achievements.json   # Initial achievements data
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Authentication**: JWT + bcrypt
- **Storage**: Vercel KV (Redis) with in-memory fallback

## License

GPL-3.0
