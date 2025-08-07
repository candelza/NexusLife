import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';
import PrayerInteractionCard from "@/components/PrayerInteractionCard";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock, 
  ArrowLeft,
  Facebook,
  AlertTriangle,
  CheckCircle,
  Users
} from "lucide-react";

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
}

const PrayerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prayer, setPrayer] = useState<Prayer | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    if (id) {
      fetchPrayer();
      checkUserLike();
    }

    return () => subscription.unsubscribe();
  }, [id]);

  const fetchPrayer = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

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
        .eq('id', id)
        .single();

      if (error) throw error;
      setPrayer(data);

      // Fetch likes count
      const { count: likesCount } = await supabase
        .from('prayer_likes')
        .select('*', { count: 'exact', head: true })
        .eq('prayer_id', id);

      setLikesCount(likesCount || 0);

    } catch (error) {
      console.error('Error fetching prayer:', error);
      setHasError(true);
      toast({
        title: "ไม่พบคำอธิษฐาน",
        description: "คำอธิษฐานที่คุณค้นหาอาจถูกลบหรือไม่สามารถเข้าถึงได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserLike = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prayer_likes')
        .select('id')
        .eq('prayer_id', id)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setIsLiked(true);
      }
    } catch (error) {
      // User hasn't liked this prayer
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนกดไลค์",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('prayer_likes')
          .delete()
          .eq('prayer_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('prayer_likes')
          .insert({
            prayer_id: id,
            user_id: user.id
          });

        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถกดไลค์ได้",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (!prayer) return;
    
    const shareUrl = `${window.location.origin}/prayer/${id}`;
    const shareText = `คำอธิษฐาน: ${prayer.title}`;
    
    // Facebook share
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const getDisplayName = () => {
    if (!prayer) return "";
    
    if (prayer.is_anonymous) {
      return "ไม่ระบุชื่อ";
    }
    
    return prayer.profile?.display_name || 
           `${prayer.profile?.first_name || ''} ${prayer.profile?.last_name || ''}`.trim() ||
           "ผู้ใช้";
  };

  const getDisplayInitials = () => {
    if (!prayer) return "";
    
    if (prayer.is_anonymous) {
      return "?";
    }
    
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'ไม่ระบุวันที่';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-divine rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-divine animate-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (hasError || !prayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-divine rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-divine">
            <AlertTriangle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">ไม่พบคำอธิษฐาน</h2>
          <p className="text-muted-foreground mb-4">คำอธิษฐานที่คุณค้นหาอาจถูกลบหรือไม่สามารถเข้าถึงได้</p>
          <Button onClick={() => navigate("/")} variant="divine">
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold">คำอธิษฐาน</h1>
            <p className="text-muted-foreground">รายละเอียดคำอธิษฐาน</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Prayer Card */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-peaceful">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={prayer.is_anonymous ? undefined : prayer.profile?.avatar_url} />
                    <AvatarFallback className={prayer.is_anonymous ? "bg-muted" : ""}>
                      {getDisplayInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getDisplayName()}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(prayer.created_at)}</span>
                      </div>
                    </div>
                    {prayer.category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {prayer.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {prayer.is_urgent && (
                    <Badge variant="destructive" className="text-xs">
                      เร่งด่วน
                    </Badge>
                  )}
                  {prayer.is_private && (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                      ส่วนตัว
                    </Badge>
                  )}
                  <Badge 
                    variant={prayer.status === 'answered' ? 'default' : 'secondary'}
                    className={prayer.status === 'answered' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {prayer.status === 'answered' ? 'ได้รับการตอบ' : 'กำลังดำเนินการ'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-4">{prayer.title}</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap text-lg leading-relaxed">
                    {prayer.description}
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                  <div className="flex items-center gap-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>ไลค์ ({likesCount})</span>
                    </Button>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>ชุมชน</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Facebook className="w-5 h-5" />
                    <span>แชร์ Facebook</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Interaction Card */}
          {id && (
            <PrayerInteractionCard 
              prayerId={id}
              onUpdate={() => {
                // Refresh prayer data if needed
                fetchPrayer();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerDetail; 