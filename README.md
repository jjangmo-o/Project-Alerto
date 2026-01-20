# Project Alerto - Complete Setup Guide

A disaster alert and community management system for Marikina City with real-time hazard monitoring, evacuation center mapping, and community status updates.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Download |
|----------|---------|----------|
| Node.js | v18.x or higher | [nodejs.org](https://nodejs.org/) |
| npm | v9.x or higher | Comes with Node.js |
| pnpm | Latest | `npm install -g pnpm` |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

## 🔑 Required API Keys

You'll need to obtain the following API keys:

1. **Supabase** - Create a project at [supabase.com](https://supabase.com)
   - Project URL
   - Anon Key
   - Service Role Key (for backend)

2. **Mapbox** - Sign up at [mapbox.com](https://www.mapbox.com/)
   - Access Token

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Project-Alerto
```

### 2. Backend Setup

```bash
cd backend
```

#### Install Dependencies

```bash
pnpm install
```

#### Backend Dependencies

| Package | Description |
|---------|-------------|
| `@nestjs/core` | NestJS core framework |
| `@nestjs/common` | NestJS common utilities |
| `@nestjs/config` | Configuration module |
| `@nestjs/platform-express` | Express adapter |
| `@nestjs/websockets` | WebSocket support |
| `@nestjs/platform-socket.io` | Socket.IO adapter |
| `@supabase/supabase-js` | Supabase client |
| `@turf/turf` | Geospatial analysis |
| `axios` | HTTP client |
| `class-validator` | DTO validation |
| `class-transformer` | Object transformation |
| `multer` | File upload handling |

#### Create Environment File

Create a `.env` file in the `backend/` directory:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server
PORT=3000
```

#### Run Backend

```bash
# Development mode (with hot reload)
pnpm run start:dev

# Production mode
pnpm run start:prod
```

The backend API will be available at `http://localhost:3000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
```

#### Frontend Dependencies

| Package | Description |
|---------|-------------|
| `react` | UI library (v19) |
| `react-dom` | React DOM renderer |
| `react-router-dom` | Client-side routing |
| `@supabase/supabase-js` | Supabase client |
| `mapbox-gl` | Interactive maps |
| `@mapbox/mapbox-gl-geocoder` | Location search |
| `axios` | HTTP client |
| `socket.io-client` | Real-time communication |
| `html2canvas` | Screenshot generation |
| `jspdf` | PDF generation |
| `qrcode.react` | QR code generation |
| `tailwindcss` | CSS framework |
| `postcss` | CSS processing |
| `autoprefixer` | Vendor prefixing |

#### Create Environment File

Create a `.env` file in the `frontend/` directory:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
VITE_API_URL=http://localhost:3000

# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_access_token

# Alert API (optional)
VITE_ALERT_API_URL=your_alert_api_url
```

#### Run Frontend

```bash
# Development mode
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📦 Complete Dependency List

### Backend (`backend/package.json`)

```json
{
  "dependencies": {
    "@nestjs/common": "^10.x",
    "@nestjs/config": "^3.x",
    "@nestjs/core": "^10.x",
    "@nestjs/platform-express": "^10.x",
    "@nestjs/platform-socket.io": "^10.x",
    "@nestjs/websockets": "^10.x",
    "@supabase/supabase-js": "^2.x",
    "@turf/turf": "^7.x",
    "axios": "^1.x",
    "class-transformer": "^0.5.x",
    "class-validator": "^0.14.x",
    "multer": "^1.x",
    "reflect-metadata": "^0.2.x",
    "rxjs": "^7.x"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.x",
    "@nestjs/testing": "^10.x",
    "@types/express": "^4.x",
    "@types/multer": "^1.x",
    "@types/node": "^20.x",
    "eslint": "^9.x",
    "prettier": "^3.x",
    "typescript": "^5.x",
    "typescript-eslint": "^8.x"
  }
}
```

### Frontend (`frontend/package.json`)

```json
{
  "dependencies": {
    "@mapbox/mapbox-gl-geocoder": "^5.x",
    "@supabase/supabase-js": "^2.x",
    "axios": "^1.x",
    "html2canvas": "^1.x",
    "jspdf": "^2.x",
    "mapbox-gl": "^3.x",
    "qrcode.react": "^4.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "react-qr-code": "^2.x",
    "react-router-dom": "^7.x",
    "socket.io-client": "^4.x"
  },
  "devDependencies": {
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x",
    "@vitejs/plugin-react": "^4.x",
    "autoprefixer": "^10.x",
    "eslint": "^9.x",
    "postcss": "^8.x",
    "tailwindcss": "^3.x",
    "typescript": "^5.x",
    "typescript-eslint": "^8.x",
    "vite": "^6.x"
  }
}
```

## 🏃 Running the Complete Project

### Option 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
pnpm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Using Concurrently (Optional)

Install concurrently in root:
```bash
npm install -g concurrently
```

Run both:
```bash
concurrently "cd backend && pnpm run start:dev" "cd frontend && npm run dev"
```

## 📁 Project Structure

```
Project-Alerto/
├── backend/
│   ├── src/
│   │   ├── admin/              # Admin endpoints
│   │   ├── auth/               # Authentication
│   │   ├── barangays/          # Barangay management
│   │   ├── common/             # Shared utilities
│   │   ├── evacuation-centers/ # Evacuation center APIs
│   │   ├── hazards/            # Hazard data & services
│   │   ├── live-updates/       # Real-time updates
│   │   ├── media/              # File uploads
│   │   ├── notifications/      # Alert notifications
│   │   ├── reports/            # Disaster reports
│   │   ├── supabase/           # Supabase client
│   │   ├── app.module.ts       # Root module
│   │   └── main.ts             # Entry point
│   ├── .env                    # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images, icons
│   │   ├── context/            # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Library configs
│   │   ├── pages/              # Page components
│   │   │   └── admin/          # Admin pages
│   │   ├── services/           # API services
│   │   ├── App.tsx             # Root component
│   │   └── main.tsx            # Entry point
│   ├── supabase/               # Edge functions
│   ├── .env                    # Environment variables
│   └── package.json
│
└── README.md
```

## 🔧 Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `pnpm run start` | Start the server |
| `pnpm run start:dev` | Start with hot reload |
| `pnpm run start:prod` | Start in production mode |
| `pnpm run build` | Build for production |
| `pnpm run test` | Run unit tests |
| `pnpm run lint` | Run ESLint |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🐛 Troubleshooting

### Backend Issues

1. **Supabase connection error**
   ```bash
   # Check your .env file has correct values
   cat backend/.env
   ```

2. **Port already in use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   ```

3. **Module not found**
   ```bash
   cd backend
   rm -rf node_modules
   pnpm install
   ```

### Frontend Issues

1. **Mapbox not loading**
   - Verify `VITE_MAPBOX_TOKEN` is valid
   - Check Mapbox dashboard for token permissions

2. **API connection failed**
   - Ensure backend is running on port 3000
   - Check `VITE_API_URL` in `.env`

3. **Build errors**
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

## 🔗 Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| API Health Check | http://localhost:3000/health |

## 📄 License

This project is private and proprietary.
