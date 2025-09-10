// Re-export the hook from the new admin auth provider for backward compatibility
export { useAdminAuth } from "@/pages/admin/AdminAuthProvider";

// Helper function to get auth headers for API requests
export const getAdminAuthHeaders = () => {
  const adminId = localStorage.getItem('adminId');
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminId || !adminToken) {
    return {};
  }
  
  return {
    'x-admin-id': adminId,
    'x-admin-token': adminToken
  };
};
