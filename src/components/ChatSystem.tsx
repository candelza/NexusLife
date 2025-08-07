import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Users, MessageCircle, MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  user_id: string;
  group_id: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface ChatSystemProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSystem = ({ groupId, groupName, isOpen, onClose }: ChatSystemProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          *,
          profile:profiles!group_messages_user_id_fkey(
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อความได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          content: newMessage.trim(),
          user_id: user.id,
          group_id: groupId
        });

      if (error) throw error;

      setNewMessage("");
      toast({
        title: "ส่งข้อความสำเร็จ",
        description: "ข้อความของคุณถูกส่งแล้ว",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อความได้",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

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

  // Fetch messages when component mounts or groupId changes
  useEffect(() => {
    if (isOpen && groupId) {
      fetchMessages();
    }
  }, [isOpen, groupId]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!isOpen || !groupId) return;

    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, groupId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getDisplayName = (message: Message) => {
    if (message.profile?.display_name) return message.profile.display_name;
    if (message.profile?.first_name && message.profile?.last_name) {
      return `${message.profile.first_name} ${message.profile.last_name}`;
    }
    return 'สมาชิก';
  };

  const getAvatarFallback = (message: Message) => {
    const name = getDisplayName(message);
    return name.charAt(0).toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">แชทกลุ่ม: {groupName}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Messages Area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 border rounded-lg p-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>กำลังโหลดข้อความ...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีข้อความ</p>
                <p className="text-sm">เริ่มต้นการสนทนาในกลุ่มของคุณ</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.user_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.profile?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {getAvatarFallback(message)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col space-y-1 ${
                      message.user_id === user?.id ? 'items-end' : 'items-start'
                    }`}>
                      <div className={`px-3 py-2 rounded-lg max-w-xs lg:max-w-md ${
                        message.user_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className={message.user_id === user?.id ? 'text-right' : 'text-left'}>
                          {getDisplayName(message)}
                        </span>
                        <span>•</span>
                        <span>{formatTime(message.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="พิมพ์ข้อความของคุณ..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSystem;
