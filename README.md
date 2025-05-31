# Online Medical Service Platform

A modern, full-stack medical appointment management system built with Next.js and FastAPI, designed to streamline the connection between patients and healthcare providers.

## 🌟 Features

- **User Authentication & Profiles**
  - Secure registration and login system
  - Comprehensive user profiles for patients and healthcare providers
  - JWT-based authentication
  - Role-based access control (Admin, Doctor, Patient)
  - User banning functionality for administrators

- **Appointment Management**
  - Schedule and manage medical appointments
  - View appointment history
  - Real-time availability updates
  - Doctor calendar management

- **Document Management**
  - Secure document upload and storage
  - Role-based document access
  - Support for multiple file formats (PDF, DOC, DOCX, JPG, PNG)
  - Size limit enforcement (10MB per file)

- **Community Features**
  - Discussion forum
  - Comment system with nested replies
  - Like functionality
  - Role-specific badges ([DOCTOR], [ADMIN])

- **Notification System**
  - Real-time notifications for:
    - New appointments
    - Document uploads
    - Comment replies and likes
    - Administrative actions
  - Mark as read functionality
  - Notification clearing

- **User Dashboard**
  - Personalized dashboard for users
  - Appointment tracking
  - Profile management
  - Document management
  - Theme customization
  - Language selection (English/French)

## 🚀 Tech Stack

### Backend (FastAPI)
- FastAPI v0.115.12
- PostgreSQL (Database)
- SQLAlchemy v2.0.40 (ORM)
- Pydantic v2.11.4
- JWT Authentication
- Uvicorn v0.34.2
- Alembic (Database migrations)

### Frontend (Next.js)
- Next.js 14
- TypeScript
- Tailwind CSS
- React Hook Form
- Axios
- Context API for state management
- React Hot Toast for notifications

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Git
- Node.js (v16.0.0 or higher)
- Python (v3.8 or higher)
- PostgreSQL (v12 or higher)
- A code editor (VS Code recommended)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/online-medical-access-app.git
cd online-medical-access-app
```

### 2. Backend Setup

#### 2.1 Create Python Virtual Environment
```bash
# Windows
python -m venv backend/venv
backend\venv\Scripts\activate

# macOS/Linux
python3 -m venv backend/venv
source backend/venv/bin/activate
```

#### 2.2 Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### 2.3 Database Setup
1. Create a PostgreSQL database:
```bash
# Log into PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE medical_app;
```

2. Create `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost/medical_app
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM=HS256
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

3. Run database migrations:
```bash
# Initialize Alembic if migrations folder doesn't exist
alembic init migrations

# Generate and run migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

#### 2.4 Start Backend Server
```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`
- Alternative API docs: `http://localhost:8000/redoc`

### 3. Frontend Setup

#### 3.1 Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### 3.2 Configure Environment
Create `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 3.3 Start Frontend Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Common Issues & Solutions

### Backend Issues

1. **Database Connection Error**
   ```
   Error: could not connect to server: Connection refused
   ```
   **Solution:**
   - Check if PostgreSQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Alembic Migration Error**
   ```
   ERROR [root] Error: Target database is not up to date
   ```
   **Solution:**
   ```bash
   # Reset migrations
   alembic downgrade base
   # Remove migrations folder
   rm -rf migrations/
   # Reinitialize
   alembic init migrations
   # Create new migration
   alembic revision --autogenerate -m "Fresh start"
   # Apply migration
   alembic upgrade head
   ```

3. **Module Not Found Errors**
   ```
   ModuleNotFoundError: No module named 'xyz'
   ```
   **Solution:**
   ```bash
   pip install -r requirements.txt --no-cache-dir
   ```

4. **File Upload Issues**
   ```
   Error: Could not save the file
   ```
   **Solution:**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure correct content types

5. **Notification Issues**
   ```
   Error: Failed to send notification
   ```
   **Solution:**
   - Check database connectivity
   - Verify user permissions
   - Clear notification cache

### Frontend Issues

1. **Node Modules Issues**
   ```
   Error: Cannot find module 'xyz'
   ```
   **Solution:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Build Errors**
   ```
   Error: Type error: Cannot find name 'xyz'
   ```
   **Solution:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run dev
   ```

3. **API Connection Error**
   ```
   Error: Network Error
   ```
   **Solution:**
   - Check if backend server is running
   - Verify NEXT_PUBLIC_API_URL in `.env.local`
   - Check CORS settings in backend

4. **Document Upload Issues**
   ```
   Error: 422 Unprocessable Content
   ```
   **Solution:**
   - Check file size (max 10MB)
   - Verify file type (PDF, DOC, DOCX, JPG, PNG)
   - Ensure proper authentication

5. **Notification Display Issues**
   ```
   Error: Failed to load notifications
   ```
   **Solution:**
   - Check WebSocket connection
   - Clear browser cache
   - Verify authentication token

## 📦 Production Deployment

### Backend Deployment
1. Set up a production PostgreSQL database
2. Update `.env` with production values
3. Run migrations on production database
4. Deploy using Gunicorn:
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Frontend Deployment
1. Build the production version:
   ```bash
   npm run build
   ```
2. Deploy the `.next` folder to your hosting service
3. Set up environment variables on your hosting platform

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📫 Support

For support, email [your-email@example.com] or create an issue in the repository.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contact

email : [mohamed.elmasoudi.dev@gmail.com] .

