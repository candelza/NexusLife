import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Shield, Users, ArrowRight, UserPlus, LogIn, Mail } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
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

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      // Google OAuth will redirect to the callback URL
      // The callback will handle the profile creation
      
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเข้าสู่ระบบด้วย Google ได้",
        variant: "destructive"
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลงทะเบียนได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
    } catch (error: any) {
      console.error('Sign in error:', error);
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
              Faith Nexus Hub
            </CardTitle>
            <p className="text-muted-foreground">
              ชุมชนอธิษฐานแห่งความเชื่อ
            </p>
          </CardHeader>
          
          <CardContent>
            {/* Auth Mode Tabs */}
            <div className="flex bg-muted rounded-lg p-1 mb-6">
              <Button
                variant={authMode === 'login' ? 'default' : 'ghost'}
                onClick={() => setAuthMode('login')}
                className="flex-1"
                size="sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                เข้าสู่ระบบ
              </Button>
              <Button
                variant={authMode === 'signup' ? 'default' : 'ghost'}
                onClick={() => setAuthMode('signup')}
                className="flex-1"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                สมัครสมาชิก
              </Button>
            </div>

            {/* Google Login Button */}
            <div className="mb-6">
              <Button
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
                variant="outline"
              >
                {isGoogleLoading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent mr-2" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    เข้าสู่ระบบด้วย Google
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">หรือ</span>
              </div>
            </div>

            <form onSubmit={authMode === 'login' ? handleSignIn : handleSignUp} className="space-y-4">
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
              
              {/* Separate Buttons for Login and Signup */}
              {authMode === 'login' ? (
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-divine hover:bg-gradient-divine/90" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      เข้าสู่ระบบด้วยอีเมล
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-peaceful hover:bg-gradient-peaceful/90 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      กำลังสมัครสมาชิก...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      สมัครสมาชิกด้วยอีเมล
                      <UserPlus className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </form>
            
            {/* Switch Mode Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {authMode === 'login' 
                  ? "ยังไม่มีบัญชี? " 
                  : "มีบัญชีอยู่แล้ว? "
                }
                <Button
                  variant="link"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="p-0 h-auto text-primary hover:text-primary/80"
                >
                  {authMode === 'login' ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
                </Button>
              </p>
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