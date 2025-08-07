import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Shield, 
  Crown, 
  UserCheck,
  AlertTriangle,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profiles: {
    display_name: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  } | null;
  user_roles: {
    role: 'admin' | 'moderator' | 'member';
    assigned_at: string;
  }[];
}

const AdminPermissions = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      // Get users with their roles directly
      const { data: usersData, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          assigned_at,
          profiles!inner (
            id,
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `);

      if (error) throw error;

      // Group by user_id to handle multiple roles
      const userMap = new Map();
      usersData?.forEach(item => {
        const userId = item.user_id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            id: userId,
            email: 'Loading...',
            created_at: '',
            profiles: item.profiles,
            user_roles: []
          });
        }
        userMap.get(userId).user_roles.push({
          role: item.role,
          assigned_at: item.assigned_at
        });
      });

      // Also get users without roles
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name, avatar_url');

      if (profilesError) throw profilesError;

      allProfiles?.forEach(profile => {
        if (!userMap.has(profile.id)) {
          userMap.set(profile.id, {
            id: profile.id,
            email: 'Loading...',
            created_at: '',
            profiles: profile,
            user_roles: []
          });
        }
      });

      const usersArray = Array.from(userMap.values());
      setUsers(usersArray);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายชื่อผู้ใช้ได้",
        variant: "destructive",
      });
    }
  };

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const hasAdminRole = !!data;
      setIsAdmin(hasAdminRole);
      
      if (!hasAdminRole) {
        navigate("/dashboard");
        toast({
          title: "ไม่มีสิทธิ์เข้าถึง",
          description: "คุณไม่มีสิทธิ์เข้าถึงหน้าจัดการสิทธิ์",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      navigate("/dashboard");
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'member') => {
    try {
      // Remove existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Add new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "อัพเดทสิทธิ์สำเร็จ",
        description: `เปลี่ยนสิทธิ์เป็น ${getRoleLabel(newRole)} แล้ว`,
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสิทธิ์ได้",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'moderator': return 'ผู้ดูแล';
      case 'member': return 'สมาชิก';
      default: return 'ไม่ระบุ';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      case 'member': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'moderator': return Shield;
      case 'member': return UserCheck;
      default: return Users;
    }
  };

  const filteredUsers = users.filter(user => {
    const searchMatch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.profiles?.first_name || ''} ${user.profiles?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const roleMatch = filterRole === 'all' || 
      user.user_roles.some(ur => ur.role === filterRole) ||
      (filterRole === 'no-role' && user.user_roles.length === 0);
    
    return searchMatch && roleMatch;
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">กำลังตรวจสอบสิทธิ์...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">จัดการสิทธิ์ผู้ใช้</h1>
          <p className="text-muted-foreground">จัดการบทบาทและสิทธิ์ของสมาชิกในระบบ</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาผู้ใช้ด้วยชื่อหรืออีเมล..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="กรองตามบทบาท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                    <SelectItem value="moderator">ผู้ดูแล</SelectItem>
                    <SelectItem value="member">สมาชิก</SelectItem>
                    <SelectItem value="no-role">ไม่มีบทบาท</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => {
            const currentRole = user.user_roles[0]?.role || null;
            const RoleIcon = getRoleIcon(currentRole || '');
            
            return (
              <Card key={user.id} className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.profiles?.avatar_url} />
                        <AvatarFallback>
                          {user.profiles?.display_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-medium">
                          {user.profiles?.display_name || `${user.profiles?.first_name || ''} ${user.profiles?.last_name || ''}`.trim() || user.email || 'ไม่มีข้อมูล'}
                        </h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          เข้าร่วมเมื่อ {new Date(user.created_at).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <RoleIcon className="w-4 h-4" />
                        <Badge variant={getRoleColor(currentRole || '') as any}>
                          {currentRole ? getRoleLabel(currentRole) : 'ไม่มีบทบาท'}
                        </Badge>
                      </div>
                      
                      <Select
                        value={currentRole || 'member'}
                        onValueChange={(value) => updateUserRole(user.id, value as any)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">สมาชิก</SelectItem>
                          <SelectItem value="moderator">ผู้ดูแล</SelectItem>
                          <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">ไม่พบผู้ใช้</h3>
              <p className="text-muted-foreground">ไม่พบผู้ใช้ที่ตรงตามเงื่อนไขการค้นหา</p>
            </CardContent>
          </Card>
        )}

        {/* Warning */}
        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            การเปลี่ยนแปลงสิทธิ์จะมีผลทันที กรุณาใช้ความระมัดระวังในการกำหนดสิทธิ์ผู้ดูแลระบบ
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default AdminPermissions;