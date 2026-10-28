
const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const Task = require("../models/Task");

const router = express.Router();

// Create a new project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || "",
      owner: req.userId,
      members: [req.userId],
    });

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({
      message: "Server error while creating project",
    });
  }
});

// Get projects owned by or shared with the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { members: req.userId },
      ],
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Projects fetched successfully",
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Fetch projects error:", error);
    return res.status(500).json({
      message: "Server error while fetching projects",
    });
  }
});

// Update a project (owner only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Project name cannot be empty",
        });
      }
      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (status !== undefined) {
      if (!["Active", "Completed"].includes(status)) {
        return res.status(400).json({
          message: "Invalid project status",
        });
      }
      project.status = status;
    }

    await project.save();

    return res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({
      message: "Server error while updating project",
    });
  }
});

// Delete a project (owner only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({
      message: "Server error while deleting project",
    });
  }
});


 // Add a team member to a project (owner only)
router.post("/:id/members", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Member email is required" });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner",
      });
    }

    const member = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!member) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyMember = project.members.some(
      (id) => id.toString() === member._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: "User is already a project member",
      });
    }

    project.members.push(member._id);
    await project.save();

    return res.status(200).json({
      message: "Team member added successfully",
      project,
    });
  } catch (error) {
    console.error("Add team member error:", error);
    return res.status(500).json({
      message: "Server error while adding team member",
    });
  }
});

// Assign a task to a project member (owner only)
router.post("/:id/tasks", authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, deadline, assignedTo } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner",
      });
    }

    if (!assignedTo || !mongoose.isValidObjectId(assignedTo)) {
      return res.status(400).json({ message: "Valid assignee ID is required" });
    }

    const isMember = project.members.some(
      (id) => id.toString() === assignedTo
    );

    if (!isMember) {
      return res.status(400).json({
        message: "Assignee must be a project member",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      priority: priority || "Medium",
      deadline: deadline || null,
      user: req.userId,
      project: project._id,
      assignedTo,
    });

    return res.status(201).json({
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    console.error("Assign task error:", error);
    return res.status(500).json({
      message: "Server error while assigning task",
    });
  }
});

module.exports = router;
