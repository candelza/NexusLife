import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Users, 
  Calendar, 
  User, 
  Plus, 
  Bell,
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import NotificationBell from "./NotificationBell";
import type { User as SupabaseUser } from '@supabase/supabase-js';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setIsAdmin(session.user.email === 'candelaz28@gmail.com');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAdmin(session.user.email === 'candelaz28@gmail.com');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถออกจากระบบได้",
        variant: "destructive",
      });
    } else {
      toast({
        title: "ออกจากระบบสำเร็จ",
        description: "แล้วพบกันใหม่!",
      });
      navigate("/auth");
    }
  };

  const handleSettingsClick = () => {
    if (isAdmin) {
      navigate("/admin");
    } else {
      toast({
        title: "ไม่มีสิทธิ์เข้าถึง",
        description: "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงการตั้งค่าได้",
        variant: "destructive"
      });
    }
  };

  const navItems = [
    { path: "/", label: "คำอธิษฐาน", icon: Heart },
    { path: "/groups", label: "กลุ่มดูแล", icon: Users },
    { path: "/calendar", label: "ปฏิทิน", icon: Calendar },
    { path: "/profile", label: "โปรไฟล์", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-card/60 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-divine rounded-xl flex items-center justify-center shadow-glow">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold bg-gradient-divine bg-clip-text text-transparent">
                เน็กซัส
              </h1>
              <p className="text-xs text-muted-foreground">ชุมชนแห่งการอธิษฐาน</p>
            </div>
          </Link>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "divine" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-9 px-3",
                      isActive(item.path) && "shadow-divine"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/new-prayer">
            <Button variant="divine" size="sm">
              <Plus className="w-4 h-4" />
              คำอธิษฐานใหม่
            </Button>
          </Link>
          
          <NotificationBell />
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSettingsClick}
            title={isAdmin ? "การจัดการระบบ" : "การตั้งค่า"}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {user && (
            <Button variant="ghost" size="icon" onClick={handleLogout} title="ออกจากระบบ">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-card/60 backdrop-blur-md border-b border-border/50">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-divine rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold bg-gradient-divine bg-clip-text text-transparent">
              เน็กซัส
            </span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <NotificationBell />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSettingsClick}
              title={isAdmin ? "การจัดการระบบ" : "การตั้งค่า"}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border/50 z-50">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant={isActive(item.path) ? "divine" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              <div className="pt-2 border-t border-border/50">
                <Link to="/new-prayer" onClick={() => setIsOpen(false)}>
                  <Button variant="divine" className="w-full">
                    <Plus className="w-4 h-4" />
                    คำอธิษฐานใหม่
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;