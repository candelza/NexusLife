import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Book, Heart, Share2 } from "lucide-react";

interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse_start: number;
  verse_end?: number;
  content: string;
  content_thai?: string;
  explanation?: string;
  explanation_thai?: string;
}

const DailyBibleVerse = () => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDailyVerse = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get today's date as a seed for consistent daily verse
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      
      // Get a random verse using day as seed
      const { data, error } = await supabase
        .from('bible_verses')
        .select('*')
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        // Use day of year to select a consistent verse for the day
        const selectedVerse = data[dayOfYear % data.length] || data[0];
        setVerse(selectedVerse);
      }
    } catch (error) {
      console.error('Error fetching daily verse:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดพระคัมภีร์ประจำวันได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleShare = () => {
    if (!verse) return;
    
    const text = `📖 พระคัมภีร์ประจำวัน: ${verse.book} ${verse.chapter}:${verse.verse_start}\n\n"${verse.content_thai || verse.content}"\n\n#พระคัมภีร์ #DailyBible`;
    const url = window.location.href;
    
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  useEffect(() => {
    fetchDailyVerse();
  }, [fetchDailyVerse]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-divine text-primary-foreground border-0">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">กำลังโหลดพระคัมภีร์ประจำวัน...</div>
        </CardContent>
      </Card>
    );
  }

  if (!verse) {
    return null;
  }

  return (
    <Card className="bg-gradient-divine text-primary-foreground border-0 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
      
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            พระคัมภีร์ประจำวัน
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground">
            {verse.book} {verse.chapter}:{verse.verse_start}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-4">
          <div className="text-lg leading-relaxed">
            "{verse.content_thai || verse.content}"
          </div>
          
          {verse.explanation_thai && (
            <div className="p-3 bg-white/10 rounded-lg">
              <p className="text-sm opacity-90">{verse.explanation_thai}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="bg-white/20 text-primary-foreground hover:bg-white/30"
            >
              <Share2 className="w-4 h-4 mr-2" />
              แชร์
            </Button>
            
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Heart className="w-4 h-4" />
              <span>พระวจนะของพระเจ้า</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyBibleVerse;
