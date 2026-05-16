# 🎨 Painter Portfolio Website

A responsive portfolio website built for a professional painter, featuring an image gallery, fullscreen modal viewer, and Firebase Storage integration.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript |
| Storage | Firebase Storage |
| Hosting | Firebase Hosting / GitHub Pages |
| Styling | CSS Modules / Tailwind |

## Features

- **Image gallery** — responsive grid layout showcasing paintings with lazy loading
- **Fullscreen modal** — click any painting for an immersive full-screen view with navigation
- **Firebase Storage** — secure image uploads and retrieval (no exposed credentials)
- **Contact form** — email integration for inquiries
- **Mobile responsive** — optimized for all screen sizes
- **Fast loading** — optimized images and minimal bundle size

## Project Structure

```
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Gallery, About, Contact pages
│   ├── hooks/         # Custom React hooks
│   ├── firebase/      # Firebase config & storage utils
│   └── assets/        # Static assets
├── public/
└── firebase.json      # Firebase hosting config
```

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Storage enabled

### Setup

```bash
git clone https://github.com/eranCat/painter-portfolio-website.git
cd painter-portfolio-website
npm install
cp .env.example .env
# Add your Firebase config values to .env
npm run dev
```

### Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Build & Deploy

```bash
npm run build
firebase deploy
```

## Security

This project uses Firebase Storage Rules to restrict uploads to authenticated users only. No API keys or credentials are stored in the repository — all secrets are managed via environment variables.

## Author

**Eran Karaso** — [Portfolio](https://erancat.github.io/portfolio-site) · [GitHub](https://github.com/eranCat)
