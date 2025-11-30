# Employee Attendance System

**Developer Information:**
- **Name:** ShamanthShetty K R
- **College:** Adichunchanagiri Institute of Technology
- **Contact:** +91 9740642860

---

A full-stack attendance tracking system with Employee and Manager roles, built with React, Redux Toolkit, Node.js, Express, and MongoDB.

## Features

### Employee Features
- ✅ Register/Login
- ✅ Mark attendance (Check In / Check Out)
- ✅ View attendance history with calendar view
- ✅ View monthly summary (Present/Absent/Late days)
- ✅ Dashboard with stats

### Manager Features
- ✅ Login
- ✅ View all employees attendance
- ✅ Filter by employee, date, status, department
- ✅ View team attendance summary
- ✅ Export attendance reports (CSV)
- ✅ Dashboard with team stats and charts

## Tech Stack

- **Frontend:** React 18, Redux Toolkit, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd employee-attendance-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/employee_attendance
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
OFFICE_START_TIME=09:00
LATE_THRESHOLD_MINUTES=15
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Seed Database (Optional)
```bash
cd backend
npm run seed
```

This creates sample users and attendance data.

## Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:5000

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:3000

## Demo Accounts

After running the seed script:

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Manager  | manager@company.com    | password123  |
| Employee | john@company.com       | password123  |
| Employee | jane@company.com       | password123  |
| Employee | bob@company.com        | password123  |
| Employee | alice@company.com      | password123  |
| Employee | charlie@company.com    | password123  |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Attendance (Employee)
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my-history` - Get attendance history
- `GET /api/attendance/my-summary` - Get monthly summary
- `GET /api/attendance/today` - Get today's status

### Attendance (Manager)
- `GET /api/attendance/all` - Get all attendance
- `GET /api/attendance/employee/:id` - Get specific employee
- `GET /api/attendance/summary` - Get team summary
- `GET /api/attendance/export` - Export CSV
- `GET /api/attendance/today-status` - Today's status for all

### Dashboard
- `GET /api/dashboard/employee` - Employee stats
- `GET /api/dashboard/manager` - Manager stats

## Project Structure

```
employee-attendance-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` in the `backend` directory and update the values:

```bash
cd backend
cp .env.example .env
```

Required environment variables:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration (default: 7d)
- `OFFICE_START_TIME` - Office start time (default: 09:00)
- `LATE_THRESHOLD_MINUTES` - Minutes after start time to mark as late (default: 15)

## Screenshots

> **Note:** Add screenshots here to showcase the application UI and features.

### Employee Portal
- **Dashboard**: Overview of today's status, monthly stats, and recent attendance
- **Mark Attendance**: Quick check-in/check-out interface
- **History**: Calendar view with color-coded attendance (Green: Present, Red: Absent, Yellow: Late, Orange: Half-Day)
- **Profile**: Employee information and settings

### Manager Portal
- **Dashboard**: Team statistics, weekly trends, department overview, and pending approvals
- **All Attendance**: Comprehensive view with advanced filtering options
- **Team Calendar**: Visual calendar showing team attendance patterns
- **Reports**: Generate and export attendance reports in CSV format

To add screenshots:
1. Take screenshots of key pages
2. Save them in a `screenshots/` folder
3. Update this section with image references: `![Description](./screenshots/image.png)`

## License

ISC

