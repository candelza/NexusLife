import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (data.session?.user) {
          // Ensure profile exists for Google user
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Create profile for Google user
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                display_name: data.session.user.user_metadata?.full_name || 
                             data.session.user.email?.split('@')[0] || 'User',
                first_name: data.session.user.user_metadata?.full_name?.split(' ')[0] || '',
                last_name: data.session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                avatar_url: data.session.user.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (createError) {
              console.error('Error creating profile for Google user:', createError);
            }
          }

          toast({
            title: "เข้าสู่ระบบสำเร็จ",
            description: "ยินดีต้อนรับกลับมา",
          });

          navigate("/");
        } else {
          throw new Error("ไม่พบข้อมูลการเข้าสู่ระบบ");
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message || "ไม่สามารถเข้าสู่ระบบได้",
          variant: "destructive"
        });
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-peaceful w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-divine rounded-full flex items-center justify-center">
                              <Heart className="w-8 h-8 text-gray-700" />
            </div>
          </div>
          <CardTitle className="text-xl font-serif">
            กำลังเข้าสู่ระบบ...
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                กำลังตรวจสอบข้อมูลการเข้าสู่ระบบ
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-muted-foreground">
                เข้าสู่ระบบสำเร็จ
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback; 