import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock, 
  Send,
  ThumbsUp,
  AlertTriangle,
  Star,
  BookOpen,
  Users,
  CheckCircle,
  Prayer
} from "lucide-react";

interface PrayerResponse {
  id: string;
  content: string;
  response_type: 'prayer' | 'comment' | 'testimony';
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface PrayerInteractionCardProps {
  prayerId: string;
  onUpdate?: () => void;
}

const PrayerInteractionCard = ({ prayerId, onUpdate }: PrayerInteractionCardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [responses, setResponses] = useState<PrayerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newResponse, setNewResponse] = useState("");
  const [responseType, setResponseType] = useState<'prayer' | 'comment' | 'testimony'>('prayer');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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

    return () => subscription.unsubscribe();
  }, []);

  // Fetch responses
  const fetchResponses = useCallback(async () => {
    if (!prayerId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('prayer_responses')
        .select(`
          id,
          content,
          response_type,
          created_at,
          user_id,
          profile:profiles!prayer_responses_user_id_fkey(
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('prayer_id', prayerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดการตอบสนองได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [prayerId, toast]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const handleSubmitResponse = async () => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนแสดงความคิดเห็น",
        variant: "destructive"
      });
      return;
    }

    if (!newResponse.trim()) {
      toast({
        title: "ข้อความไม่สามารถว่างได้",
        description: "กรุณาใส่ข้อความก่อนส่ง",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('prayer_responses')
        .insert({
          prayer_id: prayerId,
          user_id: user.id,
          content: newResponse.trim(),
          response_type: responseType
        });

      if (error) throw error;

      setNewResponse("");
      setIsDialogOpen(false);
      
      // Refresh responses
      await fetchResponses();
      
      onUpdate?.();

      const responseTypeText = {
        prayer: "คำอธิษฐาน",
        comment: "ความคิดเห็น",
        testimony: "คำพยาน"
      }[responseType];

      toast({
        title: "ส่งสำเร็จ",
        description: `${responseTypeText}ของคุณได้ถูกส่งแล้ว`,
      });
    } catch (error: any) {
      console.error('Error submitting response:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อความได้",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'ไม่ระบุวันที่';
    }
  };

  const getResponseIcon = (type: string) => {
    switch (type) {
      case 'prayer':
        return <Prayer className="w-4 h-4 text-blue-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'testimony':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResponseColor = (type: string) => {
    switch (type) {
      case 'prayer':
        return 'border-blue-200 bg-blue-50';
      case 'comment':
        return 'border-green-200 bg-green-50';
      case 'testimony':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getResponseTypeText = (type: string) => {
    switch (type) {
      case 'prayer':
        return 'คำอธิษฐาน';
      case 'comment':
        return 'ความคิดเห็น';
      case 'testimony':
        return 'คำพยาน';
      default:
        return 'ข้อความ';
    }
  };

  const prayerResponses = responses.filter(r => r.response_type === 'prayer');
  const comments = responses.filter(r => r.response_type === 'comment');
  const testimonies = responses.filter(r => r.response_type === 'testimony');

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          การตอบสนองและคำพยาน
          <Badge variant="secondary" className="ml-auto">
            {responses.length} ข้อความ
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">ทั้งหมด ({responses.length})</TabsTrigger>
            <TabsTrigger value="prayers">คำอธิษฐาน ({prayerResponses.length})</TabsTrigger>
            <TabsTrigger value="comments">ความคิดเห็น ({comments.length})</TabsTrigger>
            <TabsTrigger value="testimonies">คำพยาน ({testimonies.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">กำลังโหลด...</p>
              </div>
            ) : responses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีการตอบสนอง</p>
                <p className="text-sm">เป็นคนแรกที่แสดงความคิดเห็นหรือคำพยาน</p>
              </div>
            ) : (
              <div className="space-y-3">
                {responses.map((response) => (
                  <div
                    key={response.id}
                    className={`p-4 rounded-lg border ${getResponseColor(response.response_type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={response.profile?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {response.profile?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {response.profile?.display_name || 'ผู้ใช้'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getResponseTypeText(response.response_type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(response.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                      </div>
                      <div className="mt-1">
                        {getResponseIcon(response.response_type)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prayers" className="space-y-4">
            {prayerResponses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Prayer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีคำอธิษฐาน</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prayerResponses.map((response) => (
                  <div
                    key={response.id}
                    className="p-4 rounded-lg border border-blue-200 bg-blue-50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={response.profile?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {response.profile?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {response.profile?.display_name || 'ผู้ใช้'}
                          </span>
                          <Badge variant="outline" className="text-xs bg-blue-100">
                            คำอธิษฐาน
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(response.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                      </div>
                      <Prayer className="w-4 h-4 text-blue-500 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีความคิดเห็น</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((response) => (
                  <div
                    key={response.id}
                    className="p-4 rounded-lg border border-green-200 bg-green-50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={response.profile?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {response.profile?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {response.profile?.display_name || 'ผู้ใช้'}
                          </span>
                          <Badge variant="outline" className="text-xs bg-green-100">
                            ความคิดเห็น
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(response.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                      </div>
                      <MessageCircle className="w-4 h-4 text-green-500 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="testimonies" className="space-y-4">
            {testimonies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีคำพยาน</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testimonies.map((response) => (
                  <div
                    key={response.id}
                    className="p-4 rounded-lg border border-yellow-200 bg-yellow-50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={response.profile?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {response.profile?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {response.profile?.display_name || 'ผู้ใช้'}
                          </span>
                          <Badge variant="outline" className="text-xs bg-yellow-100">
                            คำพยาน
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(response.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                      </div>
                      <Star className="w-4 h-4 text-yellow-500 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Response Button */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                เพิ่มการตอบสนอง
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>เพิ่มการตอบสนอง</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ประเภทการตอบสนอง</label>
                  <Select value={responseType} onValueChange={(value: any) => setResponseType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prayer">คำอธิษฐาน</SelectItem>
                      <SelectItem value="comment">ความคิดเห็น</SelectItem>
                      <SelectItem value="testimony">คำพยาน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">ข้อความ</label>
                  <Textarea
                    placeholder={
                      responseType === 'prayer' ? "เขียนคำอธิษฐานของคุณ..." :
                      responseType === 'comment' ? "เขียนความคิดเห็นของคุณ..." :
                      "เขียนคำพยานของคุณ..."
                    }
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={isSubmitting}
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
                        ส่ง
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerInteractionCard;