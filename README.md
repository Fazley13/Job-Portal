# Job Portal System

A web application for **Students, Alumni, Employers, and Admins** to manage jobs, applications, and career paths. Users can search jobs, track applications in real-time, view company profiles, and get career suggestions.

## Features
- Job search and details
- Career path suggestions
- Real-time application tracking
- Company profile display
- Events and networking
- Role-based dashboards: Student, Alumni, Employer, Admin

## Tech Stack
- Frontend: React, Tailwind CSS, Vite
- Backend: Node.js, Express, MongoDB
- Real-time updates: Socket.IO

## Setup

### Backend
cd backend  
npm install  
node server.js

Set up .env with your MongoDB URI and JWT secret

### Frontend
cd frontend  
npm install  
npm run dev





## Setup after the redesign

```bash
# backend
cd backend && npm install && npm run dev
# create the first admin (admin self-registration is disabled for security)
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=StrongPass1 npm run seed:admin

# frontend
cd frontend && npm install && npm run dev
```

Set `VITE_API_URL` in `frontend/.env` if the backend is not on `http://localhost:8080` (see `.env.example`).
