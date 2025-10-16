import { useAdminSeries } from "@/hooks/useAdminSeries";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SeriesDialog } from "@/components/admin/SeriesDialog";
import { useState } from "react";
import { useSeriesManagement } from "@/hooks/useSeriesManagement";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SeriesType } from "@/types/video";

export default function AdminSeriesList() {
  const { data: series, isLoading, error } = useAdminSeries();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<SeriesType | null>(null);
  const { deleteSeries } = useSeriesManagement();

  console.log("AdminSeriesList render - series:", series, "isLoading:", isLoading, "error:", error);

  const handleEdit = (series: SeriesType) => {
    setEditingSeries(series);
    setDialogOpen(true);
  };

  const handleDelete = (series: SeriesType) => {
    setSeriesToDelete(series);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (seriesToDelete) {
      deleteSeries.mutate(seriesToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSeriesToDelete(null);
        }
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingSeries(null);
  };

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
        <Button onClick={() => setDialogOpen(true)} className="text-gray-900">+ New Series</Button>
      </div>

      {hasSeries ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 hover:shadow transition bg-white flex flex-col relative group">
              <img src={s.thumbnail_url || '/placeholder.jpg'} alt={s.title} className="h-40 w-full object-cover rounded" />
              <div className="mt-2 flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.total_episodes} episodes</p>
                <p className="text-xs text-gray-400 capitalize">{s.status}</p>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Link to={`/admin/series/${s.id}`} className="flex-1">
                  <Button variant="outline" className="w-full text-gray-900">Manage</Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-900">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(s)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(s)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-white">
          <p className="text-gray-500 mb-4">No series have been created yet.</p>
          <Button onClick={() => setDialogOpen(true)} className="text-gray-900">Create your first series</Button>
        </div>
      )}

      <SeriesDialog 
        open={dialogOpen} 
        onOpenChange={handleDialogClose}
        series={editingSeries}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{seriesToDelete?.title}"? This action cannot be undone.
              {seriesToDelete?.total_episodes && seriesToDelete.total_episodes > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  This series has {seriesToDelete.total_episodes} episodes. You must remove all videos first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteSeries.isPending || (seriesToDelete?.total_episodes && seriesToDelete.total_episodes > 0)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSeries.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
