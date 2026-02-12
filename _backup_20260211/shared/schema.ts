import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Patient request schema for Firebase data structure
export const patientRequestSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  symptom: z.string().min(1, "Symptom description is required"),
  status: z.enum(["pending", "replied", "urgent"]),
  timestamp: z.number(),
  doctorReply: z.string().optional(),
  replyTimestamp: z.number().optional(),
});

export const insertPatientRequestSchema = patientRequestSchema.omit({
  timestamp: true,
  replyTimestamp: true,
});

export type PatientRequest = z.infer<typeof patientRequestSchema>;
export type InsertPatientRequest = z.infer<typeof insertPatientRequestSchema>;

// Message schema for Firebase data structure  
export const messageSchema = z.object({
  sender: z.enum(["patient", "doctor"]),
  message: z.string().min(1, "Message is required"),
  senderName: z.string().min(1, "Sender name is required"),
  timestamp: z.number(),
  patientId: z.string().optional(),
});

export const insertMessageSchema = messageSchema.omit({
  timestamp: true,
});

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Medicine prescription schema
export const medicineSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"), // e.g., "twice daily", "every 8 hours"
  duration: z.string().min(1, "Duration is required"), // e.g., "7 days", "2 weeks"
  instructions: z.string().optional(), // Additional instructions
  prescribedBy: z.string().default("Dr. Johnson"),
  prescribedAt: z.number(),
  isActive: z.boolean().default(true),
});

export const insertMedicineSchema = medicineSchema.omit({
  prescribedAt: true,
});

export type Medicine = z.infer<typeof medicineSchema>;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;

// Patient profile schema for personalized reminders
export const patientProfileSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  age: z.number().min(0).max(150),
  isElderly: z.boolean().default(false), // Age 65+ or special needs
  reminderPreferences: z.object({
    fontSize: z.enum(["normal", "large", "extra-large"]).default("normal"),
    reminderFrequency: z.enum(["standard", "frequent", "gentle"]).default("standard"),
    preferredReminderTime: z.array(z.string()).default(["08:00", "12:00", "18:00"]), // HH:MM format
    enableVoiceReminders: z.boolean().default(false),
    enableTextReminders: z.boolean().default(true),
    specialInstructions: z.string().optional(),
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const insertPatientProfileSchema = patientProfileSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type PatientProfile = z.infer<typeof patientProfileSchema>;
export type InsertPatientProfile = z.infer<typeof insertPatientProfileSchema>;

// Medicine reminder schema  
export const medicineReminderSchema = z.object({
  medicineId: z.string().min(1, "Medicine ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  reminderTime: z.string().min(1, "Reminder time is required"), // HH:MM format
  reminderDays: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])),
  reminderType: z.enum(["text", "voice", "both"]).default("text"),
  customMessage: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
});

export const insertMedicineReminderSchema = medicineReminderSchema.omit({
  createdAt: true,
});

export type MedicineReminder = z.infer<typeof medicineReminderSchema>;
export type InsertMedicineReminder = z.infer<typeof insertMedicineReminderSchema>;
