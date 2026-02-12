import { db } from "./server/db";
import { organizations } from "./shared/schema";
import { eq } from "drizzle-orm";

async function run() {
  const org = await db
    .select()
    .from(organizations)
    .where(eq(organizations.code, "MA"))
    .get();

  if (org) {
    console.log("Found Org 'MA'. Updating to 'MAMS'...");
    try {
      await db
        .update(organizations)
        .set({ code: "MAMS" })
        .where(eq(organizations.id, org.id))
        .run();
      console.log("Successfully updated Org code to 'MAMS'.");
    } catch (e: any) {
      if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
        console.log("Could not update: 'MAMS' already exists.");
      } else {
        console.error("Error updating:", e);
      }
    }
  } else {
    console.log("Org 'MA' not found. Maybe already fixed or deleted.");
  }
}

run();
