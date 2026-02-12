
import Database from "better-sqlite3";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database("sqlite.db");

const migrationsDir = path.join(__dirname, "migrations");
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));

files.sort();

console.log("Running migrations...");
for (const file of files) {
    console.log(`Applying ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    db.exec(sql);
}
console.log("Migrations applied!");
