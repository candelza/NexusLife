import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Users, 
  Calendar,
  Search,
  Filter,
  Star,
  MessageCircle,
  Share2,
  Clock,
  User as UserIcon,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Book
} from "lucide-react";
import heroImage from "/hero-prayer.jpg";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import PrayerCard from "@/components/PrayerCard";
import DailyBibleVerse from "@/components/DailyBibleVerse";
import PrayerStats from "@/components/PrayerStats";

interface Prayer {
  id: string;
  title: string;
  description: string;
  category: string | null;
  is_urgent: boolean;
  is_private: boolean;
  is_anonymous: boolean;
  status: string;
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  likes_count?: number;
  comments_count?: number;
  user_liked?: boolean;
}

const quickActions = [
  { icon: Heart, label: "แบ่งปันคำอธิษฐาน", color: "text-pink-500" },
  { icon: Book, label: "อ่านพระคัมภีร์", color: "text-purple-500" },
  { icon: Users, label: "เข้าร่วมกลุ่ม", color: "text-blue-500" },
  { icon: Calendar, label: "การประชุมอธิษฐาน", color: "text-green-500" },
];

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [isLoadingPrayers, setIsLoadingPrayers] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch prayers from database with better error handling
  const fetchPrayers = async () => {
    if (!user) {
      console.log('No user, skipping fetchPrayers');
      return;
    }
    
    console.log('Fetching prayers for user:', user.id);
    setIsLoadingPrayers(true);
    setHasError(false);
    setErrorMessage("");
    
    try {
      const { data, error } = await supabase
        .from('prayers')
        .select(`
          *,
          profile:profiles!prayers_user_id_fkey(
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      console.log('Prayers fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching prayers:', error);
        throw error;
      }
      
      // Validate prayer data
      const validPrayers = (data || []).filter(prayer => {
        if (!prayer || !prayer.id || !prayer.title || !prayer.description) {
          console.warn('Invalid prayer data found:', prayer);
          return false;
        }
        return true;
      });
      
      setPrayers(validPrayers);
      
      if (validPrayers.length !== (data || []).length) {
        console.warn(`Filtered out ${(data || []).length - validPrayers.length} invalid prayers`);
      }
      
    } catch (error: any) {
      console.error('Error in fetchPrayers:', error);
      setHasError(true);
      
      let errorMsg = "ไม่สามารถโหลดคำอธิษฐานได้";
      
      if (error?.code === 'PGRST301' || error?.code === 'PGRST302') {
        errorMsg = "ปัญหาการเชื่อมต่อกับเซิร์ฟเวอร์";
      } else if (error?.code === '42P01') {
        errorMsg = "ตารางคำอธิษฐานไม่พบในฐานข้อมูล";
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      
      // Don't show toast for network errors to avoid spam
      if (error.code !== 'PGRST301' && error.code !== 'PGRST302') {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingPrayers(false);
    }
  };

  // Auth state management
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Redirect to auth if no user
        if (!session?.user) {
          console.log('No user found, redirecting to auth');
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session?.user) {
        console.log('No initial session, redirecting to auth');
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch prayers when user is available
  useEffect(() => {
    if (user) {
      console.log('User available, fetching prayers');
      fetchPrayers();
    }
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  // Refresh prayers every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up prayer refresh interval');
    const interval = setInterval(() => {
      console.log('Refreshing prayers...');
      fetchPrayers();
    }, 30000); // 30 seconds

    return () => {
      console.log('Clearing prayer refresh interval');
      clearInterval(interval);
    };
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  const handlePrayerUpdate = () => {
    fetchPrayers();
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage("");
    fetchPrayers();
  };

  const filteredPrayers = prayers.filter(prayer => {
    const searchLower = searchTerm.toLowerCase();
    const title = prayer.title || '';
    const description = prayer.description || '';
    const displayName = prayer.profile?.display_name || '';
    
    return title.toLowerCase().includes(searchLower) ||
           description.toLowerCase().includes(searchLower) ||
           displayName.toLowerCase().includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-divine rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-divine animate-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an issue
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-divine rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-divine">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">กรุณาเข้าสู่ระบบ</p>
          <Button onClick={() => navigate("/auth")} variant="divine">
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Prayer Community" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight">
                รวมใจใน
                <span className="block bg-gradient-to-r from-primary-glow to-yellow-300 bg-clip-text text-transparent">
                  การอธิษฐาน
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                เข้าร่วมชุมชนของเราในการยกชูซึ่งกันและกันผ่านการอธิษฐาน ความเชื่อ และการเป็นเพื่อนเคียง
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="xl" variant="peaceful">
                  <Users className="w-5 h-5" />
                  เข้าร่วมกลุ่มดูแล
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 -mt-16 relative z-10">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-divine transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => navigate("/new-prayer")}>
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-3 text-pink-500" />
              <h3 className="font-semibold">แบ่งปันคำอธิษฐาน</h3>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-divine transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => navigate("/bible-reading")}>
            <CardContent className="p-6 text-center">
              <Book className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-semibold">อ่านพระคัมภีร์</h3>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-divine transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => navigate("/groups")}>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold">เข้าร่วมกลุ่ม</h3>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-divine transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => navigate("/calendar")}>
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold">การประชุมอธิษฐาน</h3>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ค้นหาคำอธิษฐาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/60 border-border/50"
            />
          </div>
          <Button variant="outline" size="default">
            <Filter className="w-4 h-4" />
            กรอง
          </Button>
        </div>

        {/* Daily Bible Verse */}
        <div className="mb-8">
          <DailyBibleVerse />
        </div>

        {/* Prayer Statistics */}
        <div className="mb-8">
          <PrayerStats />
        </div>

        {/* Prayer Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-semibold">คำขอการอธิษฐานล่าสุด</h2>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredPrayers.length} คำอธิษฐานที่ยังใช้งาน
            </Badge>
          </div>

          {/* Error State */}
          {hasError && (
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">เกิดข้อผิดพลาด</h3>
                <p className="text-muted-foreground mb-4">{errorMessage}</p>
                <Button onClick={handleRetry} variant="outline" className="mr-2">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  ลองใหม่
                </Button>
                <Button onClick={() => navigate("/new-prayer")} variant="divine">
                  สร้างคำอธิษฐานใหม่
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoadingPrayers && !hasError && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-muted-foreground">กำลังโหลดคำอธิษฐาน...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingPrayers && !hasError && filteredPrayers.length === 0 && (
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">ยังไม่มีคำอธิษฐาน</h3>
                <p className="text-muted-foreground mb-4">เป็นคนแรกที่แบ่งปันคำอธิษฐานกับชุมชน</p>
                <Button onClick={() => navigate("/new-prayer")} variant="divine">
                  แบ่งปันคำอธิษฐาน
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Prayer Cards */}
          {!isLoadingPrayers && !hasError && filteredPrayers.length > 0 && (
            <div className="space-y-4">
              {filteredPrayers.map((prayer) => (
                <PrayerCard 
                  key={prayer.id} 
                  prayer={prayer}
                  onPrayerUpdate={handlePrayerUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;