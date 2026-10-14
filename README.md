# TaskFlow — Student Task and Project Management System

TaskFlow is a MERN stack web application designed to help university students organize academic tasks, manage project work, and track task completion in one place.

## Features

- User registration and login
- Password hashing using bcryptjs
- JWT-based authentication
- Create new tasks
- View personal tasks
- Edit existing tasks
- Delete tasks
- Mark tasks as completed or pending
- Filter tasks by status
- Responsive user interface

## Technologies Used

**Frontend**
- React.js
- Vite
- HTML and CSS
- JavaScript

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- JSON Web Token (JWT)

## Project Structure

    TaskFlow/
    ├── backend/
    │   ├── models/
    │   ├── routes/
    │   ├── middleware/
    │   ├── server.js
    │   ├── db.js
    │   └── package.json
    ├── frontend/
    │   ├── src/
    │   │   ├── App.jsx
    │   │   └── App.css
    │   └── package.json
    └── README.md

## Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB
- Git (optional)

### 1. Clone the repository

    git clone YOUR_GITHUB_REPOSITORY_URL
    cd TaskFlow

### 2. Configure the backend

    cd backend
    npm install

Create a `.env` file inside the backend folder and configure:

    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/taskflow
    JWT_SECRET=replace_with_a_long_random_secret

Use your existing environment variable names if they differ. Never commit `.env` or real secrets to GitHub.

### 3. Start the backend

    npm run dev

The backend runs on port 5000 unless configured otherwise.

### 4. Start the frontend

Open a second terminal:

    cd frontend
    npm install
    npm run dev

Open the local URL displayed by Vite in your browser.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get authenticated user information |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | Retrieve the user's tasks |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

Protected endpoints require a valid JWT access token in the Authorization header.

## Security

- Passwords are hashed before storage.
- JWT authentication protects private routes.
- Task access should be restricted to the authenticated task owner.
- Environment variables are used for database configuration and JWT secrets.

## Future Improvements

- Task deadlines and reminders
- Task priority levels
- Search and sorting
- Improved mobile interface
- Deployment to a production environment

## Author

Developed as a university Software Engineering lab project.
