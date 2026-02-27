# Abyan's Profile

A personal profile website with an admin panel for managing achievements. Built for Vercel deployment.

## Features

- 🏆 Achievement showcase with year-based grouping
- 🔐 Secure admin panel with JWT authentication
- 🔒 Password hashing with bcrypt (12 salt rounds)
- 📱 Responsive design with dark/light mode
- ⚡ Fast serverless API endpoints
- 🎨 Animated particles and smooth transitions

## Quick Start

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/abyan-profile)

### 2. Set Environment Variables

In your Vercel project settings, add:

```
JWT_SECRET=your-strong-random-secret-key
```

Generate a strong secret:
```bash
openssl rand -base64 32
```

### 3. Setup Admin Account

1. Visit `/admin` after deployment
2. Create your admin password (must meet security requirements)
3. Login with your password

### 4. Enable Persistent Storage (Recommended)

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

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Adding Achievements

### Via Admin Panel

1. Go to `/admin`
2. Login with your password
3. Use the form to add new achievements
4. Click on a year to expand/collapse
5. Edit or delete existing achievements

### Via API

```bash
# Login first
TOKEN=$(curl -s -X POST https://your-domain/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}' | jq -r '.token')

# Add achievement
curl -X POST https://your-domain/api/admin/achievements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"year":"2025","achievement":"New Achievement, 1 Januari 2025"}'
```

## File Structure

```
├── api/
│   ├── index.js           # Main profile page
│   ├── achievements.js    # Public achievements API
│   ├── auth/
│   │   ├── login.js       # Login endpoint
│   │   ├── setup.js       # Admin setup endpoint
│   │   └── status.js      # Auth status check
│   ├── admin/
│   │   └── achievements.js # Admin CRUD operations
│   └── lib/
│       ├── auth.js        # Authentication utilities
│       └── achievements.js # Data storage layer
├── data/
│   └── achievements.json  # Initial achievements data
├── public/
│   └── admin.html         # Admin panel UI
├── package.json
├── vercel.json
└── README.md
```

## License

GPL-3.0
