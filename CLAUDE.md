# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SAANSE (SAANSE)** is a Netflix-style devotional video platform specializing in Hindu mythology and spiritual content. It features short-form videos (2-3 minutes) covering stories from epics like Ramayana and Mahabharata, Krishna leelas, bhajans, and educational spiritual content.

## Common Commands

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

## Architecture Overview

### Stack
- **Frontend**: React 18 + TypeScript + Vite + TanStack Query
- **UI**: Tailwind CSS + shadcn/ui + Radix UI primitives
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: Supabase PostgreSQL with Row Level Security
- **Auth**: Supabase Auth with Google OAuth
- **Routing**: Wouter (lightweight client-side routing)
- **Internationalization**: i18next (Hindi, English, Gujarati, Marathi)

### Project Structure
```
/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components (admin/, ui/, video/)
│   │   ├── pages/        # Route components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities (supabase client, utils)
│   │   ├── types/        # TypeScript definitions
│   │   └── i18n/         # Translation files
├── server/               # Express.js backend
│   ├── admin/            # Admin panel API routes
│   ├── routes.ts         # Main API routes
│   ├── storage.ts        # Database operations layer
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Drizzle database schema
└── scripts/              # Utility scripts for setup/seeding
```

### Database Schema (Supabase)
- **users**: User profiles linked to Supabase auth
- **videos**: Video content with metadata, views, likes
- **series**: Episodic content collections (Ramayana, Krishna, etc.)
- **playlists**: User-created video collections
- **view_history**: User watch history and progress
- **admin_users**: CMS admin accounts with role-based access

### API Routes
- `/api/videos` - CRUD operations for videos
- `/api/videos/category/:category` - Filter by content category
- `/api/videos/search/:query` - Search videos
- `/api/series` - Manage episodic content series
- `/api/users` - User management
- `/api/playlists` - User playlist operations
- `/api/admin/*` - Admin panel endpoints (protected)

## Content Categories

The platform organizes content into these spiritual categories:
- **Ramayana**: Epic stories and teachings
- **Krishna**: Krishna Leela and divine pastimes
- **Mahabharata**: Epic tales and moral lessons  
- **Shiva**: Lord Shiva's stories and significance
- **Hanuman**: Hanuman's devotion and strength
- **Ganesha**: Lord Ganesha's tales
- **Devi**: Divine Mother's forms and stories
- **Festivals**: Religious celebrations and rituals
- **Bhajans**: Devotional songs and chants
- **Explained**: Spiritual concepts and philosophy

## Key Features

### User Features
- Video streaming with custom player controls
- Category-based browsing and search
- User playlists (favorites, watch later, custom)
- Watch history and progress tracking
- Multi-language support with i18next
- PWA capabilities for mobile experience

### Admin CMS Panel
- Video management (upload, edit, categorize)
- Series management for episodic content  
- User administration and analytics
- Content moderation workflows
- Dashboard with metrics and insights
- Role-based access (admin/super_admin)

### Authentication
- Supabase Auth with Google OAuth integration
- Firebase Auth fallback (legacy)
- Session management with Row Level Security
- Admin authentication separate from user auth

## Development Guidelines

### Code Patterns
Follow patterns established in `.cursorrules` - use TypeScript strict mode, Zod validation, proper error handling, and consistent component structure.

### Component Structure Template
```typescript
interface ComponentProps {
  // Type all props
}

export default function Component({ prop }: ComponentProps) {
  const [state, setState] = useState();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/endpoint"],
    queryFn: () => fetchData()
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div className="component-container">{/* content */}</div>;
}
```

### Database Operations
Use Drizzle ORM with type-safe operations:
```typescript
// Example patterns from storage.ts
const videos = await db.select().from(videosTable).where(eq(videosTable.isActive, true));
const result = await db.insert(videosTable).values(data).returning();
```

## Environment Setup

Required environment variables in `.env`:
```
# Supabase (primary database)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co  
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server config
PORT=3000
NODE_ENV=development

# Legacy Firebase (optional fallback)
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
```

## Admin Panel Access

Default admin credentials (change in production):
- **URL**: `http://localhost:3000/admin`
- **Email**: `harshadmadaye@firsteconomy.com`  
- **Password**: `admin123`

Create admin user: `npm run setup:admin`

## Notable Implementation Details

- **Dual Database Support**: Configured for both Supabase (primary) and in-memory storage (development)
- **Series vs Standalone**: Content can be episodic (part of series) or standalone videos
- **Mobile-First**: Responsive design optimized for mobile viewing
- **Internationalization**: Multi-language support with i18next
- **PWA Ready**: Service worker and manifest for app-like experience
- **Performance**: TanStack Query for caching, lazy loading, image optimization

## Troubleshooting

- **Build errors**: Run `npm run check` for TypeScript issues
- **Database issues**: Check Supabase connection with `npm run test:supabase`
- **Seeding fails**: Ensure database schema is pushed with `npm run db:push`
- **Admin login fails**: Verify admin user exists with `npm run setup:admin`