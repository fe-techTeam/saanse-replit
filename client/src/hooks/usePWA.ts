import { useState, useEffect } from "react";

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInStandaloneMode = 'standalone' in window.navigator && (window.navigator as any).standalone;
    const isInstalled = isStandalone || isInStandaloneMode;
    setIsInstalled(isInstalled);

    // Show install prompt logic
    if (!isInstalled) {
      if (iOS) {
        // For iOS, show manual install instructions if not in standalone mode
        const showIOSPrompt = !isStandalone && !localStorage.getItem('pwa-dismissed');
        setShowInstallPrompt(showIOSPrompt);
        setCanInstall(true);
      } else {
        // For Android/other platforms, wait for beforeinstallprompt
        setCanInstall(false);
      }
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      setCanInstall(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setCanInstall(false);
      localStorage.removeItem('pwa-dismissed');
    };

    // Listen for standalone mode changes
    const handleStandaloneChange = () => {
      const isNowStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsInstalled(isNowStandalone);
      if (isNowStandalone) {
        setShowInstallPrompt(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    standaloneMediaQuery.addEventListener('change', handleStandaloneChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneMediaQuery.removeEventListener('change', handleStandaloneChange);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const dismissInstall = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    
    // Remember dismissal for iOS users
    if (isIOS) {
      localStorage.setItem('pwa-dismissed', Date.now().toString());
    }
  };

  // Check if we should show the prompt again (after 7 days for iOS)
  const shouldShowIOSPrompt = () => {
    if (!isIOS || isInstalled) return false;
    
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (!dismissed) return true;
    
    const dismissedDate = new Date(parseInt(dismissed));
    const now = new Date();
    const daysSinceDismissed = Math.floor((now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceDismissed >= 7;
  };

  return {
    showInstallPrompt: showInstallPrompt && (canInstall || (isIOS && shouldShowIOSPrompt())),
    isInstalled,
    isIOS,
    canInstall,
    installApp,
    dismissInstall,
  };
}
