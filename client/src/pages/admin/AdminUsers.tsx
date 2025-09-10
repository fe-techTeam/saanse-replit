import UserManager from "@/components/admin/UserManager";

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          Manage user accounts, roles, and permissions
        </p>
      </div>
      
      <UserManager />
    </div>
  );
}