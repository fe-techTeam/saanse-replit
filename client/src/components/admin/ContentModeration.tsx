import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Flag, 
  Check, 
  X, 
  Eye, 
  AlertTriangle, 
  User, 
  Calendar,
  MessageSquare,
  Shield
} from "lucide-react";

interface ReportedContent {
  id: string;
  contentId: string;
  contentType: "video" | "comment" | "user";
  contentTitle: string;
  contentUrl?: string;
  reportedBy: string;
  reportedAt: string;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved";
  moderatorId?: string;
  moderatorAction?: "approve" | "remove" | "warn";
  moderatorNotes?: string;
}

interface ContentItem {
  id: string;
  title: string;
  thumbnailUrl?: string;
  category: string;
  createdAt: string;
  reportedCount: number;
}

export default function ContentModeration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Mock data - in real app, this would come from API
  const mockReportedContent: ReportedContent[] = [
    {
      id: "1",
      contentId: "video-1",
      contentType: "video",
      contentTitle: "Krishna Leela - Part 1",
      contentUrl: "https://example.com/video1",
      reportedBy: "user123",
      reportedAt: "2024-01-15T10:30:00Z",
      reason: "Inappropriate content",
      description: "This video contains content that may not be suitable for all audiences",
      status: "pending"
    },
    {
      id: "2",
      contentId: "video-2",
      contentType: "video",
      contentTitle: "Ramayana Stories",
      contentUrl: "https://example.com/video2",
      reportedBy: "user456",
      reportedAt: "2024-01-14T15:45:00Z",
      reason: "Copyright violation",
      description: "This video appears to use copyrighted material without permission",
      status: "reviewed",
      moderatorId: "mod1",
      moderatorAction: "warn",
      moderatorNotes: "Content reviewed, warning issued to uploader"
    }
  ];

  const mockContentItems: ContentItem[] = [
    {
      id: "video-1",
      title: "Krishna Leela - Part 1",
      thumbnailUrl: "https://example.com/thumb1.jpg",
      category: "Krishna",
      createdAt: "2024-01-10T08:00:00Z",
      reportedCount: 3
    },
    {
      id: "video-2",
      title: "Ramayana Stories",
      thumbnailUrl: "https://example.com/thumb2.jpg",
      category: "Ramayana",
      createdAt: "2024-01-08T12:00:00Z",
      reportedCount: 1
    }
  ];

  // Filter reported content by status
  const pendingReports = mockReportedContent.filter(r => r.status === "pending");
  const reviewedReports = mockReportedContent.filter(r => r.status === "reviewed");

  // Moderation actions mutation
  const moderationActionMutation = useMutation({
    mutationFn: async ({ reportId, action, notes }: { 
      reportId: string; 
      action: "approve" | "remove" | "warn"; 
      notes?: string;
    }) => {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      return { reportId, action, notes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation"] });
      toast({
        title: "Success",
        description: "Moderation action completed successfully",
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete moderation action",
        variant: "destructive"
      });
    }
  });

  const handleModerationAction = (action: "approve" | "remove" | "warn", notes?: string) => {
    if (!selectedReport) return;

    moderationActionMutation.mutate({
      reportId: selectedReport.id,
      action,
      notes
    });
  };

  const handleReview = (report: ReportedContent) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case "inappropriate content":
        return "destructive";
      case "copyright violation":
        return "secondary";
      case "spam":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "reviewed":
        return "secondary";
      case "resolved":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Moderation</h2>
          <p className="text-muted-foreground">
            Review and moderate reported content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {pendingReports.length} Pending
          </Badge>
          <Badge variant="secondary">
            {reviewedReports.length} Reviewed
          </Badge>
        </div>
      </div>

      {/* Moderation Dashboard */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed Today</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewedReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Completed reviews
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">
              Time to review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingReports.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedReports.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">No pending reports</div>
              </CardContent>
            </Card>
          ) : (
            pendingReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getReasonColor(report.reason)}>
                          {report.reason}
                        </Badge>
                        <Badge variant="outline">
                          {report.contentType}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(report.reportedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold mb-2">{report.contentTitle}</h3>
                      
                      {report.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {report.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Reported by: {report.reportedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(report.reportedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(report)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="reviewed" className="space-y-4">
          {reviewedReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">No reviewed reports</div>
              </CardContent>
            </Card>
          ) : (
            reviewedReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getReasonColor(report.reason)}>
                          {report.reason}
                        </Badge>
                        <Badge variant={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        {report.moderatorAction && (
                          <Badge variant="outline">
                            {report.moderatorAction}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {new Date(report.reportedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold mb-2">{report.contentTitle}</h3>
                      
                      {report.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {report.description}
                        </p>
                      )}
                      
                      {report.moderatorNotes && (
                        <div className="bg-muted p-3 rounded-md mb-3">
                          <p className="text-sm font-medium mb-1">Moderator Notes:</p>
                          <p className="text-sm text-muted-foreground">
                            {report.moderatorNotes}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Reported by: {report.reportedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          Moderated by: {report.moderatorId}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Reported Content</DialogTitle>
            <DialogDescription>
              Review the reported content and take appropriate action
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Content Preview */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{selectedReport.contentTitle}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={getReasonColor(selectedReport.reason)}>
                    {selectedReport.reason}
                  </Badge>
                  <Badge variant="outline">
                    {selectedReport.contentType}
                  </Badge>
                </div>
                
                {selectedReport.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedReport.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Reported by: {selectedReport.reportedBy}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedReport.reportedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* Moderation Actions */}
              <div className="space-y-4">
                <h4 className="font-medium">Take Action</h4>
                
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleModerationAction("approve")}
                    disabled={moderationActionMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Content
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleModerationAction("warn")}
                    disabled={moderationActionMutation.isPending}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Issue Warning
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => handleModerationAction("remove")}
                    disabled={moderationActionMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Content
                  </Button>
                </div>
              </div>
              
              {moderationActionMutation.isPending && (
                <div className="text-center text-muted-foreground">
                  Processing moderation action...
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
