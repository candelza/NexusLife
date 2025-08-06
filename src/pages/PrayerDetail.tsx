import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock, 
  ArrowLeft,
  Send,
  Facebook
} from "lucide-react";

interface Prayer {
  id: string;
  title: string;
  description: string;
  category: string | null;
  is_urgent: boolean;
  is_private: boolean;
  is_anonymous: boolean;
  status: string;
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

const PrayerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prayer, setPrayer] = useState<Prayer | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    if (id) {
      fetchPrayer();
      fetchComments();
      checkUserLike();
    }

    return () => subscription.unsubscribe();
  }, [id]);

  const fetchPrayer = async () => {
    try {
      const { data, error } = await supabase
        .from('prayers')
        .select(`
          *,
          profile:profiles!prayers_user_id_fkey(
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPrayer(data);
    } catch (error) {
      console.error('Error fetching prayer:', error);
      toast({
        title: "ไม่พบคำอธิษฐาน",
        description: "คำอธิษฐานที่คุณค้นหาอาจถูกลบหรือไม่สามารถเข้าถึงได้",
        variant: "destructive"
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_responses')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profile:profiles!prayer_responses_user_id_fkey(
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('prayer_id', id)
        .eq('response_type', 'comment')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkUserLike = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prayer_likes')
        .select('id')
        .eq('prayer_id', id)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setIsLiked(true);
      }
    } catch (error) {
      // User hasn't liked this prayer
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนกดไลค์",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('prayer_likes')
          .delete()
          .eq('prayer_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('prayer_likes')
          .insert({
            prayer_id: id,
            user_id: user.id
          });

        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถกดไลค์ได้",
        variant: "destructive"
      });
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนแสดงความคิดเห็น",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) {
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
          prayer_id: id,
          user_id: user.id,
          content: newComment.trim(),
          response_type: 'comment'
        });

      if (error) throw error;

      toast({
        title: "ส่งความคิดเห็นสำเร็จ",
        description: "ความคิดเห็นของคุณได้ถูกส่งแล้ว",
      });

      setNewComment("");
      setIsCommentDialogOpen(false);
      fetchComments();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งความคิดเห็นได้",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/prayer/${id}`;
    const shareText = `คำอธิษฐาน: ${prayer?.title}`;
    
    // Facebook share
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const getDisplayName = () => {
    if (!prayer) return "";
    
    if (prayer.is_anonymous) {
      return "ไม่ระบุชื่อ";
    }
    
    return prayer.profile?.display_name || 
           `${prayer.profile?.first_name || ''} ${prayer.profile?.last_name || ''}`.trim() ||
           "ผู้ใช้";
  };

  const getDisplayInitials = () => {
    if (!prayer) return "";
    
    if (prayer.is_anonymous) {
      return "?";
    }
    
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (!prayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">ไม่พบคำอธิษฐาน</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold">คำอธิษฐาน</h1>
            <p className="text-muted-foreground">รายละเอียดคำอธิษฐาน</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-peaceful">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={prayer.is_anonymous ? undefined : prayer.profile?.avatar_url} />
                    <AvatarFallback className={prayer.is_anonymous ? "bg-muted" : ""}>
                      {getDisplayInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getDisplayName()}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(prayer.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                    {prayer.category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {prayer.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {prayer.is_urgent && (
                    <Badge variant="destructive" className="text-xs">
                      เร่งด่วน
                    </Badge>
                  )}
                  {prayer.is_private && (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                      ส่วนตัว
                    </Badge>
                  )}
                  <Badge 
                    variant={prayer.status === 'answered' ? 'default' : 'secondary'}
                    className={prayer.status === 'answered' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {prayer.status === 'answered' ? 'ได้รับการตอบ' : 'กำลังดำเนินการ'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-4">{prayer.title}</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap text-lg leading-relaxed">
                    {prayer.description}
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                  <div className="flex items-center gap-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>ไลค์ ({likesCount})</span>
                    </Button>
                    
                    <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 text-muted-foreground"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>ความคิดเห็น ({comments.length})</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>แสดงความคิดเห็น</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Textarea
                              placeholder="เขียนความคิดเห็นของคุณ..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          {/* Comments list */}
                          {comments.length > 0 && (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              <h4 className="font-medium text-sm">ความคิดเห็นล่าสุด</h4>
                              {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-2 p-2 bg-muted/30 rounded-lg">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={comment.profile?.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                      {comment.profile?.display_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium">
                                        {comment.profile?.display_name || 'ผู้ใช้'}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(comment.created_at).toLocaleDateString('th-TH')}
                                      </span>
                                    </div>
                                    <p className="text-sm">{comment.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsCommentDialogOpen(false)}
                              className="flex-1"
                            >
                              ยกเลิก
                            </Button>
                            <Button
                              onClick={handleComment}
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
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Facebook className="w-5 h-5" />
                    <span>แชร์ Facebook</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrayerDetail; 