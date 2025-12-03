# VyomAi Pvt Ltd - AI Solutions Platform

## Overview

VyomAi Pvt Ltd is a Nepal-based AI technology startup that provides intelligent business solutions including AI agent templates, custom chatbots, and seamless platform integrations. The application is a single-page website showcasing the company's services, featuring an interactive AI chatbot, visitor tracking, content management system, and admin dashboard. The design blends futuristic tech aesthetics with traditional Nepali cultural elements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives via shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for interactive elements

**Design System:**
- Custom color scheme supporting light/dark themes with Nepali-inspired saffron accents
- Typography: Inter (body), Space Grotesk (headings), Poppins (Devanagari compatibility)
- Component library follows shadcn/ui "New York" style with custom modifications
- Responsive design with mobile-first approach
- Cultural fusion: Modern tech aesthetics combined with traditional Nepali mandala patterns

**Key Features:**
- Single-page application with smooth scroll navigation
- AI-powered chatbot interface for user interaction
- Real-time visitor counter
- Theme switching (light/dark mode)
- Scroll-triggered animations
- Admin authentication and content management

**Page Structure:**
- Home page with sections: Hero, About, Services, Solutions, Media, Contact
- Admin login page
- Admin dashboard for content/settings management
- 404 error page

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Session Management**: Token-based authentication stored in localStorage
- **API Design**: RESTful endpoints

**Storage Strategy:**
- ✅ PostgreSQL database implementation (`DatabaseStorage`) via Drizzle ORM
- Neon Database serverless PostgreSQL (via `@neondatabase/serverless`)
- Full database persistence for all admin data (users, articles, team members, bookings, etc.)
- Automatic user initialization for admin and test accounts

**Data Models:**
- **Users**: Admin authentication (username/password/email) with password reset capability
- **Articles**: Content management (title, content, type, media URLs, published status)
- **Team Members**: Company team with avatars, roles, descriptions, and animation settings
- **Pricing Packages**: Tiered pricing plans with features and highlighting
- **Bookings**: Project booking requests with status tracking (created/open/ongoing/completed)
- **Site Settings**: Configurable company information, social links, payment settings
- **Visitor Stats**: Total and daily visitor tracking with analytics
- **Social Media Analytics**: 6-platform analytics (LinkedIn, Instagram, Facebook, YouTube, WhatsApp, Viber)
- **Social Media Integrations**: OAuth connection management for platforms

**API Endpoints:**
- `/api/visitors` - GET visitor statistics
- `/api/visitors/increment` - POST to increment visitor count
- `/api/articles` - GET all articles, POST new article
- `/api/articles/:id` - GET/PUT/DELETE specific article
- `/api/settings` - GET/PUT site settings
- `/api/admin/login` - POST admin authentication
- `/api/contact` - POST contact form submissions
- `/api/chat` - POST AI chatbot interactions

**Security Considerations:**
- Token-based authentication middleware for protected routes
- CORS configuration for API access
- Input validation using Zod schemas
- Session management with token verification

### Build System

**Development:**
- Vite dev server with HMR (Hot Module Replacement)
- TypeScript compilation with strict mode
- Path aliases for clean imports (@/, @shared/, @assets/)

**Production:**
- Vite builds client assets to `dist/public`
- esbuild bundles server code to single `dist/index.cjs` file
- Selective dependency bundling (allowlist for improved cold start times)
- Static file serving from Express

## External Dependencies

### AI Services
- **OpenAI API**: Powers the AI chatbot functionality
  - Model: GPT-5 (as per configuration comment)
  - Used for contextual responses about VyomAi services
  - API key required via environment variable `OPENAI_API_KEY`

### Database
- **Neon Database**: Serverless PostgreSQL (configured but using in-memory storage currently)
  - Connection via `@neondatabase/serverless` package
  - Drizzle ORM for type-safe database operations
  - Environment variable: `DATABASE_URL`

### UI Component Library
- **Radix UI**: Accessible component primitives
  - 25+ components (accordion, dialog, dropdown, popover, etc.)
  - Full keyboard navigation and ARIA support
- **shadcn/ui**: Pre-styled component implementations

### Styling & Icons
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for UI elements
- **React Icons**: Additional icons (SiLinkedin, SiInstagram, etc.)

### Form Management
- **React Hook Form**: Form state and validation
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Zod integration with React Hook Form

### Development Tools
- **Replit Plugins**: Development banner, error modal, cartographer
- **PostCSS**: CSS processing with Autoprefixer

### Payment Integration
- **Fonepay**: Nepal-based payment gateway (mentioned in requirements, not yet implemented)
  - Intended for online payment processing
  - Backend configuration prepared via site settings

### Email Configuration
- **Email Provider**: Gmail API (native Google Workspace integration via Replit)
- **Status**: ✅ ACTIVE - Connected and functional
- **Primary Sender**: Gmail account connected via Replit integrations
- **Admin Inbox**: info@vyomai.cloud (contact forms, booking requests)
- **Implementation**: googleapis v148.0.0 with OAuth2 authentication
- **Not Using**: Microsoft Office 365 (per user preference)

### Email Use Cases
- **Password Reset**: Sends 6-digit verification codes to admin email
- **Contact Forms**: Send to info@vyomai.cloud + user confirmation
- **Booking Requests**: Send to info@vyomai.cloud + booking confirmation
- **System Notifications**: From Gmail account (for admin features)

### Password Reset System
- **Status**: ✅ FULLY FUNCTIONAL
- **Flow**: Request code → 6-digit code sent via Gmail → Verify code → Reset password
- **Code Expiration**: 15 minutes
- **Email Verification**: Only users with registered emails in database can reset passwords
- **Database**: All users persisted in PostgreSQL with email field

### Communication
- **Social Media Integration**: Links to LinkedIn, Instagram, Facebook, WhatsApp, Viber
- **Email Domain**: vyomai.cloud (hosted on Hostinger)
- **Location**: Tokha, Kathmandu, Nepal

### Design Assets
- Custom Nepali flag SVG component
- Google Fonts: Inter, Space Grotesk, Poppins, DM Sans, Fira Code, Geist Mono
- Particle background and mandala pattern effects