
import { db } from "./db";
import { users, organizations } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking if Super Admin exists...");

    // Check if HQ org exists
    let hq = await db.select().from(organizations).where(eq(organizations.code, "HQ")).get();

    if (!hq) {
        console.log("Creating MediConnect HQ organization...");
        hq = await db.insert(organizations).values({
            name: "MediConnect HQ",
            code: "HQ",
            type: "platform",
            address: "Internal",
        }).returning().get();
    } else {
        console.log("MediConnect HQ organization already exists.");
    }

    // Check if Super Admin exists
    const admin = await db.select().from(users).where(eq(users.employeeId, "SUPER001")).get();

    if (!admin) {
        console.log("Creating Super Admin user...");
        await db.insert(users).values({
            organizationId: hq.id,
            employeeId: "SUPER001",
            name: "Super Admin",
            role: "super_admin",
            password: "password",
        });
        console.log("Super Admin created successfully.");
    } else {
        console.log("Super Admin user already exists.");
    }
}

main().catch(console.error);
