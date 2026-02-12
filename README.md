# MediConnect - Clinical Workflow Platform

**MediConnect** is an advanced, role-based healthcare management system designed to streamline clinical workflows, patient care, and hospital administration. It features a modern, responsive interface and supports multiple user roles including Doctors, Nurses, Hospital Administrators, and Department Staff (Pharmacy/Lab).

---

## 🚀 Key Features

### 🏥 Administration & Management

- **Platform Admin Portal**: Super Admin dashboard to onboard new Hospitals, Labs, and Pharmacies.
- **Hospital Admin Portal**: Manages hospital staff (Doctors & Nurses) with role-based access control.
- **Organization Management**: Multi-tenant architecture supporting Hospitals, diagnostic centers, and pharmacies.

### 👩‍⚕️ Clinical Care

- **Doctor Dashboard**: Real-time patient overview, emergency alerts, active visits, and diagnosis management.
- **Nurse Dashboard**: Patient check-ins, symptom reporting, vital monitoring, and emergency flagging.
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
- **Authentication**: Custom session-based auth with passport-like strategy.

---

## 📂 Directory Structure

```
MediConnect/
├── client/              # Frontend React Application
│   ├── src/
│   │   ├── components/  # Reusable UI components (Shadcn)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities & query client
│   │   ├── pages/       # Application views (Dashboards)
│   │   └── Main.tsx     # Entry point
├── server/              # Backend Express Application
│   ├── routes.ts        # API Routes definition
│   ├── db.ts            # Database connection & schema
│   ├── auth.ts          # Authentication logic
│   └── index.ts         # Server entry point
├── shared/              # Shared Types & Schemas
│   └── schema.ts        # Drizzle schema & Zod validation
├── docs/                # Project Documentation
└── migrations/          # Database migrations
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js (v18+)
- NPM

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

3.  **Database Setup**:
    Initialize the SQLite database and apply migrations:

    ```bash
    npm run db:push
    ```

4.  **Seed Data (Optional)**:
    Populate the database with demo users:

    ```bash
    npm run db:seed
    # To create Super Admin for Platform Portal:
    npx tsx scripts/insert-super-admin.ts
    ```

5.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    The application will launch at `http://localhost:5000`.

---

## 🔐 Democracy Credentials

Use these pre-configured accounts to explore the different roles:

| Role               | Username / ID | Org Code | Password   | Access                                 |
| :----------------- | :------------ | :------- | :--------- | :------------------------------------- |
| **Platform Admin** | `SUPER001`    | `HQ`     | `password` | Manage Organizations (Labs/Pharmacies) |
| **Hospital Admin** | `ADM001`      | `CITY`   | `password` | Manage Hospital Staff                  |
| **Doctor**         | `DOC001`      | `CITY`   | `password` | Diagnose, Orders, Emergencies          |
| **Nurse**          | `NUR001`      | `CITY`   | `password` | Check-in, Vitals, Emergencies          |
| **Pharmacist**     | `PHARM001`    | `CITY`   | `password` | Process Prescriptions                  |
| **Lab Tech**       | `LAB001`      | `LAB`    | `password` | Process Lab Tests                      |

> **Note**: Organization Code is required for login. Default Hospital is **City General Hospital** (`CITY`).

---

## 📖 Documentation

- [Design Guidelines](docs/DESIGN.md) - UI/UX principles and component usage.
- [User Guide](docs/USER_GUIDE.md) - Step-by-step walkthrough of key workflows.

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch.
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

Built with ❤️ by the MediConnect Team.
