# Replit.md

## Overview

This is a full-stack web application built with React and Express, featuring a modern UI component library and database integration. The project appears to be a game application with a clean, component-based architecture using TypeScript throughout. It includes a comprehensive set of UI components, database schema management, and a structured client-server separation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build System**: ESBuild for production bundling, TSX for development
- **Storage Interface**: Abstracted storage layer with in-memory implementation (MemStorage)
- **API Structure**: RESTful endpoints with `/api` prefix
- **Error Handling**: Centralized error handling middleware
- **Development**: Hot module replacement via Vite integration

### Database & Schema Management
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon Database (serverless PostgreSQL)
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for schema migrations in `/migrations` directory
- **Type Safety**: Automatic TypeScript types generated from schema

### Development Environment
- **Monorepo Structure**: Client and server code in separate directories with shared types
- **Path Aliases**: Configured for clean imports (`@/`, `@shared/`)
- **Development Server**: Vite dev server with Express middleware integration
- **Build Process**: Separate client (Vite) and server (ESBuild) builds

### Component Design System
- **Base Components**: Comprehensive set of accessible UI components
- **Theming**: Dark mode support with CSS custom properties
- **Icons**: Lucide React icon library
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Animation**: Smooth transitions and animations built into components

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **express**: Web application framework for Node.js
- **react**: Frontend UI library
- **vite**: Build tool and development server

### UI and Styling
- **@radix-ui/***: Accessible, unstyled UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional CSS class utility

### Development and Build Tools
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundler for server builds
- **drizzle-kit**: Database schema management and migrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay

### Additional Libraries
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Performant form library
- **wouter**: Minimalist routing library
- **date-fns**: Date manipulation utilities
- **cmdk**: Command menu component
- **embla-carousel-react**: Carousel component library

### Database and Session Management
- **connect-pg-simple**: PostgreSQL session store for Express
- **drizzle-zod**: Zod integration for schema validation