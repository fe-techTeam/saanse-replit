import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminSession {
  admin: AdminUser;
  token: string;
  expiresAt: string;
}

// Admin users table - separate from regular users
const ADMIN_USERS = [
  {
    email: 'harshadmadaye@firsteconomy.com',
    displayName: 'Harshad Madaye',
    role: 'super_admin' as const,
    isActive: true
  }
];

export class AdminAuthService {
  // Initialize admin users in database
  static async initializeAdminUsers() {
    try {
      for (const adminUser of ADMIN_USERS) {
        const { data: existingUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', adminUser.email)
          .single();

        if (!existingUser) {
          await supabase
            .from('admin_users')
            .insert({
              email: adminUser.email,
              display_name: adminUser.displayName,
              role: adminUser.role,
              is_active: adminUser.isActive,
              created_at: new Date().toISOString()
            });
          
          console.log(`✅ Created admin user: ${adminUser.email}`);
        }
      }
    } catch (error) {
      console.error('Error initializing admin users:', error);
    }
  }

  // Verify admin credentials
  static async verifyAdmin(email: string, password: string): Promise<AdminUser | null> {
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !adminUser) {
        return null;
      }

      // For now, use a simple password check (in production, use proper hashing)
      // This is a temporary solution - replace with proper authentication
      const expectedPassword = 'admin123'; // Change this in production
      
      if (password !== expectedPassword) {
        return null;
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', adminUser.id);

      return {
        id: adminUser.id,
        email: adminUser.email,
        displayName: adminUser.display_name,
        role: adminUser.role,
        isActive: adminUser.is_active,
        createdAt: adminUser.created_at,
        lastLoginAt: adminUser.last_login_at
      };
    } catch (error) {
      console.error('Error verifying admin:', error);
      return null;
    }
  }

  // Get admin by ID
  static async getAdminById(id: string): Promise<AdminUser | null> {
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error || !adminUser) {
        return null;
      }

      return {
        id: adminUser.id,
        email: adminUser.email,
        displayName: adminUser.display_name,
        role: adminUser.role,
        isActive: adminUser.is_active,
        createdAt: adminUser.created_at,
        lastLoginAt: adminUser.last_login_at
      };
    } catch (error) {
      console.error('Error getting admin by ID:', error);
      return null;
    }
  }

  // Get all admin users
  static async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const { data: adminUsers, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return adminUsers.map(admin => ({
        id: admin.id,
        email: admin.email,
        displayName: admin.display_name,
        role: admin.role,
        isActive: admin.is_active,
        createdAt: admin.created_at,
        lastLoginAt: admin.last_login_at
      }));
    } catch (error) {
      console.error('Error getting all admins:', error);
      return [];
    }
  }

  // Create new admin user
  static async createAdmin(adminData: {
    email: string;
    displayName?: string;
    role: 'admin' | 'super_admin';
  }): Promise<AdminUser | null> {
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .insert({
          email: adminData.email,
          display_name: adminData.displayName,
          role: adminData.role,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: adminUser.id,
        email: adminUser.email,
        displayName: adminUser.display_name,
        role: adminUser.role,
        isActive: adminUser.is_active,
        createdAt: adminUser.created_at,
        lastLoginAt: adminUser.last_login_at
      };
    } catch (error) {
      console.error('Error creating admin:', error);
      return null;
    }
  }

  // Update admin user
  static async updateAdmin(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
    try {
      const updateData: any = {};
      if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: adminUser.id,
        email: adminUser.email,
        displayName: adminUser.display_name,
        role: adminUser.role,
        isActive: adminUser.is_active,
        createdAt: adminUser.created_at,
        lastLoginAt: adminUser.last_login_at
      };
    } catch (error) {
      console.error('Error updating admin:', error);
      return null;
    }
  }

  // Delete admin user
  static async deleteAdmin(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting admin:', error);
      return false;
    }
  }
}
