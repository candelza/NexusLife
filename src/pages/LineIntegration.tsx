import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Send,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendLineTextMessage } from "@/integrations/line/webhook";

interface LineUser {
  id: string;
  line_user_id: string;
  status: string;
  followed_at: string;
  unfollowed_at: string | null;
  created_at: string;
}

interface LineGroup {
  id: string;
  line_group_id: string;
  status: string;
  joined_at: string;
  left_at: string | null;
  created_at: string;
}

interface LineMessage {
  id: string;
  line_user_id: string;
  message_type: string;
  message_text: string;
  source_type: string;
  timestamp: string;
  created_at: string;
}

const LineIntegration = () => {
  const [lineUsers, setLineUsers] = useState<LineUser[]>([]);
  const [lineGroups, setLineGroups] = useState<LineGroup[]>([]);
  const [lineMessages, setLineMessages] = useState<LineMessage[]>([]);
  const [testMessage, setTestMessage] = useState("");
  const [testRecipient, setTestRecipient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const webhookUrl = `${window.location.origin}/.netlify/functions/line-webhook`;

  useEffect(() => {
    fetchLineData();
  }, []);

  const fetchLineData = async () => {
    try {
      // Fetch Line users
      const { data: users, error: usersError } = await supabase
        .from('line_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setLineUsers(users || []);

      // Fetch Line groups
      const { data: groups, error: groupsError } = await supabase
        .from('line_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;
      setLineGroups(groups || []);

      // Fetch Line messages
      const { data: messages, error: messagesError } = await supabase
        .from('line_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (messagesError) throw messagesError;
      setLineMessages(messages || []);
    } catch (error) {
      console.error('Error fetching Line data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูล Line ได้",
        variant: "destructive"
      });
    }
  };

  const handleTestMessage = async () => {
    if (!testMessage.trim() || !testRecipient.trim()) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อความและผู้รับ",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await sendLineTextMessage(testRecipient, testMessage);
      
      if (success) {
        toast({
          title: "ส่งข้อความสำเร็จ",
          description: "ข้อความถูกส่งไปยัง Line แล้ว",
        });
        setTestMessage("");
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถส่งข้อความได้",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อความได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "คัดลอกแล้ว",
      description: "Webhook URL ถูกคัดลอกแล้ว",
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Line Integration</h1>
        <p className="text-muted-foreground">จัดการการเชื่อมต่อกับ Line Official Account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <div className="flex gap-2 mt-2">
                <Input value={webhookUrl} readOnly />
                <Button onClick={copyWebhookUrl} variant="outline" size="sm">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ใช้ URL นี้ในการตั้งค่า webhook ใน Line Developer Console
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">การตั้งค่า</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• ไปที่ Line Developer Console</li>
                <li>• เลือก Channel ของคุณ</li>
                <li>• ไปที่ Messaging API</li>
                <li>• ตั้งค่า Webhook URL เป็น URL ด้านบน</li>
                <li>• เปิดใช้งาน "Use webhook"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Test Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              ทดสอบส่งข้อความ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>ผู้รับ (User ID หรือ Group ID)</Label>
              <Input
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="U1234567890abcdef"
              />
            </div>
            <div>
              <Label>ข้อความ</Label>
              <Textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="ข้อความทดสอบ..."
                rows={3}
              />
            </div>
            <Button 
              onClick={handleTestMessage} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "กำลังส่ง..." : "ส่งข้อความ"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Line Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Line Users ({lineUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lineUsers.map((user) => (
                <div key={user.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{user.line_user_id}</p>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
              ))}
              {lineUsers.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  ยังไม่มีผู้ใช้ Line
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Line Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Line Groups ({lineGroups.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lineGroups.map((group) => (
                <div key={group.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{group.line_group_id}</p>
                      <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                        {group.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(group.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
              ))}
              {lineGroups.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  ยังไม่มีกลุ่ม Line
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Line Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Line Messages ({lineMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lineMessages.map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{message.line_user_id}</p>
                    <p className="text-sm">{message.message_text}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
              ))}
              {lineMessages.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  ยังไม่มีข้อความ Line
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LineIntegration;
