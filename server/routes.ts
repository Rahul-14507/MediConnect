import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientRequestSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simulate inbound patient call
  app.post("/api/simulate-call", async (req, res) => {
    try {
      const patientData = insertPatientRequestSchema.parse({
        patientName: req.body.patientName || "Emergency Patient",
        symptom: req.body.symptom || "Urgent medical consultation needed - severe abdominal pain.",
        status: req.body.status || "urgent"
      });

      const request = await storage.createPatientRequest(patientData);
      
      res.json({
        success: true,
        message: "Patient request simulated successfully",
        data: request
      });
    } catch (error) {
      console.error("Error simulating call:", error);
      res.status(400).json({
        success: false,
        message: "Failed to simulate patient call",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Doctor sends reply to patient
  app.post("/api/reply", async (req, res) => {
    try {
      const { patientId, doctorReply } = req.body;
      
      if (!patientId || !doctorReply) {
        return res.status(400).json({
          success: false,
          message: "Patient ID and doctor reply are required"
        });
      }

      await storage.updatePatientReply(patientId, doctorReply);

      // Also add to messages collection for chat
      const messageData = insertMessageSchema.parse({
        sender: "doctor",
        message: doctorReply,
        senderName: "Dr. Johnson",
        patientId
      });
      
      await storage.createMessage(messageData);
      
      res.json({
        success: true,
        message: "Reply sent successfully"
      });
    } catch (error) {
      console.error("Error sending reply:", error);
      res.status(400).json({
        success: false,
        message: "Failed to send reply",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all patient-doctor conversations
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      const patients = await storage.getAllPatientRequests();
      
      res.json({
        success: true,
        data: {
          messages,
          patients
        }
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch messages",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
