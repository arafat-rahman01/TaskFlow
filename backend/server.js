
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");

const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");

const Project = require("./models/Project");
const connectDB = require("./db");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Make Socket.IO available inside API routes
app.set("io", io);

// Authenticate Socket.IO connections using JWT
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        socket.userId = decoded.userId;

        next();
    } catch (error) {
        next(new Error("Invalid or expired token"));
    }
});

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a project only if the user is its owner or member
    socket.on("joinProject", async (projectId) => {
        try {
            if (!mongoose.isValidObjectId(projectId)) {
                socket.emit("socketError", {
                    message: "Invalid project ID"
                });
                return;
            }

            const project = await Project.findOne({
                _id: projectId,
                $or: [
                    { owner: socket.userId },
                    { members: socket.userId }
                ]
            }).select("_id");

            if (!project) {
                socket.emit("socketError", {
                    message: "Project access denied"
                });
                return;
            }

            socket.join(`project_${projectId}`);

            console.log(
                `User ${socket.userId} joined project ${projectId}`
            );

            socket.emit("joinedProject", { projectId });

        } catch (error) {
            console.error("Join project socket error:", error.message);
        }
    });

    // Leave project room
    socket.on("leaveProject", (projectId) => {
        if (typeof projectId !== "string") return;

        socket.leave(`project_${projectId}`);

        console.log(`User left project ${projectId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Express middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "Authenticated successfully",
        userId: req.userId
    });
});

app.get("/", (req, res) => {
    res.send("Welcome to TaskFlow API!");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDB();

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log("Socket.IO server is ready!");
    });
}

startServer();
