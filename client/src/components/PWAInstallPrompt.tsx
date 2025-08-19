import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

export function PWAInstallPrompt() {
  const { showInstallPrompt, installApp, dismissInstall } = usePWA();

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 bg-dharma-gold text-dharma-dark p-4 rounded-lg shadow-lg z-40">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">Install Dharma Stream</h4>
          <p className="text-sm opacity-80">Access your devotional content offline</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={installApp}
            className="px-3 py-1 bg-dharma-dark text-white rounded text-sm hover:bg-gray-800"
          >
            Install
          </Button>
          <Button
            onClick={dismissInstall}
            variant="outline"
            className="px-3 py-1 border border-dharma-dark rounded text-sm hover:bg-dharma-dark hover:text-white"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
