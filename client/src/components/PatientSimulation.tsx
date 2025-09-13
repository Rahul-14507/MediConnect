import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, MessageSquare, User } from "lucide-react";

interface PatientSimulationProps {
  doctorPhoneNumber?: string;
}

export default function PatientSimulation({ doctorPhoneNumber = "+1234567890" }: PatientSimulationProps) {
  const [patientName, setPatientName] = useState("Maria Santos");
  const [symptoms, setSymptoms] = useState("Fever, need help");
  const { toast } = useToast();

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
          <p className="text-muted-foreground">Patient App Demo</p>
        </div>

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
            📞 Call Doctor
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-12 text-lg"
            onClick={handleSendSMS}
            data-testid="button-send-sms"
          >
            <MessageSquare className="h-5 w-5 mr-3" />
            💬 Send SMS
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
      </div>
    </div>
  );
}