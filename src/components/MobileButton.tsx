import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileButtonProps {
  children: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "divine" | "peaceful";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

const MobileButton = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left"
}: MobileButtonProps) => {
  const baseClasses = cn(
    "touch-manipulation transition-all duration-200",
    fullWidth && "w-full",
    className
  );

  const sizeClasses = {
    sm: "text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 h-8 md:h-9",
    default: "text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 h-10 md:h-11",
    lg: "text-base md:text-lg px-4 md:px-6 py-3 md:py-4 h-12 md:h-14",
    icon: "w-8 h-8 md:w-10 md:h-10 p-0"
  };

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    divine: "bg-gradient-divine text-gray-100 hover:shadow-divine",
    peaceful: "bg-gradient-peaceful text-gray-900 hover:shadow-peaceful"
  };

  return (
    <Button
      variant={variant as any}
      size={size as any}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        loading && "opacity-75 cursor-wait"
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      
      {icon && iconPosition === "left" && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === "right" && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </Button>
  );
};

export default MobileButton;
