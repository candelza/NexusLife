import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit3, Upload, Camera } from "lucide-react";

interface ProfileEditDialogProps {
  trigger: React.ReactNode;
  profile: any;
  onProfileUpdate: () => void;
}

const ProfileEditDialog = ({ trigger, profile, onProfileUpdate }: ProfileEditDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    bio: '',
    phone: '',
    location: '',
    avatar_url: ''
  });
  const [careGroups, setCareGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        avatar_url: profile.avatar_url || ''
      });
      setPreviewUrl(profile.avatar_url || '');
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen) {
      fetchCareGroups();
      fetchUserGroup();
    }
  }, [isOpen]);

  const fetchCareGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('care_groups')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCareGroups(data || []);
    } catch (error) {
      console.error('Error fetching care groups:', error);
    }
  };

  const fetchUserGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setSelectedGroup(data?.group_id || '');
    } catch (error) {
      console.error('Error fetching user group:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadAvatar = async (userId: string) => {
    if (!avatarFile) return formData.avatar_url;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const handleGroupAction = async (userId: string) => {
    try {
      if (newGroupName.trim()) {
        // Create new group
        const { data: newGroup, error: createError } = await supabase
          .from('care_groups')
          .insert({
            name: newGroupName.trim(),
            leader_id: userId
          })
          .select()
          .single();

        if (createError) throw createError;

        // Join the new group
        await supabase
          .from('group_members')
          .insert({
            user_id: userId,
            group_id: newGroup.id,
            role: 'leader'
          });

        toast({
          title: "สร้างกลุ่มสำเร็จ",
          description: `สร้างกลุ่ม "${newGroupName}" และเข้าร่วมเป็นหัวหน้ากลุ่มแล้ว`,
        });
      } else if (selectedGroup) {
        // Leave current group first
        await supabase
          .from('group_members')
          .delete()
          .eq('user_id', userId);

        // Join selected group
        await supabase
          .from('group_members')
          .insert({
            user_id: userId,
            group_id: selectedGroup,
            role: 'member'
          });

        const groupName = careGroups.find(g => g.id === selectedGroup)?.name;
        toast({
          title: "เข้าร่วมกลุ่มสำเร็จ",
          description: `เข้าร่วมกลุ่ม "${groupName}" แล้ว`,
        });
      }
    } catch (error) {
      console.error('Error handling group action:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Upload avatar if changed
      const avatarUrl = await uploadAvatar(user.id);

      // First, check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            ...formData,
            avatar_url: avatarUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createError) throw createError;
      } else if (checkError) {
        throw checkError;
      } else {
        // Profile exists, update it
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            ...formData,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // Handle group membership
      await handleGroupAction(user.id);

      toast({
        title: "อัพเดทโปรไฟล์สำเร็จ",
        description: "ข้อมูลโปรไฟล์ได้รับการอัพเดทแล้ว",
      });

      setIsOpen(false);
      onProfileUpdate();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพเดทโปรไฟล์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขโปรไฟล์</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={previewUrl} />
              <AvatarFallback>
                {formData.display_name?.charAt(0) || formData.first_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                  <span>เปลี่ยนรูป</span>
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </Label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">ชื่อ</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="last_name">นามสกุล</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="display_name">ชื่อที่แสดง</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="location">ที่อยู่</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="bio">เกี่ยวกับตัวเอง</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Group Management */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="font-medium">การจัดการกลุ่มดูแล</h4>
              
              <div>
                <Label htmlFor="existing-group">เลือกกลุ่มที่มีอยู่</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกกลุ่มที่ต้องการเข้าร่วม" />
                  </SelectTrigger>
                  <SelectContent>
                    {careGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center text-muted-foreground">หรือ</div>

              <div>
                <Label htmlFor="new-group">สร้างกลุ่มใหม่</Label>
                <Input
                  id="new-group"
                  placeholder="ชื่อกลุ่มใหม่"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;