import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CircularButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CircularButton({ children, onClick, className, size = "md" }: CircularButtonProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "rounded-full bg-black/20 backdrop-blur-sm transition-all duration-200",
        "hover:bg-red-600/20 hover:text-red-400 hover:scale-110",
        "border border-gray-700/50 hover:border-red-500/50",
        "text-white flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Button>
  );
}