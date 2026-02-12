
# User Guide

## 1. Login
- Use the **System Login** form with your **Organization Code** and **Employee ID**.
- See `README.md` for a list of demo credentials.

## 2. Platform Administration (Super Admin)
- Log in as **Platform Admin** (`HQ` / `SUPER001`).
- **Dashboard**: View statistics of all registered organizations.
- **Register Org**: Click "Register Organization" to onboard a new Hospital, Pharmacy, or Lab.
  - This automatically creates an Admin user for that organization.

## 3. Hospital Administration
- Log in as **Hospital Admin** (`CITY` / `ADM001`).
- **Staff Management**: View and filter list of doctors and nurses.
- **Add Staff**: Register new employees. They will immediately have access using the Hospital Code (`CITY`).

## 4. Clinical Workflows

### Nurse: Patient Check-In & Emergency
- Log in as **Nurse**.
- **Dashboard**: View assigned patients.
- **Check-In**: Click "New Visit" to register a patient arrival.
- **Emergency**: Open a Visit card and click **"Update / Report Issue"**.
  - Select "Emergency" or "Critical" priority.
  - This triggers an alert on the Doctor's dashboard.

### Doctor: Diagnosis & Orders
- Log in as **Doctor**.
- **Emergency Alerts**: Active emergencies appear at the top of the dashboard.
- **Patient Details**: Click a patient to view history.
- **Diagnosis**: Click "Add Diagnosis" on the current visit to record findings.
- **Orders**: Use the "Prescription" or "Lab Test" tabs to issue orders.

### Departments: Fulfillment
- Log in as **Pharmacist** or **Lab Tech**.
- **Queue**: View pending orders in real-time.
- **Process**: Click "Start Processing".
- **Complete**: Mark as completed and add results/notes.

## 5. Printing
- Patient Cards can be printed from the **Patient Details** page or **Nurse Dashboard**.
