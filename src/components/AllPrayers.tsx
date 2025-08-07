import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PrayerCard from "@/components/PrayerCard";
import { 
  Heart, 
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Plus,
  Book
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

const AllPrayers = () => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  const itemsPerPage = 10;

  const fetchPrayers = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");

      let query = supabase
        .from('prayers')
        .select(`
          *,
          profile:profiles!prayers_user_id_fkey(
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `, { count: 'exact' });

      // Apply filters
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter !== "all") {
        query = query.eq('category', categoryFilter);
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching prayers:', error);
        throw error;
      }

      // Validate prayer data
      const validPrayers = (data || []).filter(prayer => {
        if (!prayer || !prayer.id || !prayer.title || !prayer.description) {
          console.warn('Invalid prayer data found:', prayer);
          return false;
        }
        return true;
      });

      setPrayers(validPrayers);
      
      // Calculate total pages
      const total = count || 0;
      setTotalPages(Math.ceil(total / itemsPerPage));

      if (validPrayers.length !== (data || []).length) {
        console.warn(`Filtered out ${(data || []).length - validPrayers.length} invalid prayers`);
      }

    } catch (error: any) {
      console.error('Error in fetchPrayers:', error);
      setHasError(true);
      
      let errorMsg = "ไม่สามารถโหลดคำอธิษฐานได้";
      
      if (error?.code === 'PGRST301' || error?.code === 'PGRST302') {
        errorMsg = "ปัญหาการเชื่อมต่อกับเซิร์ฟเวอร์";
      } else if (error?.code === '42P01') {
        errorMsg = "ตารางคำอธิษฐานไม่พบในฐานข้อมูล";
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter, currentPage, toast]);

  const handlePrayerUpdate = () => {
    fetchPrayers();
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage("");
    fetchPrayers();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filteredPrayers = prayers.filter(prayer => {
    const searchLower = searchTerm.toLowerCase();
    const title = prayer.title || '';
    const description = prayer.description || '';
    const displayName = prayer.profile?.display_name || '';
    
    return title.toLowerCase().includes(searchLower) ||
           description.toLowerCase().includes(searchLower) ||
           displayName.toLowerCase().includes(searchLower);
  });

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-divine rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-divine animate-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">กำลังโหลดคำอธิษฐาน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">คำอธิษฐานทั้งหมด</h1>
          <p className="text-muted-foreground">ดูและค้นหาคำอธิษฐานทั้งหมดในชุมชน</p>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ค้นหาคำอธิษฐาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/60 border-border/50"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-card/60 border-border/50">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">กำลังดำเนินการ</SelectItem>
              <SelectItem value="answered">ได้รับการตอบ</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-card/60 border-border/50">
              <SelectValue placeholder="หมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="สุขภาพ">สุขภาพ</SelectItem>
              <SelectItem value="การงาน">การงาน</SelectItem>
              <SelectItem value="ครอบครัว">ครอบครัว</SelectItem>
              <SelectItem value="การศึกษา">การศึกษา</SelectItem>
              <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={fetchPrayers}
            className="bg-card/60 border-border/50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
        </div>

        {/* Error State */}
        {hasError && (
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 mb-8">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">เกิดข้อผิดพลาด</h3>
              <p className="text-muted-foreground mb-4">{errorMessage}</p>
              <div className="flex justify-center gap-2">
                <Button onClick={handleRetry} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  ลองใหม่
                </Button>
                <Button onClick={() => navigate("/new-prayer")} variant="divine">
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างคำอธิษฐานใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {!hasError && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{prayers.length}</div>
                <div className="text-sm text-muted-foreground">คำอธิษฐานทั้งหมด</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 text-center">
                <Book className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {prayers.filter(p => p.status === 'answered').length}
                </div>
                <div className="text-sm text-muted-foreground">ได้รับการตอบ</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {prayers.filter(p => p.is_urgent).length}
                </div>
                <div className="text-sm text-muted-foreground">เร่งด่วน</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 text-center">
                <Filter className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{filteredPrayers.length}</div>
                <div className="text-sm text-muted-foreground">ผลการค้นหา</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Prayer List */}
        {!hasError && (
          <div className="space-y-6">
            {filteredPrayers.length === 0 ? (
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">ไม่พบคำอธิษฐาน</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all" || categoryFilter !== "all" 
                      ? "ลองเปลี่ยนเงื่อนไขการค้นหา" 
                      : "ยังไม่มีคำอธิษฐานในระบบ"}
                  </p>
                  <Button onClick={() => navigate("/new-prayer")} variant="divine">
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างคำอธิษฐานแรก
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPrayers.map((prayer) => (
                  <PrayerCard 
                    key={prayer.id} 
                    prayer={prayer}
                    onPrayerUpdate={handlePrayerUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!hasError && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ก่อนหน้า
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "divine" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPrayers;
