# TaskFlow — Student Task and Project Management System

TaskFlow is a MERN stack web application designed to help students organize, manage, and track their academic tasks efficiently.

## Features

- **User Authentication:** Register and log in securely.
- **Task Management:** Create, view, edit, and delete personal tasks.
- **Task Status:** Mark tasks as completed or pending.
- **Priority Management:** Assign Low, Medium, or High priority to tasks.
- **Deadline Management:** Set and update task deadlines.
- **Search:** Find tasks by title.
- **Filtering:** Filter tasks by status.
- **Sorting:** Sort tasks by newest first, priority, or earliest deadline.
- **Responsive UI:** Use the application on desktop and mobile screens.
- **Task Ownership:** Users can access and manage their own tasks.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Token (JWT) |
| Password Security | bcryptjs |
| API Testing | Hoppscotch, PowerShell |

## Project Structure

```text
TaskFlow/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── db.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── index.html
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB
- Git (optional, for version control)

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd TaskFlow
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=m