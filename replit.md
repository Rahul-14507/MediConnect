# MediConnect - Telemedicine Platform

## Overview

MediConnect is a telemedicine platform designed to connect semi-urban and rural communities with healthcare professionals through secure digital consultations. The platform provides both patient and doctor interfaces, enabling remote medical consultations via call/SMS simulation and real-time messaging capabilities. Built as a hackathon prototype called "VillageCare," it demonstrates core telemedicine functionality including patient request management, doctor-patient communication, and consultation workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom design system following medical interface standards
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom theme provider supporting light/dark modes with medical-focused color palette

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with JSON responses
- **Session Management**: Express sessions with PostgreSQL session store
- **Development**: Hot reload with Vite middleware integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless platform
- **ORM**: Drizzle ORM with schema-first approach for type safety
- **Schema Management**: Centralized schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database schema migrations

### Authentication and Authorization
- **Authentication**: Simple username/password authentication (demo-ready)
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **Role Management**: Basic doctor/patient role distinction
- **Demo Credentials**: Hardcoded credentials for hackathon demonstration

### Key Data Models
- **Users**: Doctor authentication and profile management
- **Patient Requests**: Consultation requests with symptoms and urgency levels
- **Messages**: Real-time chat system for doctor-patient communication
- **Consultation Status**: Request status tracking (pending, replied, urgent)

### Component Architecture
- **Design System**: Medical-focused UI components with consistent theming
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Updates**: Polling-based updates for demo purposes (3-second intervals)
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM and query builder
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React routing library

### UI and Design Dependencies
- **@radix-ui/***: Headless UI component primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Medical and general purpose icons

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and development experience
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development

### Form and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema definition

### Date and Time Handling
- **date-fns**: Date manipulation and formatting utilities

### Database and Session Management
- **connect-pg-simple**: PostgreSQL session store for Express
- **drizzle-kit**: Database schema management and migrations

The architecture prioritizes rapid prototyping while maintaining code quality through TypeScript, structured component design, and clear separation of concerns between frontend and backend systems.