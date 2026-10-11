const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new task
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const task = await Task.create({
            title,
            description,
            user: req.userId
        });

        return res.status(201).json({
            message: "Task created successfully",
            task
        });
    } catch (error) {
        console.error("Create task error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

// Get all tasks of logged-in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Tasks fetched successfully",
            count: tasks.length,
            tasks
        });
    } catch (error) {
        console.error("Fetch tasks error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});


/* Update a task */
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, description, completed } = req.body;

        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.userId
            },
            {
                title,
                description,
                completed
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task updated successfully",
            task
        });
    } catch (error) {
        console.error("Update task error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;