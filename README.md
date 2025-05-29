# Online Medical Service Platform

A modern, full-stack medical appointment management system built with Next.js and FastAPI, designed to streamline the connection between patients and healthcare providers.

## 🌟 Features

- **User Authentication & Profiles**
  - Secure registration and login system
  - Comprehensive user profiles for patients and healthcare providers
  - JWT-based authentication

- **Appointment Management**
  - Schedule and manage medical appointments
  - View appointment history
  - Real-time availability updates

- **User Dashboard**
  - Personalized dashboard for users
  - Appointment tracking
  - Profile management

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

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

## 🛠️ Installation & Setup

### Backend Setup

1. Clone the repository and navigate to backend:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Unix/MacOS
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Create `.env` file in backend directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost/dbname
   SECRET_KEY=your_secret_key
   ```

5. Run migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## 🔍 API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📁 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── schemas/
│   ├── alembic/
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
│
└── frontend/
    ├── app/
    ├── public/
    ├── components/
    ├── styles/
    ├── package.json
    └── tsconfig.json
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Secure session management
- Input validation and sanitization
- CORS protection

## 🧪 Testing

### Backend Tests
```bash
cd backend
./venv/Scripts/Activate
uvicorn main:app --reload
```

### Frontend Tests
```bash
cd frontend
npm run dev
```

## 🚀 Deployment

### Backend
- Supports Docker containerization
- Can be deployed to any cloud platform supporting Python (AWS, GCP, Azure)

### Frontend
- Optimized for Vercel deployment
- Static export available for traditional hosting


## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🤝 Contact

email : [mohamed.elmasoudi.dev@gmail.com] .

