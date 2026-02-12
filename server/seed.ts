
import { db } from "./db";
import { users, organizations, patients, clinicalVisits } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking seed data...");

    // 1. Create Default Organization (Hospital)
    let hospital = await db.select().from(organizations).where(eq(organizations.code, "CITY")).get();
    if (!hospital) {
        console.log("Creating City General Hospital...");
        hospital = await db.insert(organizations).values({
            name: "City General Hospital",
            type: "hospital",
            code: "CITY",
            address: "123 Health Ave, Metro City",
        }).returning().get();
    }

    // 2. Create Default Users
    const roles = [
        { role: "admin", code: "ADM001", name: "Admin Raj Patel" },
        { role: "doctor", code: "DOC001", name: "Dr. Sarah Chen" },
        { role: "nurse", code: "NUR001", name: "Nurse Priya Sharma" },
        { role: "pharmacy", code: "PHARM001", name: "Pharmacist John Doe" },
        { role: "diagnostic", code: "LAB001", name: "Lab Tech Mike Ross" },
    ];

    for (const r of roles) {
        const existing = await db.select().from(users).where(eq(users.employeeId, r.code)).get();
        if (!existing) {
            console.log(`Creating ${r.role}: ${r.name}...`);
            await db.insert(users).values({
                organizationId: hospital.id,
                employeeId: r.code,
                name: r.name,
                role: r.role,
                password: "password",
            });
        }
    }

    console.log("Seed completed.");
}

main().catch(console.error);
