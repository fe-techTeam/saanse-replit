import { useSeries } from "@/hooks/useSeries";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SeriesDialog } from "@/components/admin/SeriesDialog";
import { useState } from "react";

export default function AdminSeriesList() {
  const { data: series, isLoading, error } = useSeries();
  const [dialogOpen, setDialogOpen] = useState(false);

  console.log("AdminSeriesList render - series:", series, "isLoading:", isLoading, "error:", error);

  if (isLoading) return <p>Loading...</p>;

  const hasSeries = Array.isArray(series) && series.length > 0;
  console.log("hasSeries:", hasSeries, "series length:", series?.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Series</h1>
          <p className="text-gray-600 mt-2">Manage series and episodes</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>+ New Series</Button>
      </div>

      {hasSeries ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.map((s) => (
            <Link key={s.id} to={`/admin/series/${s.id}`}
              className="border rounded-lg p-4 hover:shadow transition bg-white flex flex-col">
              <img src={s.thumbnail_url || '/placeholder.jpg'} alt={s.title} className="h-40 w-full object-cover rounded" />
              <div className="mt-2 flex-1">
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.total_episodes} episodes</p>
              </div>
              <Button variant="outline" className="mt-2 w-full">Manage</Button>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-white">
          <p className="text-gray-500 mb-4">No series have been created yet.</p>
          <Button onClick={() => setDialogOpen(true)}>Create your first series</Button>
        </div>
      )}

      <SeriesDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
