import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings as SettingsIcon, 
  Globe, 
  Shield, 
  Video, 
  Users, 
  Bell,
  Save,
  RefreshCw
} from "lucide-react";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxVideoDuration: number;
  maxVideoSize: number;
  allowedVideoFormats: string[];
  maxUploadsPerDay: number;
  emailNotifications: boolean;
  autoApproveVideos: boolean;
  enableComments: boolean;
  enableLikes: boolean;
  enableSharing: boolean;
  defaultLanguage: string;
  supportedLanguages: string[];
  analyticsEnabled: boolean;
  backupEnabled: boolean;
  backupFrequency: string;
}

const defaultSettings: SystemSettings = {
  siteName: "SAANSE",
  siteDescription: "Divine Stories Platform",
  siteUrl: "https://saanse.app",
  contactEmail: "admin@saanse.app",
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: true,
  maxVideoDuration: 600,
  maxVideoSize: 100,
  allowedVideoFormats: ["mp4", "webm", "avi", "mov"],
  maxUploadsPerDay: 10,
  emailNotifications: true,
  autoApproveVideos: false,
  enableComments: true,
  enableLikes: true,
  enableSharing: true,
  defaultLanguage: "en",
  supportedLanguages: ["en", "hi", "gu", "mr"],
  analyticsEnabled: true,
  backupEnabled: true,
  backupFrequency: "daily"
};

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      return newSettings;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveSettingsMutation.mutateAsync(settings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    toast({
      title: "Reset",
      description: "Settings reset to defaults",
    });
  };

  const updateSetting = <K extends keyof SystemSettings>(
    key: K, 
    value: SystemSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">
            Configure platform-wide settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic site configuration and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateSetting("siteName", e.target.value)}
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => updateSetting("siteUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateSetting("siteDescription", e.target.value)}
                placeholder="Enter site description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                value={settings.contactEmail}
                onChange={(e) => updateSetting("contactEmail", e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Access
            </CardTitle>
            <CardDescription>
              Control access and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable the site for maintenance
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to create accounts
                </p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => updateSetting("allowRegistration", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify their email before accessing
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => updateSetting("requireEmailVerification", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Content Settings
            </CardTitle>
            <CardDescription>
              Configure video upload and content management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxVideoDuration">Maximum Video Duration (seconds)</Label>
                <Input
                  id="maxVideoDuration"
                  type="number"
                  value={settings.maxVideoDuration}
                  onChange={(e) => updateSetting("maxVideoDuration", parseInt(e.target.value) || 0)}
                  placeholder="600"
                />
              </div>
              <div>
                <Label htmlFor="maxVideoSize">Maximum Video Size (MB)</Label>
                <Input
                  id="maxVideoSize"
                  type="number"
                  value={settings.maxVideoSize}
                  onChange={(e) => updateSetting("maxVideoSize", parseInt(e.target.value) || 0)}
                  placeholder="100"
                />
              </div>
            </div>
            
            <div>
              <Label>Allowed Video Formats</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["mp4", "webm", "avi", "mov", "mkv", "flv"].map((format) => (
                  <div key={format} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={format}
                      checked={settings.allowedVideoFormats.includes(format)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateSetting("allowedVideoFormats", [...settings.allowedVideoFormats, format]);
                        } else {
                          updateSetting("allowedVideoFormats", settings.allowedVideoFormats.filter(f => f !== format));
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={format} className="text-sm">{format.toUpperCase()}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve Videos</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve uploaded videos
                </p>
              </div>
              <Switch
                checked={settings.autoApproveVideos}
                onCheckedChange={(checked) => updateSetting("autoApproveVideos", checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="maxUploadsPerDay">Maximum Uploads Per Day</Label>
              <Input
                id="maxUploadsPerDay"
                type="number"
                value={settings.maxUploadsPerDay}
                onChange={(e) => updateSetting("maxUploadsPerDay", parseInt(e.target.value) || 0)}
                placeholder="10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Social Features
            </CardTitle>
            <CardDescription>
              Enable or disable social interaction features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to comment on videos
                </p>
              </div>
              <Switch
                checked={settings.enableComments}
                onCheckedChange={(checked) => updateSetting("enableComments", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Likes</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to like videos
                </p>
              </div>
              <Switch
                checked={settings.enableLikes}
                onCheckedChange={(checked) => updateSetting("enableLikes", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to share videos
                </p>
              </div>
              <Switch
                checked={settings.enableSharing}
                onCheckedChange={(checked) => updateSetting("enableSharing", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure email and system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for important events
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
            <CardDescription>
              Advanced system configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <select
                  id="defaultLanguage"
                  value={settings.defaultLanguage}
                  onChange={(e) => updateSetting("defaultLanguage", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="gu">Gujarati</option>
                  <option value="mr">Marathi</option>
                </select>
              </div>
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <select
                  id="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={(e) => updateSetting("backupFrequency", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Collect usage analytics and statistics
                </p>
              </div>
              <Switch
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => updateSetting("analyticsEnabled", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup system data
                </p>
              </div>
              <Switch
                checked={settings.backupEnabled}
                onCheckedChange={(checked) => updateSetting("backupEnabled", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
