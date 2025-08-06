import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';
import { 
  Users, 
  Trash2, 
  Shield, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Ban,
  CheckCircle,
  AlertCircle,
  Calendar,
  Heart,
  MessageCircle
} from "lucide-react";

interface Member {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  group_members?: {
    role: string;
    group: {
      name: string;
    };
  }[];
}

interface Prayer {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string | null;
  };
}

const AdminSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้",
          variant: "destructive"
        });
        return;
      }

      setUser(user);
      
      // Check if user is admin (candelaz28@gmail.com)
      if (user.email === 'candelaz28@gmail.com') {
        setIsAdmin(true);
        fetchMembers();
        fetchPrayers();
      } else {
        setIsAdmin(false);
        toast({
          title: "ไม่มีสิทธิ์เข้าถึง",
          description: "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงหน้านี้ได้",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          created_at,
          display_name,
          first_name,
          last_name,
          avatar_url,
          group_members(
            role,
            group:care_groups(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchPrayers = async () => {
    try {
      const { data, error } = await supabase
        .from('prayers')
        .select(`
          *,
          profile:profiles!prayers_user_id_fkey(
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrayers(data || []);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(memberId);
      if (authError) throw authError;

      // Delete from profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId);

      if (profileError) throw profileError;

      toast({
        title: "ลบสมาชิกสำเร็จ",
        description: "สมาชิกได้ถูกลบออกจากระบบแล้ว",
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error deleting member:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสมาชิกได้",
        variant: "destructive"
      });
    }
  };

  const handleDeletePrayer = async (prayerId: string) => {
    try {
      // Delete prayer responses first
      const { error: responsesError } = await supabase
        .from('prayer_responses')
        .delete()
        .eq('prayer_id', prayerId);

      if (responsesError) throw responsesError;

      // Delete prayer likes
      const { error: likesError } = await supabase
        .from('prayer_likes')
        .delete()
        .eq('prayer_id', prayerId);

      if (likesError) throw likesError;

      // Delete the prayer
      const { error: prayerError } = await supabase
        .from('prayers')
        .delete()
        .eq('id', prayerId);

      if (prayerError) throw prayerError;

      toast({
        title: "ลบคำอธิษฐานสำเร็จ",
        description: "คำอธิษฐานได้ถูกลบออกจากระบบแล้ว",
      });

      fetchPrayers();
    } catch (error: any) {
      console.error('Error deleting prayer:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบคำอธิษฐานได้",
        variant: "destructive"
      });
    }
  };

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = member.profile?.display_name || '';
    const firstName = member.profile?.first_name || '';
    const lastName = member.profile?.last_name || '';
    const email = member.email || '';
    
    return displayName.toLowerCase().includes(searchLower) ||
           firstName.toLowerCase().includes(searchLower) ||
           lastName.toLowerCase().includes(searchLower) ||
           email.toLowerCase().includes(searchLower);
  });

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-muted-foreground">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงหน้านี้ได้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-serif font-bold">การจัดการระบบ</h1>
          </div>
          <p className="text-muted-foreground">จัดการสมาชิกและคำอธิษฐานทั้งหมดในระบบ</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ค้นหาสมาชิกหรือคำอธิษฐาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              สมาชิก ({members.length})
            </TabsTrigger>
            <TabsTrigger value="prayers" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              คำอธิษฐาน ({prayers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>รายชื่อสมาชิกทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.profile?.avatar_url} />
                          <AvatarFallback>
                            {member.profile?.display_name?.charAt(0) || member.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.profile?.display_name || 
                             `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.trim() ||
                             'ไม่ระบุชื่อ'}
                          </div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                          <div className="text-xs text-muted-foreground">
                            เข้าร่วมเมื่อ {new Date(member.created_at).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.group_members && member.group_members.length > 0 && (
                          <Badge variant="outline">
                            {member.group_members[0].group.name}
                          </Badge>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>ยืนยันการลบสมาชิก</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p>คุณแน่ใจหรือไม่ที่จะลบสมาชิกคนนี้? การกระทำนี้ไม่สามารถยกเลิกได้</p>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">ยกเลิก</Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleDeleteMember(member.id)}
                                >
                                  ลบสมาชิก
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prayers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>คำอธิษฐานทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPrayers.map((prayer) => (
                    <div key={prayer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium mb-1">{prayer.title}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          โดย {prayer.profile?.display_name || 'ไม่ระบุชื่อ'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(prayer.created_at).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={prayer.status === 'answered' ? 'default' : 'secondary'}
                          className={prayer.status === 'answered' ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          {prayer.status === 'answered' ? 'ได้รับการตอบ' : 'กำลังดำเนินการ'}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>ยืนยันการลบคำอธิษฐาน</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p>คุณแน่ใจหรือไม่ที่จะลบคำอธิษฐานนี้? การกระทำนี้ไม่สามารถยกเลิกได้</p>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">ยกเลิก</Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleDeletePrayer(prayer.id)}
                                >
                                  ลบคำอธิษฐาน
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings; 