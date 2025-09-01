import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Search, 
  MessageCircle, 
  UserPlus, 
  GraduationCap,
  Star,
  MapPin,
  Plus,
  Check,
  X,
  Clock,
  Video,
  MapIcon,
  Calendar,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  year_of_study?: number;
  bio?: string;
  profile_picture_url?: string;
  institution_id?: string;
  connections_count: number;
  daily_streak: number;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  difficulty: string;
  type: string;
  location?: string;
  max_members: number;
  current_members: number;
  tags: string[];
  created_by: string;
  created_at: string;
  meeting_schedule?: string;
  creator_name?: string;
}

interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  message?: string;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export const ConnectPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  
  // Create group form state
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    subject: "",
    difficulty: "intermediate",
    type: "virtual",
    location: "",
    max_members: 20,
    tags: "",
    meeting_schedule: ""
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      
      // Fetch current user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setCurrentProfile(profile);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProfiles(),
        fetchStudyGroups(),
        fetchConnectionRequests()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const fetchProfiles = async () => {
    if (!currentProfile?.institution_id) return;

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .eq('institution_id', currentProfile.institution_id)
      .neq('user_id', currentUser.id);

    if (profilesData) {
      const students = profilesData.filter(p => p.role === 'student');
      const mentorProfiles = profilesData.filter(p => p.role === 'mentor' || p.role === 'teacher');
      
      setProfiles(students);
      setMentors(mentorProfiles);
    }
  };

  const fetchStudyGroups = async () => {
    const { data: groupsData } = await supabase
      .from('study_groups')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (groupsData) {
      // Fetch creator names separately
      const creatorIds = [...new Set(groupsData.map(group => group.created_by))];
      const { data: creators } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', creatorIds);

      const creatorsMap = new Map(creators?.map(c => [c.user_id, c.full_name]) || []);
      
      const groupsWithCreator = groupsData.map(group => ({
        ...group,
        creator_name: creatorsMap.get(group.created_by) || 'Unknown'
      }));
      setStudyGroups(groupsWithCreator);
    }
  };

  const fetchConnectionRequests = async () => {
    if (!currentUser) return;

    const { data: requestsData } = await supabase
      .from('connection_requests')
      .select('*')
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (requestsData) {
      // Fetch user names separately
      const userIds = [...new Set([
        ...requestsData.map(req => req.sender_id),
        ...requestsData.map(req => req.receiver_id)
      ])];
      
      const { data: users } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const usersMap = new Map(users?.map(u => [u.user_id, u.full_name]) || []);
      
      const requestsWithNames = requestsData.map(req => ({
        ...req,
        sender_name: usersMap.get(req.sender_id) || 'Unknown',
        receiver_name: usersMap.get(req.receiver_id) || 'Unknown'
      }));
      setConnectionRequests(requestsWithNames);
    }
  };

  const sendConnectionRequest = async (receiverId: string, message?: string) => {
    try {
      const { error } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: currentUser.id,
          receiver_id: receiverId,
          message
        });

      if (error) throw error;

      toast({
        title: "Connection request sent",
        description: "Your request has been sent successfully!",
      });

      fetchConnectionRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const respondToConnectionRequest = async (requestId: string, accept: boolean) => {
    try {
      if (accept) {
        // Call the database function to accept the connection
        const { error } = await supabase.rpc('accept_connection_request', {
          request_id: requestId
        });
        
        if (error) throw error;
        
        toast({
          title: "Connection accepted",
          description: "You are now connected!",
        });
      } else {
        // Reject the request
        const { error } = await supabase
          .from('connection_requests')
          .update({ status: 'rejected' })
          .eq('id', requestId);
        
        if (error) throw error;
        
        toast({
          title: "Connection declined",
          description: "Request has been declined.",
        });
      }

      fetchConnectionRequests();
      fetchProfiles(); // Refresh to update connection counts
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to request",
        variant: "destructive",
      });
    }
  };

  const createStudyGroup = async () => {
    try {
      const { error } = await supabase
        .from('study_groups')
        .insert({
          name: groupForm.name,
          description: groupForm.description,
          subject: groupForm.subject,
          difficulty: groupForm.difficulty,
          type: groupForm.type,
          location: groupForm.location || null,
          max_members: groupForm.max_members,
          tags: groupForm.tags.split(',').map(tag => tag.trim()),
          meeting_schedule: groupForm.meeting_schedule || null,
          created_by: currentUser.id,
          institution_id: currentProfile?.institution_id
        });

      if (error) throw error;

      // Auto-join the creator
      const { data: newGroup } = await supabase
        .from('study_groups')
        .select('id')
        .eq('created_by', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (newGroup) {
        await supabase
          .from('group_memberships')
          .insert({
            group_id: newGroup.id,
            user_id: currentUser.id,
            role: 'admin'
          });
      }

      toast({
        title: "Study group created",
        description: "Your study group has been created successfully!",
      });

      setIsCreateGroupOpen(false);
      setGroupForm({
        name: "",
        description: "",
        subject: "",
        difficulty: "intermediate",
        type: "virtual",
        location: "",
        max_members: 20,
        tags: "",
        meeting_schedule: ""
      });
      fetchStudyGroups();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create study group",
        variant: "destructive",
      });
    }
  };

  const joinStudyGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_memberships')
        .insert({
          group_id: groupId,
          user_id: currentUser.id,
          role: 'member'
        });

      if (error) throw error;

      // Update group member count manually
      const { data: currentGroup } = await supabase
        .from('study_groups')
        .select('current_members')
        .eq('id', groupId)
        .single();

      if (currentGroup) {
        const { error: updateError } = await supabase
          .from('study_groups')
          .update({ current_members: currentGroup.current_members + 1 })
          .eq('id', groupId);

        if (updateError) throw updateError;
      }

      toast({
        title: "Joined study group",
        description: "You have successfully joined the group!",
      });

      fetchStudyGroups();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join study group",
        variant: "destructive",
      });
    }
  };

  const sendMentorRequest = async (mentorId: string) => {
    try {
      const { error } = await supabase
        .from('mentoring_relationships')
        .insert({
          mentor_id: mentorId,
          mentee_id: currentUser.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Mentor request sent",
        description: "Your mentorship request has been sent!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send mentor request",
        variant: "destructive",
      });
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMentors = mentors.filter(mentor =>
    mentor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual': return <Video className="h-4 w-4" />;
      case 'in-person': return <MapIcon className="h-4 w-4" />;
      case 'hybrid': return <Calendar className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const getConnectionStatus = (profileId: string) => {
    const existingRequest = connectionRequests.find(req => 
      (req.sender_id === currentUser?.id && req.receiver_id === profileId) ||
      (req.receiver_id === currentUser?.id && req.sender_id === profileId)
    );
    
    if (existingRequest) {
      if (existingRequest.status === 'accepted') return 'connected';
      if (existingRequest.status === 'pending') {
        return existingRequest.sender_id === currentUser?.id ? 'sent' : 'received';
      }
    }
    return 'none';
  };

  const pendingRequests = connectionRequests.filter(req => 
    req.receiver_id === currentUser?.id && req.status === 'pending'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Connect with Your Community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find peers, mentors, and collaborators to enhance your college experience
          </p>
        </div>

        {/* Connection Requests Alert */}
        {pendingRequests.length > 0 && (
          <div className="mb-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Connection Requests ({pendingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
                      <div>
                        <p className="font-medium">{request.sender_name}</p>
                        {request.message && (
                          <p className="text-sm text-muted-foreground">"{request.message}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => respondToConnectionRequest(request.id, true)}
                          className="h-8"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => respondToConnectionRequest(request.id, false)}
                          className="h-8"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => {
                const connectionStatus = getConnectionStatus(profile.user_id);
                
                return (
                  <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile.profile_picture_url} />
                          <AvatarFallback>
                            {profile.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{profile.full_name}</CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            {profile.year_of_study && `Year ${profile.year_of_study} • `}
                            {profile.department}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {profile.connections_count} connections
                        </div>
                        <Badge variant="secondary">
                          {profile.daily_streak} day streak
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        {connectionStatus === 'connected' ? (
                          <Button size="sm" className="flex-1" disabled>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Connected
                          </Button>
                        ) : connectionStatus === 'sent' ? (
                          <Button size="sm" className="flex-1" disabled variant="outline">
                            <Clock className="h-4 w-4 mr-2" />
                            Request Sent
                          </Button>
                        ) : connectionStatus === 'received' ? (
                          <Button size="sm" className="flex-1" disabled variant="outline">
                            <Clock className="h-4 w-4 mr-2" />
                            Pending Response
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="flex-1">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Connect
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Connection Request</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>Send a connection request to {profile.full_name}?</p>
                                <div>
                                  <Label htmlFor="message">Message (optional)</Label>
                                  <Textarea
                                    id="message"
                                    placeholder="Hi! I'd like to connect..."
                                    className="mt-1"
                                  />
                                </div>
                                <Button 
                                  onClick={() => {
                                    const message = (document.getElementById('message') as HTMLTextAreaElement)?.value;
                                    sendConnectionRequest(profile.user_id, message);
                                  }}
                                  className="w-full"
                                >
                                  Send Request
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="mentors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={mentor.profile_picture_url} />
                        <AvatarFallback>
                          {mentor.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{mentor.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{mentor.role}</p>
                        <p className="text-sm font-medium text-primary">{mentor.department}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {mentor.bio && (
                      <p className="text-sm text-muted-foreground mb-4">{mentor.bio}</p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {mentor.connections_count} connections
                        </div>
                      </div>
                      <Badge variant="outline">{mentor.role}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => sendMentorRequest(mentor.user_id)}
                      >
                        Request Mentorship
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="mb-6 text-right">
              <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Study Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="groupName">Group Name</Label>
                      <Input
                        id="groupName"
                        value={groupForm.name}
                        onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                        placeholder="e.g., Data Structures Study Group"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={groupForm.subject}
                        onChange={(e) => setGroupForm({...groupForm, subject: e.target.value})}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={groupForm.difficulty} onValueChange={(value) => setGroupForm({...groupForm, difficulty: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={groupForm.type} onValueChange={(value) => setGroupForm({...groupForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="in-person">In-person</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(groupForm.type === 'in-person' || groupForm.type === 'hybrid') && (
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={groupForm.location}
                          onChange={(e) => setGroupForm({...groupForm, location: e.target.value})}
                          placeholder="e.g., Library Room 201"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={groupForm.description}
                        onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                        placeholder="Describe what this group is about..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={groupForm.tags}
                        onChange={(e) => setGroupForm({...groupForm, tags: e.target.value})}
                        placeholder="e.g., algorithms, coding, exam prep"
                      />
                    </div>
                    <Button onClick={createStudyGroup} className="w-full">
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{group.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(group.difficulty)}>
                          {group.difficulty}
                        </Badge>
                        <div className="flex items-center text-muted-foreground">
                          {getTypeIcon(group.type)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {group.description}
                    </p>
                    
                    {group.location && (
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {group.location}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Users className="h-4 w-4 mr-1" />
                      {group.current_members}/{group.max_members} members
                    </div>

                    {group.tags && group.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {group.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mb-3">
                      Created by {group.creator_name}
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => joinStudyGroup(group.id)}
                      disabled={group.current_members >= group.max_members}
                    >
                      {group.current_members >= group.max_members ? 'Group Full' : 'Join Group'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};