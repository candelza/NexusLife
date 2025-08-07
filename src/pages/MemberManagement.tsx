import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';
import ChatSystem from "@/components/ChatSystem";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Crown, 
  Settings,
  Search,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Send,
  AlertTriangle,
  MessageCircle
} from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  group_id: string;
  role: string | null;
  joined_at: string;
  profile: {
    id: string;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  care_group: {
    id: string;
    name: string;
  };
}

interface CareGroup {
  id: string;
  name: string;
  description: string | null;
}

const roleOptions = [
  { value: "leader", label: "หัวหน้า", icon: Crown },
  { value: "co-leader", label: "รองหัวหน้า", icon: Shield },
  { value: "member", label: "สมาชิก", icon: Users }
];

const MemberManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [careGroups, setCareGroups] = useState<CareGroup[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);

  // Fetch members from database
  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          group_id,
          role,
          joined_at,
          profile:profiles!group_members_user_id_fkey(
            id,
            display_name,
            first_name,
            last_name,
            avatar_url,
            created_at
          ),
          care_group:care_groups!group_members_group_id_fkey(
            id,
            name
          )
        `)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Fetch care groups
  const fetchCareGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('care_groups')
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      setCareGroups(data || []);
    } catch (error) {
      console.error('Error fetching care groups:', error);
    }
  };

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchMembers();
    fetchCareGroups();
    setIsLoading(false);

    return () => subscription.unsubscribe();
  }, []);

  const filteredMembers = members.filter(member => {
    const memberName = member.profile.display_name || 
                      `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim() ||
                      'Unknown User';
    const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "จำเป็นต้องมีอีเมล",
        description: "กรุณากรอกที่อยู่อีเมลเพื่อส่งคำเชิญ",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you would send an invitation email here
    // For now, we'll just show a success message
    toast({
      title: "ส่งคำเชิญแล้ว",
      description: `ส่งคำเชิญเข้าร่วมกลุ่มดูแลไปยัง ${inviteEmail} แล้ว`,
    });
    setInviteEmail("");
    setIsInviteOpen(false);
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "อัปเดตบทบาทแล้ว",
        description: `บทบาทของสมาชิกถูกอัปเดตเป็น ${roleOptions.find(r => r.value === newRole)?.label} แล้ว`,
      });

      // Refresh members
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตบทบาทได้",
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะนำ ${memberName} ออกจากกลุ่มดูแล?`)) {
      return;
    }

    setIsDeleting(memberId);
    
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "นำสมาชิกออกแล้ว",
        description: `${memberName} ถูกนำออกจากกลุ่มดูแลแล้ว`,
        variant: "destructive"
      });

      // Refresh members
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถนำสมาชิกออกได้",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">จัดการสมาชิก</h1>
            <p className="text-muted-foreground">จัดการสมาชิกกลุ่มดูแลและบทบาทของพวกเขา</p>
          </div>
          
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="divine" size="default">
                <UserPlus className="w-4 h-4" />
                เชิญสมาชิก
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เชิญสมาชิกใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">ที่อยู่อีเมล</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="กรอกที่อยู่อีเมลของสมาชิก"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsInviteOpen(false)} className="flex-1">
                    ยกเลิก
                  </Button>
                  <Button variant="divine" onClick={handleInviteMember} className="flex-1">
                    <Send className="w-4 h-4" />
                    ส่งคำเชิญ
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{members.length}</div>
              <div className="text-sm text-muted-foreground">สมาชิกทั้งหมด</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{members.filter(m => m.role === 'leader' || m.role === 'co-leader').length}</div>
              <div className="text-sm text-muted-foreground">ผู้นำ</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <Crown className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{careGroups.length}</div>
              <div className="text-sm text-muted-foreground">กลุ่มดูแล</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {members.length > 0 ? Math.round(members.length / careGroups.length) : 0}
              </div>
              <div className="text-sm text-muted-foreground">สมาชิกเฉลี่ยต่อกลุ่ม</div>
            </CardContent>
          </Card>
        </div>

        {/* Care Groups with Chat */}
        <Card className="mb-6 bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              กลุ่มดูแลของคุณ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {careGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>คุณยังไม่ได้เข้าร่วมกลุ่มดูแลใดๆ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {careGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{group.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedGroup(group);
                            setIsChatOpen(true);
                          }}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {members.filter(m => m.care_group.id === group.id).length} สมาชิก
                        </span>
                        <Badge variant="outline" className="text-xs">
                          กลุ่มดูแล
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-6 bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="ค้นหาสมาชิก..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="กรองตามบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">บทบาททั้งหมด</SelectItem>
                  <SelectItem value="leader">ผู้นำ</SelectItem>
                  <SelectItem value="co-leader">รองผู้นำ</SelectItem>
                  <SelectItem value="member">สมาชิก</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              สมาชิกกลุ่มดูแล ({filteredMembers.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>ไม่พบสมาชิกที่ตรงกับเงื่อนไขการค้นหา</p>
              </div>
            ) : (
              <div className="space-y-0">
                {filteredMembers.map((member, index) => {
                  const memberName = member.profile.display_name || 
                                   `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim() ||
                                   'Unknown User';
                  const memberInitials = memberName.split(' ').map(n => n[0]).join('');
                  
                  return (
                    <div key={member.id}>
                      <div className="p-6 hover:bg-accent/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={member.profile.avatar_url} alt={memberName} />
                              <AvatarFallback>
                                {memberInitials}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{memberName}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {member.care_group.name}
                                </Badge>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>เข้าร่วมเมื่อ {new Date(member.joined_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'short'
                                  })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Select
                              value={member.role || 'member'}
                              onValueChange={(value) => handleRoleChange(member.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roleOptions.map(role => (
                                  <SelectItem key={role.value} value={role.value}>
                                    <div className="flex items-center gap-2">
                                      <role.icon className="w-3 h-3" />
                                      {role.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member.id, memberName)}
                              disabled={isDeleting === member.id}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {isDeleting === member.id ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {index < filteredMembers.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat System */}
      {selectedGroup && (
        <ChatSystem
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedGroup(null);
          }}
        />
      )}
    </div>
  );
};

export default MemberManagement;