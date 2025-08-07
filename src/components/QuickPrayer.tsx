import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Send, Plus, X } from "lucide-react";

const QuickPrayer = ({ onPrayerCreated }: { onPrayerCreated?: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prayerText, setPrayerText] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!prayerText.trim()) {
      toast({
        title: "ข้อความไม่สามารถว่างได้",
        description: "กรุณาใส่ข้อความคำอธิษฐาน",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "คุณต้องเข้าสู่ระบบก่อนสร้างคำอธิษฐาน",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('prayers')
        .insert({
          title: prayerText.length > 50 ? prayerText.substring(0, 50) + "..." : prayerText,
          description: prayerText,
          user_id: user.id,
          is_urgent: isUrgent,
          is_anonymous: isAnonymous,
          status: 'pending'
        });

      if (error) throw error;

      // Reset form
      setPrayerText("");
      setIsUrgent(false);
      setIsAnonymous(false);
      setIsExpanded(false);

      toast({
        title: "ส่งคำอธิษฐานสำเร็จ",
        description: "คำอธิษฐานของคุณได้ถูกส่งแล้ว",
      });

      onPrayerCreated?.();
    } catch (error) {
      console.error('Error creating prayer:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งคำอธิษฐานได้",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPrayerText("");
    setIsUrgent(false);
    setIsAnonymous(false);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:shadow-peaceful transition-all cursor-pointer"
            onClick={() => setIsExpanded(true)}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Plus className="w-5 h-5" />
            <span className="font-medium">เพิ่มคำอธิษฐานด่วน</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            คำอธิษฐานด่วน
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="เขียนคำอธิษฐานของคุณ..."
            value={prayerText}
            onChange={(e) => setPrayerText(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="text-xs text-muted-foreground">
            {prayerText.length}/500 ตัวอักษร
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="urgent"
              checked={isUrgent}
              onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
            />
            <label htmlFor="urgent" className="text-sm font-medium">
              เร่งด่วน
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <label htmlFor="anonymous" className="text-sm font-medium">
              ไม่ระบุชื่อ
            </label>
          </div>
        </div>

        {isUrgent && (
          <Badge variant="destructive" className="w-fit">
            ⚠️ คำอธิษฐานเร่งด่วน
          </Badge>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !prayerText.trim()}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                ส่ง...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                ส่งคำอธิษฐาน
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickPrayer;
