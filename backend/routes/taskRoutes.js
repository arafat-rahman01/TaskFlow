
const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new task
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description, priority, deadline } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const task = await Task.create({
            title: title.trim(),
            description: description || "",
            priority: priority || "Medium",
            deadline: deadline || null,
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

// Update a task
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, description, completed, priority, deadline } = req.body;

        const updates = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    message: "Task title is required"
                });
            }
            updates.title = title.trim();
        }

        if (description !== undefined) {
            updates.description = description;
        }

        if (completed !== undefined) {
            updates.completed = completed;
        }

        if (priority !== undefined) {
            updates.priority = priority;
        }

        if (deadline !== undefined) {
            updates.deadline = deadline || null;
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.userId
            },
            updates,
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

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid task data. Check priority and deadline."
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
});

// Delete a task
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        console.error("Delete task error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
