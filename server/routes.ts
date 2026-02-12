import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { db } from "./db";
import {
  users,
  patients,
  clinicalActions,
  clinicalVisits,
  organizations,
  insertActionSchema,
  insertVisitSchema,
  insertPatientSchema,
  insertOrganizationSchema,
} from "@shared/schema";
import { eq, desc, and, inArray, like, or, sql, not } from "drizzle-orm";

export async function registerRoutes(app: Express, server: Server) {
  // WebSocket Setup
  const wss = new WebSocketServer({ server, path: "/ws" });

  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // ─── Auth ────────────────────────────────────────────────────────
  app.post("/api/login", async (req, res) => {
    let { orgCode, employeeId, password } = req.body;
    orgCode = orgCode?.trim();
    employeeId = employeeId?.trim();
    console.log("Login attempt:", { orgCode, employeeId, password });

    const org = await db
      .select()
      .from(organizations)
      .where(eq(organizations.code, orgCode))
      .get();
    console.log("Found Org:", org);
    if (!org) {
      console.log("Login failed: Organization not found for code:", orgCode);
      return res.status(401).json({ message: "Invalid Organization Code" });
    }

    console.log(
      `Searching for user in Org ${org.id} (${org.name}) with EmployeeID: ${employeeId}`,
    );

    const user = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.organizationId, org.id),
          eq(users.employeeId, employeeId),
          eq(users.password, password),
        ),
      )
      .get();

    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword, organization: org });
  });

  // ─── Staff Management (Hospital Admin) ───────────────────────────

  // Get Staff for Current Organization
  app.get("/api/staff", async (req, res) => {
    const { organizationId } = req.query;
    if (!organizationId)
      return res.status(400).json({ message: "Organization ID required" });

    const staff = await db
      .select()
      .from(users)
      .where(eq(users.organizationId, parseInt(organizationId as string)))
      .orderBy(desc(users.role));

    // Remove passwords
    const safeStaff = staff.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });

    res.json(safeStaff);
  });

  // Create New Staff
  app.post("/api/staff", async (req, res) => {
    const { organizationId, employeeId, name, role, password } = req.body;

    // Simple validation
    if (!organizationId || !employeeId || !name || !role || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const newUser = await db
        .insert(users)
        .values({
          organizationId,
          employeeId,
          name,
          role,
          password,
        })
        .returning()
        .get();

      const { password: _, ...safeUser } = newUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({
        message: "Failed to create staff (Employee ID might be taken)",
      });
    }
  });

  // ─── Organization Management (Super Admin) ───────────────────────

  // Get All Organizations (Super Admin view)
  // Get All Organizations
  app.get("/api/admin/organizations", async (req, res) => {
    // Authenticate (check role) - skipping for demo simplicity as requested
    const orgs = await db
      .select()
      .from(organizations)
      .orderBy(desc(organizations.id));
    res.json(orgs);
  });

  // Get Hospitals (for Transfer destination selection)
  app.get("/api/hospitals", async (req, res) => {
    // Ideally filter out the current user's org, but frontend can handle that or we pass ?exclude=ID
    const orgs = await db
      .select()
      .from(organizations)
      .where(eq(organizations.type, "hospital"))
      .orderBy(organizations.name);
    res.json(orgs);
  });

  // Register New Organization
  // Register New Organization
  app.post("/api/admin/organizations", async (req, res) => {
    const { name, type, code, address, adminEmployeeId, adminPassword } =
      req.body;

    if (!name || !type || !code || !adminEmployeeId || !adminPassword) {
      return res.status(400).json({
        message: "Name, Type, Code, Admin ID, and Password are required",
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanAdminId = adminEmployeeId.trim();
    const cleanName = name.trim();
    const cleanAddress = address?.trim();

    console.log("Registering Org:", { cleanName, cleanCode, cleanAdminId });

    try {
      // 1. Create Organization
      const newOrg = await db
        .insert(organizations)
        .values({
          name: cleanName,
          type,
          code: cleanCode,
          address: cleanAddress,
        })
        .returning()
        .get();

      // 2. Create Admin User for this Org
      const newUser = await db
        .insert(users)
        .values({
          organizationId: newOrg.id,
          employeeId: cleanAdminId,
          name: `${cleanName} Admin`,
          role: "admin",
          password: adminPassword,
        })
        .returning()
        .get();

      res.json({ organization: newOrg, admin: newUser });
    } catch (error: any) {
      console.error("Failed to register org:", error);
      // Check for unique constraint violations
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res
          .status(400)
          .json({ message: "Organization Code or Admin ID already exists" });
      }
      res.status(500).json({
        message: "Failed to register organization",
      });
    }
  });

  // Delete Organization
  app.delete("/api/admin/organizations/:id", async (req, res) => {
    const orgId = parseInt(req.params.id);

    // Prevent deleting seeded orgs to avoid breaking demos (optional, but good for safety)
    if (orgId <= 4) {
      return res
        .status(403)
        .json({ message: "Cannot delete default demo organizations" });
    }

    try {
      db.transaction(() => {
        // Delete users
        db.delete(users).where(eq(users.organizationId, orgId)).run();
        // Delete org
        db.delete(organizations).where(eq(organizations.id, orgId)).run();
      });
      res.json({ message: "Organization deleted successfully" });
    } catch (error) {
      console.error("Delete org error:", error);
      res.status(500).json({ message: "Failed to delete organization" });
    }
  });

  // ─── Patients ────────────────────────────────────────────────────

  // Search Patient (supports uniqueId exact match AND partial name match)
  app.get("/api/patients/search", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);

    const q = query as string;
    const results = await db
      .select()
      .from(patients)
      .where(
        or(
          eq(patients.uniqueId, q),
          like(patients.name, `%${q}%`),
          like(patients.uniqueId, `%${q}%`),
        ),
      );
    res.json(results);
  });

  // Create Patient (Nurse)
  app.post("/api/patients", async (req, res) => {
    const uniqueId = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = insertPatientSchema.safeParse({
      ...req.body,
      uniqueId,
      dob: new Date(req.body.dob),
    });
    if (!result.success) return res.status(400).json(result.error);

    const newPatient = await db
      .insert(patients)
      .values(result.data)
      .returning()
      .get();
    broadcast({ type: "NEW_PATIENT", patient: newPatient });
    res.json(newPatient);
  });

  // Get All Patients
  app.get("/api/patients", async (req, res) => {
    const results = await db.select().from(patients).orderBy(desc(patients.id));
    res.json(results);
  });

  // Update Patient
  app.put("/api/patients/:id", async (req, res) => {
    const patientId = parseInt(req.params.id);
    try {
      const updated = await db
        .update(patients)
        .set({
          name: req.body.name,
          dob: req.body.dob ? new Date(req.body.dob) : undefined,
          gender: req.body.gender,
          contact: req.body.contact,
          bloodGroup: req.body.bloodGroup,
        })
        .where(eq(patients.id, patientId))
        .returning()
        .get();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  // Delete Patient (Cascading)
  app.delete("/api/patients/:id", (req, res) => {
    const patientId = parseInt(req.params.id);
    try {
      db.transaction(() => {
        db.delete(clinicalActions)
          .where(eq(clinicalActions.patientId, patientId))
          .run();

        const patientVisits = db
          .select({ id: clinicalVisits.id })
          .from(clinicalVisits)
          .where(eq(clinicalVisits.patientId, patientId))
          .all();

        if (patientVisits.length > 0) {
          const visitIds = patientVisits.map((v) => v.id);
          db.delete(clinicalActions)
            .where(inArray(clinicalActions.visitId, visitIds))
            .run();
        }

        db.delete(clinicalVisits)
          .where(eq(clinicalVisits.patientId, patientId))
          .run();
        db.delete(patients).where(eq(patients.id, patientId)).run();
      });
      res.json({ message: "Patient deleted successfully" });
    } catch (error) {
      console.error("Delete patient error:", error);
      res
        .status(500)
        .json({ message: "Failed to delete patient", error: String(error) });
    }
  });

  // Get Single Patient
  app.get("/api/patients/:id", async (req, res) => {
    const patientId = parseInt(req.params.id);
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .get();
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  // ─── Visits ──────────────────────────────────────────────────────

  // Create Visit (Check-in)
  app.post("/api/visits", async (req, res) => {
    const result = insertVisitSchema.safeParse({
      ...req.body,
      date: new Date(),
    });
    if (!result.success) return res.status(400).json(result.error);

    const newVisit = await db
      .insert(clinicalVisits)
      .values(result.data)
      .returning()
      .get();
    res.json(newVisit);
  });

  // Get Active Emergencies (Doctor Dashboard)
  app.get("/api/visits/active-emergencies", async (req, res) => {
    const results = await db
      .select({
        visit: clinicalVisits,
        patient: patients,
        attendedBy: users.name,
      })
      .from(clinicalVisits)
      .innerJoin(patients, eq(clinicalVisits.patientId, patients.id))
      .leftJoin(users, eq(clinicalVisits.attendedBy, users.id))
      .where(
        or(
          eq(clinicalVisits.priority, "emergency"),
          eq(clinicalVisits.priority, "critical"),
        ),
      )
      .orderBy(desc(clinicalVisits.date));

    res.json(results);
  });

  // Update Visit (Diagnosis/Symptoms)
  app.patch("/api/visits/:id", async (req, res) => {
    const { diagnosis, symptoms, priority } = req.body;
    const visitId = parseInt(req.params.id);

    try {
      const updatedVisit = await db
        .update(clinicalVisits)
        .set({
          diagnosis,
          symptoms: symptoms || undefined,
          priority: priority || undefined,
        })
        .where(eq(clinicalVisits.id, visitId))
        .returning()
        .get();

      if (!updatedVisit)
        return res.status(404).json({ message: "Visit not found" });

      broadcast({ type: "UPDATE_VISIT", visit: updatedVisit });
      res.json(updatedVisit);
    } catch (error) {
      res.status(500).json({ message: "Failed to update visit" });
    }
  });

  // Get Patient Details (Visits + Actions joined)
  app.get("/api/patients/:id/details", async (req, res) => {
    const patientId = parseInt(req.params.id);

    const visits = await db
      .select({
        visit: clinicalVisits,
        orgName: organizations.name,
        staffName: users.name,
      })
      .from(clinicalVisits)
      .leftJoin(
        organizations,
        eq(clinicalVisits.organizationId, organizations.id),
      )
      .leftJoin(users, eq(clinicalVisits.attendedBy, users.id))
      .where(eq(clinicalVisits.patientId, patientId))
      .orderBy(desc(clinicalVisits.date));

    const actions = await db
      .select({
        action: clinicalActions,
        authorName: users.name,
        orgName: organizations.name,
      })
      .from(clinicalActions)
      .leftJoin(users, eq(clinicalActions.authorId, users.id))
      .leftJoin(
        organizations,
        eq(clinicalActions.fromOrganizationId, organizations.id),
      )
      .where(eq(clinicalActions.patientId, patientId))
      .orderBy(desc(clinicalActions.createdAt));

    // Flatten actions for timeline consumption
    const flatActions = actions.map((a) => ({
      id: a.action.id,
      patientId: a.action.patientId,
      type: a.action.type,
      status: a.action.status,
      description: a.action.description,
      payload: a.action.payload,
      createdAt: a.action.createdAt,
      updatedAt: a.action.updatedAt,
      completedAt: a.action.completedAt,
      notes: a.action.notes,
      authorName: a.authorName || "Unknown",
      orgName: a.orgName || "Unknown",
    }));

    res.json({ visits, actions: flatActions });
  });

  // ─── Actions ─────────────────────────────────────────────────────

  // Create Action (Doctor orders prescription/lab/etc.)
  app.post("/api/actions", async (req, res) => {
    const result = insertActionSchema.safeParse({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!result.success) return res.status(400).json(result.error);

    const newAction = await db
      .insert(clinicalActions)
      .values(result.data)
      .returning()
      .get();
    broadcast({ type: "NEW_ACTION", action: newAction });
    res.json(newAction);
  });

  // Fulfill Action (Pharmacy/Lab/Nurse completes task)
  app.patch("/api/actions/:id", async (req, res) => {
    const { status, notes, completedBy, completedByOrganizationId } = req.body;

    const updatedAction = await db
      .update(clinicalActions)
      .set({
        status,
        notes,
        completedBy,
        completedByOrganizationId,
        completedAt: status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(clinicalActions.id, parseInt(req.params.id)))
      .returning()
      .get();

    broadcast({ type: "UPDATE_ACTION", action: updatedAction });
    res.json(updatedAction);
  });

  // ─── Department Queue ────────────────────────────────────────────

  // Get queue items for a specific role (pharmacy, diagnostic, nurse)
  app.get("/api/departments/:role/queue", async (req, res) => {
    const role = req.params.role;

    // Map roles to action types they handle
    const roleActionMap: Record<string, string[]> = {
      pharmacy: ["prescription"],
      diagnostic: ["lab_test", "radiology"],
      nurse: ["observation", "procedure", "transfer"],
    };

    const actionTypes = roleActionMap[role];
    if (!actionTypes) return res.json([]);

    const results = await db
      .select({
        action: clinicalActions,
        patientName: patients.name,
        uniqueId: patients.uniqueId,
        authorName: users.name,
        orgName: organizations.name,
      })
      .from(clinicalActions)
      .leftJoin(patients, eq(clinicalActions.patientId, patients.id))
      .leftJoin(users, eq(clinicalActions.authorId, users.id))
      .leftJoin(
        organizations,
        eq(clinicalActions.fromOrganizationId, organizations.id),
      )
      .where(inArray(clinicalActions.type, actionTypes))
      .orderBy(desc(clinicalActions.createdAt));

    // Flatten for frontend consumption
    const flat = results.map((r) => ({
      id: r.action.id,
      patientId: r.action.patientId,
      type: r.action.type,
      status: r.action.status,
      description: r.action.description,
      payload: r.action.payload,
      createdAt: r.action.createdAt,
      updatedAt: r.action.updatedAt,
      completedAt: r.action.completedAt,
      notes: r.action.notes,
      patientName: r.patientName || "Unknown",
      uniqueId: r.uniqueId || "N/A",
      authorName: r.authorName || "Unknown",
      orgName: r.orgName || "Unknown",
    }));

    res.json(flat);
  });

  // Create Transfer Action
  app.post("/api/transfers", async (req, res) => {
    const { patientId, targetOrgId, notes, fromOrgId, authorId } = req.body;

    if (!patientId || !targetOrgId || !fromOrgId || !authorId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify target org logic could go here

    try {
      const newAction = await db
        .insert(clinicalActions)
        .values({
          patientId,
          visitId: null, // Transfer is often disjoint from a specific visit, or could be linked
          authorId,
          fromOrganizationId: fromOrgId,
          type: "transfer",
          status: "pending",
          description: "Patient Transfer Request",
          payload: { targetOrgId }, // Storing target in JSON payload
          notes: notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .get();

      broadcast({ type: "NEW_ACTION", action: newAction });
      res.json(newAction);
    } catch (error) {
      console.error("Transfer creation failed:", error);
      res.status(500).json({ message: "Failed to create transfer" });
    }
  });

  // ─── Stats ───────────────────────────────────────────────────────

  app.get("/api/stats", async (req, res) => {
    const totalPatients = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .get();
    const totalVisits = await db
      .select({ count: sql<number>`count(*)` })
      .from(clinicalVisits)
      .get();
    const pendingActions = await db
      .select({ count: sql<number>`count(*)` })
      .from(clinicalActions)
      .where(eq(clinicalActions.status, "pending"))
      .get();
    const completedActions = await db
      .select({ count: sql<number>`count(*)` })
      .from(clinicalActions)
      .where(eq(clinicalActions.status, "completed"))
      .get();

    res.json({
      totalPatients: totalPatients?.count || 0,
      totalVisits: totalVisits?.count || 0,
      pendingActions: pendingActions?.count || 0,
      completedActions: completedActions?.count || 0,
    });
  });
}
