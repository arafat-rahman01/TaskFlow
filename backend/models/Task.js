
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },

        deadline: {
            type: Date,
            default: null
        },

        completed: {
            type: Boolean,
            default: false
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        
        project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null
        },
        
        assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
        }

    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
