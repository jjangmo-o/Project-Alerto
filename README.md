# Project Alerto - Frontend

A React-based disaster alert and community management system for Marikina City. This application provides real-time hazard monitoring, evacuation center mapping, and community status updates.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v9.x or higher) - comes with Node.js
- **Git** - [Download](https://git-scm.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

#### Getting API Keys:

- **Supabase**: Create a project at [supabase.com](https://supabase.com) and get your project URL and anon key from Settings > API
- **Mapbox**: Sign up at [mapbox.com](https://www.mapbox.com/) and get your access token from your account dashboard

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code issues |

## 🛠️ Tech Stack

### Core
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - Automatic vendor prefixing

### Maps & Location
- **Mapbox GL** - Interactive maps
- **@mapbox/mapbox-gl-geocoder** - Location search

### Backend Integration
- **Supabase** - Backend-as-a-Service (Auth, Database, Realtime)
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication

### Utilities
- **html2canvas** - Screenshot generation
- **jsPDF** - PDF generation
- **qrcode.react / react-qr-code** - QR code generation

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, icons, etc.
│   ├── components/      # Reusable UI components
│   ├── context/         # React context providers (Auth)
│   ├── data/            # Mock data and constants
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Library configurations (Supabase)
│   ├── pages/           # Page components
│   │   └── admin/       # Admin dashboard pages
│   ├── services/        # API service functions
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Root component
│   └── main.tsx         # Application entry point
├── supabase/            # Supabase edge functions
├── .env                 # Environment variables (create this)
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## 🔗 Related Services

This frontend requires the following services to be running:

1. **Backend API** - NestJS backend server (see `/backend` directory)
2. **Supabase** - Database and authentication
3. **Mapbox** - Map services

## 🐛 Troubleshooting

### Common Issues

1. **Mapbox not loading**: Ensure your `VITE_MAPBOX_TOKEN` is valid and has the correct permissions

2. **Supabase connection errors**: Verify your Supabase URL and anon key are correct

3. **API connection failed**: Make sure the backend server is running on the port specified in `VITE_API_URL`

4. **Module not found errors**: Try deleting `node_modules` and running `npm install` again

```bash
rm -rf node_modules
npm install
```

## 📄 License

This project is private and proprietary.
