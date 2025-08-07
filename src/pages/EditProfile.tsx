import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

const EditProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    bio: '',
    phone: '',
    location: '',
    avatar_url: '',
    line_id: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not found.');
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }

        if (data) {
          setProfile(data);
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            display_name: data.display_name || '',
            bio: data.bio || '',
            phone: data.phone || '',
            location: data.location || '',
            avatar_url: data.avatar_url || '',
            line_id: data.line_id || '',
          });
          setPreviewUrl(data.avatar_url || '');
        }
      } catch (error: any) {
        console.error('Error in fetchProfile:', error);
        toast({
          title: 'เกิดข้อผิดพลาดในการโหลดโปรไฟล์',
          description: error.message || 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadAvatar = async (userId: string): Promise<string> => {
    if (!avatarFile) return formData.avatar_url;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error('ไม่สามารถอัปโหลดรูปโปรไฟล์ได้');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        throw new Error('ไม่พบผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      }

      console.log('Updating profile for user:', user.id);
      console.log('Form data:', formData);
      
      // Validate form data
      if (!formData.display_name.trim() && !formData.first_name.trim() && !formData.last_name.trim()) {
        throw new Error('กรุณากรอกชื่อที่แสดง หรือชื่อและนามสกุล');
      }

      // Upload avatar if changed
      let avatarUrl = formData.avatar_url;
      if (avatarFile) {
        console.log('Uploading new avatar...');
        try {
          avatarUrl = await uploadAvatar(user.id);
          console.log('Avatar uploaded:', avatarUrl);
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          // Continue without avatar upload if it fails
        }
      }
      
      // Prepare update data - only include fields that exist in the database
      const updates: any = {
        updated_at: new Date().toISOString()
      };

      // Only add fields if they have values
      if (formData.first_name.trim()) updates.first_name = formData.first_name.trim();
      if (formData.last_name.trim()) updates.last_name = formData.last_name.trim();
      if (formData.display_name.trim()) updates.display_name = formData.display_name.trim();
      if (formData.bio.trim()) updates.bio = formData.bio.trim();
      if (formData.phone.trim()) updates.phone = formData.phone.trim();
      if (formData.location.trim()) updates.location = formData.location.trim();
      if (formData.line_id.trim()) updates.line_id = formData.line_id.trim();
      if (avatarUrl) updates.avatar_url = avatarUrl;

      console.log('Sending update with data:', updates);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error(`ไม่สามารถอัปเดตโปรไฟล์: ${updateError.message}`);
      }

      console.log('Profile updated successfully');

      // Verify the update was successful by fetching the updated profile
      const { data: updatedProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (verifyError) {
        console.error('Error verifying update:', verifyError);
        throw new Error('ไม่สามารถยืนยันการอัปเดตได้');
      }

      console.log('Profile update verified:', updatedProfile);

      toast({
        title: "อัปเดตโปรไฟล์สำเร็จ",
        description: "ข้อมูลโปรไฟล์ได้รับการอัปเดตแล้ว",
      });

      // Navigate back to profile page
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Show specific error messages based on error type
      let errorMessage = "ไม่สามารถอัปเดตโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'PGRST116') {
        errorMessage = "ไม่พบโปรไฟล์ในฐานข้อมูล";
      } else if (error.code === '23505') {
        errorMessage = "ข้อมูลซ้ำกับที่มีอยู่แล้ว";
      } else if (error.code === '23503') {
        errorMessage = "ข้อมูลไม่ถูกต้อง";
      }
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">กำลังโหลดโปรไฟล์...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">แก้ไขโปรไฟล์</CardTitle>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 border-4 border-white/20 shadow-glow">
                  <AvatarImage src={previewUrl} />
                  <AvatarFallback className="text-2xl bg-white/20 text-primary-foreground">
                    {formData.display_name?.charAt(0) || formData.first_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                    <span>เปลี่ยนรูปโปรไฟล์</span>
                  </div>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                    disabled={uploading}
                  />
                </Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">ชื่อ</Label>
                  <Input 
                    id="first_name" 
                    value={formData.first_name} 
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">นามสกุล</Label>
                  <Input 
                    id="last_name" 
                    value={formData.last_name} 
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">ชื่อที่แสดง</Label>
                <Input 
                  id="display_name" 
                  value={formData.display_name} 
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">ที่อยู่</Label>
                <Input 
                  id="location" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="line_id">Line ID</Label>
                <Input 
                  id="line_id" 
                  value={formData.line_id} 
                  onChange={(e) => setFormData({...formData, line_id: e.target.value})}
                  placeholder="เช่น @username หรือ user123"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">เกี่ยวกับตัวเอง</Label>
                <Textarea 
                  id="bio" 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  placeholder="บอกเล่าเกี่ยวกับตัวเอง..."
                  disabled={uploading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/profile')}
                disabled={uploading}
              >
                ยกเลิก
              </Button>
              <Button 
                type="submit" 
                disabled={uploading}
                className="bg-gradient-divine text-white hover:bg-gradient-divine/90"
                onClick={() => {
                  console.log('Save button clicked');
                  console.log('Current form data:', formData);
                  console.log('Avatar file:', avatarFile);
                }}
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    กำลังบันทึก...
                  </div>
                ) : (
                  "บันทึกการเปลี่ยนแปลง"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
