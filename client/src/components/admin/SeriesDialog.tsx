import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSeriesManagement } from "@/hooks/useSeriesManagement";
import type { SeriesType } from "@/types/video";

interface SeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series?: SeriesType | null; // For editing
}

export function SeriesDialog({ open, onOpenChange, series }: SeriesDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Ramayana");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [status, setStatus] = useState("draft");
  const { createSeries, updateSeries } = useSeriesManagement();

  const isEditing = !!series;

  // Reset form when dialog opens/closes or series changes
  useEffect(() => {
    if (open) {
      if (series) {
        setTitle(series.title || "");
        setDescription(series.description || "");
        setCategory(series.category || "Ramayana");
        setThumbnailUrl(series.thumbnail_url || "");
        setBannerUrl(series.banner_url || "");
        setStatus(series.status || "draft");
      } else {
        setTitle("");
        setDescription("");
        setCategory("Ramayana");
        setThumbnailUrl("");
        setBannerUrl("");
        setStatus("draft");
      }
    }
  }, [open, series]);

  // Handle form submission
  const handleCreate = () => {
    const payload = { 
      title, 
      description, 
      category,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
      bannerUrl: bannerUrl || undefined,
      status
    };
    createSeries.mutate(payload, {
      onSuccess: () => onOpenChange(false)
    });
  };

  const handleUpdate = () => {
    if (!series) return;
    const payload = { 
      id: series.id,
      title, 
      description, 
      category,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
      bannerUrl: bannerUrl || undefined,
      status
    };
    updateSeries.mutate(payload, {
      onSuccess: () => onOpenChange(false)
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    if (isEditing) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Series" : "New Series"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Series title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Series description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ramayana">Ramayana</SelectItem>
                <SelectItem value="Mahabharata">Mahabharata</SelectItem>
                <SelectItem value="Krishna">Krishna</SelectItem>
                <SelectItem value="Shiva">Shiva</SelectItem>
                <SelectItem value="Hanuman">Hanuman</SelectItem>
                <SelectItem value="Ganesha">Ganesha</SelectItem>
                <SelectItem value="Devi">Devi</SelectItem>
                <SelectItem value="Festivals">Festivals</SelectItem>
                <SelectItem value="Bhajans">Bhajans</SelectItem>
                <SelectItem value="Explained">Explained</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              placeholder="https://example.com/thumbnail.jpg"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="banner">Banner URL (optional)</Label>
            <Input
              id="banner"
              placeholder="https://example.com/banner.jpg"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={!title.trim() || createSeries.isPending || updateSeries.isPending}
              className="flex-1 text-gray-900"
            >
              {(createSeries.isPending || updateSeries.isPending) ? "Saving..." : (isEditing ? "Update" : "Create")}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="text-gray-900">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
