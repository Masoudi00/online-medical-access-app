# Online Medical Service Platform

This project is a full-stack application built to provide online medical services, connecting patients with healthcare providers. The system is built with FastAPI backend and will include a modern frontend interface.

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.8 or higher
- PostgreSQL 12 or higher
- Node.js 16 or higher (for frontend development)
- Git

## Project Overview

The platform aims to facilitate:
- Patient account management and authentication
- Medical appointment scheduling
- Healthcare provider profiles and availability
- Medical record management
- Secure communication between patients and healthcare providers

## Tech Stack

### Backend
- **Framework**: FastAPI (v0.115.12) - Modern, fast web framework for building APIs
- **Database**: PostgreSQL - Robust, scalable relational database
- **ORM**: SQLAlchemy (v2.0.40) - SQL toolkit and ORM
- **Data Validation**: Pydantic (v2.11.4) - Data validation using Python type annotations
- **Authentication**: JWT (JSON Web Tokens) - Secure token-based authentication
- **Server**: Uvicorn (v0.34.2) - ASGI server implementation
- **Database Driver**: psycopg2-binary - PostgreSQL adapter for Python
- **Security**: bcrypt - Password hashing and security

### Frontend
- **Framework**: Next.js 14 - React framework with server-side rendering
- **Language**: TypeScript - Type-safe JavaScript
- **Styling**: Tailwind CSS - Utility-first CSS framework
- **State Management**: React Context API - Built-in state management
- **HTTP Client**: Axios - Promise-based HTTP client
- **Form Handling**: React Hook Form - Form validation and handling
- **UI Components**: Custom components with Tailwind CSS
- **Authentication**: JWT token management
- **Routing**: Next.js App Router - File-system based routing

### Development Tools
- **Version Control**: Git
- **Package Manager**: 
  - Backend: pip (Python)
  - Frontend: npm (Node.js)
- **API Documentation**: Swagger/OpenAPI
- **Environment Management**: 
  - Backend: Python virtual environment
  - Frontend: Node.js environment
- **Code Quality**: 
  - ESLint - JavaScript/TypeScript linting
  - Prettier - Code formatting
  - Black - Python code formatting

### Deployment & Infrastructure
- **Containerization**: Docker (planned)
- **CI/CD**: GitHub Actions (planned)
- **Hosting**: 
  - Backend: TBD
  - Frontend: Vercel (recommended for Next.js)

## Project Structure

```
.
├── backend/
│   ├── main.py           # FastAPI application and endpoints
│   ├── crud.py          # Database CRUD operations
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── security.py      # Authentication and security
│   ├── database.py      # Database configuration
│   └── requirements.txt # Python dependencies
└── frontend/
    └── (To be implemented)
```

## Backend Features

The backend is built with FastAPI and provides:

### Authentication System
- User registration with comprehensive profile information:
  - CIN (National Identity Number)
  - First Name
  - Last Name
  - Email (used for authentication)
  - Gender
  - Password (securely hashed)
  - Phone Number
- Secure login using email and password
- JWT token-based authentication

### API Endpoints

#### Authentication
- `POST /auth/login` - User login (use email for authentication)
- `POST /user` - Create new user account
- `GET /users/me` - Get current user profile

#### User Management
- `POST /users/{user_id}` - Get user by ID
- `GET /users` - List all users (with pagination)

### Technologies Used

- **FastAPI** (v0.115.12) - Modern, fast web framework for building APIs
- **SQLAlchemy** (v2.0.40) - SQL toolkit and ORM
- **Pydantic** (v2.11.4) - Data validation using Python type annotations
- **PostgreSQL** - Database (via psycopg2-binary)
- **JWT** - JSON Web Tokens for secure authentication
- **Uvicorn** (v0.34.2) - ASGI server implementation

## Setup and Installation

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   Create a `.env` file in the backend directory with:
   ```
   DATABASE_URL=postgresql://user:password@localhost/dbname
   ```

4. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

To run the backend tests:
```bash
cd backend
pytest
```

For frontend tests:
```bash
cd frontend
npm test
```

## API Documentation

Once the server is running, you can access:
- Interactive API documentation (Swagger UI): `http://localhost:8000/docs`
- Alternative API documentation (ReDoc): `http://localhost:8000/redoc`

### Authentication Flow
1. Register a new account using `/user` endpoint with required fields
2. Login using `/auth/login` endpoint with your email and password
3. Use the received JWT token in the Authorization header for protected endpoints

## Planned Features

- Appointment scheduling system
- Medical record management
- Real-time chat between patients and healthcare providers
- Prescription management
- Integration with medical imaging services
- Telemedicine video consultation
- Emergency service integration
- Medical report generation

## Security Measures

- Password hashing using bcrypt
- JWT token-based authentication
- Secure email verification
- Data encryption for sensitive medical information
- HIPAA compliance considerations (to be implemented)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team. 