import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Book, 
  CheckCircle, 
  Circle, 
  ChevronLeft, 
  ChevronRight,
  Shuffle,
  Heart
} from "lucide-react";

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
  reading_day: number;
}

interface BibleVerseCardProps {
  date?: Date;
  showControls?: boolean;
}

const BibleVerseCard = ({ date = new Date(), showControls = true }: BibleVerseCardProps) => {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const currentDayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

  const fetchDailyVerses = async () => {
    try {
      setIsLoading(true);
      
      // First try to get verses for today's reading day
      let { data, error } = await supabase
        .from('bible_verses')
        .select('*')
        .eq('reading_day', currentDayOfYear)
        .limit(3);

      if (error) throw error;

      // If no verses for today, get random verses
      if (!data || data.length === 0) {
        const { data: randomData, error: randomError } = await supabase
          .from('bible_verses')
          .select('*')
          .limit(10);

        if (randomError) throw randomError;

        // Simple pseudo-random selection based on date
        const shuffled = randomData?.sort(() => {
          const seed = currentDayOfYear;
          return (seed % 3) - 1;
        }) || [];

        data = shuffled.slice(0, 3);
      }

      setVerses(data || []);
      
      // Check if user has completed today's reading
      await checkReadingProgress();
    } catch (error) {
      console.error('Error fetching bible verses:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดพระคัมภีร์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkReadingProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_bible_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('reading_day', currentDayOfYear)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsCompleted(!!data);
    } catch (error) {
      console.error('Error checking reading progress:', error);
    }
  };

  const markAsCompleted = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "กรุณาเข้าสู่ระบบเพื่อบันทึกความคืบหน้าการอ่าน",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_bible_progress')
        .upsert({
          user_id: user.id,
          reading_day: currentDayOfYear,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsCompleted(true);
      toast({
        title: "บันทึกการอ่านแล้ว",
        description: "บันทึกความคืบหน้าการอ่านพระคัมภีร์วันนี้แล้ว",
      });

      // Check for yearly completion achievement
      await checkYearlyCompletion(user.id);
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกความคืบหน้าได้",
        variant: "destructive",
      });
    }
  };

  const checkYearlyCompletion = async (userId: string) => {
    try {
      const { count } = await supabase
        .from('user_bible_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (count && count >= 365) {
        // Award yearly completion achievement
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_type: 'yearly_bible_reading',
            achievement_data: {
              year: new Date().getFullYear(),
              completed_days: count
            }
          });

        toast({
          title: "🏆 ยินดีด้วย!",
          description: "คุณอ่านพระคัมภีร์ครบ 1 ปีแล้ว!",
        });
      }
    } catch (error) {
      console.error('Error checking yearly completion:', error);
    }
  };

  const navigateVerse = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'next' && currentIndex < verses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const shuffleVerses = () => {
    const shuffled = [...verses].sort(() => Math.random() - 0.5);
    setVerses(shuffled);
    setCurrentIndex(0);
  };

  useEffect(() => {
    fetchDailyVerses();
  }, [date]);

  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">กำลังโหลดพระคัมภีร์...</div>
        </CardContent>
      </Card>
    );
  }

  if (verses.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <Book className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">ไม่มีพระคัมภีร์สำหรับวันนี้</p>
        </CardContent>
      </Card>
    );
  }

  const currentVerse = verses[currentIndex];

  return (
    <Card className="bg-white border border-gray-200 shadow-lg overflow-hidden" style={{
      '--tw-ring-offset-shadow': '0 0 #0000',
      '--tw-ring-shadow': '0 0 #0000',
      '--tw-shadow': 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)'
    } as React.CSSProperties}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Book className="w-5 h-5 text-gray-700" />
            พระคัมภีร์ประจำวัน
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              {currentIndex + 1}/{verses.length}
            </Badge>
            {isCompleted && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                อ่านแล้ว
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="text-sm text-gray-600 font-medium">
            {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse_start}
            {currentVerse.verse_end && currentVerse.verse_end !== currentVerse.verse_start && 
              `-${currentVerse.verse_end}`}
          </div>
          
          <div className="text-lg leading-relaxed text-gray-900">
            {currentVerse.content_thai || currentVerse.content}
          </div>
          
          {(currentVerse.explanation_thai || currentVerse.explanation) && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-900">คำอธิบาย</h4>
              <p className="text-sm text-gray-700">
                {currentVerse.explanation_thai || currentVerse.explanation}
              </p>
            </div>
          )}
        </div>

        {showControls && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateVerse('prev')}
                disabled={currentIndex === 0}
                className="text-gray-600 hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shuffleVerses}
                className="text-gray-600 hover:bg-gray-100"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateVerse('next')}
                disabled={currentIndex === verses.length - 1}
                className="text-gray-600 hover:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={markAsCompleted}
              disabled={isCompleted}
              className="bg-gray-800 text-gray-100 hover:bg-gray-900"
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  อ่านแล้ว
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 mr-1" />
                  ทำเครื่องหมายว่าอ่านแล้ว
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BibleVerseCard;