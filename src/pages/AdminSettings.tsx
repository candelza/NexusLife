import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  MessageCircle,
  BookOpen,
  Crown,
  UserCheck,
  Settings
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface Member {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    member_level?: string;
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

interface BibleVerse {
  id: string;
  verse: string;
  reference: string;
  date: string;
  created_at: string;
}

interface CareGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const AdminSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [bibleVerses, setBibleVerses] = useState<BibleVerse[]>([]);
  const [careGroups, setCareGroups] = useState<CareGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  
  // New state for forms
  const [newBibleVerse, setNewBibleVerse] = useState({ verse: '', reference: '', date: '' });
  const [newCareGroup, setNewCareGroup] = useState({ name: '', description: '' });
  const [selectedMemberLevel, setSelectedMemberLevel] = useState('');
  const [selectedCareGroup, setSelectedCareGroup] = useState('');
  
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
        fetchBibleVerses();
        fetchCareGroups();
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
          member_level,
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

  const fetchBibleVerses = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_bible_verses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setBibleVerses(data || []);
    } catch (error) {
      console.error('Error fetching bible verses:', error);
    }
  };

  const fetchCareGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('care_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCareGroups(data || []);
    } catch (error) {
      console.error('Error fetching care groups:', error);
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

  const handleUpdateMemberLevel = async (memberId: string, level: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ member_level: level })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "อัปเดตระดับสมาชิกสำเร็จ",
        description: "ระดับสมาชิกได้รับการอัปเดตแล้ว",
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error updating member level:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตระดับสมาชิกได้",
        variant: "destructive"
      });
    }
  };

  const handleAddBibleVerse = async () => {
    try {
      const { error } = await supabase
        .from('daily_bible_verses')
        .insert({
          verse: newBibleVerse.verse,
          reference: newBibleVerse.reference,
          date: newBibleVerse.date
        });

      if (error) throw error;

      toast({
        title: "เพิ่มพระคัมภีร์ประจำวันสำเร็จ",
        description: "พระคัมภีร์ประจำวันได้รับการเพิ่มแล้ว",
      });

      setNewBibleVerse({ verse: '', reference: '', date: '' });
      fetchBibleVerses();
    } catch (error: any) {
      console.error('Error adding bible verse:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มพระคัมภีร์ประจำวันได้",
        variant: "destructive"
      });
    }
  };

  const handleAddCareGroup = async () => {
    try {
      const { error } = await supabase
        .from('care_groups')
        .insert({
          name: newCareGroup.name,
          description: newCareGroup.description
        });

      if (error) throw error;

      toast({
        title: "เพิ่มกลุ่มดูแลสำเร็จ",
        description: "กลุ่มดูแลได้รับการเพิ่มแล้ว",
      });

      setNewCareGroup({ name: '', description: '' });
      fetchCareGroups();
    } catch (error: any) {
      console.error('Error adding care group:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มกลุ่มดูแลได้",
        variant: "destructive"
      });
    }
  };

  const handleAssignToGroup = async (memberId: string, groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          member_id: memberId,
          group_id: groupId,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "จัดกลุ่มสมาชิกสำเร็จ",
        description: "สมาชิกได้รับการจัดกลุ่มแล้ว",
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error assigning to group:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถจัดกลุ่มสมาชิกได้",
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
          <p className="text-muted-foreground">จัดการสมาชิก, คำอธิษฐาน, พระคัมภีร์ประจำวัน และกลุ่มดูแล</p>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              สมาชิก
            </TabsTrigger>
            <TabsTrigger value="prayers" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              คำอธิษฐาน
            </TabsTrigger>
            <TabsTrigger value="bible" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              พระคัมภีร์
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              กลุ่มดูแล
            </TabsTrigger>
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              ระดับสมาชิก
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>รายชื่อสมาชิกทั้งหมด ({members.length})</CardTitle>
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
                        <Badge variant="outline" className="capitalize">
                          {member.profile?.member_level || 'member'}
                        </Badge>
                        {member.group_members && member.group_members.length > 0 && (
                          <Badge variant="secondary">
                            {member.group_members[0].group.name}
                          </Badge>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>จัดการสมาชิก</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>ระดับสมาชิก</Label>
                                <Select 
                                  value={member.profile?.member_level || 'member'} 
                                  onValueChange={(value) => handleUpdateMemberLevel(member.id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="member">สมาชิก</SelectItem>
                                    <SelectItem value="moderator">ผู้ดูแล</SelectItem>
                                    <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>จัดกลุ่ม</Label>
                                <Select onValueChange={(value) => handleAssignToGroup(member.id, value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="เลือกกลุ่ม" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {careGroups.map((group) => (
                                      <SelectItem key={group.id} value={group.id}>
                                        {group.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
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
                <CardTitle>คำอธิษฐานทั้งหมด ({prayers.length})</CardTitle>
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

          <TabsContent value="bible" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>พระคัมภีร์ประจำวัน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">เพิ่มพระคัมภีร์ประจำวันใหม่</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>ข้อพระคัมภีร์</Label>
                        <Textarea 
                          value={newBibleVerse.verse}
                          onChange={(e) => setNewBibleVerse({...newBibleVerse, verse: e.target.value})}
                          placeholder="ใส่ข้อพระคัมภีร์ที่นี่..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>อ้างอิง</Label>
                          <Input 
                            value={newBibleVerse.reference}
                            onChange={(e) => setNewBibleVerse({...newBibleVerse, reference: e.target.value})}
                            placeholder="เช่น ยอห์น 3:16"
                          />
                        </div>
                        <div>
                          <Label>วันที่</Label>
                          <Input 
                            type="date"
                            value={newBibleVerse.date}
                            onChange={(e) => setNewBibleVerse({...newBibleVerse, date: e.target.value})}
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddBibleVerse}>เพิ่มพระคัมภีร์ประจำวัน</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {bibleVerses.map((verse) => (
                      <div key={verse.id} className="p-3 border rounded-lg">
                        <div className="font-medium">{verse.verse}</div>
                        <div className="text-sm text-muted-foreground">{verse.reference}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(verse.date).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>กลุ่มดูแล</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">เพิ่มกลุ่มดูแลใหม่</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>ชื่อกลุ่ม</Label>
                        <Input 
                          value={newCareGroup.name}
                          onChange={(e) => setNewCareGroup({...newCareGroup, name: e.target.value})}
                          placeholder="ชื่อกลุ่มดูแล..."
                        />
                      </div>
                      <div>
                        <Label>คำอธิบาย</Label>
                        <Textarea 
                          value={newCareGroup.description}
                          onChange={(e) => setNewCareGroup({...newCareGroup, description: e.target.value})}
                          placeholder="คำอธิบายกลุ่ม..."
                        />
                      </div>
                      <Button onClick={handleAddCareGroup}>เพิ่มกลุ่มดูแล</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {careGroups.map((group) => (
                      <div key={group.id} className="p-3 border rounded-lg">
                        <div className="font-medium">{group.name}</div>
                        <div className="text-sm text-muted-foreground">{group.description}</div>
                        <div className="text-xs text-muted-foreground">
                          สร้างเมื่อ {new Date(group.created_at).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="levels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>จัดการระดับสมาชิก</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <h3 className="font-medium">สมาชิก</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">สมาชิกทั่วไป สามารถอ่านและแบ่งปันคำอธิษฐานได้</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-medium">ผู้ดูแล</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">สามารถจัดการคำอธิษฐานและสมาชิกในกลุ่มได้</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-purple-500" />
                        <h3 className="font-medium">ผู้ดูแลระบบ</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">สิทธิ์เต็มในการจัดการระบบทั้งหมด</p>
                    </div>
                  </div>
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