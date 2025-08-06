import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Shield, Users, ArrowRight } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: email.split('@')[0],
              last_name: ''
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Create profile for new user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              display_name: email.split('@')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }

          toast({
            title: "ลงทะเบียนสำเร็จ",
            description: "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Ensure profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Create profile if it doesn't exist
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                display_name: data.user.email?.split('@')[0] || 'User',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (createError) {
              console.error('Error creating profile:', createError);
            }
          }

          toast({
            title: "เข้าสู่ระบบสำเร็จ",
            description: "ยินดีต้อนรับกลับมา",
          });
          
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเข้าสู่ระบบได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-peaceful">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-divine rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-serif">
              {isSignUp ? "สร้างบัญชีใหม่" : "เข้าสู่ระบบ"}
            </CardTitle>
            <p className="text-muted-foreground">
              {isSignUp 
                ? "เข้าร่วมชุมชนอธิษฐานของเรา" 
                : "ยินดีต้อนรับกลับมา"
              }
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                variant="divine"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    {isSignUp ? "สร้างบัญชี" : "เข้าสู่ระบบ"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isSignUp 
                  ? "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ" 
                  : "ยังไม่มีบัญชี? สร้างบัญชีใหม่"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Features */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-medium text-sm">คำอธิษฐานร่วมกัน</h3>
            <p className="text-xs text-muted-foreground">แบ่งปันและอธิษฐานร่วมกัน</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-sm">ชุมชนดูแล</h3>
            <p className="text-xs text-muted-foreground">เข้าร่วมกลุ่มดูแลที่เหมาะสม</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-sm">ความเป็นส่วนตัว</h3>
            <p className="text-xs text-muted-foreground">ข้อมูลของคุณปลอดภัย</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;