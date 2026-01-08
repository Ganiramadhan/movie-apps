# Movie Frontend

Modern web application for managing and browsing movies, built with React, TypeScript, and Vite.

## Tech Stack

- **React 19** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **TanStack Query** - State management
- **React Router** - Routing
- **Axios** - HTTP client

## Features

- ✅ CRUD Movies (Create, Read, Update, Delete)
- ✅ Search & Filter (title, genre, rating, year)
- ✅ Dashboard Analytics with charts
- ✅ Upload poster images
- ✅ Sync data from TMDB
- ✅ Responsive design (desktop & mobile)

## Setup

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 2. Environment Variables

Create `.env` file in root:

```env
VITE_API_URL=http://localhost:8010/api/v1
```

### 3. Run Development

```bash
pnpm dev
```

Open `http://localhost:5173`

### 4. Build Production

```bash
pnpm build
```

## Available Scripts

| Command        | Description                  |
|----------------|--------------------------|
| `pnpm dev`     | Start development server     |
| `pnpm build`   | Build for production       |
| `pnpm preview` | Preview production build     |
| `pnpm lint`    | Run ESLint                   |

## Project Structure

```
src/
├── components/        # React components
├── hooks/            # Custom hooks
├── pages/            # Route pages
├── lib/              # API config
├── utils/            # Helper functions
└── App.tsx           # Main app
```

## API Integration

Make sure backend API is running at `http://localhost:8010`

### Main Endpoints
- `GET /movies` - List movies
- `POST /movies` - Create movie
- `PUT /movies/:id` - Update movie
- `DELETE /movies/:id` - Delete movie
- `POST /sync/movies` - Sync TMDB
- `GET /dashboard/stats` - Dashboard data

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search
- `Ctrl/Cmd + N` - Create new movie
- `Escape` - Close modal

## Docker

```bash
# Build image
docker build -t movie-frontend:latest .

# Run container
docker run -p 80:80 movie-frontend:latest
```

## Troubleshooting

### API Connection Error
Check `VITE_API_URL` in `.env` file and make sure backend is running.

### Build Error
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```
