import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Users, Phone } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary rounded-full">
              <Stethoscope className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">MediConnect</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Telemedicine Platform for Semi-Urban Communities
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Connecting patients in remote areas with healthcare professionals through 
              secure consultations, emergency support, and medical guidance.
            </p>
          </div>
        </div>

        {/* Demo Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card className="hover-elevate">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-primary rounded-full">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl">Doctor Dashboard</CardTitle>
                <CardDescription>
                  Manage patient requests, send replies, and conduct consultations
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/doctor">
                <Button className="w-full" size="lg" data-testid="button-doctor-demo">
                  Access Doctor Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-chart-2 rounded-full">
                  <Phone className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl">Patient App Demo</CardTitle>
                <CardDescription>
                  Simulate patient experience with call and SMS features
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/patient">
                <Button variant="outline" className="w-full" size="lg" data-testid="button-patient-demo">
                  Try Patient App
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Quick Consultations</h3>
            <p className="text-muted-foreground text-sm">
              Patients can quickly connect with doctors via phone calls or SMS for immediate medical guidance.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Real-time Messaging</h3>
            <p className="text-muted-foreground text-sm">
              Secure chat system allows doctors to provide detailed medical advice and follow-up care.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Emergency Support</h3>
            <p className="text-muted-foreground text-sm">
              Urgent requests are prioritized to ensure critical medical situations receive immediate attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}