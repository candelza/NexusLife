import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  User as UserIcon,
  Send,
  ThumbsUp,
  Trash2,
  AlertTriangle
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
  likes_count?: number;
  comments_count?: number;
  user_liked?: boolean;
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

interface PrayerCardProps {
  prayer: Prayer;
  onPrayerUpdate?: () => void;
}

const PrayerCard = ({ prayer, onPrayerUpdate }: PrayerCardProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLiked, setIsLiked] = useState(prayer.user_liked || false);
  const [likesCount, setLikesCount] = useState(prayer.likes_count || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(prayer.comments_count || 0);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  // Validate prayer data
  const validatePrayer = (prayer: Prayer): boolean => {
    if (!prayer || !prayer.id || !prayer.title || !prayer.description) {
      console.error('Invalid prayer data:', prayer);
      return false;
    }
    return true;
  };

  // Safe date formatting
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'ไม่ระบุวันที่';
      }
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'ไม่ระบุวันที่';
    }
  };

  useEffect(() => {
    // Validate prayer data first
    if (!validatePrayer(prayer)) {
      setHasError(true);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setIsAdmin(session.user.email === 'candelaz28@gmail.com');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAdmin(session.user.email === 'candelaz28@gmail.com');
      }
    });

    fetchComments();

    return () => subscription.unsubscribe();
  }, [prayer.id]);

  const fetchComments = useCallback(async () => {
    if (!prayer.id) {
      console.error('No prayer ID provided');
      return;
    }

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
        .eq('prayer_id', prayer.id)
        .eq('response_type', 'comment')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
      setComments(data || []);
      setCommentsCount(data?.length || 0);
    } catch (error: unknown) {
      console.error('Error fetching comments:', error);
      // Don't show toast for comment errors to avoid spam
    }
  }, [prayer.id]);

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
          .eq('prayer_id', prayer.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('prayer_likes')
          .insert({
            prayer_id: prayer.id,
            user_id: user.id
          });

        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }

      onPrayerUpdate?.();
    } catch (error: unknown) {
      console.error('Error handling like:', error);
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
          prayer_id: prayer.id,
          user_id: user.id,
          content: newComment.trim(),
          response_type: 'comment'
        });

      if (error) throw error;

      setNewComment("");
      setIsCommentDialogOpen(false);
      
      // Refresh comments
      await fetchComments();
      
      onPrayerUpdate?.();

      toast({
        title: "ส่งความคิดเห็นสำเร็จ",
        description: "ความคิดเห็นของคุณได้ถูกส่งแล้ว",
      });
    } catch (error: unknown) {
      console.error('Error submitting comment:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งความคิดเห็นได้",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถลบคำอธิษฐานได้",
        variant: "destructive"
      });
      return;
    }

    try {
      // Delete prayer responses first
      const { error: responsesError } = await supabase
        .from('prayer_responses')
        .delete()
        .eq('prayer_id', prayer.id);

      if (responsesError) throw responsesError;

      // Delete prayer likes
      const { error: likesError } = await supabase
        .from('prayer_likes')
        .delete()
        .eq('prayer_id', prayer.id);

      if (likesError) throw likesError;

      // Delete the prayer
      const { error: prayerError } = await supabase
        .from('prayers')
        .delete()
        .eq('id', prayer.id);

      if (prayerError) throw prayerError;

      toast({
        title: "ลบคำอธิษฐานสำเร็จ",
        description: "คำอธิษฐานได้ถูกลบออกจากระบบแล้ว",
      });

      onPrayerUpdate?.();
    } catch (error: unknown) {
      console.error('Error deleting prayer:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบคำอธิษฐานได้",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/prayer/${prayer.id}`;
    const shareText = `คำอธิษฐาน: ${prayer.title}`;
    
    // Facebook share
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const getDisplayName = () => {
    if (prayer.is_anonymous) {
      return "ไม่ระบุชื่อ";
    }
    
    return prayer.profile?.display_name || 
           `${prayer.profile?.first_name || ''} ${prayer.profile?.last_name || ''}`.trim() ||
           "ผู้ใช้";
  };

  const getDisplayInitials = () => {
    if (prayer.is_anonymous) {
      return "?";
    }
    
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Show error state if prayer data is invalid
  if (hasError || !validatePrayer(prayer)) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">ไม่สามารถแสดงคำอธิษฐานได้</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:shadow-peaceful transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
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
                  <span>{formatDate(prayer.created_at)}</span>
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
            {isAdmin && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>ยืนยันการลบคำอธิษฐาน</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>คุณแน่ใจหรือไม่ที่จะลบคำอธิษฐานนี้? การกระทำนี้ไม่สามารถยกเลิกได้</p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">ยกเลิก</Button>
                      <Button 
                        variant="destructive"
                        onClick={handleDelete}
                      >
                        ลบคำอธิษฐาน
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h4 
              className="font-semibold text-lg mb-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate(`/prayer/${prayer.id}`)}
            >
              {prayer.title}
            </h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{prayer.description}</p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{likesCount}</span>
              </Button>
              
              <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-muted-foreground"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{commentsCount}</span>
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
                                  {formatDate(comment.created_at)}
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
              className="flex items-center gap-1 text-muted-foreground"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">แชร์</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerCard; 