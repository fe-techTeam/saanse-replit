import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";
import { X, Download, Smartphone } from "lucide-react";

export function PWAInstallPrompt() {
  const { showInstallPrompt, installApp, dismissInstall, isIOS } = usePWA();

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 p-4 rounded-xl shadow-xl z-50 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-white/20 p-2 rounded-lg">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg">Install SAANSE App</h4>
            <p className="text-sm opacity-90 mt-1">
              {isIOS 
                ? "Tap the share button and select 'Add to Home Screen' to install the app"
                : "Get instant access to divine stories. Works offline and feels like a native app!"
              }
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs opacity-80">
              <span>🚀 Fast loading</span>
              <span>•</span>
              <span>📱 Native feel</span>
              <span>•</span>
              <span>🔄 Offline access</span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={dismissInstall}
          variant="ghost"
          size="sm"
          className="text-gray-900 hover:bg-white/20 p-1 h-auto min-w-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {!isIOS && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={installApp}
            className="flex-1 bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2 font-medium"
          >
            <Download className="w-4 h-4" />
            Install App
          </Button>
          <Button
            onClick={dismissInstall}
            variant="outline"
            className="border-gray-900/20 text-gray-900 hover:bg-white/20"
          >
            Maybe Later
          </Button>
        </div>
      )}
      
      {isIOS && (
        <div className="mt-3 p-3 bg-white/10 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span>📱</span>
            <span>Tap</span>
            <div className="bg-white/20 px-2 py-1 rounded text-xs">Share</div>
            <span>then</span>
            <div className="bg-white/20 px-2 py-1 rounded text-xs">Add to Home Screen</div>
          </div>
        </div>
      )}
    </div>
  );
}
