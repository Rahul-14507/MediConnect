import { db } from "./server/db";
import { organizations, users } from "./shared/schema";
import { eq } from "drizzle-orm";

async function run() {
  const code = "TESTMAMS_" + Date.now();
  console.log("Creating Org with code:", code);

  try {
    const newOrg = await db
      .insert(organizations)
      .values({
        name: "Test MAMS",
        type: "hospital",
        code: code,
        address: "123 Test St",
      })
      .returning()
      .get();

    console.log("Created Org:", newOrg);

    const foundOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.code, code))
      .get();

    console.log("Found Org immediately:", foundOrg);

    const foundOrgTrimmed = await db
      .select()
      .from(organizations)
      .where(eq(organizations.code, code.trim()))
      .get();

    console.log("Found Org Trimmed:", foundOrgTrimmed);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
