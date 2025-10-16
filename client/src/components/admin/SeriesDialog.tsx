import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { getAdminAuthHeaders } from "@/hooks/useAdminAuth";
import type { SeriesType } from "@/types/video";

interface SeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series?: SeriesType | null;
}

interface SeriesFormData {
  title: string;
  description: string;
  category: string;
  slug: string;
  thumbnailUrl: string;
  bannerUrl: string;
  status: "draft" | "published" | "archived";
}

const CATEGORIES = [
  "Ramayana",
  "Mahabharata",
  "Krishna",
  "Shiva",
  "Hanuman",
  "Ganesha",
  "Devi",
  "Festivals",
  "Bhajans",
  "Explained"
] as const;

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400";

export function SeriesDialog({ open, onOpenChange, series }: SeriesDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!series;

  const [formData, setFormData] = useState<SeriesFormData>({
    title: "",
    description: "",
    category: "Ramayana",
    slug: "",
    thumbnailUrl: "",
    bannerUrl: "",
    status: "draft"
  });

  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof SeriesFormData, string>>>({});

  useEffect(() => {
    if (open) {
      if (series) {
        setFormData({
          title: series.title || "",
          description: series.description || "",
          category: series.category || "Ramayana",
          slug: series.slug || "",
          thumbnailUrl: series.thumbnail_url || "",
          bannerUrl: series.banner_url || "",
          status: (series.status as "draft" | "published" | "archived") || "draft"
        });
      } else {
        setFormData({
          title: "",
          description: "",
          category: "Ramayana",
          slug: "",
          thumbnailUrl: "",
          bannerUrl: "",
          status: "draft"
        });
      }
      setError(null);
      setValidationErrors({});
    }
  }, [open, series]);

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleChange = (field: keyof SeriesFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "title" && !isEditing) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof SeriesFormData, string>> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (formData.title.trim().length > 100) {
      errors.title = "Title must be less than 100 characters";
    }

    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    if (formData.thumbnailUrl && !isValidUrl(formData.thumbnailUrl)) {
      errors.thumbnailUrl = "Please enter a valid URL";
    }

    if (formData.bannerUrl && !isValidUrl(formData.bannerUrl)) {
      errors.bannerUrl = "Please enter a valid URL";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const transformToApiFormat = (data: SeriesFormData) => {
    return {
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      category: data.category.trim(),
      slug: data.slug.trim(),
      thumbnailUrl: data.thumbnailUrl.trim() || DEFAULT_THUMBNAIL,
      bannerUrl: data.bannerUrl.trim() || undefined,
      status: data.status
    };
  };

  const createMutation = useMutation({
    mutationFn: async (data: SeriesFormData) => {
      const payload = transformToApiFormat(data);
      return await apiClient.post<SeriesType>(
        "/api/admin/series",
        payload,
        { headers: getAdminAuthHeaders() }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/series"] });
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
      onOpenChange(false);
      setError(null);
      setValidationErrors({});
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.error 
        || err?.response?.data?.details 
        || err?.message 
        || "Failed to create series";
      setError(errorMessage);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SeriesFormData) => {
      if (!series?.id) throw new Error("Series ID is required for update");
      const payload = transformToApiFormat(data);
      return await apiClient.patch<SeriesType>(
        `/api/admin/series/${series.id}`,
        payload,
        { headers: getAdminAuthHeaders() }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/series"] });
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
      onOpenChange(false);
      setError(null);
      setValidationErrors({});
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.error 
        || err?.response?.data?.details 
        || err?.message 
        || "Failed to update series";
      setError(errorMessage);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      setError("Form data is not properly initialized. Please close and reopen the dialog.");
      return;
    }
    
    if (!validateForm()) {
      setError("Please fix the validation errors");
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(formData);
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (err) {
      // Error is handled by mutation onError
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Series" : "Create New Series"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter series title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              disabled={isPending}
              required
              className={validationErrors.title ? "border-red-500" : ""}
            />
            {validationErrors.title && (
              <p className="text-xs text-red-600">{validationErrors.title}</p>
            )}
            <p className="text-xs text-gray-500">
              The name of your series (e.g., "Ramayana Episodes")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              placeholder="series-url-slug"
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              disabled={isPending}
              required
              className={validationErrors.slug ? "border-red-500" : ""}
            />
            {validationErrors.slug && (
              <p className="text-xs text-red-600">{validationErrors.slug}</p>
            )}
            <p className="text-xs text-gray-500">
              URL-friendly identifier (auto-generated from title, lowercase with hyphens)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter series description (optional)"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={isPending}
              rows={4}
              className={`resize-none ${validationErrors.description ? "border-red-500" : ""}`}
            />
            {validationErrors.description && (
              <p className="text-xs text-red-600">{validationErrors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              A brief description of what this series covers (max 500 characters)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              The main topic or theme of this series
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail" className="text-sm font-medium">
              Thumbnail URL
            </Label>
            <Input
              id="thumbnail"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.thumbnailUrl}
              onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
              disabled={isPending}
              className={validationErrors.thumbnailUrl ? "border-red-500" : ""}
            />
            {validationErrors.thumbnailUrl && (
              <p className="text-xs text-red-600">{validationErrors.thumbnailUrl}</p>
            )}
            {formData.thumbnailUrl && isValidUrl(formData.thumbnailUrl) && (
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img 
                  src={formData.thumbnailUrl} 
                  alt="Thumbnail preview" 
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL;
                  }}
                />
              </div>
            )}
            <p className="text-xs text-gray-500">
              Leave empty to use default thumbnail image
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner" className="text-sm font-medium">
              Banner URL
            </Label>
            <Input
              id="banner"
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={formData.bannerUrl}
              onChange={(e) => handleChange("bannerUrl", e.target.value)}
              disabled={isPending}
              className={validationErrors.bannerUrl ? "border-red-500" : ""}
            />
            {validationErrors.bannerUrl && (
              <p className="text-xs text-red-600">{validationErrors.bannerUrl}</p>
            )}
            {formData.bannerUrl && isValidUrl(formData.bannerUrl) && (
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img 
                  src={formData.bannerUrl} 
                  alt="Banner preview" 
                  className="w-full h-24 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <p className="text-xs text-gray-500">
              Optional wide banner image for series header (recommended: 1920x400)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "draft" | "published" | "archived") => handleChange("status", value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>Draft - Hidden from users</span>
                  </div>
                </SelectItem>
                <SelectItem value="published">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Published - Visible to users</span>
                  </div>
                </SelectItem>
                <SelectItem value="archived">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    <span>Archived - Hidden and read-only</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {formData.status === "draft" && "Save as draft to work on it before publishing"}
              {formData.status === "published" && "Series will be visible to all users"}
              {formData.status === "archived" && "Series will be hidden but preserved"}
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isEditing ? "Updating..." : "Creating..."}
                </span>
              ) : (
                <span>{isEditing ? "Update Series" : "Create Series"}</span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="px-8"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
