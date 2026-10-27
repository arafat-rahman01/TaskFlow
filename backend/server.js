
const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");
require("dotenv").config();

const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");

const connectDB = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

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

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
