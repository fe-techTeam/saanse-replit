import Analytics from "@/components/admin/Analytics";

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-600 mt-2">
          View detailed analytics and performance metrics
        </p>
      </div>
      
      <Analytics />
    </div>
  );
}