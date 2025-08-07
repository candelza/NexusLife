import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Users, Clock, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";

interface PrayerStats {
  totalPrayers: number;
  answeredPrayers: number;
  urgentPrayers: number;
  thisWeekPrayers: number;
  totalLikes: number;
  totalComments: number;
}

const PrayerStats = () => {
  const [stats, setStats] = useState<PrayerStats>({
    totalPrayers: 0,
    answeredPrayers: 0,
    urgentPrayers: 0,
    thisWeekPrayers: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current week start
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      
      // Fetch prayer statistics
      const { data: prayers, error: prayersError } = await supabase
        .from('prayers')
        .select('*');

      if (prayersError) throw prayersError;

      // Fetch likes count
      const { count: likesCount, error: likesError } = await supabase
        .from('prayer_likes')
        .select('*', { count: 'exact', head: true });

      if (likesError) throw likesError;

      // Fetch comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('prayer_responses')
        .select('*', { count: 'exact', head: true })
        .eq('response_type', 'comment');

      if (commentsError) throw commentsError;

      // Calculate statistics
      const totalPrayers = prayers?.length || 0;
      const answeredPrayers = prayers?.filter(p => p.status === 'answered').length || 0;
      const urgentPrayers = prayers?.filter(p => p.is_urgent).length || 0;
      const thisWeekPrayers = prayers?.filter(p => new Date(p.created_at) >= weekStart).length || 0;

      setStats({
        totalPrayers,
        answeredPrayers,
        urgentPrayers,
        thisWeekPrayers,
        totalLikes: likesCount || 0,
        totalComments: commentsCount || 0
      });
    } catch (error) {
      console.error('Error fetching prayer stats:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดสถิติได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: Heart,
      label: "คำอธิษฐานทั้งหมด",
      value: stats.totalPrayers,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    },
    {
      icon: CheckCircle,
      label: "ได้รับการตอบ",
      value: stats.answeredPrayers,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: AlertTriangle,
      label: "เร่งด่วน",
      value: stats.urgentPrayers,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: TrendingUp,
      label: "สัปดาห์นี้",
      value: stats.thisWeekPrayers,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Heart,
      label: "ไลค์ทั้งหมด",
      value: stats.totalLikes,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Users,
      label: "ความคิดเห็น",
      value: stats.totalComments,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="bg-card/60 backdrop-blur-sm border-border/50 hover:shadow-peaceful transition-all">
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PrayerStats;
