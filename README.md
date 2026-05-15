# Painter Portfolio Website

A minimal, bilingual portfolio website for painters built with modern web technologies. Features a clean design, bilingual support (Hebrew & English), Firebase backend, WhatsApp integration, and an admin panel for managing artwork.

## 🎨 Features

- **Bilingual Support** - Seamless switching between Hebrew and English
- **Responsive Design** - Mobile-first approach with beautiful layouts
- **Firebase Backend** - Real-time database and image storage
- **Admin Panel** - Manage paintings, exhibitions, and contact information
- **WhatsApp Integration** - Direct contact form submission via WhatsApp
- **Image Gallery** - Showcase artwork with fullscreen modal viewer
- **Contact Form** - Secure form handling with validation
- **SEO Optimized** - Meta tags and structured data for search engines

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Deployment**: GitHub Pages / Firebase Hosting
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/          # React components (Gallery, Admin, Forms, etc.)
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── styles/             # Global styles and Tailwind config
├── firebase/           # Firebase configuration and utilities
├── i18n/               # Internationalization setup
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase account with project setup

### Installation

1. Clone the repository:
```bash
git clone https://github.com/eranCat/painter-portfolio-website.git
cd painter-portfolio-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase credentials:
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_WHATSAPP_PHONE=your_whatsapp_number
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 🎯 Key Features in Detail

### Admin Panel
- Upload and manage artwork images
- Edit painting metadata (title, year, dimensions, price)
- Manage exhibitions and events
- View contact form submissions

### Gallery
- Responsive grid layout with lazy loading
- Fullscreen modal viewer with navigation
- Filter by category/collection
- Share artwork on social media

### Internationalization (i18n)
- Language switching in navigation
- Persistent language preference
- All text content in Hebrew and English

### Firebase Integration
- Firestore for data persistence
- Firebase Storage for image uploads
- Real-time database updates
- Authentication for admin access

## 📱 Responsive Design

- Mobile-first CSS with Tailwind breakpoints
- Touch-friendly navigation and interactions
- Optimized image serving for different devices
- Performance monitoring and optimization

## 🔐 Security

- Firebase authentication for admin access
- Secure environment variables
- Input validation and sanitization
- CORS configuration for API endpoints

## 📊 Performance

- Code splitting for faster initial load
- Image optimization and lazy loading
- Caching strategies with Service Workers
- Lighthouse score optimization

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### GitHub Pages
Configure `vite.config.ts` with your repository name and push to `gh-pages` branch.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements.

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Eran Karaso** - Full-Stack Developer  
GitHub: [@eranCat](https://github.com/eranCat)

## 🔗 Links

- [Live Demo](https://painter-portfolio-example.com) (replace with actual URL)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.