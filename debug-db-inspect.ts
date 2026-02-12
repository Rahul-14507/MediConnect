import { db } from "./server/db";
import { organizations } from "./shared/schema";

async function run() {
  const orgs = await db.select().from(organizations).all();
  console.log("Total Orgs:", orgs.length);

  orgs.forEach((org) => {
    console.log(`ID: ${org.id}, Name: ${org.name}, Code: '${org.code}'`);
    console.log(`Code Length: ${org.code.length}`);
    console.log(`Code Hex: ${Buffer.from(org.code).toString("hex")}`);
    console.log("---");
  });
}

run();
