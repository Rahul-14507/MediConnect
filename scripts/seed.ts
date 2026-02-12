
import Database from "better-sqlite3";

const sqlite = new Database("sqlite.db");

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

console.log("Seeding database...\n");

// Clear existing data (order matters for FK constraints)
sqlite.exec("DELETE FROM clinical_actions");
sqlite.exec("DELETE FROM clinical_visits");
sqlite.exec("DELETE FROM patients");
sqlite.exec("DELETE FROM users");
sqlite.exec("DELETE FROM organizations");

// Reset autoincrement
sqlite.exec("DELETE FROM sqlite_sequence");

// ─── Organizations ───────────────────────────────────────────────
const insertOrg = sqlite.prepare(
    "INSERT INTO organizations (name, type, code, address) VALUES (?, ?, ?, ?)"
);
insertOrg.run("City General Hospital", "hospital", "CITY", "123 Medical Avenue, Downtown");
insertOrg.run("GreenCross Pharmacy", "pharmacy", "GREEN", "456 Health Street, Midtown");
insertOrg.run("DiagnoLab Diagnostics", "lab", "LAB", "789 Science Park, Uptown");
console.log("✓ Organizations seeded (3)");

// ─── Users ───────────────────────────────────────────────────────
const insertUser = sqlite.prepare(
    "INSERT INTO users (organization_id, employee_id, name, role, password) VALUES (?, ?, ?, ?, ?)"
);
// City Hospital staff
insertUser.run(1, "DOC001", "Dr. Sarah Chen", "doctor", "password");
insertUser.run(1, "NUR001", "Nurse Priya Sharma", "nurse", "password");
insertUser.run(1, "ADM001", "Admin Raj Patel", "admin", "password");
// GreenCross Pharmacy
insertUser.run(2, "PH001", "Pharmacist Amit Kumar", "pharmacy", "password");
// DiagnoLab
insertUser.run(3, "LAB001", "Lab Tech Meera Joshi", "diagnostic", "password");
console.log("✓ Users seeded (5)");

// ─── Sample Patients ─────────────────────────────────────────────
const insertPatient = sqlite.prepare(
    "INSERT INTO patients (unique_id, name, dob, gender, contact, blood_group) VALUES (?, ?, ?, ?, ?, ?)"
);
// Use seconds for all timestamps (Drizzle mode:'timestamp' = seconds)
const dob1 = Math.floor(new Date("1990-05-15").getTime() / 1000);
const dob2 = Math.floor(new Date("1985-11-22").getTime() / 1000);
const dob3 = Math.floor(new Date("2000-03-08").getTime() / 1000);

insertPatient.run("PAT-10001", "Jane Doe", dob1, "Female", "555-0101", "O+");
insertPatient.run("PAT-10002", "Rahul Verma", dob2, "Male", "555-0202", "B+");
insertPatient.run("PAT-10003", "Maria Santos", dob3, "Female", "555-0303", "A-");
console.log("✓ Patients seeded (3)");

// ─── Sample Visits ───────────────────────────────────────────────
const insertVisit = sqlite.prepare(
    "INSERT INTO clinical_visits (patient_id, organization_id, date, vitals, symptoms, attended_by) VALUES (?, ?, ?, ?, ?, ?)"
);
const now = Math.floor(Date.now() / 1000);
const visit1Vitals = JSON.stringify({ weight: "65", bp: "120/80", temp: "36.8" });
const visit2Vitals = JSON.stringify({ weight: "78", bp: "140/90", temp: "37.2" });

insertVisit.run(1, 1, now - 86400, visit1Vitals, "Headache, mild fever, fatigue", 2); // yesterday
insertVisit.run(2, 1, now, visit2Vitals, "Chest pain, shortness of breath", 2); // today
console.log("✓ Visits seeded (2)");

// ─── Sample Actions ──────────────────────────────────────────────
const insertAction = sqlite.prepare(
    `INSERT INTO clinical_actions (patient_id, visit_id, author_id, from_organization_id, type, status, description, payload, created_at, updated_at, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

// Prescription for Jane (pending at pharmacy)
insertAction.run(1, 1, 1, 1, "prescription", "pending",
    "Paracetamol 500mg - 1 tablet TDS for 5 days. Ibuprofen 400mg for pain relief.",
    null, now - 80000, now - 80000, null);

// Lab test for Jane (completed)
insertAction.run(1, 1, 1, 1, "lab_test", "completed",
    "Complete Blood Count (CBC) - Check for infection markers",
    null, now - 82000, now - 40000,
    "Results: WBC 11,200/µL (slightly elevated), RBC 4.5M/µL (normal), Hb 13.2 g/dL (normal)");

// Prescription for Rahul (in_progress)
insertAction.run(2, 2, 1, 1, "prescription", "in_progress",
    "Aspirin 75mg daily. Atorvastatin 20mg at night. Schedule ECG.",
    null, now - 3600, now - 1800, null);

// Lab test for Rahul (pending at lab)
insertAction.run(2, 2, 1, 1, "lab_test", "pending",
    "Lipid Panel + Cardiac Enzymes (Troponin, CK-MB)",
    null, now - 3500, now - 3500, null);

// Nurse observation for Jane
insertAction.run(1, 1, 1, 1, "observation", "completed",
    "Monitor temperature every 4 hours. Ensure adequate hydration.",
    null, now - 81000, now - 60000,
    "Temperature stable at 37.0°C. Patient reports improvement.");

console.log("✓ Actions seeded (5)");
console.log("\n✅ Database seeded successfully!");
console.log("\nDemo Credentials:");
console.log("  Doctor:     CITY / DOC001 / password");
console.log("  Nurse:      CITY / NUR001 / password");
console.log("  Pharmacy:   GREEN / PH001 / password");
console.log("  Lab:        LAB / LAB001 / password");
