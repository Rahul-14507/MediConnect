import { db } from "./server/db";
import { organizations } from "./shared/schema";
import fs from "fs";

async function run() {
  const orgs = await db.select().from(organizations).all();
  let output = `Total Orgs: ${orgs.length}\n\n`;

  for (const org of orgs) {
    output += JSON.stringify(org, null, 2) + "\n";
    output += `Code Hex: ${Buffer.from(org.code).toString("hex")}\n`;
    output += "---\n";
  }

  fs.writeFileSync("debug-db-dump.txt", output);
  console.log("Dumped to debug-db-dump.txt");
}

run();
