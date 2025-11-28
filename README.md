# Medical Clinic Management System

Full-stack application for managing medical clinic operations.

## 📁 Project Structure

```
medical-clinic-management-system/
├── backend/         # Express + Prisma API
├── frontend/        # Frontend application
└── docs/           # Documentation
```

## 🚀 Getting Started

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL in .env
npx prisma generate
npx prisma migrate dev
npm start
```

Backend runs on: `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173` (or configured port)

## 📚 Documentation

- **Backend Documentation**: See `backend/README.md`
- **Team Collaboration Guide**: See `team-collaboration-guide.pdf`
- **Project Guide**: See artifacts folder

## 👥 Team Structure

- **Database Designer**: Works on `backend/prisma/schema.prisma`
- **Queries Developer**: Works on `backend/src/services/`
- **Business Logic Developer**: Works on `backend/src/controllers/` and `backend/src/routes/`
- **Frontend Developer**: Works on `frontend/`

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL / MySQL / SQLite

### Frontend
- React / Vue / Angular (TBD)
- (Add your frontend stack here)

## 📝 Development Workflow

1. Database Designer creates models in `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev` to apply changes
3. Queries Developer creates services in `backend/src/services/`
4. Business Logic Developer uses services in controllers and routes
5. Frontend Developer consumes API endpoints

## 🔗 API Endpoints

Base URL: `http://localhost:3000/api`

- Health check: `GET /`
- (Add your endpoints here as you develop)

## 📦 Scripts

### Backend
```bash
npm start          # Start server
npm run dev        # Development mode with nodemon
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
```

## 🤝 Contributing

See team collaboration guide for detailed workflow.
