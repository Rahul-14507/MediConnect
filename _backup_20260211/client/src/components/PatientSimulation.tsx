import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Phone, MessageSquare, User, Pill, Clock, Bell } from "lucide-react";

interface PatientSimulationProps {
  doctorPhoneNumber?: string;
}

export default function PatientSimulation({ doctorPhoneNumber = "+1234567890" }: PatientSimulationProps) {
  const [patientName, setPatientName] = useState("Maria Santos");
  const [symptoms, setSymptoms] = useState("Fever, need help");
  const { toast } = useToast();

  // Use sample patient ID for demo
  const patientId = "sample-1";

  // Fetch medication schedule for the patient
  const { data: medicationData } = useQuery({
    queryKey: ['/api/patient', patientId, 'medication-schedule'],
    queryFn: () => fetch(`/api/patient/${patientId}/medication-schedule`).then(res => res.json()),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleCallDoctor = () => {
    // In a real Flutter app, this would open the phone dialer
    const telUrl = `tel:${doctorPhoneNumber}`;
    
    toast({
      title: "Opening Phone Dialer",
      description: `Calling doctor at ${doctorPhoneNumber}`,
    });
    
    // Simulate opening phone dialer
    console.log(`Opening phone dialer with: ${telUrl}`);
    // In a web environment, this would be: window.location.href = telUrl;
  };

  const handleSendSMS = () => {
    // In a real Flutter app, this would open the SMS app
    const smsUrl = `sms:${doctorPhoneNumber}?body=${encodeURIComponent(`Patient: ${patientName}\nSymptoms: ${symptoms}`)}`;
    
    toast({
      title: "Opening SMS App", 
      description: `Sending message to doctor at ${doctorPhoneNumber}`,
    });
    
    // Simulate opening SMS app
    console.log(`Opening SMS app with: ${smsUrl}`);
    // In a web environment, this would be: window.location.href = smsUrl;
  };

  const messages = [
    {
      id: "1",
      sender: "Patient",
      message: symptoms,
      timestamp: "2 min ago",
      isDoctor: false
    },
    {
      id: "2", 
      sender: "Dr. Johnson",
      message: "I understand your concern. Please take paracetamol and get plenty of rest. Monitor your temperature.",
      timestamp: "1 min ago", 
      isDoctor: true
    }
  ];

  const medicines = medicationData?.data?.medicines || [];
  const profile = medicationData?.data?.profile;

  const formatNextDoseTime = (frequency: string) => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-full">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold">MediConnect</h1>
          <p className="text-muted-foreground">Patient App Demo - {patientName}</p>
        </div>

        <Tabs defaultValue="contact" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact" data-testid="tab-contact">Contact Doctor</TabsTrigger>
            <TabsTrigger value="medicines" data-testid="tab-medicines">My Medicines</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Patient Name</Label>
                  <Input
                    id="patient-name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    data-testid="input-patient-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms..."
                    data-testid="input-symptoms"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full h-12 text-lg"
                onClick={handleCallDoctor}
                data-testid="button-call-doctor"
              >
                <Phone className="h-5 w-5 mr-3" />
                Call Doctor
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-12 text-lg"
                onClick={handleSendSMS}
                data-testid="button-send-sms"
              >
                <MessageSquare className="h-5 w-5 mr-3" />
                Send SMS
              </Button>
            </div>

            {/* Chat Simulation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chat with Doctor</CardTitle>
                <p className="text-sm text-muted-foreground">
                  This simulates SMS replies from the doctor
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto" data-testid="chat-simulation">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.isDoctor 
                          ? "bg-primary text-primary-foreground ml-4" 
                          : "bg-muted mr-4"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{message.sender}</span>
                        <span className="text-xs opacity-70">{message.timestamp}</span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demo Info */}
            <Card className="bg-muted">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Demo Information</h3>
                <p className="text-sm text-muted-foreground">
                  Doctor Number: <span className="font-mono">{doctorPhoneNumber}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  In a real app, these buttons would open your phone's dialer and SMS apps.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medicines" className="space-y-4">
            {profile?.isElderly && (
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-amber-600" />
                    Elderly Care Profile Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p>✓ Large font size for better readability</p>
                    <p>✓ Frequent reminder notifications</p>
                    <p>✓ Voice reminders enabled</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Pill className="h-5 w-5 mr-2" />
                  My Medicine Schedule
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {medicines.length > 0 
                    ? `You have ${medicines.length} prescribed medicine${medicines.length === 1 ? '' : 's'}`
                    : "No medicines prescribed yet"
                  }
                </p>
              </CardHeader>
              <CardContent>
                {medicines.length === 0 ? (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No medicines prescribed</p>
                    <p className="text-sm text-muted-foreground">
                      Contact your doctor if you need medication
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicines.map((medicine: any) => (
                      <Card key={medicine.id} className={profile?.isElderly ? "text-lg" : ""}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`flex items-center ${profile?.isElderly ? "text-xl" : "text-lg"}`}>
                              <Pill className="h-4 w-4 mr-2" />
                              {medicine.medicineName}
                            </CardTitle>
                            <Badge variant="secondary">{medicine.frequency}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">Dosage</Label>
                              <p className={profile?.isElderly ? "text-base font-medium" : "font-medium"}>
                                {medicine.dosage}
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Duration</Label>
                              <p className={profile?.isElderly ? "text-base font-medium" : "font-medium"}>
                                {medicine.duration}
                              </p>
                            </div>
                          </div>
                          
                          {medicine.instructions && (
                            <div>
                              <Label className="text-muted-foreground">Instructions</Label>
                              <p className={`text-sm ${profile?.isElderly ? "text-base" : ""}`}>
                                {medicine.instructions}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-blue-600" />
                              <span className={`text-blue-600 ${profile?.isElderly ? "text-base font-semibold" : "text-sm font-medium"}`}>
                                Next dose: {formatNextDoseTime(medicine.frequency)}
                              </span>
                            </div>
                            <Button 
                              size={profile?.isElderly ? "default" : "sm"} 
                              variant="outline"
                              data-testid={`button-reminder-${medicine.id}`}
                            >
                              <Bell className="h-4 w-4 mr-1" />
                              Remind Me
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medicine reminder tips */}
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardContent className="p-4">
                <h3 className={`font-medium mb-2 flex items-center ${profile?.isElderly ? "text-lg" : ""}`}>
                  <Bell className="h-4 w-4 mr-2" />
                  Reminder Tips
                </h3>
                <div className={`space-y-2 text-sm ${profile?.isElderly ? "text-base" : ""}`}>
                  <p>• Take medicines with food if instructed</p>
                  <p>• Set phone alarms for reminder times</p>
                  <p>• Keep a water bottle nearby</p>
                  {profile?.isElderly && <p>• Ask family member to help if needed</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}