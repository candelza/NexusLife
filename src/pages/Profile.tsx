import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

import PrayerCard from "@/components/PrayerCard";
import { 
  Heart, 
  Users, 
  Calendar,
  Star,
  Shield,
  Settings,
  Edit3,
  TrendingUp,
  Clock,
  Award,
  MapPin,
  Mail,
  Phone
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
  likes_count?: number;
  comments_count?: number;
  user_liked?: boolean;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Create profile if it doesn't exist
      if (error.code === 'PGRST116') {
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              display_name: user?.email?.split('@')[0] || 'User',
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } catch (createError: any) {
          console.error('Error creating profile:', createError);
        }
      }
    }
  };

  // Fetch user prayers
  const fetchPrayers = async (userId: string) => {
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrayers(data || []);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    }
  };

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
          fetchPrayers(session.user.id);
        } else {
          navigate("/auth");
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPrayers(session.user.id);
      } else {
        navigate("/auth");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handlePrayerUpdate = () => {
    if (user) {
      fetchPrayers(user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">กำลังโหลดโปรไฟล์...</div>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || 
                     `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                     user?.email?.split('@')[0] || 
                     'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8">
        {/* Profile Header */}
        <Card className="mb-8 bg-gradient-divine border-0 text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          
          <CardContent className="p-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white/20 shadow-glow">
                  <AvatarImage src={profile?.avatar_url} alt={displayName} />
                  <AvatarFallback className="text-2xl bg-white/20 text-gray-100">
                    {displayName.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-glow rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-700" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-serif font-bold mb-2 text-gray-900">
                      {displayName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <Badge variant="secondary" className="bg-white/20 text-gray-100 hover:bg-white/30">
                        <Shield className="w-3 h-3 mr-1" />
                        สมาชิก
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-100/80">
                      <MapPin className="w-4 h-4" />
                      <span>{user?.email}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="w-4 h-4" />
                      <span>เข้าร่วม {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long'
                      }) : 'ไม่ทราบ'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white/20 text-gray-100 hover:bg-white/30 border-white/30"
                    onClick={() => navigate('/profile/edit')}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    แก้ไขโปรไฟล์
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{prayers.length}</div>
              <div className="text-sm text-muted-foreground">คำอธิษฐานที่แบ่งปัน</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {prayers.filter(p => p.status === 'answered').length}
              </div>
              <div className="text-sm text-muted-foreground">คำอธิษฐานที่ได้รับการตอบ</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">กลุ่มที่เข้าร่วม</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">กิจกรรมที่เข้าร่วม</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="prayers">คำอธิษฐานของฉัน</TabsTrigger>
            <TabsTrigger value="group">กลุ่มดูแล</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* About */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      เกี่ยวกับฉัน
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/profile/edit')}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      แก้ไข
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {profile?.bio || "ยังไม่มีข้อมูลเกี่ยวกับตัวเอง"}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{user?.email}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile?.line_id && (
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <span>Line ID: {profile.line_id}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Prayer Progress */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    การเดินทางในการอธิษฐาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>คำอธิษฐานที่ได้รับการตอบ</span>
                      <span>{prayers.filter(p => p.status === 'answered').length}/{prayers.length}</span>
                    </div>
                    <Progress 
                      value={prayers.length > 0 ? (prayers.filter(p => p.status === 'answered').length / prayers.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>คำอธิษฐานเร่งด่วน</span>
                      <span>{prayers.filter(p => p.is_urgent).length}</span>
                    </div>
                    <Progress 
                      value={prayers.length > 0 ? (prayers.filter(p => p.is_urgent).length / prayers.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prayers" className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>คำขอการอธิษฐานล่าสุด</CardTitle>
              </CardHeader>
              <CardContent>
                {prayers.length > 0 ? (
                  <div className="space-y-4">
                    {prayers.map((prayer) => (
                      <PrayerCard 
                        key={prayer.id} 
                        prayer={prayer}
                        onPrayerUpdate={handlePrayerUpdate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>ยังไม่มีคำอธิษฐานที่แบ่งปัน</p>
                    <Button 
                      variant="divine" 
                      className="mt-4"
                      onClick={() => navigate("/new-prayer")}
                    >
                      แบ่งปันคำอธิษฐานแรก
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="group" className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    สมาชิกกลุ่มดูแล
                  </CardTitle>
                  <Button 
                    variant="divine" 
                    size="sm"
                    onClick={() => navigate('/groups')}
                  >
                    จัดการกลุ่ม
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>ยังไม่ได้เข้าร่วมกลุ่มดูแล</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate("/groups")}
                  >
                    เข้าร่วมกลุ่มดูแล
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;