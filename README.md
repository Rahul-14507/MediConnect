# MediConnect - Clinical Workflow Platform

**MediConnect** is an advanced, role-based healthcare management system designed to streamline clinical workflows, patient care, and hospital administration. It features a modern, responsive interface and supports multiple user roles including Doctors, Nurses, Hospital Administrators, and Department Staff (Pharmacy/Lab).

---

## Key Features

### 🏥 Administration & Management

- **Platform Admin Portal**: Super Admin dashboard to onboard new Hospitals, Labs, and Pharmacies.
- **Hospital Admin Portal**: Manages hospital staff (Doctors & Nurses) with role-based access control.
- **Organization Management**: Multi-tenant architecture supporting Hospitals, diagnostic centers, and pharmacies.

### 👩‍⚕️ Clinical Care

- **Doctor Dashboard**: Real-time patient overview, emergency alerts, active visits, and diagnosis management.
- **Nurse Dashboard**: Patient check-ins, symptom reporting, vital monitoring, and patient transfers.
- **Emergency Response**: Dedicated workflow for critical cases with instant doctor notifications.
- **Diagnosis & Orders**: Doctors can prescribe medications, lab tests, and procedures directly from the patient profile.

### 🔬 Ancillary Services

- **Department Queues**: Dedicated dashboards for Pharmacy and Lab staff to process orders.
- **Patient Search**: Global search by Name or Unique ID across the organization.
- **Report Generation**: Print-ready Patient Cards and Visit Summaries.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI, Tanstack Query.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (via Better-SQLite3), Drizzle ORM.
- **Authentication**: Custom session-based auth.

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v18 or higher)
- **NPM** (comes with Node.js)

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/mediconnect.git
    cd MediConnect
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Setup Database**:
    Initialize the SQLite database schema:

    ```bash
    npm run db:push
    ```

4.  **Seed Data**:
    Populate the database with organizations and demo users:

    ```bash
    npm run db:seed
    ```

5.  **Start the Server**:
    Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:5000](http://localhost:5000).

---

## 🔐 Demo Credentials

Use these pre-configured accounts to explore the different roles.

| Role               | Username / ID | Org Code | Password   | Description                            |
| :----------------- | :------------ | :------- | :--------- | :------------------------------------- |
| **Platform Admin** | `SUPER001`    | `HQ`     | `password` | Manage Organizations (Labs/Pharmacies) |
| **Hospital Admin** | `ADM001`      | `CITY`   | `password` | Manage Hospital Staff                  |
| **Doctor**         | `DOC001`      | `CITY`   | `password` | Diagnose, Orders, Emergencies          |
| **Nurse**          | `NUR001`      | `CITY`   | `password` | Check-in, Vitals, Transfers            |
| **Pharmacist**     | `PH001`       | `GREEN`  | `password` | Process Prescriptions                  |
| **Lab Tech**       | `LAB001`      | `LAB`    | `password` | Process Lab Tests                      |

> **Note**: You must enter the **Organization Code** exactly as shown (e.g., `CITY`, `GREEN`, `LAB`).

---

## ☁️ Deployment

### Vercel

The project is configured for Vercel deployment using serverless functions.

1.  Push your code to a Git repository.
2.  Import the project into Vercel.
3.  Vercel will detect the settings automatically.
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist/public`
4.  Deploy!

> **Warning**: The SQLite database is file-based and **will not persist data** across serverless function restarts on Vercel. For a production deployment, replace SQLite with a persistent database like Neon (Postgres) or Turso.

---

## 📂 Directory Structure

```
MediConnect/
├── client/              # Frontend React Application
├── server/              # Backend Express Application
│   └── routes.ts        # API Routes
├── shared/              # Shared Types & Schemas
└── api/                 # Vercel Serverless Entry Point
```

---

Built with ❤️ by the MediConnect Team.
