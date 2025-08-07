import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Calendar,
  Star,
  TrendingUp,
  UserPlus,
  Activity,
  BookOpen,
  CheckCircle,
  Clock
} from "lucide-react";

interface CareGroup {
  id: string;
  name: string;
  description: string;
  member_count: number;
  leader: {
    display_name: string;
    avatar_url: string;
  };
}

interface CommunityStats {
  totalMembers: number;
  activeGroups: number;
  totalPrayers: number;
  totalResponses: number;
  recentActivity: {
    type: string;
    count: number;
    period: string;
  }[];
  topGroups: CareGroup[];
}

const CommunityFeatures = () => {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  const fetchCommunityStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch care groups
      const { data: groups, error: groupsError } = await supabase
        .from('care_groups')
        .select(`
          id,
          name,
          description,
          leader:profiles!care_groups_leader_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .order('name');

      if (groupsError) throw groupsError;

      // Fetch group members count
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members')
        .select('group_id');

      if (membersError) throw membersError;

      // Calculate member counts for each group
      const memberCounts = groupMembers?.reduce((acc, member) => {
        acc[member.group_id] = (acc[member.group_id] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }) || {};

      const groupsWithMembers = groups?.map(group => ({
        ...group,
        member_count: memberCounts[group.id] || 0
      })) || [];

      // Fetch other stats
      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalPrayers } = await supabase
        .from('prayers')
        .select('*', { count: 'exact', head: true });

      const { count: totalResponses } = await supabase
        .from('prayer_responses')
        .select('*', { count: 'exact', head: true });

      // Calculate recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentPrayers } = await supabase
        .from('prayers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: recentResponses } = await supabase
        .from('prayer_responses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: recentMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const recentActivity = [
        { type: 'สมาชิกใหม่', count: recentMembers || 0, period: '7 วัน' },
        { type: 'คำอธิษฐานใหม่', count: recentPrayers || 0, period: '7 วัน' },
        { type: 'การตอบสนอง', count: recentResponses || 0, period: '7 วัน' }
      ];

      // Get top groups by member count
      const topGroups = groupsWithMembers
        .sort((a, b) => b.member_count - a.member_count)
        .slice(0, 3);

      setStats({
        totalMembers: totalMembers || 0,
        activeGroups: groupsWithMembers.length,
        totalPrayers: totalPrayers || 0,
        totalResponses: totalResponses || 0,
        recentActivity,
        topGroups
      });

    } catch (error: any) {
      console.error('Error fetching community stats:', error);
      setError('ไม่สามารถโหลดข้อมูลชุมชนได้');
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
            <span className="text-muted-foreground">กำลังโหลดข้อมูลชุมชน...</span>
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
            <Activity className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Community Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">สมาชิกทั้งหมด</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">กลุ่มดูแล</p>
                <p className="text-2xl font-bold">{stats.activeGroups}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">คำอธิษฐาน</p>
                <p className="text-2xl font-bold">{stats.totalPrayers}</p>
              </div>
              <Heart className="w-8 h-8 text-purple-500" />
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
              <MessageCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
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

      {/* Top Groups */}
      {stats.topGroups.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              กลุ่มดูแลยอดนิยม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topGroups.map((group, index) => (
                <div key={group.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{group.name}</h4>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={group.leader?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {group.leader?.display_name?.charAt(0) || 'L'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {group.leader?.display_name || 'ผู้นำกลุ่ม'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{group.member_count}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      สมาชิก
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate("/groups")}
                className="w-full"
              >
                ดูกลุ่มดูแลทั้งหมด
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Engagement */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5" />
            การมีส่วนร่วมของชุมชน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">อัตราการมีส่วนร่วม</span>
              <span className="text-sm font-medium">
                {stats.totalMembers > 0 ? Math.round((stats.totalResponses / stats.totalMembers) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={stats.totalMembers > 0 ? (stats.totalResponses / stats.totalMembers) * 100 : 0} 
              className="h-2" 
            />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {stats.totalPrayers > 0 ? Math.round((stats.totalResponses / stats.totalPrayers) * 100) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">อัตราการตอบสนอง</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {stats.totalMembers > 0 ? Math.round((stats.activeGroups / stats.totalMembers) * 1000) : 0}
                </div>
                <div className="text-xs text-muted-foreground">กลุ่มต่อสมาชิก 1,000 คน</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            การดำเนินการด่วน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/new-prayer")}
              className="h-16"
            >
              <div className="text-center">
                <Heart className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">แบ่งปันคำอธิษฐาน</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/groups")}
              className="h-16"
            >
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">เข้าร่วมกลุ่มดูแล</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/calendar")}
              className="h-16"
            >
              <div className="text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">ดูกิจกรรม</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/bible-reading")}
              className="h-16"
            >
              <div className="text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">อ่านพระคัมภีร์</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityFeatures;
