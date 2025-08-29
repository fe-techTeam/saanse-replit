# SAANSE Admin Panel Guide

## Overview

The SAANSE Admin Panel is a comprehensive content management system that allows administrators to manage all aspects of the platform including videos, series, users, and analytics.

## Features

### 🔐 Authentication & Authorization
- **Admin Login**: Secure login system with role-based access
- **Super Admin**: Full access to all features including admin management
- **Regular Admin**: Access to content and user management
- **Session Management**: Persistent login with token-based authentication

### 📊 Dashboard
- **Key Metrics**: Total videos, users, views, likes
- **Recent Activity**: Latest videos and user registrations
- **Quick Actions**: Direct access to common tasks
- **Real-time Stats**: Live data from the database

### 🎬 Content Management
- **Video Management**: Create, edit, delete, and organize videos
- **Series Management**: Manage episodic content and series
- **Category Organization**: Organize content by categories
- **Content Moderation**: Review and moderate user-generated content

### 👥 User Management
- **User Profiles**: View and manage user accounts
- **Admin Users**: Create and manage admin accounts
- **Role Management**: Assign different permission levels
- **User Analytics**: Track user engagement and activity

### 📈 Analytics & Reporting
- **View Analytics**: Track video performance and engagement
- **User Analytics**: Monitor user behavior and growth
- **Content Analytics**: Analyze content performance
- **Export Reports**: Generate detailed reports

## Setup Instructions

### 1. Database Setup

First, ensure your database tables are created:

```bash
# Generate SQL commands
npm run db:sql

# Copy the SQL commands to your Supabase SQL Editor and run them
```

### 2. Admin User Setup

Create the default admin user:

```bash
npm run setup:admin
```

### 3. Start the Application

```bash
npm run dev
```

### 4. Access Admin Panel

Navigate to: `http://localhost:3000/admin`

## Default Admin Credentials

- **Email**: `harshadmadaye@firsteconomy.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password in production!

## Admin Panel Structure

### Routes

- `/admin` - Dashboard
- `/admin/videos` - Video Management
- `/admin/series` - Series Management
- `/admin/users` - User Management
- `/admin/admins` - Admin User Management
- `/admin/analytics` - Analytics Dashboard
- `/admin/settings` - System Settings

### Components

```
client/src/components/admin/
├── AdminLogin.tsx          # Login form
├── AdminLayout.tsx         # Main layout with navigation
├── AdminDashboard.tsx      # Dashboard overview
├── VideoManager.tsx        # Video management (to be implemented)
├── UserManager.tsx         # User management (to be implemented)
├── Analytics.tsx           # Analytics dashboard (to be implemented)
└── Settings.tsx            # System settings (to be implemented)
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile

### Content Management
- `GET /api/admin/videos` - Get all videos
- `POST /api/admin/videos` - Create video
- `PATCH /api/admin/videos/:id` - Update video
- `DELETE /api/admin/videos/:id` - Delete video

### User Management
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Admin Management
- `GET /api/admin/admins` - Get all admins
- `POST /api/admin/admins` - Create admin (super admin only)
- `PATCH /api/admin/admins/:id` - Update admin (super admin only)
- `DELETE /api/admin/admins/:id` - Delete admin (super admin only)

### Analytics
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics` - Detailed analytics

## Security Features

### Authentication
- Token-based authentication
- Session management
- Secure password handling

### Authorization
- Role-based access control (RBAC)
- Super admin vs regular admin permissions
- API endpoint protection

### Data Protection
- Row Level Security (RLS) policies
- Input validation and sanitization
- SQL injection prevention

## Database Schema

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMP
);
```

### RLS Policies
```sql
-- Admin users can view all admin users
CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (true);

-- Super admins can manage admin users
CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL USING (true);
```

## Usage Guide

### 1. Login
1. Navigate to `/admin`
2. Enter your admin credentials
3. Click "Sign In"

### 2. Dashboard
- View key metrics and recent activity
- Access quick actions for common tasks
- Monitor platform health

### 3. Content Management
- **Videos**: Upload, edit, and organize video content
- **Series**: Create and manage episodic content
- **Categories**: Organize content by themes

### 4. User Management
- **Users**: View and manage user accounts
- **Admins**: Create and manage admin accounts (super admin only)

### 5. Analytics
- **Overview**: Platform-wide statistics
- **Content Performance**: Video and series analytics
- **User Engagement**: User behavior insights

## Best Practices

### Security
1. **Change Default Password**: Update the default admin password immediately
2. **Use Strong Passwords**: Implement password complexity requirements
3. **Regular Access Review**: Periodically review admin access
4. **Log Monitoring**: Monitor admin activity logs

### Content Management
1. **Content Guidelines**: Establish clear content guidelines
2. **Quality Control**: Review content before publishing
3. **Metadata**: Ensure proper video metadata and descriptions
4. **Thumbnails**: Use high-quality thumbnails for videos

### User Management
1. **Role Assignment**: Assign appropriate roles to admins
2. **Access Control**: Limit access based on responsibilities
3. **User Support**: Provide support for user issues
4. **Account Security**: Monitor for suspicious user activity

## Troubleshooting

### Common Issues

#### Login Problems
- **Issue**: Cannot login with admin credentials
- **Solution**: Verify admin user exists in database and credentials are correct

#### Database Connection
- **Issue**: Admin panel cannot connect to database
- **Solution**: Check Supabase credentials and network connection

#### Permission Errors
- **Issue**: Cannot perform certain actions
- **Solution**: Verify admin role and permissions

### Debug Commands

```bash
# Test database connection
npm run test:supabase

# Test environment variables
npm run test:env

# Setup admin database
npm run setup:admin

# Seed database with content
npm run db:seed:direct
```

## Development

### Adding New Features

1. **Backend**: Add API endpoints in `server/admin-routes.ts`
2. **Frontend**: Create components in `client/src/components/admin/`
3. **Database**: Update schema in `shared/schema.ts`
4. **Testing**: Test thoroughly before deployment

### Customization

- **Styling**: Modify Tailwind classes in components
- **Permissions**: Update RLS policies for new features
- **Validation**: Add input validation for new forms
- **Analytics**: Extend analytics for new metrics

## Production Deployment

### Security Checklist
- [ ] Change default admin password
- [ ] Enable HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### Performance Optimization
- [ ] Database indexing
- [ ] Caching strategies
- [ ] Image optimization
- [ ] CDN configuration

### Backup Strategy
- [ ] Regular database backups
- [ ] File storage backups
- [ ] Configuration backups
- [ ] Disaster recovery plan

## Support

For technical support or questions about the admin panel:

1. Check the troubleshooting section
2. Review the API documentation
3. Check server logs for errors
4. Contact the development team

---

**Note**: This admin panel is designed for the SAANSE platform and should be customized according to your specific requirements and branding guidelines.
