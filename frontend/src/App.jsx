
import { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000";

function App() {
  // =========================
  // GENERAL STATES
  // =========================
  const [page, setPage] = useState("home");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // =========================
  // AUTH STATES
  // =========================
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // =========================
  // PERSONAL TASK STATES
  // =========================
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [priority, setPriority] = useState("Medium");
  const [deadline, setDeadline] = useState("");

  // =========================
  // PROJECT STATES
  // =========================
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectMessage, setProjectMessage] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectTasksLoading, setProjectTasksLoading] = useState(false);

  // =========================
  // TEAM MEMBER STATES
  // =========================
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMessage, setMemberMessage] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  // =========================
  // PROJECT TASK FORM STATES
  // =========================
  const [projectTaskTitle, setProjectTaskTitle] = useState("");
  const [projectTaskDescription, setProjectTaskDescription] = useState("");
  const [projectTaskPriority, setProjectTaskPriority] = useState("Medium");
  const [projectTaskDeadline, setProjectTaskDeadline] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [projectTaskMessage, setProjectTaskMessage] = useState("");
  const [projectTaskLoading, setProjectTaskLoading] = useState(false);

  const [showProjectTaskForm, setShowProjectTaskForm] = useState(false);

  // =========================
  // AUTH HELPERS
  // =========================
  const token = () => localStorage.getItem("token");

  const getCurrentUserId = () => {
    try {
      const savedToken = token();
      if (!savedToken) return null;

      const payload = JSON.parse(atob(savedToken.split(".")[1]));
      return payload.userId || payload.id || payload._id || null;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  const isProjectOwner = (project) => {
    const ownerId =
      typeof project?.owner === "object"
        ? project.owner?._id
        : project?.owner;

    return ownerId && currentUserId
      ? String(ownerId) === String(currentUserId)
      : false;
  };

  const getMemberId = (member) => {
    return typeof member === "object" ? member?._id : member;
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");

    setTasks([]);
    setProjects([]);
    setProjectTasks([]);
    setSelectedProject(null);

    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDeadline("");
    setEditingTaskId(null);

    setProjectName("");
    setProjectDescription("");
    setProjectMessage("");
    setShowProjectForm(false);

    setMemberEmail("");
    setMemberMessage("");

    setProjectTaskTitle("");
    setProjectTaskDescription("");
    setProjectTaskDeadline("");
    setProjectTaskPriority("Medium");
    setAssignedTo("");
    setProjectTaskMessage("");

    setFilter("All");
    setSearch("");

    setPage("home");
  };

  // =========================
  // FETCH PERSONAL TASKS
  // =========================
  const fetchTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tasks.");
      }

      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === "dashboard") {
      fetchTasks();
    }
  }, [page]);

  // =========================
  // CREATE PERSONAL TASK
  // =========================
  const handleSaveTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Task title is required.");
      return;
    }

    try {
      const isEditing = editingTaskId !== null;

      const response = await fetch(
        isEditing
          ? `${API_BASE}/api/tasks/${editingTaskId}`
          : `${API_BASE}/api/tasks`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            priority,
            deadline: deadline || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save task.");
      }

      if (isEditing) {
        const updatedTask = data.task || data;

        setTasks((previous) =>
          previous.map((task) =>
            task._id === editingTaskId
              ? { ...task, ...updatedTask }
              : task
          )
        );
      } else {
        const newTask = data.task || data;
        setTasks((previous) => [newTask, ...previous]);
      }

      resetTaskForm();
      setFilter("All");
      setSearch("");
    } catch (err) {
      alert(err.message || "Something went wrong.");
    }
  };

  const resetTaskForm = () => {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDeadline("");
    setEditingTaskId(null);
  };

  // =========================
  // TOGGLE PERSONAL TASK
  // =========================
  const handleToggleTask = async (task) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/tasks/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({
            completed: !task.completed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update task.");
        return;
      }

      setTasks((previous) =>
        previous.map((item) =>
          item._id === task._id
            ? { ...item, ...(data.task || {}) }
            : item
        )
      );
    } catch (err) {
      console.error("Update task error:", err);
      alert("Could not connect to the server.");
    }
  };

  // =========================
  // EDIT PERSONAL TASK
  // =========================
  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(task.priority || "Medium");

    setDeadline(
      task.deadline
        ? new Date(task.deadline).toISOString().slice(0, 10)
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE PERSONAL TASK
  // =========================
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task.");
      }

      setTasks((previous) =>
        previous.filter((task) => task._id !== taskId)
      );
    } catch (err) {
      alert(err.message || "Something went wrong.");
    }
  };

  // =========================
  // PERSONAL TASK STATISTICS
  // =========================
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filter === "All" ||
      (filter === "Pending" && !task.completed) ||
      (filter === "Completed" && task.completed);

    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      (task.title || "").toLowerCase().includes(query) ||
      (task.description || "").toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = {
        High: 3,
        Medium: 2,
        Low: 1,
      };

      return (
        (priorityOrder[b.priority || "Medium"] || 2) -
        (priorityOrder[a.priority || "Medium"] || 2)
      );
    }

    if (sortBy === "deadline") {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;

      return new Date(a.deadline) - new Date(b.deadline);
    }

    return (
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
    );
  });

  // =========================
  // FETCH PROJECTS
  // =========================
  const fetchProjects = async () => {
    setProjectsLoading(true);
    setProjectsError("");

    try {
      const response = await fetch(`${API_BASE}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load projects.");
      }

      setProjects(data.projects || []);
    } catch (err) {
      setProjectsError(err.message || "Could not load projects.");
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    if (page === "projects") {
      fetchProjects();
    }
  }, [page]);

  // =========================
  // CREATE PROJECT
  // =========================
  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setProjectMessage("Project name is required.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create project.");
      }

      setProjectMessage("Project created successfully!");
      setProjectName("");
      setProjectDescription("");
      setShowProjectForm(false);

      await fetchProjects();
    } catch (err) {
      setProjectMessage(err.message || "Server connection failed.");
    }
  };

  // =========================
  // OPEN PROJECT DETAILS
  // =========================
  const openProjectDetails = async (project) => {
    setSelectedProject(project);
    setProjectTasks([]);
    setMemberMessage("");
    setProjectTaskMessage("");
    setShowProjectTaskForm(false);
    setMemberEmail("");

    setPage("projectDetails");

    await fetchProjectTasks(project._id);
  };

  // =========================
  // FETCH PROJECT TASKS
  // =========================
  const fetchProjectTasks = async (projectId) => {
    setProjectTasksLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/projects/${projectId}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load project tasks.");
      }

      setProjectTasks(data.tasks || []);
    } catch (err) {
      setProjectTaskMessage(err.message || "Could not load project tasks.");
    } finally {
      setProjectTasksLoading(false);
    }
  };

  // =========================
  // ADD PROJECT MEMBER
  // =========================
  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!memberEmail.trim()) {
      setMemberMessage("Please enter a member email.");
      return;
    }

    if (!selectedProject) return;

    setMemberLoading(true);
    setMemberMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/projects/${selectedProject._id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({
            email: memberEmail.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add member.");
      }

      setMemberMessage("Member added successfully!");
      setMemberEmail("");

      await fetchProjects();

      const updatedProjectsResponse = await fetch(
        `${API_BASE}/api/projects`,
        {
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      const updatedProjectsData = await updatedProjectsResponse.json();

      if (updatedProjectsResponse.ok) {
        const updatedProject = (updatedProjectsData.projects || []).find(
          (item) => item._id === selectedProject._id
        );

        if (updatedProject) {
          setSelectedProject(updatedProject);
        }
      }
    } catch (err) {
      setMemberMessage(err.message || "Could not add member.");
    } finally {
      setMemberLoading(false);
    }
  };

  // =========================
  // CREATE PROJECT TASK
  // =========================
  const handleCreateProjectTask = async (e) => {
    e.preventDefault();

    if (!selectedProject) return;

    if (!projectTaskTitle.trim()) {
      setProjectTaskMessage("Task title is required.");
      return;
    }

    if (!assignedTo) {
      setProjectTaskMessage("Please assign this task to a project member.");
      return;
    }

    setProjectTaskLoading(true);
    setProjectTaskMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/projects/${selectedProject._id}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({
            title: projectTaskTitle.trim(),
            description: projectTaskDescription.trim(),
            priority: projectTaskPriority,
            deadline: projectTaskDeadline || null,
            assignedTo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create project task.");
      }

      setProjectTaskMessage("Project task created successfully!");

      setProjectTaskTitle("");
      setProjectTaskDescription("");
      setProjectTaskPriority("Medium");
      setProjectTaskDeadline("");
      setAssignedTo("");
      setShowProjectTaskForm(false);

      await fetchProjectTasks(selectedProject._id);
    } catch (err) {
      setProjectTaskMessage(err.message || "Could not create project task.");
    } finally {
      setProjectTaskLoading(false);
    }
  };

  // =========================
  // UPDATE PROJECT TASK STATUS
  // =========================
  const handleToggleProjectTask = async (task) => {
    const creatorId =
      typeof task.user === "object" ? task.user?._id : task.user;

    if (
      !currentUserId ||
      String(creatorId) !== String(currentUserId)
    ) {
      alert(
        "Only the task creator can update this task with the current backend permissions."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/tasks/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({
            completed: !task.completed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update project task.");
      }

      setProjectTasks((previous) =>
        previous.map((item) =>
          item._id === task._id
            ? { ...item, ...(data.task || {}) }
            : item
        )
      );
    } catch (err) {
      alert(err.message || "Could not update project task.");
    }
  };

  // =========================
  // PROJECT PROGRESS
  // =========================
  const projectTotalTasks = projectTasks.length;

  const projectCompletedTasks = projectTasks.filter(
    (task) => task.completed
  ).length;

  const projectPendingTasks =
    projectTotalTasks - projectCompletedTasks;

  const projectProgress = projectTotalTasks
    ? Math.round(
        (projectCompletedTasks / projectTotalTasks) * 100
      )
    : 0;

  // =========================
  // AUTH NAVIGATION
  // =========================
  const openRegister = () => {
    setRegisterError("");
    setRegisterSuccess("");
    setPage("register");
  };

  return (
    <div className="app-shell">
      <nav className="navbar">
        <button
          className="brand"
          type="button"
          onClick={() => setPage(token() ? "dashboard" : "home")}
          aria-label="TaskFlow home"
        >
          <span className="brand-mark">T</span>
          <span>
            Task<span className="brand-accent">Flow</span>
          </span>
        </button>

        <div className="nav-actions">
          {["dashboard", "projects", "projectDetails"].includes(page) ? (
            <>
              <button
                className={`button ${
                  page === "dashboard" ? "button-primary" : "button-ghost"
                }`}
                type="button"
                onClick={() => setPage("dashboard")}
              >
                Dashboard
              </button>

              <button
                className={`button ${
                  page === "projects" || page === "projectDetails"
                    ? "button-primary"
                    : "button-ghost"
                }`}
                type="button"
                onClick={() => setPage("projects")}
              >
                Projects
              </button>

              <span className="nav-status">
                <span className="online-dot" /> Workspace
              </span>

              <button
                className="button button-ghost nav-logout"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              {page !== "home" && (
                <button
                  className="button button-ghost nav-back"
                  type="button"
                  onClick={() => setPage("home")}
                >
                  Back home
                </button>
              )}

              <button
                className="button button-secondary"
                type="button"
                onClick={() => setPage("login")}
              >
                Log in
              </button>

              <button
                className="button button-primary nav-signup"
                type="button"
                onClick={openRegister}
              >
                Get started <span aria-hidden="true">↗</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* =========================
          HOME PAGE
      ========================= */}
      {page === "home" && (
        <main className="home-page">
          <section className="hero-layout">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" /> BUILT FOR STUDENT LIFE
              </div>

              <h1>
                Make room for
                <br />
                <span>great work.</span>
              </h1>

              <p className="hero-description">
                Keep assignments, projects, and everyday priorities in one
                calm, organized workspace. Spend less time tracking tasks
                and more time making progress.
              </p>

              <div className="hero-actions">
                <button
                  className="button button-primary button-large"
                  onClick={openRegister}
                  type="button"
                >
                  Start organizing <span aria-hidden="true">→</span>
                </button>

                <button
                  className="button button-secondary button-large"
                  onClick={() => setPage("login")}
                  type="button"
                >
                  I already have an account
                </button>
              </div>

              <div className="hero-proof">
                <span className="proof-check">✓</span>
                <span>Simple task tracking</span>
                <span className="proof-divider" />
                <span>Made for university life</span>
              </div>
            </div>

            <div className="preview-wrap" aria-label="TaskFlow dashboard preview">
              <div className="preview-glow" />

              <div className="preview-card">
                <div className="preview-topbar">
                  <div>
                    <span className="preview-overline">YOUR WORKSPACE</span>
                    <h3>Today at a glance</h3>
                  </div>
                  <span className="preview-icon">✦</span>
                </div>

                <div className="preview-progress">
                  <div className="progress-ring">
                    <span>72%</span>
                  </div>

                  <div className="progress-copy">
                    <strong>You're making progress</strong>
                    <span>Small steps add up. Keep going.</span>
                    <div className="progress-track">
                      <span />
                    </div>
                  </div>
                </div>

                <div className="preview-section-label">
                  A LITTLE PLAN FOR TODAY
                </div>

                <div className="preview-task">
                  <span className="preview-checkbox checked">✓</span>
                  <span className="preview-task-copy">
                    <strong>Review lecture notes</strong>
                    <small>Data Structures</small>
                  </span>
                  <span className="mini-status done">Done</span>
                </div>

                <div className="preview-task">
                  <span className="preview-checkbox" />
                  <span className="preview-task-copy">
                    <strong>Finish project outline</strong>
                    <small>Software Engineering</small>
                  </span>
                  <span className="mini-status in-progress">In progress</span>
                </div>

                <div className="preview-task">
                  <span className="preview-checkbox" />
                  <span className="preview-task-copy">
                    <strong>Practice coding problems</strong>
                    <small>Personal goal</small>
                  </span>
                  <span className="mini-status upcoming">Next up</span>
                </div>

                <div className="preview-footer">
                  <span className="footer-spark">✦</span>
                  Your goals, one task at a time.
                </div>
              </div>

              <div className="floating-note">
                <span>↗</span>
                <div>
                  <strong>Stay on track</strong>
                  <small>One step at a time</small>
                </div>
              </div>
            </div>
          </section>

          <section className="feature-strip">
            <div className="feature-item">
              <span className="feature-icon lavender">▦</span>
              <div>
                <strong>Everything in one place</strong>
                <p>Keep your tasks organized.</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon mint">✓</span>
              <div>
                <strong>See your progress</strong>
                <p>Celebrate every completed task.</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon peach">⌁</span>
              <div>
                <strong>Focus on what matters</strong>
                <p>Make your workload manageable.</p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* =========================
          LOGIN PAGE
      ========================= */}
      {page === "login" && (
        <main className="auth-page">
          <section className="auth-aside">
            <div className="auth-aside-mark">T</div>
            <p className="eyebrow eyebrow-light">WELCOME BACK</p>
            <h1>
              Your next win
              <br />
              starts here.
            </h1>
            <p>
              Pick up where you left off and keep moving toward your goals.
            </p>
            <div className="auth-quote">
              “Progress is built one task at a time.”
            </div>
          </section>

          <section className="auth-panel">
            <div className="auth-heading">
              <span className="auth-kicker">YOUR WORKSPACE</span>
              <h2>Welcome back</h2>
              <p>Enter your details to access your tasks.</p>
            </div>

            <form
              className="auth-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginLoading(true);

                try {
                  const response = await fetch(
                    `${API_BASE}/api/auth/login`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ email, password }),
                    }
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    alert(data.message || "Login failed.");
                    return;
                  }

                  localStorage.setItem("token", data.token);
                  setPage("dashboard");
                } catch {
                  alert(
                    "Cannot connect to the server. Check that the backend is running."
                  );
                } finally {
                  setLoginLoading(false);
                }
              }}
            >
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                className="button button-primary button-full"
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading ? "Signing in..." : "Sign in to TaskFlow"}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className="auth-switch">
              New to TaskFlow?{" "}
              <button type="button" onClick={openRegister}>
                Create an account
              </button>
            </p>
          </section>
        </main>
      )}

      {/* =========================
          REGISTER PAGE
      ========================= */}
      {page === "register" && (
        <main className="auth-page">
          <section className="auth-aside register-aside">
            <div className="auth-aside-mark">T</div>
            <p className="eyebrow eyebrow-light">A FRESH START</p>
            <h1>
              Make your
              <br />
              plans happen.
            </h1>
            <p>
              Create a little structure for your big ambitions. Your next
              chapter starts with one task.
            </p>
            <div className="auth-quote">
              “Organize today. Feel ready for tomorrow.”
            </div>
          </section>

          <section className="auth-panel">
            <div className="auth-heading">
              <span className="auth-kicker">GET STARTED</span>
              <h2>Create your account</h2>
              <p>It only takes a minute to get organized.</p>
            </div>

            {registerError && (
              <div className="form-alert form-alert-error" role="alert">
                {registerError}
              </div>
            )}

            {registerSuccess && (
              <div className="form-alert form-alert-success" role="status">
                {registerSuccess}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={async (e) => {
                e.preventDefault();

                setRegisterError("");
                setRegisterSuccess("");

                if (name.trim().length < 2) {
                  setRegisterError(
                    "Name must contain at least 2 characters."
                  );
                  return;
                }

                if (password.length < 6) {
                  setRegisterError(
                    "Password must be at least 6 characters."
                  );
                  return;
                }

                setRegisterLoading(true);

                try {
                  const response = await fetch(
                    `${API_BASE}/api/auth/register`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password,
                      }),
                    }
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(
                      data.message || "Registration failed."
                    );
                  }

                  setRegisterSuccess(
                    "Account created successfully. Redirecting to login..."
                  );

                  setName("");
                  setEmail("");
                  setPassword("");

                  setTimeout(() => {
                    setRegisterSuccess("");
                    setPage("login");
                  }, 1200);
                } catch (err) {
                  setRegisterError(
                    err.message || "Cannot connect to the server."
                  );
                } finally {
                  setRegisterLoading(false);
                }
              }}
            >
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                autoComplete="name"
                required
              />

              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />

              <button
                className="button button-primary button-full"
                type="submit"
                disabled={registerLoading}
              >
                {registerLoading ? "Creating account..." : "Create account"}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setRegisterError("");
                  setRegisterSuccess("");
                  setPage("login");
                }}
              >
                Sign in
              </button>
            </p>
          </section>
        </main>
      )}

      {/* PART 2 CONTINUES HERE */}

      {/* =========================
          DASHBOARD PAGE
      ========================= */}
      {page === "dashboard" && (
        <main className="dashboard-page">
          <section className="dashboard-heading">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-dot" /> YOUR WORKSPACE
              </p>
              <h1>
                Task dashboard<span className="heading-period">.</span>
              </h1>
              <p className="dashboard-subtitle">
                A clear mind starts with a clear plan. What will you get done today?
              </p>
            </div>

            <div className="date-chip">
              <span>◷</span> Your personal task space
            </div>
          </section>

          {/* PERSONAL TASK STATISTICS */}
          <section className="stats-grid" aria-label="Task statistics">
            <article className="stat-card stat-total">
              <div className="stat-top">
                <span className="stat-icon">▦</span>
                <span className="stat-label">ALL TASKS</span>
              </div>
              <div className="stat-number">{totalTasks}</div>
              <p>Tasks in your workspace</p>
            </article>

            <article className="stat-card stat-pending">
              <div className="stat-top">
                <span className="stat-icon">◷</span>
                <span className="stat-label">PENDING</span>
              </div>
              <div className="stat-number">{pendingTasks}</div>
              <p>Still on your list</p>
            </article>

            <article className="stat-card stat-completed">
              <div className="stat-top">
                <span className="stat-icon">✓</span>
                <span className="stat-label">COMPLETED</span>
              </div>
              <div className="stat-number">{completedTasks}</div>
              <p>Wins worth celebrating</p>
            </article>

            <article className="stat-card stat-progress">
              <div className="stat-top">
                <span className="stat-icon">↗</span>
                <span className="stat-label">PROGRESS</span>
              </div>
              <div className="stat-number">
                {completionRate}
                <span className="stat-percent">%</span>
              </div>
              <div className="stat-progress-track">
                <span style={{ width: `${completionRate}%` }} />
              </div>
            </article>
          </section>

          <section className="dashboard-content">
            <div className="task-main-column">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">YOUR TO-DO LIST</span>
                  <h2>
                    {editingTaskId
                      ? "Edit task"
                      : "Tasks that move you forward"}
                  </h2>
                </div>
                <span className="task-count">
                  {filteredTasks.length} shown
                </span>
              </div>

              {/* FILTER / SEARCH / SORT */}
              <div className="task-toolbar">
                <div className="filter-tabs" role="group">
                  {["All", "Pending", "Completed"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`filter-tab ${
                        filter === status ? "active" : ""
                      }`}
                      onClick={() => setFilter(status)}
                    >
                      {status}
                      {status === "All" && <span>{totalTasks}</span>}
                    </button>
                  ))}
                </div>

                <label className="search-box">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks..."
                    aria-label="Search tasks"
                  />
                </label>

                <label className="sort-select">
                  <span>Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest first</option>
                    <option value="priority">Priority: High to Low</option>
                    <option value="deadline">Deadline: Earliest first</option>
                  </select>
                </label>
              </div>

              {loading && (
                <div className="state-card">
                  <span className="spinner" />
                  Loading your tasks...
                </div>
              )}

              {error && (
                <div className="state-card state-error">
                  <strong>We couldn't load your tasks.</strong>
                  <span>{error}</span>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={fetchTasks}
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading && !error && filteredTasks.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">✓</div>
                  <h3>
                    {search
                      ? "No matching tasks"
                      : filter === "Completed"
                      ? "No completed tasks yet"
                      : filter === "Pending"
                      ? "You're all caught up"
                      : "Your workspace is ready"}
                  </h3>
                  <p>
                    {search
                      ? "Try a different search term."
                      : "Add a task and turn your plans into progress."}
                  </p>
                  {!search && (
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={() => {
                        setFilter("All");
                        document.getElementById("task-title")?.focus();
                      }}
                    >
                      Create your first task →
                    </button>
                  )}
                </div>
              )}

              {!loading && !error && filteredTasks.length > 0 && (
                <div className="task-list">
                  {sortedTasks.map((task) => (
                    <article
                      className={`task-card ${
                        task.completed ? "task-card-done" : ""
                      }`}
                      key={task._id}
                    >
                      <button
                        className={`task-check ${
                          task.completed ? "is-checked" : ""
                        }`}
                        type="button"
                        aria-label={
                          task.completed
                            ? "Mark task pending"
                            : "Mark task completed"
                        }
                        onClick={() => handleToggleTask(task)}
                      >
                        {task.completed ? "✓" : ""}
                      </button>

                      <div className="task-card-body">
                        <div className="task-card-title-row">
                          <h3>{task.title}</h3>
                          <span
                            className={`status-pill ${
                              task.completed
                                ? "status-completed"
                                : "status-pending"
                            }`}
                          >
                            {task.completed ? "Completed" : "In progress"}
                          </span>
                        </div>

                        {task.description && (
                          <p>{task.description}</p>
                        )}

                        <div className="task-details">
                          <span
                            className={`priority-badge priority-${(
                              task.priority || "Medium"
                            ).toLowerCase()}`}
                          >
                            Priority: {task.priority || "Medium"}
                          </span>

                          {task.deadline && (
                            <span className="deadline-badge">
                              📅 Deadline:{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="task-card-footer">
                          <span className="task-meta">
                            <span>◷</span> Personal task
                          </span>

                          <div className="task-actions">
                            <button
                              type="button"
                              className="text-action"
                              onClick={() => handleEditTask(task)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="text-action text-action-danger"
                              onClick={() => handleDeleteTask(task._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* PERSONAL TASK FORM */}
            <aside className="task-sidebar">
              <section className="create-card">
                <div className="create-card-heading">
                  <span className="create-icon">
                    {editingTaskId ? "✎" : "+"}
                  </span>
                  <div>
                    <span className="section-kicker">
                      {editingTaskId ? "MAKE A CHANGE" : "NEW PRIORITY"}
                    </span>
                    <h2>{editingTaskId ? "Update task" : "Add a task"}</h2>
                  </div>
                </div>

                <p className="create-helper">
                  Break your goals into small, actionable steps.
                </p>

                <form className="task-form" onSubmit={handleSaveTask}>
                  <label htmlFor="task-title">Task title</label>
                  <input
                    id="task-title"
                    type="text"
                    placeholder="e.g. Finish project proposal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>

                  <label htmlFor="task-deadline">
                    Deadline <span className="optional-label">Optional</span>
                  </label>
                  <input
                    id="task-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />

                  <textarea
                    id="task-description"
                    placeholder="Add a few details..."
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  <button
                    className="button button-primary button-full"
                    type="submit"
                  >
                    {editingTaskId ? "Save changes" : "Add to my tasks"}
                    <span aria-hidden="true">→</span>
                  </button>

                  {editingTaskId && (
                    <button
                      className="button button-secondary button-full"
                      type="button"
                      onClick={resetTaskForm}
                    >
                      Cancel edit
                    </button>
                  )}
                </form>
              </section>

              <section className="focus-card">
                <span className="focus-spark">✦</span>
                <h3>Keep your momentum</h3>
                <p>
                  Every task you complete is progress toward something bigger.
                  Keep showing up.
                </p>
                <div className="focus-progress-label">
                  <span>Completion rate</span>
                  <strong>{completionRate}%</strong>
                </div>
                <div className="focus-progress-track">
                  <span style={{ width: `${completionRate}%` }} />
                </div>
              </section>
            </aside>
          </section>

          <footer className="dashboard-footer">
            <span className="footer-brand-mark">T</span>
            <span>TaskFlow</span>
            <span className="footer-dot">•</span>
            <span>One task at a time.</span>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </footer>
        </main>
      )}

      {/* =========================
          PROJECTS LIST PAGE
      ========================= */}
      {page === "projects" && (
        <main className="dashboard-page">
          <section className="dashboard-heading">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-dot" /> YOUR WORKSPACE
              </p>
              <h1>
                My Projects<span className="heading-period">.</span>
              </h1>
              <p className="dashboard-subtitle">
                Manage your group projects and collaborate with teammates.
              </p>
            </div>

            <button
              className="button button-primary"
              type="button"
              onClick={() => {
                setShowProjectForm((previous) => !previous);
                setProjectMessage("");
              }}
            >
              {showProjectForm ? "Cancel" : "+ Create New Project"}
            </button>
          </section>

          {projectMessage && (
            <div className="form-alert form-alert-success" role="status">
              {projectMessage}
            </div>
          )}

          {/* CREATE PROJECT FORM */}
          {showProjectForm && (
            <section className="create-card" style={{ marginBottom: "28px" }}>
              <div className="create-card-heading">
                <span className="create-icon">+</span>
                <div>
                  <span className="section-kicker">NEW WORKSPACE</span>
                  <h2>Create New Project</h2>
                </div>
              </div>

              <form className="task-form" onSubmit={handleCreateProject}>
                <label htmlFor="project-name">Project Name</label>
                <input
                  id="project-name"
                  type="text"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />

                <label htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  rows="4"
                  placeholder="Describe your project"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />

                <button className="button button-primary" type="submit">
                  Create Project →
                </button>
              </form>
            </section>
          )}

          {projectsError && (
            <div className="state-card state-error">
              {projectsError}
              <button
                className="button button-secondary"
                type="button"
                onClick={fetchProjects}
              >
                Retry
              </button>
            </div>
          )}

          {projectsLoading && (
            <div className="state-card">
              <span className="spinner" />
              Loading projects...
            </div>
          )}

          {/* PROJECT CARDS */}
          {!projectsLoading && !projectsError && projects.length > 0 && (
            <section className="project-grid">
              {projects.map((project) => {
                const memberCount = project.members?.length || 0;

                return (
                  <article
                    className="create-card"
                    key={project._id}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="create-card-heading">
                      <span className="create-icon">▦</span>
                      <div>
                        <span className="section-kicker">PROJECT</span>
                        <h2>{project.name}</h2>
                      </div>
                    </div>

                    <p className="create-helper">
                      {project.description || "No description provided."}
                    </p>

                    <div className="task-details">
                      <span className="priority-badge">
                        {memberCount} member{memberCount !== 1 ? "s" : ""}
                      </span>

                      <span className="status-pill status-pending">
                        {project.status || "Active"}
                      </span>
                    </div>

                    <p className="task-meta" style={{ marginTop: "15px" }}>
                      Owner:{" "}
                      {typeof project.owner === "object"
                        ? project.owner?.name || "Project owner"
                        : isProjectOwner(project)
                        ? "You"
                        : "Member"}
                    </p>

                    <button
                      className="button button-primary button-full"
                      type="button"
                      style={{ marginTop: "18px" }}
                      onClick={() => openProjectDetails(project)}
                    >
                      Open Project →
                    </button>
                  </article>
                );
              })}
            </section>
          )}

          {!projectsLoading &&
            !projectsError &&
            projects.length === 0 && (
              <section className="empty-state">
                <div className="empty-icon">▦</div>
                <h3>Your projects will appear here</h3>
                <p>
                  Create a project and start collaborating with your team.
                </p>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => setShowProjectForm(true)}
                >
                  Create your first project →
                </button>
              </section>
            )}
        </main>
      )}

      {/* =========================
          PROJECT DETAILS PAGE
      ========================= */}
      {page === "projectDetails" && selectedProject && (
        <main className="dashboard-page">
          <section className="dashboard-heading">
            <div>
              <button
                className="button button-ghost"
                type="button"
                onClick={() => setPage("projects")}
              >
                ← Back to Projects
              </button>

              <p className="eyebrow" style={{ marginTop: "20px" }}>
                <span className="eyebrow-dot" /> PROJECT WORKSPACE
              </p>

              <h1>
                {selectedProject.name}
                <span className="heading-period">.</span>
              </h1>

              <p className="dashboard-subtitle">
                {selectedProject.description || "Project details and team workspace."}
              </p>
            </div>

            <span className="status-pill status-pending">
              {selectedProject.status || "Active"}
            </span>
          </section>

          {/* PROJECT PROGRESS STATISTICS */}
          <section className="stats-grid">
            <article className="stat-card stat-total">
              <div className="stat-top">
                <span className="stat-icon">▦</span>
                <span className="stat-label">TOTAL TASKS</span>
              </div>
              <div className="stat-number">{projectTotalTasks}</div>
              <p>Tasks in this project</p>
            </article>

            <article className="stat-card stat-pending">
              <div className="stat-top">
                <span className="stat-icon">◷</span>
                <span className="stat-label">PENDING</span>
              </div>
              <div className="stat-number">{projectPendingTasks}</div>
              <p>Tasks remaining</p>
            </article>

            <article className="stat-card stat-completed">
              <div className="stat-top">
                <span className="stat-icon">✓</span>
                <span className="stat-label">COMPLETED</span>
              </div>
              <div className="stat-number">{projectCompletedTasks}</div>
              <p>Tasks completed</p>
            </article>

            <article className="stat-card stat-progress">
              <div className="stat-top">
                <span className="stat-icon">↗</span>
                <span className="stat-label">PROJECT PROGRESS</span>
              </div>
              <div className="stat-number">
                {projectProgress}
                <span className="stat-percent">%</span>
              </div>
              <div className="stat-progress-track">
                <span style={{ width: `${projectProgress}%` }} />
              </div>
            </article>
          </section>

          {/* PROJECT PROGRESS BAR */}
          <section className="create-card" style={{ marginBottom: "28px" }}>
            <div className="section-heading">
              <div>
                <span className="section-kicker">PROJECT OVERVIEW</span>
                <h2>Overall progress</h2>
              </div>
              <strong>{projectProgress}%</strong>
            </div>

            <div className="focus-progress-track" style={{ marginTop: "20px" }}>
              <span style={{ width: `${projectProgress}%` }} />
            </div>

            <p className="create-helper">
              {projectCompletedTasks} of {projectTotalTasks} tasks completed.
            </p>
          </section>

          {/* TEAM MEMBERS */}
          <section className="create-card" style={{ marginBottom: "28px" }}>
            <div className="create-card-heading">
              <span className="create-icon">♙</span>
              <div>
                <span className="section-kicker">COLLABORATION</span>
                <h2>Project Members</h2>
              </div>
            </div>

            <div className="project-members-list">
              {(selectedProject.members || []).map((member, index) => {
                const memberId = getMemberId(member);

                return (
                  <div
                    className="task-card"
                    key={memberId || index}
                    style={{ marginTop: "12px" }}
                  >
                    <div className="task-card-body">
                      <div className="task-card-title-row">
                        <h3>
                          {typeof member === "object"
                            ? member?.name || "Team member"
                            : "Team member"}
                        </h3>

                        {String(memberId) === String(
                          typeof selectedProject.owner === "object"
                            ? selectedProject.owner?._id
                            : selectedProject.owner
                        ) && (
                          <span className="status-pill status-completed">
                            Owner
                          </span>
                        )}
                      </div>

                      <span className="task-meta">
                        {typeof member === "object"
                          ? member?.email || ""
                          : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ADD MEMBER - OWNER ONLY */}
            {isProjectOwner(selectedProject) && (
              <div style={{ marginTop: "24px" }}>
                <h3>Add Team Member</h3>
                <p className="create-helper">
                  Enter the registered email address of your teammate.
                </p>

                <form className="task-form" onSubmit={handleAddMember}>
                  <label htmlFor="member-email">Member email</label>
                  <input
                    id="member-email"
                    type="email"
                    placeholder="teammate@example.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    required
                  />

                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={memberLoading}
                  >
                    {memberLoading ? "Adding..." : "Add Member →"}
                  </button>
                </form>

                {memberMessage && (
                  <div className="form-alert form-alert-success" role="status">
                    {memberMessage}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* PROJECT TASKS */}
          <section className="create-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">TEAM WORK</span>
                <h2>Project Tasks</h2>
              </div>

              {isProjectOwner(selectedProject) && (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() =>
                    setShowProjectTaskForm((previous) => !previous)
                  }
                >
                  {showProjectTaskForm ? "Cancel" : "+ Add Task"}
                </button>
              )}
            </div>

            {projectTaskMessage && (
              <div className="form-alert form-alert-success" role="status">
                {projectTaskMessage}
              </div>
            )}

            {/* CREATE AND ASSIGN PROJECT TASK */}
            {showProjectTaskForm && isProjectOwner(selectedProject) && (
              <form
                className="task-form"
                onSubmit={handleCreateProjectTask}
                style={{ marginTop: "24px" }}
              >
                <label htmlFor="project-task-title">Task title</label>
                <input
                  id="project-task-title"
                  type="text"
                  placeholder="Enter project task"
                  value={projectTaskTitle}
                  onChange={(e) => setProjectTaskTitle(e.target.value)}
                  required
                />

                <label htmlFor="project-task-description">
                  Description
                </label>
                <textarea
                  id="project-task-description"
                  rows="3"
                  placeholder="Task details"
                  value={projectTaskDescription}
                  onChange={(e) => setProjectTaskDescription(e.target.value)}
                />

                <label htmlFor="project-task-priority">Priority</label>
                <select
                  id="project-task-priority"
                  value={projectTaskPriority}
                  onChange={(e) => setProjectTaskPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <label htmlFor="project-task-deadline">Deadline</label>
                <input
                  id="project-task-deadline"
                  type="date"
                  value={projectTaskDeadline}
                  onChange={(e) => setProjectTaskDeadline(e.target.value)}
                />

                <label htmlFor="assign-member">Assign to member</label>
                <select
                  id="assign-member"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                >
                  <option value="">Select a team member</option>

                  {(selectedProject.members || []).map((member, index) => {
                    const memberId = getMemberId(member);

                    return (
                      <option key={memberId || index} value={memberId}>
                        {typeof member === "object"
                          ? `${member.name || "Member"} (${member.email || ""})`
                          : "Team member"}
                      </option>
                    );
                  })}
                </select>

                <button
                  className="button button-primary button-full"
                  type="submit"
                  disabled={projectTaskLoading}
                >
                  {projectTaskLoading
                    ? "Creating task..."
                    : "Create and Assign Task →"}
                </button>
              </form>
            )}

            {/* PROJECT TASK LIST */}
            {projectTasksLoading ? (
              <div className="state-card">
                <span className="spinner" />
                Loading project tasks...
              </div>
            ) : projectTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✓</div>
                <h3>No project tasks yet</h3>
                <p>
                  Create a task and assign it to a project member.
                </p>
              </div>
            ) : (
              <div className="task-list" style={{ marginTop: "22px" }}>
                {projectTasks.map((task) => {
                  const creatorId =
                    typeof task.user === "object"
                      ? task.user?._id
                      : task.user;

                  const canUpdate =
                    currentUserId &&
                    String(creatorId) === String(currentUserId);

                  const assignedMember =
                    typeof task.assignedTo === "object"
                      ? task.assignedTo
                      : null;

                  return (
                    <article
                      className={`task-card ${
                        task.completed ? "task-card-done" : ""
                      }`}
                      key={task._id}
                    >
                      <button
                        className={`task-check ${
                          task.completed ? "is-checked" : ""
                        }`}
                        type="button"
                        disabled={!canUpdate}
                        title={
                          canUpdate
                            ? "Update task status"
                            : "Only the task creator can update this task currently"
                        }
                        onClick={() => handleToggleProjectTask(task)}
                      >
                        {task.completed ? "✓" : ""}
                      </button>

                      <div className="task-card-body">
                        <div className="task-card-title-row">
                          <h3>{task.title}</h3>

                          <span
                            className={`status-pill ${
                              task.completed
                                ? "status-completed"
                                : "status-pending"
                            }`}
                          >
                            {task.completed ? "Completed" : "Pending"}
                          </span>
                        </div>

                        {task.description && <p>{task.description}</p>}

                        <div className="task-details">
                          <span
                            className={`priority-badge priority-${(
                              task.priority || "Medium"
                            ).toLowerCase()}`}
                          >
                            Priority: {task.priority || "Medium"}
                          </span>

                          {task.deadline && (
                            <span className="deadline-badge">
                              📅{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="task-card-footer">
                          <span className="task-meta">
                            Assigned to:{" "}
                            {assignedMember?.name ||
                              assignedMember?.email ||
                              "Member"}
                          </span>

                          <span className="task-meta">
                            {canUpdate
                              ? "Created by you"
                              : "Created by another member"}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="dashboard-footer">
            <span className="footer-brand-mark">T</span>
            <span>TaskFlow</span>
            <span className="footer-dot">•</span>
            <span>One team, one goal.</span>
            <button type="button" onClick={() => setPage("projects")}>
              Back to Projects
            </button>
          </footer>
        </main>
      )}
    </div>
  );
}

export default App;
