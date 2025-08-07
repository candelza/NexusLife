import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MobileOptimizedCardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  onClick?: () => void;
  interactive?: boolean;
}

const MobileOptimizedCard = ({ 
  children, 
  className, 
  header, 
  onClick, 
  interactive = false 
}: MobileOptimizedCardProps) => {
  return (
    <Card 
      className={cn(
        "bg-card/60 backdrop-blur-sm border-border/50 transition-all duration-200",
        interactive && "cursor-pointer hover:shadow-peaceful active:scale-95",
        className
      )}
      onClick={onClick}
    >
      {header && (
        <CardHeader className="pb-2 md:pb-3">
          {header}
        </CardHeader>
      )}
      <CardContent className="p-3 md:p-4 lg:p-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileOptimizedCard;
