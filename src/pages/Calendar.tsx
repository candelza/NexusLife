import { useState, useEffect } from "react";
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';
import BibleVerseCard from "@/components/BibleVerseCard";
import { cn } from "@/lib/utils";
import { 
  Calendar as CalendarIcon,
  Heart,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User as UserIcon,
  Send
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  event_type: string | null;
  is_public: boolean | null;
  organizer_id: string | null;
  care_group_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CareGroup {
  id: string;
  name: string;
}

const eventTypeColors = {
  prayer: "bg-pink-500",
  worship: "bg-yellow-500",
  study: "bg-indigo-500",
  fellowship: "bg-purple-500",
  service: "bg-green-500",
  general: "bg-blue-500"
};

const eventTypes = [
  { value: "prayer", label: "การประชุมอธิษฐาน" },
  { value: "worship", label: "การนมัสการ" },
  { value: "study", label: "การศึกษาพระคัมภีร์" },
  { value: "fellowship", label: "กิจกรรมสามัคคี" },
  { value: "service", label: "งานบริการ" },
  { value: "general", label: "กิจกรรมทั่วไป" }
];

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [careGroups, setCareGroups] = useState<CareGroup[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    event_type: "",
    is_public: true,
    care_group_id: ""
  });

  // Fetch events from database
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time');

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch care groups
  const fetchCareGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('care_groups')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCareGroups(data || []);
    } catch (error) {
      console.error('Error fetching care groups:', error);
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

    fetchEvents();
    fetchCareGroups();

    return () => subscription.unsubscribe();
  }, []);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, date);
    });
  };

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนสร้างกิจกรรม",
        variant: "destructive"
      });
      return;
    }
    
    if (!newEvent.title.trim() || !newEvent.start_time) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกหัวข้อและเวลาของกิจกรรม",
        variant: "destructive"
      });
      return;
    }

    // Validate event type if provided
    if (newEvent.event_type && !eventTypes.find(type => type.value === newEvent.event_type)) {
      toast({
        title: "ประเภทกิจกรรมไม่ถูกต้อง",
        description: "กรุณาเลือกประเภทกิจกรรมที่ถูกต้อง",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const eventData = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || null,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time || null,
        location: newEvent.location.trim() || null,
        event_type: newEvent.event_type || 'general', // Default to 'general' if not specified
        is_public: newEvent.is_public,
        organizer_id: user.id,
        care_group_id: newEvent.care_group_id || null
      };

      const { error } = await supabase
        .from('events')
        .insert(eventData);

      if (error) throw error;

      toast({
        title: "สร้างกิจกรรมสำเร็จ",
        description: "กิจกรรมใหม่ได้ถูกสร้างแล้ว",
      });
      
      // Reset form and close dialog
      setNewEvent({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        event_type: "",
        is_public: true,
        care_group_id: ""
      });
      setIsCreateDialogOpen(false);
      
      // Refresh events
      fetchEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสร้างกิจกรรมได้",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateNewEvent = (field: string, value: any) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">ปฏิทินชุมชน</h1>
            <p className="text-muted-foreground">ติดตามการประชุมอธิษฐานและกิจกรรมสามัคคี</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-card/60 border-border/50">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="p-3 pointer-events-auto"
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="divine" size="default">
                  <Plus className="w-4 h-4" />
                  เพิ่มกิจกรรม
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>สร้างกิจกรรมใหม่</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">หัวข้อกิจกรรม *</Label>
                    <Input
                      id="title"
                      placeholder="ชื่อกิจกรรม"
                      value={newEvent.title}
                      onChange={(e) => updateNewEvent("title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">รายละเอียด</Label>
                    <Textarea
                      id="description"
                      placeholder="รายละเอียดกิจกรรม"
                      value={newEvent.description}
                      onChange={(e) => updateNewEvent("description", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">เวลาเริ่ม *</Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        value={newEvent.start_time}
                        onChange={(e) => updateNewEvent("start_time", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">เวลาสิ้นสุด</Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        value={newEvent.end_time}
                        onChange={(e) => updateNewEvent("end_time", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">สถานที่</Label>
                    <Input
                      id="location"
                      placeholder="สถานที่จัดกิจกรรม"
                      value={newEvent.location}
                      onChange={(e) => updateNewEvent("location", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_type">ประเภทกิจกรรม</Label>
                    <Select onValueChange={(value) => updateNewEvent("event_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="care_group_id">กลุ่มดูแล</Label>
                    <Select onValueChange={(value) => updateNewEvent("care_group_id", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกกลุ่มดูแล" />
                      </SelectTrigger>
                      <SelectContent>
                        {careGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_public"
                      checked={newEvent.is_public}
                      onCheckedChange={(checked) => updateNewEvent("is_public", checked)}
                    />
                    <Label htmlFor="is_public">กิจกรรมสาธารณะ</Label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      variant="divine"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          สร้าง...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          สร้างกิจกรรม
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-serif text-gray-900">
                    {format(viewDate, "MMMM yyyy")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewDate(subDays(viewDate, 30))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewDate(new Date())}
                    >
                      วันนี้
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewDate(addDays(viewDate, 30))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
                    <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-700">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {eachDayOfInterval({
                    start: startOfWeek(startOfMonth(viewDate)),
                    end: endOfWeek(endOfMonth(viewDate))
                  }).map(day => {
                    const dayEvents = getEventsForDate(day);
                    const isCurrentMonth = isSameMonth(day, viewDate);
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);
                    
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "h-20 p-1 border border-gray-200 rounded-lg transition-all duration-200 hover:bg-gray-50",
                          !isCurrentMonth && "text-gray-400",
                          isSelected && "bg-blue-100 border-blue-300",
                          isCurrentDay && "bg-gradient-divine text-white font-semibold"
                        )}
                      >
                        <div className="h-full flex flex-col">
                          <span className="text-sm text-gray-900">{format(day, 'd')}</span>
                          <div className="flex-1 flex flex-col gap-1 mt-1 bg-gray-100 rounded p-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={cn(
                                  "w-full h-1.5 rounded-full",
                                  eventTypeColors[event.event_type as keyof typeof eventTypeColors] || "bg-gray-500"
                                )}
                              />
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-xs text-gray-600">+{dayEvents.length - 2}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Events */}
          <div className="space-y-6">
            {/* Bible Verses for Selected Date */}
            <BibleVerseCard date={selectedDate} />
            
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, "EEEE, MMMM d")}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateEvents.map(event => (
                      <div key={event.id} className="p-4 border border-border/50 rounded-lg hover:bg-accent/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-3 h-3 rounded-full mt-1.5",
                            eventTypeColors[event.event_type as keyof typeof eventTypeColors] || "bg-gray-500"
                          )} />
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{event.title}</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{format(new Date(event.start_time), "HH:mm")}</span>
                                {event.end_time && (
                                  <>
                                    <span>-</span>
                                    <span>{format(new Date(event.end_time), "HH:mm")}</span>
                                  </>
                                )}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              {event.description && (
                                <p className="text-sm">{event.description}</p>
                              )}
                            </div>
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                {eventTypes.find(t => t.value === event.event_type)?.label || event.event_type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>ไม่มีกิจกรรมที่กำหนดไว้สำหรับวันนี้</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">เดือนนี้</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="text-sm">การประชุมอธิษฐาน</span>
                  </div>
                  <Badge variant="secondary">
                    {events.filter(e => e.event_type === 'prayer' && isSameMonth(new Date(e.start_time), viewDate)).length}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">กลุ่มดูแล</span>
                  </div>
                  <Badge variant="secondary">
                    {events.filter(e => e.event_type === 'caregroup' && isSameMonth(new Date(e.start_time), viewDate)).length}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">กิจกรรมสามัคคี</span>
                  </div>
                  <Badge variant="secondary">
                    {events.filter(e => e.event_type === 'fellowship' && isSameMonth(new Date(e.start_time), viewDate)).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;