import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { SeriesType } from "@/types/video";

interface SeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SeriesDialog({ open, onOpenChange }: SeriesDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const createSeries = useMutation({
    mutationFn: async () => {
      const payload = { 
        title, 
        description, 
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400" // Default placeholder
      };
      return apiClient.post<SeriesType>("/api/series", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
      setTitle("");
      setDescription("");
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Series</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Series title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={() => createSeries.mutate()} disabled={!title || createSeries.isPending}>
            {createSeries.isPending ? "Saving..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
