const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../config/email");

const router = express.Router();

// Safely send notification without interrupting main operation
const sendNotification = async (emailData) => {
  try {
    await sendEmail(emailData);
  } catch (error) {
    console.error("Notification email failed:", error.message);
  }
};

// Escape HTML content
const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
};

// Create project
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

// Get projects
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

// Update project
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

    // Real-time project update
    const io = req.app.get("io");

    io.to(`project_${project._id}`).emit("projectUpdated", {
      projectId: String(project._id),
      project,
    });

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

// Delete project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
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

    // Notify connected project members before deletion
    const io = req.app.get("io");

    io.to(`project_${project._id}`).emit("projectDeleted", {
      projectId: String(project._id),
    });

    await Project.deleteOne({
      _id: project._id,
      owner: req.userId,
    });

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

// Add member + send invitation email
router.post("/:id/members", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Member email is required",
      });
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
      return res.status(404).json({
        message: "User not found",
      });
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

    // Real-time member addition event
    const io = req.app.get("io");

    io.to(`project_${project._id}`).emit("memberAdded", {
      projectId: String(project._id),
      member: {
        _id: String(member._id),
        name: member.name,
        email: member.email,
      },
    });

    console.log("Member added:", member.email);
    console.log("Starting invitation email...");

    const owner = await User.findById(req.userId).select("name");

    // Invitation email
    await sendNotification({
      to: member.email,
      subject: `You have been added to ${project.name} - TaskFlow`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to TaskFlow!</h2>

          <p>Hello ${escapeHtml(member.name)},</p>

          <p>You have been added to a project on TaskFlow.</p>

          <h3>Project Details</h3>

          <p>
            <strong>Project:</strong>
            ${escapeHtml(project.name)}
          </p>

          <p>
            <strong>Added by:</strong>
            ${escapeHtml(owner?.name || "Project Owner")}
          </p>

          <p>
            Open TaskFlow to view your project and collaborate
            with your team.
          </p>

          <p>Thank you,<br>TaskFlow Team</p>
        </div>
      `,
    });

    console.log("Invitation email process finished.");

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

// Create project task + send assignment email
router.post("/:id/tasks", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      deadline,
      assignedTo,
    } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
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
      return res.status(400).json({
        message: "Valid assignee ID is required",
      });
    }

    const isMember = project.members.some(
      (id) => id.toString() === String(assignedTo)
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

    // Real-time task creation event
    const io = req.app.get("io");

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("user", "name email");

    io.to(`project_${project._id}`).emit("taskCreated", {
      projectId: String(project._id),
      task: populatedTask,
    });

    // Find assigned member and owner
    const assignee = await User.findById(assignedTo)
      .select("name email");

    const owner = await User.findById(req.userId)
      .select("name");

    // Assignment email
    if (assignee) {
      await sendNotification({
        to: assignee.email,
        subject: `New Task Assigned: ${task.title} - TaskFlow`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Task Assigned!</h2>

            <p>Hello ${escapeHtml(assignee.name)},</p>

            <p>
              A new task has been assigned to you in TaskFlow.
            </p>

            <h3>Task Details</h3>

            <p>
              <strong>Task:</strong>
              ${escapeHtml(task.title)}
            </p>

            <p>
              <strong>Project:</strong>
              ${escapeHtml(project.name)}
            </p>

            <p>
              <strong>Description:</strong>
              ${escapeHtml(task.description || "No description")}
            </p>

            <p>
              <strong>Priority:</strong>
              ${escapeHtml(task.priority)}
            </p>

            <p>
              <strong>Deadline:</strong>
              ${
                task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "Not specified"
              }
            </p>

            <p>
              <strong>Assigned by:</strong>
              ${escapeHtml(owner?.name || "Project Owner")}
            </p>

            <p>
              Please log in to TaskFlow to view and complete your task.
            </p>

            <p>Thank you,<br>TaskFlow Team</p>
          </div>
        `,
      });
    }

    return res.status(201).json({
      message: "Task assigned successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Assign task error:", error);

    return res.status(500).json({
      message: "Server error while assigning task",
    });
  }
});

// Get project tasks
router.get("/:id/tasks", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { members: req.userId },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or access denied",
      });
    }

    const tasks = await Task.find({
      project: project._id,
    })
      .populate("assignedTo", "name email")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Project tasks fetched successfully",
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Fetch project tasks error:", error);

    return res.status(500).json({
      message: "Server error while fetching project tasks",
    });
  }
});

module.exports = router;