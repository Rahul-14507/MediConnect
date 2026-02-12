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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle,
  Pill,
  Bell,
  User
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

  // Medicine management state
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedPatientForMedicine, setSelectedPatientForMedicine] = useState<PatientRequest | null>(null);
  const [medicineForm, setMedicineForm] = useState({
    medicineName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  });
  const [profileForm, setProfileForm] = useState({
    age: "",
    isElderly: false,
    fontSize: "normal" as "normal" | "large" | "extra-large",
    reminderFrequency: "standard" as "standard" | "frequent" | "gentle",
    enableVoiceReminders: false,
    enableTextReminders: true,
    specialInstructions: ""
  });

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

  // Mutation for prescribing medicine
  const prescribeMedicineMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/prescribe-medicine', data),
    onSuccess: () => {
      toast({
        title: "Medicine Prescribed",
        description: `Medicine prescribed successfully for ${selectedPatientForMedicine?.patientName}`,
      });
      setIsMedicineDialogOpen(false);
      setMedicineForm({
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: ""
      });
      setSelectedPatientForMedicine(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to prescribe medicine",
        variant: "destructive"
      });
    }
  });

  // Mutation for creating patient profile
  const createPatientProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/patient-profile', data),
    onSuccess: () => {
      toast({
        title: "Patient Profile Updated",
        description: `Profile preferences set for ${selectedPatientForMedicine?.patientName}`,
      });
      setIsProfileDialogOpen(false);
      setProfileForm({
        age: "",
        isElderly: false,
        fontSize: "normal",
        reminderFrequency: "standard",
        enableVoiceReminders: false,
        enableTextReminders: true,
        specialInstructions: ""
      });
      setSelectedPatientForMedicine(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update patient profile",
        variant: "destructive"
      });
    }
  });

  const handlePrescribeMedicine = () => {
    if (selectedPatientForMedicine && medicineForm.medicineName.trim()) {
      prescribeMedicineMutation.mutate({
        patientId: selectedPatientForMedicine.id,
        medicineName: medicineForm.medicineName,
        dosage: medicineForm.dosage,
        frequency: medicineForm.frequency,
        duration: medicineForm.duration,
        instructions: medicineForm.instructions
      });
    }
  };

  const handleCreateProfile = () => {
    if (selectedPatientForMedicine && profileForm.age) {
      createPatientProfileMutation.mutate({
        patientId: selectedPatientForMedicine.id,
        age: parseInt(profileForm.age),
        isElderly: profileForm.isElderly,
        reminderPreferences: {
          fontSize: profileForm.fontSize,
          reminderFrequency: profileForm.reminderFrequency,
          enableVoiceReminders: profileForm.enableVoiceReminders,
          enableTextReminders: profileForm.enableTextReminders,
          specialInstructions: profileForm.specialInstructions,
          preferredReminderTime: ["08:00", "12:00", "18:00"] // Default times
        }
      });
    }
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
              <TabsTrigger value="medicine" data-testid="tab-medicine">Medicine Management</TabsTrigger>
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

          <TabsContent value="medicine" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {request.patientName}
                      <Badge variant={request.status === "urgent" ? "destructive" : "secondary"}>
                        {request.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Symptoms:</strong> {request.symptom}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPatientForMedicine(request);
                          setIsMedicineDialogOpen(true);
                        }}
                        data-testid={`button-prescribe-${request.id}`}
                      >
                        <Pill className="h-4 w-4 mr-2" />
                        Prescribe Medicine
                      </Button>
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedPatientForMedicine(request);
                          setIsProfileDialogOpen(true);
                        }}
                        data-testid={`button-profile-${request.id}`}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Set Patient Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

      {/* Medicine Prescription Dialog */}
      <Dialog open={isMedicineDialogOpen} onOpenChange={setIsMedicineDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Prescribe Medicine for {selectedPatientForMedicine?.patientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Patient Symptoms</Label>
              <p className="text-sm mt-1">{selectedPatientForMedicine?.symptom}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicine-name">Medicine Name *</Label>
              <Input
                id="medicine-name"
                value={medicineForm.medicineName}
                onChange={(e) => setMedicineForm({...medicineForm, medicineName: e.target.value})}
                placeholder="e.g., Paracetamol"
                data-testid="input-medicine-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={medicineForm.dosage}
                  onChange={(e) => setMedicineForm({...medicineForm, dosage: e.target.value})}
                  placeholder="e.g., 500mg"
                  data-testid="input-dosage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={medicineForm.frequency} onValueChange={(value) => setMedicineForm({...medicineForm, frequency: value})}>
                  <SelectTrigger data-testid="select-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once daily">Once daily</SelectItem>
                    <SelectItem value="twice daily">Twice daily</SelectItem>
                    <SelectItem value="three times daily">Three times daily</SelectItem>
                    <SelectItem value="every 4 hours">Every 4 hours</SelectItem>
                    <SelectItem value="every 6 hours">Every 6 hours</SelectItem>
                    <SelectItem value="every 8 hours">Every 8 hours</SelectItem>
                    <SelectItem value="as needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={medicineForm.duration} onValueChange={(value) => setMedicineForm({...medicineForm, duration: value})}>
                <SelectTrigger data-testid="select-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3 days">3 days</SelectItem>
                  <SelectItem value="5 days">5 days</SelectItem>
                  <SelectItem value="7 days">7 days</SelectItem>
                  <SelectItem value="10 days">10 days</SelectItem>
                  <SelectItem value="14 days">14 days</SelectItem>
                  <SelectItem value="21 days">21 days</SelectItem>
                  <SelectItem value="30 days">30 days</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Additional Instructions</Label>
              <Textarea
                id="instructions"
                value={medicineForm.instructions}
                onChange={(e) => setMedicineForm({...medicineForm, instructions: e.target.value})}
                placeholder="e.g., Take with food, avoid alcohol..."
                className="min-h-[60px]"
                data-testid="input-instructions"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMedicineDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePrescribeMedicine} data-testid="button-prescribe-confirm">
                <Pill className="h-4 w-4 mr-2" />
                Prescribe Medicine
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Patient Profile for {selectedPatientForMedicine?.patientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={profileForm.age}
                  onChange={(e) => {
                    const age = e.target.value;
                    setProfileForm({
                      ...profileForm, 
                      age,
                      isElderly: parseInt(age) >= 65
                    });
                  }}
                  placeholder="65"
                  data-testid="input-age"
                />
              </div>
              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="elderly"
                    checked={profileForm.isElderly}
                    onCheckedChange={(checked) => setProfileForm({...profileForm, isElderly: !!checked})}
                    data-testid="checkbox-elderly"
                  />
                  <Label htmlFor="elderly" className="text-sm">Elderly Care</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reminder Preferences</Label>
              <div className="space-y-3 p-3 bg-muted/30 rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select value={profileForm.fontSize} onValueChange={(value: any) => setProfileForm({...profileForm, fontSize: value})}>
                    <SelectTrigger data-testid="select-font-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="large">Large (Elderly-friendly)</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
                  <Select value={profileForm.reminderFrequency} onValueChange={(value: any) => setProfileForm({...profileForm, reminderFrequency: value})}>
                    <SelectTrigger data-testid="select-reminder-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="frequent">Frequent (Elderly-friendly)</SelectItem>
                      <SelectItem value="gentle">Gentle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="text-reminders"
                      checked={profileForm.enableTextReminders}
                      onCheckedChange={(checked) => setProfileForm({...profileForm, enableTextReminders: !!checked})}
                      data-testid="checkbox-text-reminders"
                    />
                    <Label htmlFor="text-reminders" className="text-sm">Text Reminders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="voice-reminders"
                      checked={profileForm.enableVoiceReminders}
                      onCheckedChange={(checked) => setProfileForm({...profileForm, enableVoiceReminders: !!checked})}
                      data-testid="checkbox-voice-reminders"
                    />
                    <Label htmlFor="voice-reminders" className="text-sm">Voice Reminders</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special-instructions">Special Instructions</Label>
              <Textarea
                id="special-instructions"
                value={profileForm.specialInstructions}
                onChange={(e) => setProfileForm({...profileForm, specialInstructions: e.target.value})}
                placeholder="Any special needs or instructions for this patient..."
                className="min-h-[60px]"
                data-testid="input-special-instructions"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProfile} data-testid="button-profile-confirm">
                <User className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}