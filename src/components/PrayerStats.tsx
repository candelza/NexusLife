import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, 
  Users, 
  MessageCircle, 
  Star,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Prayer
} from "lucide-react";

interface PrayerStats {
  totalPrayers: number;
  activePrayers: number;
  answeredPrayers: number;
  totalResponses: number;
  totalLikes: number;
  totalComments: number;
  totalTestimonies: number;
  urgentPrayers: number;
  privatePrayers: number;
  categoryStats: {
    category: string;
    count: number;
    percentage: number;
  }[];
  recentActivity: {
    type: string;
    count: number;
    period: string;
  }[];
}

const PrayerStats = () => {
  const [stats, setStats] = useState<PrayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch basic prayer stats
      const { data: prayers, error: prayersError } = await supabase
        .from('prayers')
        .select('*');

      if (prayersError) throw prayersError;

      // Fetch responses
      const { data: responses, error: responsesError } = await supabase
        .from('prayer_responses')
        .select('*');

      if (responsesError) throw responsesError;

      // Fetch likes
      const { data: likes, error: likesError } = await supabase
        .from('prayer_likes')
        .select('*');

      if (likesError) throw likesError;

      // Calculate stats
      const totalPrayers = prayers?.length || 0;
      const activePrayers = prayers?.filter(p => p.status === 'active').length || 0;
      const answeredPrayers = prayers?.filter(p => p.status === 'answered').length || 0;
      const urgentPrayers = prayers?.filter(p => p.is_urgent).length || 0;
      const privatePrayers = prayers?.filter(p => p.is_private).length || 0;

      const totalResponses = responses?.length || 0;
      const totalLikes = likes?.length || 0;
      const totalComments = responses?.filter(r => r.response_type === 'comment').length || 0;
      const totalTestimonies = responses?.filter(r => r.response_type === 'testimony').length || 0;

      // Calculate category stats
      const categoryCounts: { [key: string]: number } = {};
      prayers?.forEach(prayer => {
        if (prayer.category) {
          categoryCounts[prayer.category] = (categoryCounts[prayer.category] || 0) + 1;
        }
      });

      const categoryStats = Object.entries(categoryCounts)
        .map(([category, count]) => ({
          category,
          count,
          percentage: totalPrayers > 0 ? (count / totalPrayers) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentPrayers = prayers?.filter(p => 
        new Date(p.created_at) >= sevenDaysAgo
      ).length || 0;

      const recentResponses = responses?.filter(r => 
        new Date(r.created_at) >= sevenDaysAgo
      ).length || 0;

      const recentLikes = likes?.filter(l => 
        new Date(l.created_at) >= sevenDaysAgo
      ).length || 0;

      const recentActivity = [
        { type: 'คำอธิษฐานใหม่', count: recentPrayers, period: '7 วัน' },
        { type: 'การตอบสนอง', count: recentResponses, period: '7 วัน' },
        { type: 'การกดไลค์', count: recentLikes, period: '7 วัน' }
      ];

      setStats({
        totalPrayers,
        activePrayers,
        answeredPrayers,
        totalResponses,
        totalLikes,
        totalComments,
        totalTestimonies,
        urgentPrayers,
        privatePrayers,
        categoryStats,
        recentActivity
      });

    } catch (error: any) {
      console.error('Error fetching prayer stats:', error);
      setError('ไม่สามารถโหลดสถิติได้');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-muted-foreground">กำลังโหลดสถิติ...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-500">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const responseRate = stats.totalPrayers > 0 ? (stats.totalResponses / stats.totalPrayers) * 100 : 0;
  const answerRate = stats.totalPrayers > 0 ? (stats.answeredPrayers / stats.totalPrayers) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">คำอธิษฐานทั้งหมด</p>
                <p className="text-2xl font-bold">{stats.totalPrayers}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">กำลังดำเนินการ</p>
                <p className="text-2xl font-bold">{stats.activePrayers}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ได้รับการตอบ</p>
                <p className="text-2xl font-bold">{stats.answeredPrayers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">การตอบสนอง</p>
                <p className="text-2xl font-bold">{stats.totalResponses}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              อัตราการตอบสนอง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>การตอบสนอง</span>
                  <span>{responseRate.toFixed(1)}%</span>
                </div>
                <Progress value={responseRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>ได้รับการตอบ</span>
                  <span>{answerRate.toFixed(1)}%</span>
                </div>
                <Progress value={answerRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              การมีส่วนร่วม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">การกดไลค์</span>
                <Badge variant="secondary">{stats.totalLikes}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ความคิดเห็น</span>
                <Badge variant="secondary">{stats.totalComments}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">คำพยาน</span>
                <Badge variant="secondary">{stats.totalTestimonies}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              คำอธิษฐานพิเศษ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">เร่งด่วน</span>
                <Badge variant="destructive">{stats.urgentPrayers}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ส่วนตัว</span>
                <Badge variant="outline">{stats.privatePrayers}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      {stats.categoryStats.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              หมวดหมู่คำอธิษฐาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.categoryStats.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{category.category}</span>
                    <span>{category.count} คำอธิษฐาน</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            กิจกรรมล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.type} className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{activity.count}</div>
                <div className="text-sm text-muted-foreground">{activity.type}</div>
                <div className="text-xs text-muted-foreground mt-1">{activity.period}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrayerStats;
