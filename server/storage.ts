import { type User, type InsertUser, type PatientRequest, type InsertPatientRequest, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPatientRequest(request: InsertPatientRequest): Promise<PatientRequest>;
  updatePatientReply(id: string, reply: string): Promise<void>;
  getAllPatientRequests(): Promise<PatientRequest[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private patientRequests: Map<string, PatientRequest>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.patientRequests = new Map();
    this.messages = new Map();
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

  async createPatientRequest(request: InsertPatientRequest): Promise<PatientRequest> {
    const id = randomUUID();
    const patientRequest: PatientRequest = {
      ...request,
      timestamp: Date.now()
    };
    this.patientRequests.set(id, patientRequest);
    return patientRequest;
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

  async getAllPatientRequests(): Promise<PatientRequest[]> {
    return Array.from(this.patientRequests.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = {
      ...message,
      timestamp: Date.now()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => a.timestamp - b.timestamp);
  }
}

export const storage = new MemStorage();
