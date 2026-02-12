import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientRequestSchema, insertMessageSchema, insertMedicineSchema, insertPatientProfileSchema, insertMedicineReminderSchema } from "@shared/schema";

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

  // === MEDICINE MANAGEMENT ENDPOINTS ===

  // Prescribe medicine to a patient
  app.post("/api/prescribe-medicine", async (req, res) => {
    try {
      const medicineData = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(medicineData);
      
      res.json({
        success: true,
        message: "Medicine prescribed successfully",
        data: medicine
      });
    } catch (error) {
      console.error("Error prescribing medicine:", error);
      res.status(400).json({
        success: false,
        message: "Failed to prescribe medicine",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get medicines for a specific patient
  app.get("/api/patient/:patientId/medicines", async (req, res) => {
    try {
      const { patientId } = req.params;
      const medicines = await storage.getMedicinesByPatientId(patientId);
      
      res.json({
        success: true,
        data: medicines
      });
    } catch (error) {
      console.error("Error fetching patient medicines:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch patient medicines",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update medicine status (active/inactive)
  app.patch("/api/medicine/:medicineId/status", async (req, res) => {
    try {
      const { medicineId } = req.params;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: "isActive field is required and must be boolean"
        });
      }

      // Check if medicine exists
      const allMedicines = await storage.getAllMedicines();
      const medicine = allMedicines.find(m => m.id === medicineId);
      
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Medicine not found"
        });
      }

      await storage.updateMedicineStatus(medicineId, isActive);
      
      res.json({
        success: true,
        message: "Medicine status updated successfully"
      });
    } catch (error) {
      console.error("Error updating medicine status:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update medicine status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // === PATIENT PROFILE ENDPOINTS ===

  // Create or update patient profile with reminder preferences
  app.post("/api/patient-profile", async (req, res) => {
    try {
      const profileData = insertPatientProfileSchema.parse(req.body);
      
      // Check if profile already exists
      const existingProfile = await storage.getPatientProfile(profileData.patientId);
      
      let profile;
      if (existingProfile) {
        await storage.updatePatientProfile(profileData.patientId, profileData);
        profile = await storage.getPatientProfile(profileData.patientId);
      } else {
        profile = await storage.createPatientProfile(profileData);
      }
      
      res.json({
        success: true,
        message: existingProfile ? "Patient profile updated successfully" : "Patient profile created successfully",
        data: profile
      });
    } catch (error) {
      console.error("Error managing patient profile:", error);
      res.status(400).json({
        success: false,
        message: "Failed to manage patient profile",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get patient profile
  app.get("/api/patient/:patientId/profile", async (req, res) => {
    try {
      const { patientId } = req.params;
      const profile = await storage.getPatientProfile(patientId);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found"
        });
      }
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error("Error fetching patient profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch patient profile",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // === MEDICINE REMINDER ENDPOINTS ===

  // Create medicine reminder
  app.post("/api/medicine-reminder", async (req, res) => {
    try {
      const reminderData = insertMedicineReminderSchema.parse(req.body);
      
      // Verify that the medicine exists and belongs to the patient
      const medicines = await storage.getMedicinesByPatientId(reminderData.patientId);
      const medicineExists = medicines.some(m => m.id === reminderData.medicineId);
      
      if (!medicineExists) {
        return res.status(400).json({
          success: false,
          message: "Medicine not found for this patient"
        });
      }
      
      const reminder = await storage.createMedicineReminder(reminderData);
      
      res.json({
        success: true,
        message: "Medicine reminder created successfully",
        data: reminder
      });
    } catch (error) {
      console.error("Error creating medicine reminder:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create medicine reminder",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get reminders for a patient
  app.get("/api/patient/:patientId/reminders", async (req, res) => {
    try {
      const { patientId } = req.params;
      const reminders = await storage.getRemindersByPatientId(patientId);
      
      res.json({
        success: true,
        data: reminders
      });
    } catch (error) {
      console.error("Error fetching patient reminders:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch patient reminders",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update reminder status
  app.patch("/api/reminder/:reminderId/status", async (req, res) => {
    try {
      const { reminderId } = req.params;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: "isActive field is required and must be boolean"
        });
      }

      // Check if reminder exists - get all reminders and check if this one exists
      const allPatients = await storage.getAllPatientRequests();
      let reminderExists = false;
      
      for (const patient of allPatients) {
        const reminders = await storage.getRemindersByPatientId(patient.id);
        if (reminders.some(r => r.id === reminderId)) {
          reminderExists = true;
          break;
        }
      }
      
      if (!reminderExists) {
        return res.status(404).json({
          success: false,
          message: "Reminder not found"
        });
      }

      await storage.updateReminderStatus(reminderId, isActive);
      
      res.json({
        success: true,
        message: "Reminder status updated successfully"
      });
    } catch (error) {
      console.error("Error updating reminder status:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update reminder status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get patient medication schedule (medicines + reminders combined)
  app.get("/api/patient/:patientId/medication-schedule", async (req, res) => {
    try {
      const { patientId } = req.params;
      const medicines = await storage.getMedicinesByPatientId(patientId);
      const reminders = await storage.getRemindersByPatientId(patientId);
      const profile = await storage.getPatientProfile(patientId);
      
      res.json({
        success: true,
        data: {
          medicines: medicines.filter(m => m.isActive),
          reminders: reminders.filter(r => r.isActive),
          profile: profile || null
        }
      });
    } catch (error) {
      console.error("Error fetching medication schedule:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch medication schedule",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
