import { type User, type InsertUser, type PatientRequest, type InsertPatientRequest, type Message, type InsertMessage, type Medicine, type InsertMedicine, type PatientProfile, type InsertPatientProfile, type MedicineReminder, type InsertMedicineReminder } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPatientRequest(request: InsertPatientRequest): Promise<PatientRequest & { id: string }>;
  updatePatientReply(id: string, reply: string): Promise<void>;
  getAllPatientRequests(): Promise<(PatientRequest & { id: string })[]>;
  createMessage(message: InsertMessage): Promise<Message & { id: string }>;
  getAllMessages(): Promise<(Message & { id: string })[]>;
  
  // Medicine management
  createMedicine(medicine: InsertMedicine): Promise<Medicine & { id: string }>;
  getMedicinesByPatientId(patientId: string): Promise<(Medicine & { id: string })[]>;
  updateMedicineStatus(id: string, isActive: boolean): Promise<void>;
  getAllMedicines(): Promise<(Medicine & { id: string })[]>;
  
  // Patient profiles
  createPatientProfile(profile: InsertPatientProfile): Promise<PatientProfile & { id: string }>;
  getPatientProfile(patientId: string): Promise<(PatientProfile & { id: string }) | undefined>;
  updatePatientProfile(patientId: string, updates: Partial<InsertPatientProfile>): Promise<void>;
  
  // Medicine reminders
  createMedicineReminder(reminder: InsertMedicineReminder): Promise<MedicineReminder & { id: string }>;
  getRemindersByPatientId(patientId: string): Promise<(MedicineReminder & { id: string })[]>;
  getRemindersByMedicineId(medicineId: string): Promise<(MedicineReminder & { id: string })[]>;
  updateReminderStatus(id: string, isActive: boolean): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private patientRequests: Map<string, PatientRequest>;
  private messages: Map<string, Message>;
  private medicines: Map<string, Medicine>;
  private patientProfiles: Map<string, PatientProfile>;
  private medicineReminders: Map<string, MedicineReminder>;

  constructor() {
    this.users = new Map();
    this.patientRequests = new Map();
    this.messages = new Map();
    this.medicines = new Map();
    this.patientProfiles = new Map();
    this.medicineReminders = new Map();
    
    // Add sample patient requests for demonstration
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample patient requests
    const sampleRequests = [
      {
        id: "sample-1",
        patientName: "Maria Santos",
        symptom: "High fever and headache for 2 days. Difficulty sleeping and loss of appetite.",
        status: "pending" as const,
        timestamp: Date.now() - 45 * 60 * 1000, // 45 minutes ago
      },
      {
        id: "sample-2", 
        patientName: "Carlos Rodriguez",
        symptom: "Persistent cough with chest congestion. Started 3 days ago after exposure to cold weather.",
        status: "replied" as const,
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        doctorReply: "Please take warm fluids and avoid cold exposure. Monitor symptoms and contact if worsens.",
        replyTimestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
      },
      {
        id: "sample-3",
        patientName: "Ana Lopez",
        symptom: "Severe stomach pain and nausea after eating. Pain is sharp and located in upper abdomen.",
        status: "urgent" as const,
        timestamp: Date.now() - 15 * 60 * 1000, // 15 minutes ago
      },
      {
        id: "sample-4",
        patientName: "Roberto García", 
        symptom: "Feeling dizzy and lightheaded when standing up. Blood pressure seems irregular.",
        status: "pending" as const,
        timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
      },
      {
        id: "sample-5",
        patientName: "Elena Morales",
        symptom: "Chronic back pain getting worse. Difficulty walking and sleeping properly.",
        status: "replied" as const,
        timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
        doctorReply: "Please apply heat therapy and avoid heavy lifting. Schedule a follow-up if pain persists.",
        replyTimestamp: Date.now() - 3.5 * 60 * 60 * 1000,
      }
    ];

    // Add sample requests to storage
    sampleRequests.forEach(request => {
      this.patientRequests.set(request.id, request);
    });

    // Sample messages for chat
    const sampleMessages = [
      {
        id: "msg-1",
        sender: "patient" as const,
        senderName: "Maria Santos",
        message: "Doctor, I'm feeling very unwell today",
        timestamp: Date.now() - 10 * 60 * 1000,
        patientId: "sample-1"
      },
      {
        id: "msg-2", 
        sender: "doctor" as const,
        senderName: "Dr. Johnson",
        message: "I understand your concern. Can you describe your symptoms?",
        timestamp: Date.now() - 8 * 60 * 1000,
        patientId: "sample-1"
      }
    ];

    sampleMessages.forEach(message => {
      this.messages.set(message.id, message);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPatientRequest(request: InsertPatientRequest): Promise<PatientRequest & { id: string }> {
    const id = randomUUID();
    const patientRequest: PatientRequest = {
      ...request,
      timestamp: Date.now()
    };
    this.patientRequests.set(id, patientRequest);
    return { ...patientRequest, id };
  }

  async updatePatientReply(id: string, reply: string): Promise<void> {
    const request = this.patientRequests.get(id);
    if (request) {
      const updatedRequest: PatientRequest = {
        ...request,
        doctorReply: reply,
        status: "replied",
        replyTimestamp: Date.now()
      };
      this.patientRequests.set(id, updatedRequest);
    }
  }

  async getAllPatientRequests(): Promise<(PatientRequest & { id: string })[]> {
    return Array.from(this.patientRequests.entries())
      .map(([id, request]) => ({ ...request, id }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async createMessage(message: InsertMessage): Promise<Message & { id: string }> {
    const id = randomUUID();
    const newMessage: Message = {
      ...message,
      timestamp: Date.now()
    };
    this.messages.set(id, newMessage);
    return { ...newMessage, id };
  }

  async getAllMessages(): Promise<(Message & { id: string })[]> {
    return Array.from(this.messages.entries())
      .map(([id, message]) => ({ ...message, id }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  // Medicine management methods
  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine & { id: string }> {
    const id = randomUUID();
    const medicine: Medicine = {
      ...insertMedicine,
      prescribedAt: Date.now()
    };
    this.medicines.set(id, medicine);
    return { ...medicine, id };
  }

  async getMedicinesByPatientId(patientId: string): Promise<(Medicine & { id: string })[]> {
    return Array.from(this.medicines.entries())
      .map(([id, medicine]) => ({ ...medicine, id }))
      .filter(medicine => medicine.patientId === patientId)
      .sort((a, b) => b.prescribedAt - a.prescribedAt);
  }

  async updateMedicineStatus(id: string, isActive: boolean): Promise<void> {
    const medicine = this.medicines.get(id);
    if (medicine) {
      const updatedMedicine: Medicine = {
        ...medicine,
        isActive
      };
      this.medicines.set(id, updatedMedicine);
    }
  }

  async getAllMedicines(): Promise<(Medicine & { id: string })[]> {
    return Array.from(this.medicines.entries())
      .map(([id, medicine]) => ({ ...medicine, id }))
      .sort((a, b) => b.prescribedAt - a.prescribedAt);
  }

  // Patient profile methods
  async createPatientProfile(insertProfile: InsertPatientProfile): Promise<PatientProfile & { id: string }> {
    const now = Date.now();
    const profile: PatientProfile = {
      ...insertProfile,
      createdAt: now,
      updatedAt: now
    };
    this.patientProfiles.set(insertProfile.patientId, profile);
    return { ...profile, id: insertProfile.patientId };
  }

  async getPatientProfile(patientId: string): Promise<(PatientProfile & { id: string }) | undefined> {
    const profile = this.patientProfiles.get(patientId);
    if (!profile) return undefined;
    
    return { ...profile, id: patientId };
  }

  async updatePatientProfile(patientId: string, updates: Partial<InsertPatientProfile>): Promise<void> {
    const profile = this.patientProfiles.get(patientId);
    if (profile) {
      const updatedProfile: PatientProfile = {
        ...profile,
        ...updates,
        patientId, // Ensure patientId doesn't change
        updatedAt: Date.now()
      };
      this.patientProfiles.set(patientId, updatedProfile);
    }
  }

  // Medicine reminder methods
  async createMedicineReminder(insertReminder: InsertMedicineReminder): Promise<MedicineReminder & { id: string }> {
    const id = randomUUID();
    const reminder: MedicineReminder = {
      ...insertReminder,
      createdAt: Date.now()
    };
    this.medicineReminders.set(id, reminder);
    return { ...reminder, id };
  }

  async getRemindersByPatientId(patientId: string): Promise<(MedicineReminder & { id: string })[]> {
    return Array.from(this.medicineReminders.entries())
      .map(([id, reminder]) => ({ ...reminder, id }))
      .filter(reminder => reminder.patientId === patientId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async getRemindersByMedicineId(medicineId: string): Promise<(MedicineReminder & { id: string })[]> {
    return Array.from(this.medicineReminders.entries())
      .map(([id, reminder]) => ({ ...reminder, id }))
      .filter(reminder => reminder.medicineId === medicineId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async updateReminderStatus(id: string, isActive: boolean): Promise<void> {
    const reminder = this.medicineReminders.get(id);
    if (reminder) {
      const updatedReminder: MedicineReminder = {
        ...reminder,
        isActive
      };
      this.medicineReminders.set(id, updatedReminder);
    }
  }
}

export const storage = new MemStorage();
