# Project Structure

This document provides a detailed overview of the project's architecture and organization.

## Frontend Structure (Next.js)

```
frontend/
├── app/                    # Next.js App Router directory
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components
│   │   └── shared/       # Shared components across pages
│   ├── context/          # React Context providers
│   │   ├── AuthContext   # Authentication context
│   │   └── LanguageContext # Internationalization context
│   ├── lib/              # Utility functions and configurations
│   ├── styles/           # Global styles and Tailwind configurations
│   ├── hooks/            # Custom React hooks
│   ├── api/              # API integration and services
│   ├── types/            # TypeScript type definitions
│   └── (routes)/         # Application routes and pages
│       ├── admin/        # Admin dashboard
│       ├── doctor/       # Doctor-specific pages
│       ├── community/    # Community forum
│       └── settings/     # User settings
├── public/               # Static assets
├── .next/               # Next.js build output
├── node_modules/        # Dependencies
├── next.config.js       # Next.js configuration
├── package.json         # Frontend dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── postcss.config.mjs  # PostCSS configuration

## Backend Structure (FastAPI)

```
backend/
├── app/                 # Main application package
│   ├── routes/         # API endpoints and routes
│   │   ├── admin_routes.py    # Admin functionality
│   │   ├── auth_routes.py     # Authentication
│   │   ├── community_routes.py # Community features
│   │   ├── doctor_routes.py   # Doctor-specific routes
│   │   ├── notification_routes.py # Notification system
│   │   └── profile_routes.py  # Profile management
│   ├── models/        # SQLAlchemy models
│   │   ├── user.py    # User model
│   │   ├── document.py # Document model
│   │   ├── comment.py  # Comment and Reply models
│   │   └── notification.py # Notification model
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   └── utils/        # Utility functions
├── migrations/        # Alembic migrations
├── uploads/          # File upload directory
│   ├── documents/    # User documents
│   └── profile_pictures/ # Profile pictures
├── tests/           # Test files
├── venv/            # Python virtual environment
├── main.py          # Application entry point
├── requirements.txt # Python dependencies
└── alembic.ini     # Alembic configuration
```

## Key Technologies

### Frontend
- Next.js 15.3.2
- React 19
- TypeScript
- Tailwind CSS
- Ant Design
- Radix UI
- GSAP (Animations)
- Axios
- React Hot Toast
- Sonner

### Backend
- FastAPI 0.115.12
- SQLAlchemy 2.0.40
- Alembic
- PostgreSQL
- Python-Jose (JWT)
- Bcrypt
- Uvicorn 0.34.2

## Database Schema

### Users
- id: Integer (Primary Key)
- email: String (Unique)
- first_name: String
- last_name: String
- password: String
- role: String (user, doctor, admin)
- profile_picture: String (Optional)
- language: String
- theme: String
- created_at: DateTime

### Documents
- id: Integer (Primary Key)
- user_id: Integer (Foreign Key)
- name: String
- file_path: String
- content_type: String
- timestamp: String
- created_at: DateTime

### Comments
- id: Integer (Primary Key)
- user_id: Integer (Foreign Key)
- content: Text
- created_at: DateTime
- updated_at: DateTime

### Replies
- id: Integer (Primary Key)
- comment_id: Integer (Foreign Key)
- user_id: Integer (Foreign Key)
- content: Text
- created_at: DateTime
- updated_at: DateTime

### Notifications
- id: Integer (Primary Key)
- user_id: Integer (Foreign Key)
- actor_id: Integer (Foreign Key)
- type: String
- message: String
- link: String
- notification_metadata: JSON
- created_at: DateTime
- is_read: Integer

## API Structure

### Authentication
- POST /api/v1/auth/login
- POST /api/v1/auth/register
- POST /api/v1/auth/refresh-token

### Users
- GET /api/v1/users/me
- PUT /api/v1/users/me
- GET /api/v1/users/{id}

### Admin
- DELETE /admin/users/{user_id}/ban
- GET /admin/users
- GET /admin/statistics

### Documents
- POST /profile/me/documents
- GET /uploads/documents/{file_path}
- GET /doctor/documents/{document_id}
- POST /doctor/patients/{patient_id}/documents

### Community
- GET /community/posts
- POST /community/posts
- POST /community/posts/{post_id}/comments
- PUT /community/comments/{comment_id}/like
- DELETE /community/comments/{comment_id}

### Notifications
- GET /notifications
- PUT /notifications/{id}/read
- DELETE /notifications/clear-all 