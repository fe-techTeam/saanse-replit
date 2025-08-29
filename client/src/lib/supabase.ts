// Temporary type definitions until @supabase/supabase-js is installed
interface SupabaseClient {
  auth: {
    signInWithOAuth: (options: any) => Promise<{ data: any; error: any }>;
    signOut: () => Promise<{ error: any }>;
    onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: { unsubscribe: () => void } } };
    getUser: () => Promise<{ data: { user: any }; error: any }>;
    getSession: () => Promise<{ data: { session: any }; error: any }>;
  };
}

// Mock client until package is installed
const createMockClient = (url: string, key: string): SupabaseClient => {
  console.warn('Supabase client not properly initialized. Please run: npm install @supabase/supabase-js');
  return {
    auth: {
      signInWithOAuth: async () => ({ data: null, error: new Error('Supabase not installed') }),
      signOut: async () => ({ error: new Error('Supabase not installed') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getUser: async () => ({ data: { user: null }, error: new Error('Supabase not installed') }),
      getSession: async () => ({ data: { session: null }, error: new Error('Supabase not installed') })
    }
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'your-anon-key';

// Try to import the real client, fallback to mock if not available
let supabase: SupabaseClient;
try {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch {
  supabase = createMockClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Auth helpers
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event: string, session: any) => {
    callback(session?.user || null);
  });
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const handleAuthCallback = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};
