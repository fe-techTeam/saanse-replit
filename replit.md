# Dharma Stream - Devotional & Mythological OTT Platform

## Overview

Dharma Stream is a cross-platform mobile web application designed as a mini-OTT streaming platform for devotional and mythological content. The app features a React-based frontend with a dark theme and golden accents, offering short-form spiritual videos (1-2 minutes) including Ramayana stories, Mahabharata tales, Krishna leelas, Shiva stories, bhajans, and educational explanations of religious concepts. The platform provides a Netflix-like browsing experience with categories, search functionality, user accounts, playlists, and viewing history.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui for consistent, accessible design system
- **Styling**: Tailwind CSS with custom design tokens for dharma-themed colors (dark backgrounds, golden accents)
- **Build Tool**: Vite for fast development and optimized production builds
- **PWA Support**: Service worker implementation for offline functionality and app-like experience

### Backend Architecture
- **Server**: Express.js with TypeScript for API endpoints
- **Storage**: In-memory storage implementation with interface for future database integration
- **Database ORM**: Drizzle ORM configured for PostgreSQL with schema definitions
- **API Design**: RESTful endpoints for videos, users, playlists, and view history
- **Session Management**: Prepared for PostgreSQL session storage using connect-pg-simple

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured via Drizzle but using in-memory storage currently)
- **Schema Management**: Drizzle migrations with type-safe schema definitions
- **Data Models**: Users, Videos, Playlists, and ViewHistory with proper relationships
- **Connection**: Neon Database serverless driver for PostgreSQL connectivity

### Authentication and Authorization
- **Provider**: Firebase Authentication for user management
- **Methods**: Google OAuth sign-in with redirect flow for mobile compatibility
- **User Management**: Firebase UID mapping to internal user records
- **Session Handling**: Firebase auth state management with React hooks

### Mobile-First Design
- **Responsive Design**: Mobile-first approach with PWA capabilities
- **Touch Interactions**: Optimized for mobile touch interfaces
- **Performance**: Lazy loading, image optimization, and efficient component rendering
- **Offline Support**: Service worker for caching critical resources

## External Dependencies

### Authentication & Database
- **Firebase**: Authentication provider with Google OAuth integration
- **Neon Database**: Serverless PostgreSQL hosting platform
- **Drizzle ORM**: Type-safe database operations and migrations

### UI & Design System
- **Radix UI**: Primitive components for accessibility and consistent behavior
- **shadcn/ui**: Pre-built component library built on Radix primitives
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide Icons**: Comprehensive icon library for UI elements

### Development & Build Tools
- **Vite**: Modern build tool with fast HMR and optimized production builds
- **TypeScript**: Static type checking for improved code quality
- **ESBuild**: Fast JavaScript bundler for server-side code
- **PostCSS**: CSS processing with Tailwind integration

### Frontend Libraries
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form handling with validation support
- **Wouter**: Lightweight routing solution for single-page applications
- **date-fns**: Date manipulation and formatting utilities

### Fonts & Assets
- **Google Fonts**: Inter for UI text, Noto Sans Devanagari for Sanskrit/Hindi content, Crimson Text for decorative elements
- **Unsplash**: Placeholder images for video thumbnails and banners

### Development Environment
- **Replit**: Cloud development environment with specialized plugins for error handling and debugging