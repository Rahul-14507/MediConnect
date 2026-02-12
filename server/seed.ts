import { db } from "./db";
import { users, organizations, patients, clinicalVisits } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Checking seed data...");

  // 1. Create Organizations
  const orgs = [
    {
      name: "City General Hospital",
      type: "hospital",
      code: "CITY",
      address: "123 Health Ave",
    },
    {
      name: "Green Health Pharmacy",
      type: "pharmacy",
      code: "GREEN",
      address: "45 Med Street",
    },
    {
      name: "City Diagnostics Lab",
      type: "lab",
      code: "LAB",
      address: "88 Science Road",
    },
    {
      name: "MediConnect HQ",
      type: "platform",
      code: "HQ",
      address: "1 Admin Plaza",
    },
  ];

  const orgMap: Record<string, number> = {};

  for (const o of orgs) {
    let org = await db
      .select()
      .from(organizations)
      .where(eq(organizations.code, o.code))
      .get();
    if (!org) {
      console.log(`Creating ${o.name}...`);
      org = await db.insert(organizations).values(o).returning().get();
    }
    orgMap[o.code] = org.id;
  }

  // 2. Create Users
  const roles = [
    { role: "admin", code: "ADM001", name: "Admin Raj Patel", org: "CITY" },
    { role: "doctor", code: "DOC001", name: "Dr. Sarah Chen", org: "CITY" },
    { role: "nurse", code: "NUR001", name: "Nurse Priya Sharma", org: "CITY" },
    {
      role: "pharmacy",
      code: "PH001",
      name: "Pharmacist John Doe",
      org: "GREEN",
    },
    {
      role: "diagnostic",
      code: "LAB001",
      name: "Lab Tech Mike Ross",
      org: "LAB",
    },
    { role: "super_admin", code: "SUPER001", name: "Super Admin", org: "HQ" },
  ];

  for (const r of roles) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.employeeId, r.code))
      .get();
    if (!existing) {
      console.log(`Creating ${r.role}: ${r.name}...`);
      await db.insert(users).values({
        organizationId: orgMap[r.org],
        employeeId: r.code,
        name: r.name,
        role: r.role,
        password: "password",
      });
    } else {
      // Update existing user to ensure correct org (fix for previously seeded wrong orgs)
      if (existing.organizationId !== orgMap[r.org]) {
        console.log(`Updating ${r.name} to org ${r.org}...`);
        await db
          .update(users)
          .set({ organizationId: orgMap[r.org] })
          .where(eq(users.id, existing.id));
      }
    }
  }

  console.log("Seed completed.");
}

main().catch(console.error);
