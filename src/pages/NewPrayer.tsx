import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  Heart, 
  Users, 
  Shield,
  AlertTriangle,
  Send,
  ArrowLeft,
  Tag,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";

interface PrayerFormData {
  title: string;
  description: string;
  category: string;
  careGroup: string;
  isUrgent: boolean;
  isPrivate: boolean;
  isAnonymous: boolean;
}

interface CareGroup {
  id: string;
  name: string;
}

const categories = [
  "สุขภาพและการรักษา",
  "ครอบครัว",
  "ความสัมพันธ์",
  "งานและอาชีพ",
  "การชี้นำ",
  "ความกตัญญู",
  "การเงิน",
  "การเติบโตฝ่ายวิญญาณ",
  "ชุมชน",
  "อื่นๆ"
];

const NewPrayer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [careGroups, setCareGroups] = useState<CareGroup[]>([]);
  const [formData, setFormData] = useState<PrayerFormData>({
    title: "",
    description: "",
    category: "",
    careGroup: "",
    isUrgent: false,
    isPrivate: false,
    isAnonymous: false
  });

  // Fetch care groups
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

  // Auth and data loading
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    fetchCareGroups();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนแบ่งปันคำอธิษฐาน",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกหัวข้อและรายละเอียดคำอธิษฐาน",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First, ensure the user has a profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          throw new Error('ไม่สามารถสร้างโปรไฟล์ได้');
        }
        
        profile = newProfile;
      } else if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      // Now insert the prayer
      const { error } = await supabase
        .from('prayers')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category || null,
          care_group_id: formData.careGroup || null,
          is_urgent: formData.isUrgent,
          is_private: formData.isPrivate,
          is_anonymous: formData.isAnonymous,
          status: 'active'
        });

      if (error) {
        console.error('Error inserting prayer:', error);
        throw error;
      }

      toast({
        title: "ส่งคำอธิษฐานสำเร็จ",
        description: "คำอธิษฐานของคุณได้ถูกส่งให้กับชุมชนแล้ว",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error('Error submitting prayer:', error);
      
      let errorMessage = "ไม่สามารถส่งคำอธิษฐานได้ กรุณาลองใหม่อีกครั้ง";
      
      if (error.code === '23505') {
        errorMessage = "คำอธิษฐานนี้มีอยู่แล้ว กรุณาลองใหม่อีกครั้ง";
      } else if (error.code === '23503') {
        errorMessage = "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof PrayerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold">แบ่งปันคำอธิษฐาน</h1>
            <p className="text-muted-foreground">ให้ชุมชนของเราร่วมอธิษฐานกับคุณ</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-peaceful">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                รายละเอียดคำอธิษฐาน
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">
                    หัวข้อคำอธิษฐาน *
                  </Label>
                  <Input
                    id="title"
                    placeholder="หัวข้อสั้นๆ ที่มีความหมายสำหรับคำอธิษฐานของคุณ"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    className="bg-background/50 border-border/50 text-base"
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">
                    รายละเอียดคำอธิษฐาน *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="แบ่งปันรายละเอียดเพิ่มเติมเกี่ยวกับคำอธิษฐานของคุณ เปิดใจเท่าที่คุณสบายใจ..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    className="bg-background/50 border-border/50 min-h-32 text-base"
                    maxLength={500}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                {/* Category and Care Group */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      หมวดหมู่
                    </Label>
                    <Select onValueChange={(value) => updateFormData("category", value)}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="เลือกหมวดหมู่" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      กลุ่มดูแล
                    </Label>
                    <Select onValueChange={(value) => updateFormData("careGroup", value)}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="เลือกกลุ่มดูแลของคุณ" />
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
                </div>

                {/* Prayer Options */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <h3 className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    การตั้งค่าคำอธิษฐาน
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Urgent */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <div>
                          <Label htmlFor="urgent" className="font-medium">
                            ระบุเป็นเร่งด่วน
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            คำอธิษฐานเร่งด่วนจะได้รับความสำคัญในฟีดชุมชน
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="urgent"
                        checked={formData.isUrgent}
                        onCheckedChange={(checked) => updateFormData("isUrgent", checked)}
                      />
                    </div>

                    {/* Private */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-blue-500" />
                        <div>
                          <Label htmlFor="private" className="font-medium">
                            เฉพาะกลุ่มดูแล
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            มองเห็นได้เฉพาะสมาชิกในกลุ่มดูแลของคุณ
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="private"
                        checked={formData.isPrivate}
                        onCheckedChange={(checked) => updateFormData("isPrivate", checked)}
                      />
                    </div>

                    {/* Anonymous */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-500" />
                        <div>
                          <Label htmlFor="anonymous" className="font-medium">
                            ส่งแบบไม่ระบุชื่อ
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            ชื่อของคุณจะไม่แสดงในคำขอนี้
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="anonymous"
                        checked={formData.isAnonymous}
                        onCheckedChange={(checked) => updateFormData("isAnonymous", checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Selected Options Preview */}
                {(formData.category || formData.careGroup || formData.isUrgent || formData.isPrivate || formData.isAnonymous) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ตัวอย่าง:</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.category && (
                        <Badge variant="outline">{formData.category}</Badge>
                      )}
                      {formData.careGroup && (
                        <Badge variant="secondary">
                          {careGroups.find(g => g.id === formData.careGroup)?.name}
                        </Badge>
                      )}
                      {formData.isUrgent && (
                        <Badge variant="destructive">เร่งด่วน</Badge>
                      )}
                      {formData.isPrivate && (
                        <Badge className="bg-blue-500 hover:bg-blue-600">ส่วนตัว</Badge>
                      )}
                      {formData.isAnonymous && (
                        <Badge className="bg-green-500 hover:bg-green-600">ไม่ระบุชื่อ</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        กำลังส่ง...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        แบ่งปันคำอธิษฐาน
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewPrayer;