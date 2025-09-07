import Settings from "@/components/admin/Settings";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure system settings and platform preferences
        </p>
      </div>
      
      <Settings />
    </div>
  );
}