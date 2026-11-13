
const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new personal task
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

// Get all personal tasks of logged-in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.userId,
            project: null
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
        const {
            title,
            description,
            completed,
            priority,
            deadline
        } = req.body;

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
            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    message: "Completed must be true or false"
                });
            }

            updates.completed = completed;
        }

        if (priority !== undefined) {
            updates.priority = priority;
        }

        if (deadline !== undefined) {
            updates.deadline = deadline || null;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No update data provided"
            });
        }

        // Find the task
        const existingTask = await Task.findById(req.params.id);

        if (!existingTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // PERSONAL TASK
        if (!existingTask.project) {
            if (String(existingTask.user) !== String(req.userId)) {
                return res.status(403).json({
                    message: "You are not authorized to update this task"
                });
            }
        }

        // PROJECT TASK
        else {
            const project = await Project.findById(existingTask.project);

            if (!project) {
                return res.status(404).json({
                    message: "Project not found"
                });
            }

            const isOwner =
                String(project.owner) === String(req.userId);

            const isProjectMember = project.members.some(
                member => String(member) === String(req.userId)
            );

            const isAssignedMember =
                String(existingTask.assignedTo) === String(req.userId);

            // Project owner can update all task information
            if (isOwner) {
                // Owner permission
            }

            // Assigned member can only update completion status
            else if (isProjectMember && isAssignedMember) {
                const allowedFields = ["completed"];

                const hasUnauthorizedField = Object.keys(updates).some(
                    field => !allowedFields.includes(field)
                );

                if (hasUnauthorizedField) {
                    return res.status(403).json({
                        message: "Members can only update task completion status"
                    });
                }

                if (completed === undefined) {
                    return res.status(400).json({
                        message: "Only task completion status can be updated"
                    });
                }
            }

            // Other users cannot update project tasks
            else {
                return res.status(403).json({
                    message: "You are not authorized to update this project task"
                });
            }
        }

        
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                returnDocument: "after",
                runValidators: true
            }
        );


        return res.status(200).json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        console.error("Update task error:", error);

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
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
