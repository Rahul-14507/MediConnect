import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Phone, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface PatientRequest {
  id: string;
  patientName: string;
  symptom: string;
  timestamp: number;
  doctorReply?: string;
  status: "pending" | "replied" | "urgent";
  avatarUrl?: string;
}

interface PatientRequestCardProps {
  request: PatientRequest;
  onReply: (requestId: string) => void;
  onCall: (requestId: string) => void;
}

export default function PatientRequestCard({ request, onReply, onCall }: PatientRequestCardProps) {
  const getStatusColor = (status: PatientRequest["status"]) => {
    switch (status) {
      case "urgent":
        return "bg-destructive text-destructive-foreground";
      case "replied":
        return "bg-chart-2 text-white";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={request.avatarUrl} />
            <AvatarFallback>{getInitials(request.patientName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg" data-testid={`text-patient-${request.id}`}>
              {request.patientName}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })}
            </div>
          </div>
        </div>
        <Badge className={getStatusColor(request.status)} data-testid={`status-${request.id}`}>
          {request.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Symptoms</h4>
          <p className="text-sm" data-testid={`text-symptom-${request.id}`}>
            {request.symptom}
          </p>
        </div>
        
        {request.doctorReply && (
          <div className="p-3 bg-muted rounded-md">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Your Reply</h4>
            <p className="text-sm" data-testid={`text-reply-${request.id}`}>
              {request.doctorReply}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCall(request.id)}
            className="flex-1"
            data-testid={`button-call-${request.id}`}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Patient
          </Button>
          <Button
            size="sm"
            onClick={() => onReply(request.id)}
            className="flex-1"
            data-testid={`button-reply-${request.id}`}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {request.doctorReply ? "Update Reply" : "Send Reply"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}