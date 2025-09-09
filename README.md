# SAANSE - Divine Stories

A Netflix-style Progressive Web App (PWA) for Hindu mythology and spiritual content, featuring short-form devotional videos, stories from epics like Ramayana and Mahabharata, and educational spiritual content.

## 🚀 Features

### 📱 Progressive Web App (PWA)
- **Native App Experience**: Install directly from browser to home screen
- **Offline Functionality**: Watch content without internet connection
- **Cross-Platform**: Works seamlessly on iOS, Android, and Desktop
- **WhatsApp Friendly**: Perfect for viral sharing via messaging apps
- **Fast Loading**: Aggressive caching for instant startup
- **Push Notifications**: Stay updated with new content (ready for implementation)

### 🎬 Content Platform
- **Short-Form Videos**: 2-3 minute spiritual stories and teachings
- **Categorized Content**: Ramayana, Krishna, Mahabharata, Shiva, Hanuman, Ganesha, Devi, Festivals, Bhajans
- **Series Support**: Episodic content with proper episode ordering
- **Search & Discovery**: Find content across all categories
- **Personal Library**: Favorites, watch later, and custom playlists
- **Watch History**: Resume where you left off
- **Multi-Language**: Support for Hindi, English, Gujarati, and Marathi

### 🔐 Authentication & Admin
- **Supabase Auth**: Google OAuth integration with session management
- **Admin CMS**: Complete content management system
- **User Analytics**: Track engagement and popular content
- **Role-Based Access**: Admin and super admin roles
- **Content Moderation**: Review and approve user-generated content

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** + **shadcn/ui** for styling
- **Wouter** for lightweight client-side routing
- **TanStack Query** for data fetching and caching
- **i18next** for internationalization

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for type-safe database operations
- **Supabase** PostgreSQL with Row Level Security

### PWA Technology
- **Service Worker** with smart caching strategies
- **Web App Manifest** with comprehensive metadata
- **Background Sync** for offline actions
- **Install Prompts** for iOS and Android

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- ngrok account (for mobile PWA testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saanse-replit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
   SUPABASE_URL=https://your-project.supabase.co  
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Firebase (Optional - Legacy fallback)
   VITE_FIREBASE_API_KEY=your-firebase-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   ```

4. **Database Setup**
   ```bash
   # Push database schema to Supabase
   npm run db:push
   
   # Seed with sample content
   npm run db:seed:enhanced
   
   # Create admin user
   npm run setup:admin
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Your app will be running at `http://localhost:3000`

## 📱 PWA Testing Guide

### Local Testing Setup

1. **Install ngrok** (choose one method):
   ```bash
   # Using Homebrew (macOS)
   brew install ngrok/ngrok/ngrok
   
   # Using npm
   npm install -g ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Authenticate ngrok**:
   ```bash
   # Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken
   ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
   ```

3. **Expose your local server**:
   ```bash
   # In a new terminal (keep dev server running)
   ngrok http 3000
   ```

   You'll get a public HTTPS URL like: `https://abc123.ngrok.io`

### Mobile Testing Steps

#### Android Testing
1. Open the ngrok URL in Chrome mobile
2. Browse the app to trigger PWA criteria
3. Look for the install banner at the bottom
4. Tap "Install App" to add to home screen
5. Test offline by turning off internet and opening the installed app

#### iOS Testing
1. Open the ngrok URL in Safari mobile
2. Look for the custom install prompt
3. Tap the Share button → "Add to Home Screen"
4. Test the installed app from home screen

#### WhatsApp Sharing Test
1. Send the ngrok URL to yourself via WhatsApp
2. Open the link from WhatsApp
3. Verify the install prompt appears
4. Test the complete installation flow

### PWA Features to Verify

- ✅ **Install Prompt**: Appears automatically on supported browsers
- ✅ **Offline Mode**: App works without internet connection
- ✅ **Fast Loading**: Cached content loads instantly
- ✅ **Full Screen**: Opens without browser UI
- ✅ **App Icons**: SAANSE logo displays correctly on home screen
- ✅ **Background Sync**: Offline actions sync when online
- ✅ **Push Ready**: Infrastructure ready for push notifications

## 🎯 Available Scripts

### Development
```bash
npm run dev              # Start development server (port 3000)
npm run build            # Build for production  
npm run start            # Start production server
npm run check            # TypeScript type checking
```

### Database Operations
```bash
npm run db:push          # Push schema changes to Supabase
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database with basic content
npm run db:seed:enhanced # Seed with comprehensive content (7 series, 50+ videos)
```

### Testing & Utilities
```bash
npm run test:supabase    # Test Supabase connection
npm run test:env         # Test environment variables
npm run setup:admin      # Create admin user for CMS
npm run db:setup         # Setup database tables
npm run fix:deps         # Fix dependency issues
```

## 📂 Project Structure

```
/
├── client/               # React frontend
│   ├── public/
│   │   ├── manifest.json # PWA manifest with app metadata
│   │   └── sw.js        # Service worker for offline functionality
│   ├── src/
│   │   ├── components/   # UI components
│   │   │   ├── admin/   # Admin panel components
│   │   │   ├── ui/      # Reusable UI components (shadcn)
│   │   │   ├── PWAInstallPrompt.tsx # PWA installation prompt
│   │   │   └── ...
│   │   ├── pages/       # Route components
│   │   ├── hooks/       # Custom React hooks
│   │   │   └── usePWA.ts # PWA installation logic
│   │   ├── lib/         # Utilities (supabase client, utils)
│   │   ├── types/       # TypeScript definitions
│   │   └── i18n/        # Translation files
├── server/              # Express.js backend
│   ├── admin/           # Admin panel API routes
│   ├── routes.ts        # Main API routes
│   ├── storage.ts       # Database operations layer
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle database schema
└── scripts/             # Utility scripts for setup/seeding
```

## 🔐 Admin Panel Access

Access the admin panel at: `http://localhost:3000/admin`

**Default Credentials** (change in production):
- **Email**: `harshadmadaye@firsteconomy.com`
- **Password**: `admin123`

### Admin Features
- **Content Management**: Upload, edit, and organize videos
- **Series Management**: Create and manage episodic content
- **User Analytics**: View engagement metrics and popular content
- **User Management**: Manage user accounts and permissions
- **Content Moderation**: Review and approve content

## 🌐 API Endpoints

### Public Endpoints
- `GET /api/videos` - Get all active videos
- `GET /api/videos/category/:category` - Filter by category
- `GET /api/videos/search/:query` - Search videos
- `GET /api/series` - Get all series

### Protected Endpoints (User)
- `GET /api/users/profile` - Get user profile
- `POST /api/playlists` - Create playlist
- `GET /api/view-history` - Get watch history

### Admin Endpoints
- `GET /api/admin/analytics` - Get dashboard analytics
- `POST /api/admin/videos` - Create new video
- `PUT /api/admin/videos/:id` - Update video
- `DELETE /api/admin/videos/:id` - Delete video

## 📊 Content Categories

The platform organizes spiritual content into these categories:

- **Ramayana**: Epic stories and teachings from the Ramayana
- **Krishna**: Krishna Leela and divine pastimes
- **Mahabharata**: Epic tales and moral lessons from Mahabharata
- **Shiva**: Lord Shiva's stories and significance
- **Hanuman**: Hanuman's devotion and strength
- **Ganesha**: Lord Ganesha's tales and wisdom
- **Devi**: Divine Mother's forms and stories
- **Festivals**: Religious celebrations and rituals
- **Bhajans**: Devotional songs and chants
- **Explained**: Spiritual concepts and philosophy

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
Ensure all environment variables are properly set:
- Use production Supabase URLs
- Set `NODE_ENV=production`
- Configure proper CORS settings
- Set secure session secrets

### PWA Requirements for Production
- **HTTPS**: PWA requires secure connection
- **Service Worker**: Automatically registered
- **Manifest**: Properly configured with production URLs
- **Icons**: All icon sizes generated and accessible

## 🔧 Troubleshooting

### PWA Issues
- **Install prompt not showing**: Clear browser cache, ensure HTTPS
- **Service worker not updating**: Increment version in `sw.js`
- **Offline mode not working**: Check service worker registration in dev tools

### Database Issues
```bash
# Test Supabase connection
npm run test:supabase

# Reset database (careful in production)
npm run db:push
npm run db:seed:enhanced
```

### Build Issues
```bash
# Type check for errors
npm run check

# Fix dependency issues
npm run fix:deps
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spiritual Content**: Inspired by traditional Hindu scriptures and teachings
- **UI Design**: Netflix-style interface for familiar user experience
- **PWA Technology**: Modern web standards for native app experience
- **Open Source**: Built with love using open source technologies

## 📞 Support

For support, email support@saanse.com or create an issue in the repository.

---

**Made with ❤️ for spiritual seekers worldwide**

*"सत्यं शिवं सुन्दरम्" - Truth, Goodness, Beauty*