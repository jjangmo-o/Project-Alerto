### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git**

```bash
# Check your versions
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/project-alerto.git
   cd project-alerto
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env.local
   
   # Edit with your credentials
   nano .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

---

## 📦 Dependencies

### Core Dependencies

| Package | Version | Description |
|---------|---------|-------------|
| `react` | ^19.2.0 | UI component library |
| `react-dom` | ^19.2.0 | React DOM rendering |
| `react-router-dom` | ^7.11.0 | Client-side routing |
| `@supabase/supabase-js` | ^2.90.0 | Supabase client SDK |

### Styling

| Package | Version | Description |
|---------|---------|-------------|
| `tailwindcss` | ^3.4.0 | Utility-first CSS framework |
| `postcss` | ^8.5.0 | CSS post-processing |
| `autoprefixer` | ^10.4.0 | CSS vendor prefixing |

### Development Dependencies

| Package | Version | Description |
|---------|---------|-------------|
| `typescript` | ~5.9.0 | TypeScript language |
| `vite` | ^7.2.0 | Build tool & dev server |
| `@vitejs/plugin-react` | ^4.5.0 | React plugin for Vite |
| `eslint` | ^9.30.0 | Code linting |
| `@eslint/js` | ^9.30.0 | ESLint JavaScript rules |
| `typescript-eslint` | ^8.35.0 | TypeScript ESLint support |
| `eslint-plugin-react-hooks` | ^5.2.0 | React Hooks linting |
| `eslint-plugin-react-refresh` | ^0.4.20 | React Refresh linting |
| `@types/react` | ^19.2.0 | React type definitions |
| `@types/react-dom` | ^19.2.0 | React DOM type definitions |

### Install All at Once

If starting from scratch, run:

```bash
# Core dependencies
npm install react react-dom react-router-dom @supabase/supabase-js

# Styling
npm install -D tailwindcss postcss autoprefixer

# Development tools
npm install -D typescript vite @vitejs/plugin-react
npm install -D eslint @eslint/js typescript-eslint
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install -D @types/react @types/react-dom

# Initialize Tailwind (if not already done)
npx tailwindcss init -p
```

### Quick Install Command

Copy and paste this single command to install everything:

```bash
npm install react react-dom react-router-dom @supabase/supabase-js && npm install -D tailwindcss postcss autoprefixer typescript vite @vitejs/plugin-react eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh @types/react @types/react-dom
```
