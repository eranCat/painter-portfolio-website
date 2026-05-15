# Painter Portfolio Website

A minimal, creative portfolio website for painters with bilingual support (Hebrew & English), Firebase backend, and admin panel for managing paintings.

## Features

- **Bilingual Support**: Full Hebrew and English interface with seamless language switching
- **Responsive Design**: Mobile-first approach optimized for all devices
- **Firebase Integration**: Real-time database and Cloud Storage for painting images
- **Admin Panel**: Secure dashboard for artists to manage their portfolio
  - Add/edit/delete paintings with descriptions
  - Upload high-quality images to Cloud Storage
  - Manage artist profile information
- **WhatsApp Contact Integration**: Direct messaging capability for inquiries
- **Performance Optimized**: Fast loading times with optimized image delivery
- **Beautiful Galleries**: Showcase paintings in elegant layouts

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: CSS with responsive design
- **Backend**: Firebase Realtime Database
- **Storage**: Firebase Cloud Storage
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting (ready for deployment)

## Project Structure

```
├── src/
│   ├── components/       # React components (Gallery, Admin, etc.)
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Firebase and API services
│   ├── styles/          # CSS modules
│   └── utils/           # Helper functions
├── public/              # Static assets
└── firebase.config.js   # Firebase configuration
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Firebase account

### Installation

```bash
# Clone the repository
git clone https://github.com/eranCat/painter-portfolio-website.git
cd painter-portfolio-website

# Install dependencies
npm install

# Setup Firebase
# 1. Create a Firebase project at firebase.google.com
# 2. Copy your config to firebase.config.js
# 3. Enable Realtime Database and Storage

# Start development server
npm start
```

### Development

```bash
# Run in development mode
npm start

# Build for production
npm run build

# Deploy to Firebase
npm run deploy
```

## Configuration

### Firebase Setup

1. Create a `.env.local` file:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
```

2. Initialize Firebase Database with the following structure:
```
paintings/
  ├── {id}/
  │   ├── title: String
  │   ├── description: String
  │   ├── imageUrl: String
  │   └── date: Timestamp
artist/
  ├── name: String
  ├── bio: String
  └── imageUrl: String
```

## Features in Detail

### Gallery View
- Browse all paintings with descriptions
- Filter and sort by date or title
- Fullscreen lightbox for detailed viewing
- Language-specific descriptions

### Admin Panel
- Secure login with Firebase Authentication
- Add new paintings with image upload
- Edit painting details
- Delete paintings with confirmation
- Manage artist profile

### Contact Form
- Direct WhatsApp integration
- Quick inquiry submissions
- Email notifications (optional)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a personal portfolio project. Contributions welcome via pull requests.

## License

MIT License - feel free to use as inspiration for your own projects.

## Future Enhancements

- [ ] Painting categories/collections
- [ ] Client testimonials section
- [ ] Blog/artist updates
- [ ] Social media integration
- [ ] Commission request form
- [ ] Analytics dashboard

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ by Eran Karasho**