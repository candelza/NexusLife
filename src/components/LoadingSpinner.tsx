import { Heart } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "divine" | "peaceful";
}

const LoadingSpinner = ({ 
  message = "กำลังโหลด...", 
  size = "md",
  variant = "default"
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24"
  };

  const variantClasses = {
    default: "bg-card/60 backdrop-blur-sm border-border/50",
    divine: "bg-gradient-divine shadow-divine",
    peaceful: "bg-gradient-peaceful shadow-peaceful"
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center">
        <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse`}>
          <Heart className={`${size === "sm" ? "w-4 h-4" : size === "md" ? "w-8 h-8" : "w-12 h-12"} text-primary-foreground`} />
        </div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
