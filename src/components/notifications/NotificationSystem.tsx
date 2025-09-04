import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  X, 
  UserPlus, 
  Check, 
  MessageCircle,
  Users,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  message?: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

interface NotificationSystemProps {
  currentUser: any;
}

export const NotificationSystem = ({ currentUser }: NotificationSystemProps) => {
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchConnectionRequests();
      
      // Set up real-time subscription for connection requests
      const channel = supabase
        .channel('connection_requests')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'connection_requests',
            filter: `receiver_id=eq.${currentUser.id}`
          },
          () => {
            fetchConnectionRequests();
            toast({
              title: "New connection request",
              description: "You have a new connection request!",
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'connection_requests'
          },
          () => {
            fetchConnectionRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  const fetchConnectionRequests = async () => {
    if (!currentUser) return;

    const { data: requestsData } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('receiver_id', currentUser.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestsData) {
      // Fetch sender details
      const senderIds = requestsData.map(req => req.sender_id);
      const { data: senders } = await supabase
        .from('profiles')
        .select('user_id, full_name, profile_picture_url')
        .in('user_id', senderIds);

      const sendersMap = new Map(senders?.map(s => [s.user_id, s]) || []);
      
      const requestsWithSenders = requestsData.map(req => ({
        ...req,
        sender_name: sendersMap.get(req.sender_id)?.full_name || 'Unknown',
        sender_avatar: sendersMap.get(req.sender_id)?.profile_picture_url
      }));

      setConnectionRequests(requestsWithSenders);
    }
  };

  const respondToConnectionRequest = async (requestId: string, accept: boolean) => {
    setLoading(true);
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to request",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const unreadCount = connectionRequests.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {connectionRequests.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-1 p-2">
                  {connectionRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.sender_avatar} />
                          <AvatarFallback>
                            {request.sender_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <UserPlus className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              Connection Request
                            </span>
                          </div>
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{request.sender_name}</span> wants to connect
                          </p>
                          {request.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              "{request.message}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => respondToConnectionRequest(request.id, true)}
                              disabled={loading}
                              className="flex-1"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => respondToConnectionRequest(request.id, false)}
                              disabled={loading}
                              className="flex-1"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};