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
  Settings,
  Save,
  X,
  UserPlus
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface Member {
  id: string;
  created_at: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
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
  book: string;
  chapter: number;
  content: string;
  content_thai: string | null;
  verse_start: number;
  verse_end: number | null;
  reading_day: number;
  explanation: string | null;
  explanation_thai: string | null;
  created_at: string;
}

interface CareGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  assigned_at: string;
  assigned_by: string | null;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

const AdminSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [bibleVerses, setBibleVerses] = useState<BibleVerse[]>([]);
  const [careGroups, setCareGroups] = useState<CareGroup[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [selectedBibleVerse, setSelectedBibleVerse] = useState<BibleVerse | null>(null);
  
  // New state for forms
  const [newBibleVerse, setNewBibleVerse] = useState({ 
    book: '', 
    chapter: 1, 
    content: '', 
    content_thai: '', 
    verse_start: 1, 
    verse_end: null, 
    reading_day: 1,
    explanation: '',
    explanation_thai: ''
  });
  const [newCareGroup, setNewCareGroup] = useState({ name: '', description: '' });
  const [selectedMemberLevel, setSelectedMemberLevel] = useState('');
  
  // Edit states
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);
  const [editingBibleVerse, setEditingBibleVerse] = useState<BibleVerse | null>(null);
  const [editingCareGroup, setEditingCareGroup] = useState<CareGroup | null>(null);
  
  // Add role states
  const [newRoleUserId, setNewRoleUserId] = useState('');
  const [newRoleType, setNewRoleType] = useState<'admin' | 'moderator' | 'member'>('member');
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  
  // Activity log states
  const [activityLog, setActivityLog] = useState<Array<{
    id: string;
    action: string;
    details: string;
    timestamp: Date;
    type: 'success' | 'error' | 'info';
  }>>([]);
  
  const { toast } = useToast();

  // Add activity to log
  const addActivityLog = (action: string, details: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newActivity = {
      id: Date.now().toString(),
      action,
      details,
      timestamp: new Date(),
      type
    };
    setActivityLog(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only last 10 activities
  };

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
      
      // Check if user has admin or moderator role
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator'])
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error checking user role:', roleError);
      }

      if (userRole || user.email === 'candelaz28@gmail.com') {
        setIsAdmin(true);
        fetchMembers();
        fetchPrayers();
        fetchBibleVerses();
        fetchCareGroups();
        fetchUserRoles();
        
        addActivityLog(
          "เข้าสู่ระบบ Admin", 
          `ผู้ใช้ ${user.email} เข้าสู่ระบบ Admin`, 
          'info'
        );
      } else {
        setIsAdmin(false);
        toast({
          title: "ไม่มีสิทธิ์เข้าถึง",
          description: "เฉพาะผู้ดูแลระบบและผู้ดูแลเท่านั้นที่สามารถเข้าถึงหน้านี้ได้",
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
      console.log('Debug - Fetching members...');
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          created_at,
          display_name,
          first_name,
          last_name,
          avatar_url
        `)
        .order('created_at', { ascending: false });

      console.log('Debug - Members fetch result:', { data, error });
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
        .from('bible_verses')
        .select('*')
        .order('reading_day', { ascending: false });

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

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profile:profiles!user_roles_user_id_fkey(
            display_name,
            first_name,
            last_name
          )
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
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
      
      addActivityLog(
        "ลบสมาชิก", 
        `ลบสมาชิก ID: ${memberId}`, 
        'success'
      );

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

  const handleUpdatePrayerStatus = async (prayerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('prayers')
        .update({ status: newStatus })
        .eq('id', prayerId);

      if (error) throw error;

      toast({
        title: "อัปเดตสถานะสำเร็จ",
        description: `สถานะคำอธิษฐานได้รับการอัปเดตเป็น "${newStatus === 'answered' ? 'ได้รับการตอบ' : 'กำลังดำเนินการ'}"`,
      });

      fetchPrayers();
    } catch (error: any) {
      console.error('Error updating prayer status:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะได้",
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
      // Validate required fields
      if (!newBibleVerse.book || !newBibleVerse.content) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกหนังสือและเนื้อหาพระคัมภีร์",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('bible_verses')
        .insert({
          book: newBibleVerse.book,
          chapter: newBibleVerse.chapter,
          content: newBibleVerse.content,
          content_thai: newBibleVerse.content_thai || null,
          verse_start: newBibleVerse.verse_start,
          verse_end: newBibleVerse.verse_end,
          reading_day: newBibleVerse.reading_day,
          explanation: newBibleVerse.explanation || null,
          explanation_thai: newBibleVerse.explanation_thai || null
        });

      if (error) throw error;

      toast({
        title: "เพิ่มพระคัมภีร์ประจำวันสำเร็จ",
        description: "พระคัมภีร์ประจำวันได้รับการเพิ่มแล้ว",
      });
      
      addActivityLog(
        "เพิ่มพระคัมภีร์", 
        `เพิ่ม ${newBibleVerse.book} ${newBibleVerse.chapter}:${newBibleVerse.verse_start}`, 
        'success'
      );

      setNewBibleVerse({ 
        book: '', 
        chapter: 1, 
        content: '', 
        content_thai: '', 
        verse_start: 1, 
        verse_end: null, 
        reading_day: 1,
        explanation: '',
        explanation_thai: ''
      });
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
      // Validate required fields
      if (!newCareGroup.name) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกชื่อกลุ่มดูแล",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('care_groups')
        .insert({
          name: newCareGroup.name,
          description: newCareGroup.description || null
        });

      if (error) throw error;

      toast({
        title: "เพิ่มกลุ่มดูแลสำเร็จ",
        description: "กลุ่มดูแลได้รับการเพิ่มแล้ว",
      });
      
      addActivityLog(
        "เพิ่มกลุ่มดูแล", 
        `เพิ่มกลุ่ม: ${newCareGroup.name}`, 
        'success'
      );

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
          user_id: memberId,
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

  // Edit member function
  const handleEditMember = async (memberId: string, updatedData: any) => {
    try {
      // Validate required fields
      if (!updatedData.display_name && !updatedData.first_name && !updatedData.last_name) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกชื่อหรือชื่อที่แสดงอย่างน้อยหนึ่งรายการ",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: updatedData.display_name || null,
          first_name: updatedData.first_name || null,
          last_name: updatedData.last_name || null,
          member_level: updatedData.member_level || null
        })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "แก้ไขสมาชิกสำเร็จ",
        description: "ข้อมูลสมาชิกได้รับการอัปเดตแล้ว",
      });
      
      addActivityLog(
        "แก้ไขสมาชิก", 
        `แก้ไขข้อมูลสมาชิก ID: ${memberId}`, 
        'success'
      );

      setEditingMember(null);
      fetchMembers();
    } catch (error: any) {
      console.error('Error updating member:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขข้อมูลสมาชิกได้",
        variant: "destructive"
      });
    }
  };

  // Edit prayer function
  const handleEditPrayer = async (prayerId: string, updatedData: any) => {
    try {
      // Validate required fields
      if (!updatedData.title || !updatedData.description) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกหัวข้อและรายละเอียดคำอธิษฐาน",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('prayers')
        .update({
          title: updatedData.title,
          description: updatedData.description,
          status: updatedData.status || 'pending'
        })
        .eq('id', prayerId);

      if (error) throw error;

      toast({
        title: "แก้ไขคำอธิษฐานสำเร็จ",
        description: "ข้อมูลคำอธิษฐานได้รับการอัปเดตแล้ว",
      });
      
      addActivityLog(
        "แก้ไขคำอธิษฐาน", 
        `แก้ไขคำอธิษฐาน: ${updatedData.title}`, 
        'success'
      );

      setEditingPrayer(null);
      fetchPrayers();
    } catch (error: any) {
      console.error('Error updating prayer:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขข้อมูลคำอธิษฐานได้",
        variant: "destructive"
      });
    }
  };

  // Edit bible verse function
  const handleEditBibleVerse = async (verseId: string, updatedData: any) => {
    try {
      const { error } = await supabase
        .from('bible_verses')
        .update({
          book: updatedData.book,
          chapter: updatedData.chapter,
          content: updatedData.content,
          content_thai: updatedData.content_thai || null,
          verse_start: updatedData.verse_start,
          verse_end: updatedData.verse_end,
          reading_day: updatedData.reading_day,
          explanation: updatedData.explanation || null,
          explanation_thai: updatedData.explanation_thai || null
        })
        .eq('id', verseId);

      if (error) throw error;

      toast({
        title: "แก้ไขพระคัมภีร์สำเร็จ",
        description: "ข้อมูลพระคัมภีร์ได้รับการอัปเดตแล้ว",
      });

      setEditingBibleVerse(null);
      fetchBibleVerses();
    } catch (error: any) {
      console.error('Error updating bible verse:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขข้อมูลพระคัมภีร์ได้",
        variant: "destructive"
      });
    }
  };

  // Edit care group function
  const handleEditCareGroup = async (groupId: string, updatedData: any) => {
    try {
      console.log('Debug - handleEditCareGroup called with:', { groupId, updatedData });
      
      // Validate required fields
      if (!updatedData.name) {
        console.log('Debug - Validation failed: missing name');
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกชื่อกลุ่มดูแล",
          variant: "destructive"
        });
        return;
      }

      console.log('Debug - Updating care group in database...');
      const { error } = await supabase
        .from('care_groups')
        .update({
          name: updatedData.name,
          description: updatedData.description || null
        })
        .eq('id', groupId);

      console.log('Debug - Update result:', { error });
      if (error) throw error;

      toast({
        title: "แก้ไขกลุ่มดูแลสำเร็จ",
        description: "ข้อมูลกลุ่มดูแลได้รับการอัปเดตแล้ว",
      });
      
      addActivityLog(
        "แก้ไขกลุ่มดูแล", 
        `แก้ไขกลุ่ม: ${updatedData.name}`, 
        'success'
      );

      setEditingCareGroup(null);
      fetchCareGroups();
    } catch (error: any) {
      console.error('Error updating care group:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขข้อมูลกลุ่มดูแลได้",
        variant: "destructive"
      });
    }
  };

  // Delete bible verse function
  const handleDeleteBibleVerse = async (verseId: string) => {
    try {
      const { error } = await supabase
        .from('bible_verses')
        .delete()
        .eq('id', verseId);

      if (error) throw error;

      toast({
        title: "ลบพระคัมภีร์สำเร็จ",
        description: "พระคัมภีร์ได้ถูกลบออกจากระบบแล้ว",
      });

      fetchBibleVerses();
    } catch (error: any) {
      console.error('Error deleting bible verse:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบพระคัมภีร์ได้",
        variant: "destructive"
      });
    }
  };

  // Delete care group function
  const handleDeleteCareGroup = async (groupId: string) => {
    try {
      console.log('Debug - handleDeleteCareGroup called with:', { groupId });
      
      // First delete group members
      console.log('Debug - Deleting group members...');
      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);

      console.log('Debug - Delete members result:', { membersError });
      if (membersError) throw membersError;

      // Then delete the care group
      console.log('Debug - Deleting care group...');
      const { error } = await supabase
        .from('care_groups')
        .delete()
        .eq('id', groupId);

      console.log('Debug - Delete care group result:', { error });
      if (error) throw error;

      toast({
        title: "ลบกลุ่มดูแลสำเร็จ",
        description: "กลุ่มดูแลได้ถูกลบออกจากระบบแล้ว",
      });

      fetchCareGroups();
    } catch (error: any) {
      console.error('Error deleting care group:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบกลุ่มดูแลได้",
        variant: "destructive"
      });
    }
  };

  // Add user role function
  const handleAddUserRole = async (userId: string, role: 'admin' | 'moderator' | 'member') => {
    try {
      console.log('Debug - handleAddUserRole called with:', { userId, role });
      
      // Validate required fields
      if (!userId || !role) {
        console.log('Debug - Validation failed:', { userId, role });
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณาเลือกผู้ใช้และบทบาท",
          variant: "destructive"
        });
        return;
      }

      // Check if user already has this role
      console.log('Debug - Checking existing role for user:', userId, 'role:', role);
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      console.log('Debug - Existing role check result:', { existingRole, checkError });

      if (checkError && checkError.code !== 'PGRST116') {
        console.log('Debug - Error checking existing role:', checkError);
        throw checkError;
      }

      if (existingRole) {
        console.log('Debug - User already has this role');
        toast({
          title: "บทบาทซ้ำ",
          description: "ผู้ใช้นี้มีบทบาทนี้อยู่แล้ว",
          variant: "destructive"
        });
        return;
      }

      console.log('Debug - Inserting new role:', { userId, role, assigned_by: user?.id });
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          assigned_by: user?.id || null
        });

      console.log('Debug - Insert result:', { error });
      if (error) throw error;

      toast({
        title: "เปลี่ยนบทบาทสำเร็จ",
        description: "บทบาทได้รับการเปลี่ยนแล้ว",
      });
      
      addActivityLog(
        "เปลี่ยนบทบาท", 
        `เปลี่ยนบทบาทเป็น ${role} ให้กับ User ID: ${userId}`, 
        'success'
      );

      // Reset form
      setNewRoleUserId('');
      setNewRoleType('member');
      setIsAddRoleDialogOpen(false);
      
      fetchUserRoles();
    } catch (error: any) {
      console.error('Error adding user role:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนบทบาทได้",
        variant: "destructive"
      });
    }
  };

  // Update user role function
  const handleUpdateUserRole = async (roleId: string, newRole: 'admin' | 'moderator' | 'member') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          role: newRole
        })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "อัปเดตบทบาทสำเร็จ",
        description: "บทบาทได้รับการอัปเดตแล้ว",
      });

      fetchUserRoles();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตบทบาทได้",
        variant: "destructive"
      });
    }
  };

  // Delete user role function
  const handleDeleteUserRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "ลบบทบาทสำเร็จ",
        description: "บทบาทได้ถูกลบออกจากระบบแล้ว",
      });

      fetchUserRoles();
    } catch (error: any) {
      console.error('Error deleting user role:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบบทบาทได้",
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
          <TabsList className="grid w-full grid-cols-6">
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
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              ประวัติการทำงาน
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
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingMember(member)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
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
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingPrayer(prayer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>จัดการคำอธิษฐาน</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>สถานะคำอธิษฐาน</Label>
                                  <Select 
                                    value={prayer.status} 
                                    onValueChange={(value) => handleUpdatePrayerStatus(prayer.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">กำลังดำเนินการ</SelectItem>
                                      <SelectItem value="answered">ได้รับการตอบ</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
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
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>หนังสือ</Label>
                          <Input 
                            value={newBibleVerse.book}
                            onChange={(e) => setNewBibleVerse({...newBibleVerse, book: e.target.value})}
                            placeholder="เช่น ยอห์น"
                          />
                        </div>
                        <div>
                          <Label>บท</Label>
                          <Input 
                            type="number"
                            value={newBibleVerse.chapter}
                            onChange={(e) => setNewBibleVerse({...newBibleVerse, chapter: parseInt(e.target.value)})}
                            placeholder="1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>ข้อเริ่มต้น</Label>
                          <Input 
                            type="number"
                            value={newBibleVerse.verse_start}
                            onChange={(e) => setNewBibleVerse({...newBibleVerse, verse_start: parseInt(e.target.value)})}
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <Label>ข้อสิ้นสุด (ถ้ามี)</Label>
                          <Input 
                            type="number"
                            value={newBibleVerse.verse_end || ''}
                            onChange={(e) => setNewBibleVerse({...newBibleVerse, verse_end: e.target.value ? parseInt(e.target.value) : null})}
                            placeholder="16"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>เนื้อหาภาษาอังกฤษ</Label>
                        <Textarea 
                          value={newBibleVerse.content}
                          onChange={(e) => setNewBibleVerse({...newBibleVerse, content: e.target.value})}
                          placeholder="ใส่เนื้อหาพระคัมภีร์ภาษาอังกฤษ..."
                        />
                      </div>
                      <div>
                        <Label>เนื้อหาภาษาไทย</Label>
                        <Textarea 
                          value={newBibleVerse.content_thai}
                          onChange={(e) => setNewBibleVerse({...newBibleVerse, content_thai: e.target.value})}
                          placeholder="ใส่เนื้อหาพระคัมภีร์ภาษาไทย..."
                        />
                      </div>
                      <div>
                        <Label>วันอ่าน</Label>
                        <Input 
                          type="number"
                          value={newBibleVerse.reading_day}
                          onChange={(e) => setNewBibleVerse({...newBibleVerse, reading_day: parseInt(e.target.value)})}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label>คำอธิบายภาษาอังกฤษ</Label>
                        <Textarea 
                          value={newBibleVerse.explanation}
                          onChange={(e) => setNewBibleVerse({...newBibleVerse, explanation: e.target.value})}
                          placeholder="ใส่คำอธิบายภาษาอังกฤษ..."
                        />
                      </div>
                      <div>
                        <Label>คำอธิบายภาษาไทย</Label>
                        <Textarea 
                          value={newBibleVerse.explanation_thai}
                          onChange={(e) => setNewBibleVerse({...newBibleVerse, explanation_thai: e.target.value})}
                          placeholder="ใส่คำอธิบายภาษาไทย..."
                        />
                      </div>
                      <Button onClick={handleAddBibleVerse}>เพิ่มพระคัมภีร์ประจำวัน</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {bibleVerses.map((verse) => (
                      <div key={verse.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{verse.book} {verse.chapter}:{verse.verse_start}{verse.verse_end ? `-${verse.verse_end}` : ''}</div>
                            <div className="text-sm text-muted-foreground">{verse.content}</div>
                            {verse.content_thai && (
                              <div className="text-sm text-muted-foreground">{verse.content_thai}</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              วันอ่าน: {verse.reading_day}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingBibleVerse(verse)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteBibleVerse(verse.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{group.name}</div>
                            <div className="text-sm text-muted-foreground">{group.description}</div>
                            <div className="text-xs text-muted-foreground">
                              สร้างเมื่อ {new Date(group.created_at).toLocaleDateString('th-TH')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingCareGroup(group)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCareGroup(group.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">รายชื่อผู้ใช้ที่มีบทบาท</h3>
                      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <UserPlus className="w-4 h-4 mr-2" />
                            เปลี่ยนบทบาท
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>เปลี่ยนบทบาทของสมาชิก</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>เลือกสมาชิก</Label>
                              <Select value={newRoleUserId} onValueChange={setNewRoleUserId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="เลือกสมาชิกที่ต้องการเปลี่ยนบทบาท" />
                                </SelectTrigger>
                                <SelectContent>
                                  {console.log('Debug - Rendering members:', members)}
                                  {members.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.display_name || 
                                       `${member.first_name || ''} ${member.last_name || ''}`.trim() ||
                                       'ไม่ระบุชื่อ'} (ID: {member.id})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>บทบาท</Label>
                              <Select value={newRoleType} onValueChange={(value: 'admin' | 'moderator' | 'member') => setNewRoleType(value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="เลือกบทบาท" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">สมาชิก</SelectItem>
                                  <SelectItem value="moderator">ผู้ดูแล</SelectItem>
                                  <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsAddRoleDialogOpen(false)}>
                                ยกเลิก
                              </Button>
                              <Button onClick={() => {
                                console.log('Debug - newRoleUserId:', newRoleUserId);
                                console.log('Debug - newRoleType:', newRoleType);
                                if (newRoleUserId && newRoleType) {
                                  handleAddUserRole(newRoleUserId, newRoleType);
                                } else {
                                  toast({
                                    title: "ข้อมูลไม่ครบถ้วน",
                                    description: "กรุณาเลือกสมาชิกและบทบาท",
                                    variant: "destructive"
                                  });
                                }
                              }}>
                                บันทึก
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-2">
                      {userRoles.map((userRole) => (
                        <div key={userRole.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">
                                {userRole.profile?.display_name || 
                                 `${userRole.profile?.first_name || ''} ${userRole.profile?.last_name || ''}`.trim() ||
                                 'ไม่ระบุชื่อ'}
                              </div>
                              <div className="text-sm text-muted-foreground">User ID: {userRole.user_id}</div>
                              <div className="text-xs text-muted-foreground">
                                กำหนดเมื่อ {new Date(userRole.assigned_at).toLocaleDateString('th-TH')}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {userRole.role}
                              </Badge>
                              <Select 
                                value={userRole.role}
                                onValueChange={(value: 'admin' | 'moderator' | 'member') => 
                                  handleUpdateUserRole(userRole.id, value)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">สมาชิก</SelectItem>
                                  <SelectItem value="moderator">ผู้ดูแล</SelectItem>
                                  <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteUserRole(userRole.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการทำงานล่าสุด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      ยังไม่มีประวัติการทำงาน
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activityLog.map((activity) => (
                        <div 
                          key={activity.id} 
                          className={`p-3 border rounded-lg ${
                            activity.type === 'success' ? 'border-green-200 bg-green-50' :
                            activity.type === 'error' ? 'border-red-200 bg-red-50' :
                            'border-blue-200 bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{activity.action}</div>
                              <div className="text-sm text-muted-foreground">{activity.details}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {activity.timestamp.toLocaleString('th-TH')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Member Dialog */}
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>แก้ไขข้อมูลสมาชิก</DialogTitle>
            </DialogHeader>
            {editingMember && (
              <div className="space-y-4">
                <div>
                  <Label>ชื่อที่แสดง</Label>
                  <Input 
                    defaultValue={editingMember.profile?.display_name || ''}
                    onChange={(e) => setEditingMember({
                      ...editingMember,
                      profile: { ...editingMember.profile, display_name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>ชื่อ</Label>
                  <Input 
                    defaultValue={editingMember.profile?.first_name || ''}
                    onChange={(e) => setEditingMember({
                      ...editingMember,
                      profile: { ...editingMember.profile, first_name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>นามสกุล</Label>
                  <Input 
                    defaultValue={editingMember.profile?.last_name || ''}
                    onChange={(e) => setEditingMember({
                      ...editingMember,
                      profile: { ...editingMember.profile, last_name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>ระดับสมาชิก</Label>
                  <Select 
                    defaultValue={editingMember.profile?.member_level || 'member'}
                    onValueChange={(value) => setEditingMember({
                      ...editingMember,
                      profile: { ...editingMember.profile, member_level: value }
                    })}
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
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingMember(null)}>
                    <X className="w-4 h-4 mr-2" />
                    ยกเลิก
                  </Button>
                  <Button onClick={() => handleEditMember(editingMember.id, editingMember.profile!)}>
                    <Save className="w-4 h-4 mr-2" />
                    บันทึก
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Prayer Dialog */}
        <Dialog open={!!editingPrayer} onOpenChange={() => setEditingPrayer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>แก้ไขคำอธิษฐาน</DialogTitle>
            </DialogHeader>
            {editingPrayer && (
              <div className="space-y-4">
                <div>
                  <Label>หัวข้อ</Label>
                  <Input 
                    defaultValue={editingPrayer.title}
                    onChange={(e) => setEditingPrayer({
                      ...editingPrayer,
                      title: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>รายละเอียด</Label>
                  <Textarea 
                    defaultValue={editingPrayer.description}
                    onChange={(e) => setEditingPrayer({
                      ...editingPrayer,
                      description: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>สถานะ</Label>
                  <Select 
                    defaultValue={editingPrayer.status}
                    onValueChange={(value) => setEditingPrayer({
                      ...editingPrayer,
                      status: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">กำลังดำเนินการ</SelectItem>
                      <SelectItem value="answered">ได้รับการตอบ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingPrayer(null)}>
                    <X className="w-4 h-4 mr-2" />
                    ยกเลิก
                  </Button>
                  <Button onClick={() => handleEditPrayer(editingPrayer.id, editingPrayer)}>
                    <Save className="w-4 h-4 mr-2" />
                    บันทึก
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Bible Verse Dialog */}
        <Dialog open={!!editingBibleVerse} onOpenChange={() => setEditingBibleVerse(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>แก้ไขพระคัมภีร์ประจำวัน</DialogTitle>
            </DialogHeader>
            {editingBibleVerse && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>หนังสือ</Label>
                    <Input 
                      defaultValue={editingBibleVerse.book}
                      onChange={(e) => setEditingBibleVerse({
                        ...editingBibleVerse,
                        book: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label>บท</Label>
                    <Input 
                      type="number"
                      defaultValue={editingBibleVerse.chapter}
                      onChange={(e) => setEditingBibleVerse({
                        ...editingBibleVerse,
                        chapter: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>ข้อเริ่มต้น</Label>
                    <Input 
                      type="number"
                      defaultValue={editingBibleVerse.verse_start}
                      onChange={(e) => setEditingBibleVerse({
                        ...editingBibleVerse,
                        verse_start: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label>ข้อสิ้นสุด (ถ้ามี)</Label>
                    <Input 
                      type="number"
                      defaultValue={editingBibleVerse.verse_end || ''}
                      onChange={(e) => setEditingBibleVerse({
                        ...editingBibleVerse,
                        verse_end: e.target.value ? parseInt(e.target.value) : null
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label>เนื้อหาภาษาอังกฤษ</Label>
                  <Textarea 
                    defaultValue={editingBibleVerse.content}
                    onChange={(e) => setEditingBibleVerse({
                      ...editingBibleVerse,
                      content: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>เนื้อหาภาษาไทย</Label>
                  <Textarea 
                    defaultValue={editingBibleVerse.content_thai || ''}
                    onChange={(e) => setEditingBibleVerse({
                      ...editingBibleVerse,
                      content_thai: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>วันอ่าน</Label>
                  <Input 
                    type="number"
                    defaultValue={editingBibleVerse.reading_day}
                    onChange={(e) => setEditingBibleVerse({
                      ...editingBibleVerse,
                      reading_day: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>คำอธิบายภาษาอังกฤษ</Label>
                  <Textarea 
                    defaultValue={editingBibleVerse.explanation || ''}
                    onChange={(e) => setEditingBibleVerse({
                      ...editingBibleVerse,
                      explanation: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>คำอธิบายภาษาไทย</Label>
                  <Textarea 
                    defaultValue={editingBibleVerse.explanation_thai || ''}
                    onChange={(e) => setEditingBibleVerse({
                      ...editingBibleVerse,
                      explanation_thai: e.target.value
                    })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingBibleVerse(null)}>
                    <X className="w-4 h-4 mr-2" />
                    ยกเลิก
                  </Button>
                  <Button onClick={() => handleEditBibleVerse(editingBibleVerse.id, editingBibleVerse)}>
                    <Save className="w-4 h-4 mr-2" />
                    บันทึก
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Care Group Dialog */}
        <Dialog open={!!editingCareGroup} onOpenChange={() => setEditingCareGroup(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>แก้ไขกลุ่มดูแล</DialogTitle>
            </DialogHeader>
            {editingCareGroup && (
              <div className="space-y-4">
                <div>
                  <Label>ชื่อกลุ่ม</Label>
                  <Input 
                    defaultValue={editingCareGroup.name}
                    onChange={(e) => setEditingCareGroup({
                      ...editingCareGroup,
                      name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>คำอธิบาย</Label>
                  <Textarea 
                    defaultValue={editingCareGroup.description}
                    onChange={(e) => setEditingCareGroup({
                      ...editingCareGroup,
                      description: e.target.value
                    })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingCareGroup(null)}>
                    <X className="w-4 h-4 mr-2" />
                    ยกเลิก
                  </Button>
                  <Button onClick={() => handleEditCareGroup(editingCareGroup.id, editingCareGroup)}>
                    <Save className="w-4 h-4 mr-2" />
                    บันทึก
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminSettings; 