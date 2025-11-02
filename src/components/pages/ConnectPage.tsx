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
import { 
  Users, 
  Search, 
  MessageCircle, 
  UserPlus, 
  GraduationCap,
  Star,
  Plus,
  Check,
  X,
  Clock,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileViewPage } from "./ProfileViewPage";
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
  const [authorities, setAuthorities] = useState<Profile[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Show profile view if selected (after all hooks)
  if (selectedProfile) {
    return (
      <ProfileViewPage 
        profileId={selectedProfile} 
        onBack={() => setSelectedProfile(null)}
      />
    );
  }

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
    try {
      // Use the secure discovery function to get only non-sensitive profile data
      const { data: discoveryProfiles, error } = await supabase
        .rpc('get_discovery_profiles', { search_term: '' });

      if (error) {
        console.error('Error fetching discovery profiles:', error);
        return;
      }

      if (discoveryProfiles) {
        // Fetch actual connections_count and daily_streak for each profile
        const userIds = discoveryProfiles.map(p => p.user_id);
        const { data: profileStats } = await supabase
          .from('profiles')
          .select('user_id, connections_count, daily_streak')
          .in('user_id', userIds);
        
        const statsMap = new Map(profileStats?.map(s => [s.user_id, s]) || []);
        
        // Convert the discovery profiles to the expected format
        const formattedProfiles = discoveryProfiles.map(p => {
          const stats = statsMap.get(p.user_id);
          return {
            id: p.user_id, // Use user_id as id for compatibility
            user_id: p.user_id,
            full_name: p.full_name || 'Unknown User',
            email: '', // Not available in discovery mode for security
            role: p.role || 'student',
            department: p.department || 'Unknown',
            year_of_study: p.year_of_study,
            bio: p.bio,
            profile_picture_url: p.profile_picture_url,
            institution_id: p.institution_id,
            connections_count: stats?.connections_count || 0,
            daily_streak: stats?.daily_streak || 0
          };
        });

        // If current user has institution_id, prioritize same institution users
        let filteredProfiles = formattedProfiles;
        if (currentProfile?.institution_id) {
          const sameInstitution = formattedProfiles.filter(p => p.institution_id === currentProfile.institution_id);
          const otherInstitutions = formattedProfiles.filter(p => p.institution_id !== currentProfile.institution_id);
          filteredProfiles = [...sameInstitution, ...otherInstitutions];
        }

        const students = filteredProfiles.filter(p => p.role === 'student');
        const mentorProfiles = filteredProfiles.filter(p => p.role === 'mentor' || p.role === 'teacher');
        const authorityProfiles = filteredProfiles.filter(p => p.role === 'authority');
        
        setProfiles(students);
        setMentors(mentorProfiles);
        setAuthorities(authorityProfiles);
      }
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
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

  const filteredAuthorities = authorities.filter(authority =>
    authority.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    authority.department.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
            <TabsTrigger value="authority">Authority</TabsTrigger>
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
                          <CardTitle 
                            className="text-base cursor-pointer hover:text-primary transition-colors"
                            onClick={() => setSelectedProfile(profile.user_id)}
                          >
                            {profile.full_name}
                          </CardTitle>
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
                        <Button size="sm" variant="outline" onClick={() => setSelectedProfile(profile.user_id)}>
                          View Profile
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
                        <CardTitle 
                          className="text-xl cursor-pointer hover:text-primary transition-colors"
                          onClick={() => setSelectedProfile(mentor.user_id)}
                        >
                          {mentor.full_name}
                        </CardTitle>
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

          <TabsContent value="authority">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAuthorities.map((authority) => (
                <Card key={authority.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={authority.profile_picture_url} />
                        <AvatarFallback>
                          {authority.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle 
                          className="text-xl cursor-pointer hover:text-primary transition-colors"
                          onClick={() => setSelectedProfile(authority.user_id)}
                        >
                          {authority.full_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{authority.role}</p>
                        <p className="text-sm font-medium text-primary">{authority.department}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {authority.bio && (
                      <p className="text-sm text-muted-foreground mb-4">{authority.bio}</p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">5.0</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {authority.connections_count} connections
                        </div>
                      </div>
                      <Badge variant="outline">{authority.role}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedProfile(authority.user_id)}
                      >
                        View Profile
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
        </Tabs>
      </div>
    </div>
  );
};