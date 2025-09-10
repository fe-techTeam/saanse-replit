import VideoManager from "@/components/admin/VideoManager";

export default function AdminVideos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
        <p className="text-gray-600 mt-2">
          Create, edit, and manage all videos on the platform
        </p>
      </div>
      
      <VideoManager />
    </div>
  );
}