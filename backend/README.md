# Backend - Medical Clinic Management System

Express.js + Prisma backend API.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start server
npm start
```

Server runs on: `http://localhost:3000`

## 📂 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── config/
│   │   └── database.js     # Prisma connection
│   ├── controllers/        # Request handlers
│   ├── routes/             # API routes
│   ├── services/           # Database queries
│   ├── middlewares/        # Custom middlewares
│   ├── templates/          # Code templates
│   ├── app.js             # Express setup
│   └── server.js          # Entry point
└── package.json
```

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start with nodemon (requires nodemon)

## 🗄️ Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## 📋 Adding New Features

See templates in `src/templates/` for:
- Service layer
- Controllers
- Routes
- Middlewares

Detailed guide: See `project-guide.md` in artifacts folder.

## 🧪 Testing

```bash
# Run service tests
node src/services/tests/[service].service.test.js

# Open Prisma Studio for visual testing
npx prisma studio
```

## 🔗 Environment Variables

Required in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PORT=3000
NODE_ENV=development
```

## 📚 Documentation

- Team Collaboration Guide: `../team-collaboration-guide.pdf`
- Testing Guide: `TESTING-GUIDE.md`
- Templates: `src/templates/README.md`
