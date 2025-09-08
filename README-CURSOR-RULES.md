# SAANSE - Cursor Rules Documentation

This directory contains comprehensive cursor rules for developing the SAANSE Netflix-like devotional video platform. These rules help maintain consistency, quality, and best practices across the entire project.

## 📁 Cursor Rules Files

### 1. `.cursorrules` - Main Project Rules
The primary cursor rules file containing:
- **Project Overview**: Complete understanding of the SAANSE platform
- **Tech Stack**: React 18, TypeScript, Express.js, PostgreSQL, Firebase, etc.
- **Development Guidelines**: Code style, architecture, and patterns
- **Feature Priorities**: Current, next, and future development phases
- **Common Patterns**: Reusable code templates and examples

### 2. `.cursorrules-components` - React Components Guidelines
Specialized rules for frontend component development:
- **Component Architecture**: File organization and structure
- **Component Templates**: Standardized component patterns
- **Video Components**: VideoCard, VideoPlayer, and related components
- **CMS Components**: Admin panel specific components
- **Best Practices**: Performance, accessibility, and testing guidelines

### 3. `.cursorrules-backend` - Backend/API Development Rules
Comprehensive backend development guidelines:
- **API Design**: RESTful endpoints and response formats
- **Data Layer**: Database operations and storage patterns
- **Middleware**: Authentication, validation, and error handling
- **Service Layer**: Business logic implementation
- **Security**: Input validation, rate limiting, and CORS
- **Testing**: Unit and integration testing strategies

### 4. `.cursorrules-cms` - CMS & Admin Panel Rules
Specialized rules for content management system:
- **CMS Architecture**: Admin panel structure and organization
- **Video Management**: CRUD operations for video content
- **User Management**: User administration features
- **Analytics Dashboard**: Data visualization and reporting
- **Content Moderation**: Review and approval workflows
- **System Settings**: Configuration management

## 🚀 How to Use These Rules

### For New Developers
1. **Start with `.cursorrules`**: Read the main project overview first
2. **Choose your focus area**: 
   - Frontend: Use `.cursorrules-components`
   - Backend: Use `.cursorrules-backend`
   - CMS: Use `.cursorrules-cms`
3. **Follow the templates**: Use the provided code templates as starting points
4. **Reference patterns**: Use the common patterns for consistency

### For Existing Developers
1. **Quick reference**: Use these files as quick reference guides
2. **Code review**: Use patterns to ensure consistency in code reviews
3. **Refactoring**: Follow the guidelines when refactoring existing code
4. **New features**: Use templates when implementing new features

### For Project Managers
1. **Onboarding**: Share these rules with new team members
2. **Code quality**: Use as standards for code quality assessment
3. **Planning**: Reference feature priorities for roadmap planning
4. **Documentation**: Use as basis for project documentation

## 📋 Project Overview

### What is SAANSE?
SAANSE (SAANSE) is a Netflix-style platform for sharing short devotional videos focused on Hindu mythology, spiritual content, and religious stories. The platform includes:

- **User-facing features**: Video streaming, search, playlists, user profiles
- **Admin panel**: Content management, user management, analytics
- **Multi-language support**: Hindi, English, Gujarati, Marathi
- **PWA capabilities**: Offline support and mobile app-like experience

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with Google OAuth
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Internationalization**: i18next

### Content Categories
- **Ramayana**: Stories from the epic
- **Krishna**: Krishna Leela and teachings
- **Mahabharata**: Epic tales and wisdom
- **Shiva**: Lord Shiva's stories
- **Hanuman**: Hanuman's devotion and strength
- **Ganesha**: Lord Ganesha's tales
- **Devi**: Goddess stories and worship
- **Festivals**: Religious celebrations
- **Bhajans**: Devotional songs and chants
- **Explained**: Spiritual concepts and philosophy

## 🎯 Development Phases

### Phase 1 (Current) ✅
- Basic video streaming
- User authentication
- Video browsing and search
- Playlist management
- Basic CMS

### Phase 2 (Next) 🔄
- Advanced video player
- User recommendations
- Social features (comments, sharing)
- Mobile app development
- Advanced analytics

### Phase 3 (Future) 📋
- Live streaming capabilities
- Community features
- Multi-language dubbing
- VR/AR experiences
- Educational content

## 🔧 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push
npm run db:seed

# Type checking
npm run check
```

## 📚 Key Development Patterns

### Component Structure
```typescript
interface ComponentProps {
  // Props interface
}

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State management
  const [state, setState] = useState();
  
  // Data fetching
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/endpoint"],
  });

  // Event handlers
  const handleAction = () => {
    // Implementation
  };

  // Render
  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  );
}
```

### API Response Format
```typescript
// Success response
{
  data: T,
  message?: string,
  meta?: {
    total?: number,
    page?: number,
    limit?: number
  }
}

// Error response
{
  error: string,
  message: string,
  details?: any,
  statusCode: number
}
```

### Database Operations
```typescript
// Create
const result = await db.insert(table).values(data).returning();

// Read
const result = await db.select().from(table).where(eq(table.id, id));

// Update
const result = await db.update(table).set(data).where(eq(table.id, id)).returning();

// Delete
const result = await db.delete(table).where(eq(table.id, id));
```

## 🛠️ Development Tools

### Essential Extensions
- **TypeScript**: Built-in support
- **Tailwind CSS IntelliSense**: For Tailwind classes
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **React Developer Tools**: Browser extension
- **Drizzle Studio**: Database management

### Debug Tools
- **React Developer Tools**: Component inspection
- **Network tab**: API debugging
- **Console**: Error messages
- **Drizzle Studio**: Database inspection

## 📖 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Tools
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Framer Motion](https://www.framer.com/motion/)

## 🤝 Contributing

When contributing to the project:

1. **Follow the cursor rules**: Use the patterns and guidelines provided
2. **Write tests**: Include unit and integration tests
3. **Document changes**: Update documentation as needed
4. **Code review**: Ensure code follows project standards
5. **Performance**: Consider performance implications
6. **Accessibility**: Ensure features are accessible

## 📞 Support

For questions about these cursor rules or the project:

1. **Check the rules first**: Most questions are answered in these files
2. **Review existing code**: Look at similar implementations
3. **Ask the team**: Reach out to the development team
4. **Document solutions**: Update these rules with new patterns

---

**Remember**: These cursor rules are living documents. Update them as the project evolves and new patterns emerge. They should help maintain consistency and quality across the entire SAANSE platform.
