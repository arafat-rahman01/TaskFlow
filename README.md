# TaskFlow – Task and Project Management System

## 1. Project Overview

TaskFlow is a web-based task and project management system designed to help students and teams organize their tasks, manage group projects, assign responsibilities, and track project progress efficiently.

The system provides personal task management as well as collaborative project management features.

## 2. Key Features

### User Authentication
- User Registration
- User Login
- JWT-based Authentication
- Protected Routes

### Personal Task Management
- Create, Read, Update, and Delete Tasks
- Set Task Priority (Low, Medium, High)
- Set Task Deadlines
- Mark Tasks as Completed
- Search, Filter, and Sort Tasks

### Dashboard
- Total Tasks
- Completed Tasks
- Pending Tasks
- Task Completion Rate
- Upcoming Deadlines

### Project Management
- Create Projects
- View Existing Projects
- Update Project Information
- Delete Projects
- Project Details Page

### Group Management
- Add Members by Email
- View Project Members
- Create Tasks Within Projects
- Assign Tasks to Team Members
- View Project Tasks
- Assigned Members Can Update Task Completion

### Project Progress Tracking
- Total Project Tasks
- Completed Project Tasks
- Project Completion Percentage
- Progress Bar

## 3. Technologies Used

### Frontend
- React.js
- JavaScript
- CSS
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Development Tools
- Visual Studio Code
- Git and GitHub
- Postman

## 4. Project Structure

```text
TaskFlow/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── db/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## 5. Installation and Setup

### Prerequisites
- Node.js
- npm
- MongoDB
- Git

### Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd TaskFlow
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and configure your MongoDB connection, JWT secret, and other required environment variables using the names expected by your backend code.

Start the backend development server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL provided by Vite in your browser.

## 6. API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/tasks` | Get personal tasks |
| POST | `/api/tasks` | Create personal task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/projects` | Get user projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add project member |
| POST | `/api/projects/:id/tasks` | Create project task |
| GET | `/api/projects/:id/tasks` | Get project tasks |

## 7. Security

- JWT-based authentication
- Protected API routes
- Project owner authorization
- Project member access control
- Task assignment permission validation

## 8. Production Build

To create a frontend production build:

```bash
cd frontend
npm run build
```

The production files are generated inside the `dist` directory.

## 9. Future Improvements

- Email Notifications
- Real-time Team Collaboration
- File Attachments
- Advanced Project Analytics
- Calendar Integration

## 10. Conclusion

TaskFlow provides an organized platform for personal productivity and collaborative project management. It helps users manage tasks, coordinate with team members, and monitor project progress through a simple web interface.

---

**Project Name:** TaskFlow  
**Project Type:** Web-Based Task and Project Management System  
**Architecture:** MERN Stack
