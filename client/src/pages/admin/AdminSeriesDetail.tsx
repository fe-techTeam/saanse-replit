import { useParams } from "react-router-dom";
import { useSeriesVideos } from "@/hooks/useSeriesVideos";
import { useSeries } from "@/hooks/useSeries";
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { GripVertical } from "lucide-react";

// Sortable Item Component
function SortableVideoItem({ video }: { video: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border p-4 bg-white rounded flex gap-4 items-center cursor-move hover:shadow-md transition-shadow"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>
      <img src={video.thumbnail_url} alt={video.title} className="w-24 h-14 object-cover rounded" />
      <div className="flex-1">
        <p className="font-semibold text-gray-900">Ep {video.episode_number}: {video.title}</p>
        <p className="text-sm text-gray-500">{video.description?.substring(0, 100)}...</p>
      </div>
    </div>
  );
}

export default function AdminSeriesDetail() {
  const { id = "" } = useParams();
  const { data: videos, isLoading, refetch } = useSeriesVideos(id, !!id);
  const { data: series, refetch: refetchSeries } = useSeries();
  const [items, setItems] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // sync items when videos fetched
  React.useEffect(() => {
    if (videos) {
      // Sort by episode_number first, then map to IDs
      const sortedVideos = [...videos].sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
      setItems(sortedVideos.map(v => v.id));
    }
  }, [videos]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    const newOrder = arrayMove(items, oldIndex, newIndex);
    setItems(newOrder);
  };

  const saveOrder = async () => {
    setIsSaving(true);
    try {
      const payload = items.map((videoId, idx) => ({ videoId, episodeNumber: idx + 1 }));
      await apiClient.patch(`/api/series/${id}/videos/reorder`, payload);
      await refetch();
      await refetchSeries(); // Refresh series data to update episode count
    } catch (error) {
      console.error("Failed to save order:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  const currentSeries = series?.find(s => s.id === id);
  const sortedVideos = videos ? [...videos].sort((a, b) => {
    const aIndex = items.indexOf(a.id);
    const bIndex = items.indexOf(b.id);
    return aIndex - bIndex;
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{currentSeries?.title}</h1>
          <p className="text-gray-600">{videos?.length || 0} episodes • Drag to reorder</p>
        </div>
        <Button onClick={saveOrder} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Order"}
        </Button>
      </div>

      {videos && videos.length > 0 ? (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sortedVideos.map((video) => (
                <SortableVideoItem key={video.id} video={video} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No videos in this series yet.</p>
          <p className="text-sm text-gray-400 mt-2">Upload videos and assign them to this series to see them here.</p>
        </div>
      )}
    </div>
  );
}
