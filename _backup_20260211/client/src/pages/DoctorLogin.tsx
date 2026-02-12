import { useState } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/LoginForm";
import DoctorDashboard from "@/components/DoctorDashboard";

export default function DoctorLogin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [, setLocation] = useLocation();

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setDoctorName(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setDoctorName("");
    setLocation("/");
  };

  if (isLoggedIn) {
    return <DoctorDashboard doctorName={doctorName} onLogout={handleLogout} />;
  }

  return <LoginForm onLogin={handleLogin} />;
}