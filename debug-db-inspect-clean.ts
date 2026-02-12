import { db } from "./server/db";
import { organizations } from "./shared/schema";

async function run() {
  const orgs = await db.select().from(organizations).all();
  console.log("Total Orgs:", orgs.length);

  for (const org of orgs) {
    console.log(JSON.stringify(org, null, 2));
    console.log("Code Hex:", Buffer.from(org.code).toString("hex"));
    console.log("---");
  }
}

run();
