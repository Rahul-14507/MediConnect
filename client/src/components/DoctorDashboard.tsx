import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PatientRequestCard, { type PatientRequest } from "./PatientRequestCard";
import ChatInterface, { type ChatMessage } from "./ChatInterface";
import { 
  Activity, 
  Users, 
  Phone, 
  MessageSquare, 
  Plus,
  AlertCircle,
  Clock,
  CheckCircle
} from "lucide-react";

interface DoctorDashboardProps {
  doctorName: string;
  onLogout: () => void;
}

export default function DoctorDashboard({ doctorName, onLogout }: DoctorDashboardProps) {
  const { toast } = useToast();
  
  // Fetch patient requests from API
  const { data: apiData, refetch } = useQuery({
    queryKey: ['/api/messages'],
    refetchInterval: 3000, // Refresh every 3 seconds for demo purposes
  });

  const requests: PatientRequest[] = (apiData as any)?.data?.patients || [];

  const messages: ChatMessage[] = (apiData as any)?.data?.messages || [];

  const [selectedPatient, setSelectedPatient] = useState<PatientRequest | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  // Mutation for simulating calls
  const simulateCallMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/simulate-call', data),
    onSuccess: () => {
      toast({
        title: "New Patient Request",
        description: "Emergency consultation request received",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to simulate patient call",
        variant: "destructive"
      });
    }
  });

  const handleSimulateCall = () => {
    simulateCallMutation.mutate({
      patientName: "Emergency Patient", 
      symptom: "Urgent medical consultation needed - severe abdominal pain.",
      status: "urgent"
    });
  };

  const handleReply = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedPatient(request);
      setReplyText(request.doctorReply || "");
      setIsReplyDialogOpen(true);
    }
  };

  // Mutation for sending replies
  const replyMutation = useMutation({
    mutationFn: (data: { patientId: string, doctorReply: string }) => 
      apiRequest('POST', '/api/reply', data),
    onSuccess: () => {
      if (selectedPatient) {
        toast({
          title: "Reply sent",
          description: `Your message has been sent to ${selectedPatient.patientName}`,
        });
      }
      setIsReplyDialogOpen(false);
      setReplyText("");
      setSelectedPatient(null);
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
    }
  });

  const handleSendReply = () => {
    if (selectedPatient && replyText.trim()) {
      replyMutation.mutate({
        patientId: selectedPatient.id,
        doctorReply: replyText
      });
    }
  };

  const handleCall = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    toast({
      title: "Call initiated",
      description: `Calling ${request?.patientName}...`,
    });
  };

  const handleSendChatMessage = (message: string) => {
    // For chat, we'll use the reply API with a general patient ID
    replyMutation.mutate({
      patientId: "general-chat",
      doctorReply: message
    });
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    urgent: requests.filter(r => r.status === "urgent").length,
    replied: requests.filter(r => r.status === "replied").length
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">MediConnect Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome, Dr. {doctorName}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} data-testid="button-logout">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold" data-testid="stat-total">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600" data-testid="stat-pending">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgent</p>
                  <p className="text-2xl font-bold text-destructive" data-testid="stat-urgent">{stats.urgent}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Replied</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="stat-replied">{stats.replied}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="requests" data-testid="tab-requests">Patient Requests</TabsTrigger>
              <TabsTrigger value="chat" data-testid="tab-chat">Live Chat</TabsTrigger>
            </TabsList>
            
            <Button onClick={handleSimulateCall} data-testid="button-simulate-call">
              <Plus className="h-4 w-4 mr-2" />
              Simulate Inbound Call
            </Button>
          </div>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {requests.map((request) => (
                <PatientRequestCard
                  key={request.id}
                  request={request}
                  onReply={handleReply}
                  onCall={handleCall}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <div className="max-w-4xl">
              <ChatInterface
                patientName="Maria Santos"
                messages={messages}
                onSendMessage={handleSendChatMessage}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedPatient?.patientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Patient Symptoms</Label>
              <p className="text-sm mt-1">{selectedPatient?.symptom}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your medical advice here..."
                className="min-h-[100px]"
                data-testid="input-reply-message"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReply} data-testid="button-send-reply">
                Send Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}