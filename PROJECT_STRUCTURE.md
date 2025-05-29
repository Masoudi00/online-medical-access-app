# Project Structure

This document provides an overview of the project structure, which follows a modern full-stack architecture with a Next.js frontend and FastAPI backend.

## Frontend (Next.js)

```
frontend/
├── app/                      # Next.js 13+ app directory (main application code)
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # UI component library
│   │   ├── Navbar.tsx      # Navigation bar component
│   │   ├── Footer.tsx      # Footer component
│   │   ├── ProfilePopUp.tsx # Profile popup component
│   │   ├── ProfileForm.tsx  # Profile editing form
│   │   ├── SignupFormDemo.tsx # Signup form component
│   │   ├── SigninFormDemo.tsx # Signin form component
│   │   ├── CarouselDemo.tsx   # Carousel component
│   │   ├── Hero.tsx          # Hero section component
│   │   └── ThreeDCardDemo.tsx # 3D card component
│   ├── notifications/       # Notification related components and logic
│   ├── admin/              # Admin panel related pages
│   │   └── page.tsx        # Admin dashboard page
│   ├── utils/              # Utility functions and helpers
│   ├── register/           # Registration related pages
│   │   └── page.tsx        # Registration page
│   ├── profile/            # User profile related pages
│   │   └── page.tsx        # Profile page
│   ├── login/              # Authentication related pages
│   │   └── page.tsx        # Login page
│   ├── lib/                # Library code and shared functionality
│   ├── dashboard/          # Dashboard related pages
│   │   └── page.tsx        # Main dashboard page
│   ├── context/            # React context providers
│   ├── appointments/       # Appointment management pages
│   │   └── page.tsx        # Appointments page
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page component
│   └── globals.css        # Global styles
├── public/                 # Static files served by Next.js
├── .next/                  # Next.js build output
├── node_modules/          # Node.js dependencies
├── package.json           # Frontend dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── next.config.ts        # Next.js configuration
└── postcss.config.mjs    # PostCSS configuration

## Backend (FastAPI)

```
backend/
├── app/                    # Main application package
│   ├── controllers/       # Request handlers and business logic
│   ├── models/           # Database models and schemas
│   │   ├── user.py      # User model
│   │   ├── appointment.py # Appointment model
│   │   └── profile.py   # Profile model
│   ├── routes/           # API route definitions
│   │   ├── admin_routes.py     # Admin endpoints
│   │   ├── profile_routes.py   # Profile endpoints
│   │   ├── auth_routes.py      # Authentication endpoints
│   │   ├── appointment_routes.py # Appointment endpoints
│   │   └── user_routes.py      # User endpoints
│   ├── schemas/          # Pydantic schemas for request/response
│   │   ├── user.py      # User schemas
│   │   ├── appointment.py # Appointment schemas
│   │   └── profile.py   # Profile schemas
│   ├── services/         # Business logic and external service integration
│   ├── middleware/       # Custom middleware
│   │   ├── auth.py      # Authentication middleware
│   │   └── error.py     # Error handling middleware
│   ├── core/            # Core application configuration
│   │   ├── config.py    # Application configuration
│   │   └── database.py  # Database configuration
│   └── utils/           # Utility functions and helpers
├── config/               # Configuration files
│   └── settings.py      # Environment settings
├── tests/               # Test files
├── migrations/          # Database migration files
├── uploads/            # File upload directory
├── main.py             # Application entry point
├── requirements.txt    # Python dependencies
└── alembic.ini        # Alembic (migration tool) configuration
```

## Key Features

1. **Frontend**
   - Modern Next.js 13+ with App Router
   - TypeScript support
   - Component-based architecture
   - Responsive design
   - Authentication and authorization
   - Dashboard and admin interfaces
   - Appointment management system

2. **Backend**
   - FastAPI for high-performance API
   - SQLAlchemy for database operations
   - Alembic for database migrations
   - JWT authentication
   - File upload handling
   - Modular architecture with separation of concerns
   - API documentation with Swagger/OpenAPI

## Development Setup

1. **Frontend**
   - Node.js and npm/yarn required
   - Install dependencies: `npm install`
   - Run development server: `npm run dev`

2. **Backend**
   - Python 3.7+ required
   - Create virtual environment: `python -m venv venv`
   - Activate virtual environment
   - Install dependencies: `pip install -r requirements.txt`
   - Run development server: `python main.py` 