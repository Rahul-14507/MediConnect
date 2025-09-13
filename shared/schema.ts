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
