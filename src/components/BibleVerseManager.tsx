import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Book, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Save,
  X
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
  reading_day?: number;
  scheduled_date?: string;
  scheduled_time?: string;
}

const BibleVerseManager = () => {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVerse, setEditingVerse] = useState<BibleVerse | null>(null);
  const { toast } = useToast();

  const [newVerse, setNewVerse] = useState({
    book: "",
    chapter: 1,
    verse_start: 1,
    verse_end: 1,
    content: "",
    content_thai: "",
    explanation: "",
    explanation_thai: "",
    reading_day: 1,
    scheduled_date: "",
    scheduled_time: ""
  });

  const bibleBooks = [
    "ปฐมกาล", "อพยพ", "เลวีนิติ", "กันดารวิถี", "เฉลยธรรมบัญญัติ",
    "โยชูวา", "ผู้วินิจฉัย", "รูธ", "1 ซามูเอล", "2 ซามูเอล",
    "1 พงศ์กษัตริย์", "2 พงศ์กษัตริย์", "1 พงศาวดาร", "2 พงศาวดาร",
    "เอสรา", "เนหะมีย์", "เอสเธอร์", "โยบ", "สดุดี", "สุภาษิต",
    "ปัญญาจารย์", "เพลงซาโลมอน", "อิสยาห์", "เยเรมีย์", "เพลงคร่ำครวญ",
    "เอเสเคียล", "ดาเนียล", "โฮเซยา", "โยเอล", "อาโมส", "โอบาดีย์",
    "โยนาห์", "มีคาห์", "นาฮูม", "ฮาบากุก", "เศฟันยาห์", "ฮักกัย",
    "เศคาริยาห์", "มาลาคี", "มัทธิว", "มาระโก", "ลูกา", "ยอห์น",
    "กิจการ", "โรม", "1 โครินธ์", "2 โครินธ์", "กาลาเทีย", "เอเฟซัส",
    "ฟิลิปปี", "โคโลสี", "1 เธสะโลนิกา", "2 เธสะโลนิกา", "1 ทิโมธี",
    "2 ทิโมธี", "ทิตัส", "ฟีเลโมน", "ฮีบรู", "ยากอบ", "1 เปโตร",
    "2 เปโตร", "1 ยอห์น", "2 ยอห์น", "3 ยอห์น", "ยูดา", "วิวรณ์"
  ];

  const fetchVerses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bible_verses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerses(data || []);
    } catch (error) {
      console.error('Error fetching verses:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดพระคัมภีร์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const verseData = {
        ...newVerse,
        chapter: parseInt(newVerse.chapter.toString()),
        verse_start: parseInt(newVerse.verse_start.toString()),
        verse_end: parseInt(newVerse.verse_end.toString()),
        reading_day: parseInt(newVerse.reading_day.toString())
      };

      if (editingVerse) {
        // Update existing verse
        const { error } = await supabase
          .from('bible_verses')
          .update(verseData)
          .eq('id', editingVerse.id);

        if (error) throw error;

        toast({
          title: "อัปเดตสำเร็จ",
          description: "อัปเดตพระคัมภีร์เรียบร้อยแล้ว",
        });
      } else {
        // Create new verse
        const { error } = await supabase
          .from('bible_verses')
          .insert(verseData);

        if (error) throw error;

        toast({
          title: "เพิ่มสำเร็จ",
          description: "เพิ่มพระคัมภีร์เรียบร้อยแล้ว",
        });
      }

      // Reset form and refresh data
      setNewVerse({
        book: "",
        chapter: 1,
        verse_start: 1,
        verse_end: 1,
        content: "",
        content_thai: "",
        explanation: "",
        explanation_thai: "",
        reading_day: 1,
        scheduled_date: "",
        scheduled_time: ""
      });
      setEditingVerse(null);
      setIsDialogOpen(false);
      fetchVerses();
    } catch (error) {
      console.error('Error saving verse:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกพระคัมภีร์ได้",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (verse: BibleVerse) => {
    setEditingVerse(verse);
    setNewVerse({
      book: verse.book,
      chapter: verse.chapter,
      verse_start: verse.verse_start,
      verse_end: verse.verse_end || 1,
      content: verse.content,
      content_thai: verse.content_thai || "",
      explanation: verse.explanation || "",
      explanation_thai: verse.explanation_thai || "",
      reading_day: verse.reading_day || 1,
      scheduled_date: verse.scheduled_date || "",
      scheduled_time: verse.scheduled_time || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบพระคัมภีร์นี้?')) return;

    try {
      const { error } = await supabase
        .from('bible_verses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "ลบสำเร็จ",
        description: "ลบพระคัมภีร์เรียบร้อยแล้ว",
      });

      fetchVerses();
    } catch (error) {
      console.error('Error deleting verse:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบพระคัมภีร์ได้",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setNewVerse({
      book: "",
      chapter: 1,
      verse_start: 1,
      verse_end: 1,
      content: "",
      content_thai: "",
      explanation: "",
      explanation_thai: "",
      reading_day: 1,
      scheduled_date: "",
      scheduled_time: ""
    });
    setEditingVerse(null);
    setIsDialogOpen(false);
  };

  useEffect(() => {
    fetchVerses();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการพระคัมภีร์ประจำวัน</h1>
          <p className="text-muted-foreground">เพิ่ม แก้ไข และลบพระคัมภีร์ประจำวัน</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มพระคัมภีร์
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVerse ? "แก้ไขพระคัมภีร์" : "เพิ่มพระคัมภีร์ใหม่"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="book">หนังสือ</Label>
                  <Select 
                    value={newVerse.book} 
                    onValueChange={(value) => setNewVerse({...newVerse, book: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหนังสือ" />
                    </SelectTrigger>
                    <SelectContent>
                      {bibleBooks.map((book) => (
                        <SelectItem key={book} value={book}>
                          {book}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="chapter">บท</Label>
                  <Input
                    id="chapter"
                    type="number"
                    min="1"
                    value={newVerse.chapter}
                    onChange={(e) => setNewVerse({...newVerse, chapter: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="verse_start">ข้อเริ่มต้น</Label>
                  <Input
                    id="verse_start"
                    type="number"
                    min="1"
                    value={newVerse.verse_start}
                    onChange={(e) => setNewVerse({...newVerse, verse_start: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="verse_end">ข้อสิ้นสุด</Label>
                  <Input
                    id="verse_end"
                    type="number"
                    min="1"
                    value={newVerse.verse_end}
                    onChange={(e) => setNewVerse({...newVerse, verse_end: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">เนื้อหาภาษาอังกฤษ</Label>
                <Textarea
                  id="content"
                  value={newVerse.content}
                  onChange={(e) => setNewVerse({...newVerse, content: e.target.value})}
                  placeholder="Enter English content..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content_thai">เนื้อหาภาษาไทย</Label>
                <Textarea
                  id="content_thai"
                  value={newVerse.content_thai}
                  onChange={(e) => setNewVerse({...newVerse, content_thai: e.target.value})}
                  placeholder="ใส่เนื้อหาภาษาไทย..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="explanation">คำอธิบายภาษาอังกฤษ</Label>
                <Textarea
                  id="explanation"
                  value={newVerse.explanation}
                  onChange={(e) => setNewVerse({...newVerse, explanation: e.target.value})}
                  placeholder="Enter English explanation..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="explanation_thai">คำอธิบายภาษาไทย</Label>
                <Textarea
                  id="explanation_thai"
                  value={newVerse.explanation_thai}
                  onChange={(e) => setNewVerse({...newVerse, explanation_thai: e.target.value})}
                  placeholder="ใส่คำอธิบายภาษาไทย..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reading_day">วันที่อ่าน (1-365)</Label>
                  <Input
                    id="reading_day"
                    type="number"
                    min="1"
                    max="365"
                    value={newVerse.reading_day}
                    onChange={(e) => setNewVerse({...newVerse, reading_day: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="scheduled_date">วันที่กำหนด (ไม่บังคับ)</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={newVerse.scheduled_date}
                    onChange={(e) => setNewVerse({...newVerse, scheduled_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "กำลังบันทึก..." : (editingVerse ? "อัปเดต" : "เพิ่ม")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Verses List */}
      <div className="grid gap-4">
        {verses.map((verse) => (
          <Card key={verse.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {verse.book} {verse.chapter}:{verse.verse_start}
                    {verse.verse_end && verse.verse_end !== verse.verse_start && `-${verse.verse_end}`}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    วันที่อ่าน: {verse.reading_day} | 
                    {verse.scheduled_date && ` กำหนด: ${verse.scheduled_date}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(verse)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(verse.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verse.content_thai && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">เนื้อหาภาษาไทย:</p>
                    <p className="text-sm">{verse.content_thai}</p>
                  </div>
                )}
                {verse.content && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">เนื้อหาภาษาอังกฤษ:</p>
                    <p className="text-sm">{verse.content}</p>
                  </div>
                )}
                {verse.explanation_thai && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">คำอธิบายภาษาไทย:</p>
                    <p className="text-sm">{verse.explanation_thai}</p>
                  </div>
                )}
                {verse.explanation && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">คำอธิบายภาษาอังกฤษ:</p>
                    <p className="text-sm">{verse.explanation}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {verses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มีพระคัมภีร์</h3>
            <p className="text-muted-foreground mb-4">เพิ่มพระคัมภีร์แรกของคุณ</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มพระคัมภีร์
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BibleVerseManager;
