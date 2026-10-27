import { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000";

function App() {
  const [page, setPage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [priority, setPriority] = useState("Medium");
  const [deadline, setDeadline] = useState("");

  const token = () => localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setTasks([]);
    setTitle("");
    setDescription("");
    setEditingTaskId(null);
    setFilter("All");
    setSearch("");
    setPage("home");
  };

  const handleToggleTask = async (task) => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to update task.");
        return;
      }

      setTasks((previous) =>
        previous.map((item) =>
          item._id === task._id
            ? { ...item, ...(data.task || {}), completed: !task.completed }
            : item
        )
      );
    } catch (err) {
      console.error("Update task error:", err);
      alert("Could not connect to the server. Please try again.");
    }
  };

 
const handleEditTask = (task) => {
  setEditingTaskId(task._id);
  setTitle(task.title || "");
  setDescription(task.description || "");
  setPriority(task.priority || "Medium");

  setDeadline(
    task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : ""
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
};


  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to delete task.");
      setTasks((previous) => previous.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Delete task error:", err);
      alert(err.message || "Something went wrong.");
    }
  };

  useEffect(() => {
    if (page !== "dashboard") return;

    const fetchTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE}/api/tasks`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to load tasks.");
        setTasks(data.tasks || data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [page]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

  const openRegister = () => {
    setRegisterError("");
    setRegisterSuccess("");
    setPage("register");
  };

  return (
    <div className="app-shell">
      <nav className="navbar">
        <button className="brand" type="button" onClick={() => setPage("home")} aria-label="TaskFlow home">
          <span className="brand-mark">T</span>
          <span>Task<span className="brand-accent">Flow</span></span>
        </button>

        <div className="nav-actions">
          {page === "dashboard" ? (
            <>
              <span className="nav-status"><span className="online-dot" /> Workspace</span>
              <button className="button button-ghost nav-logout" type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              {page !== "home" && (
                <button className="button button-ghost nav-back" type="button" onClick={() => setPage("home")}>
                  Back home
                </button>
              )}
              <button className="button button-secondary" type="button" onClick={() => setPage("login")}>
                Log in
              </button>
              <button className="button button-primary nav-signup" type="button" onClick={openRegister}>
                Get started <span aria-hidden="true">↗</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {page === "home" && (
        <main className="home-page">
          <section className="hero-layout">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> BUILT FOR STUDENT LIFE</div>
              <h1>Make room for<br /><span>great work.</span></h1>
              <p className="hero-description">
                Keep assignments, projects, and everyday priorities in one calm, organized workspace.
                Spend less time tracking tasks and more time making progress.
              </p>
              <div className="hero-actions">
                <button className="button button-primary button-large" onClick={openRegister} type="button">
                  Start organizing <span aria-hidden="true">→</span>
                </button>
                <button className="button button-secondary button-large" onClick={() => setPage("login")} type="button">
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
                  <div className="progress-ring"><span>72%</span></div>
                  <div className="progress-copy">
                    <strong>You're making progress</strong>
                    <span>Small steps add up. Keep going.</span>
                    <div className="progress-track"><span /></div>
                  </div>
                </div>
                <div className="preview-section-label">A LITTLE PLAN FOR TODAY</div>
                <div className="preview-task">
                  <span className="preview-checkbox checked">✓</span>
                  <span className="preview-task-copy"><strong>Review lecture notes</strong><small>Data Structures</small></span>
                  <span className="mini-status done">Done</span>
                </div>
                <div className="preview-task">
                  <span className="preview-checkbox" />
                  <span className="preview-task-copy"><strong>Finish project outline</strong><small>Software Engineering</small></span>
                  <span className="mini-status in-progress">In progress</span>
                </div>
                <div className="preview-task">
                  <span className="preview-checkbox" />
                  <span className="preview-task-copy"><strong>Practice coding problems</strong><small>Personal goal</small></span>
                  <span className="mini-status upcoming">Next up</span>
                </div>
                <div className="preview-footer"><span className="footer-spark">✦</span> Your goals, one task at a time.</div>
              </div>
              <div className="floating-note"><span>↗</span><div><strong>Stay on track</strong><small>One step at a time</small></div></div>
            </div>
          </section>

          <section className="feature-strip">
            <div className="feature-item"><span className="feature-icon lavender">▦</span><div><strong>Everything in one place</strong><p>Keep your tasks organized.</p></div></div>
            <div className="feature-item"><span className="feature-icon mint">✓</span><div><strong>See your progress</strong><p>Celebrate every completed task.</p></div></div>
            <div className="feature-item"><span className="feature-icon peach">⌁</span><div><strong>Focus on what matters</strong><p>Make your workload manageable.</p></div></div>
          </section>
        </main>
      )}

      {page === "login" && (
        <main className="auth-page">
          <section className="auth-aside">
            <div className="auth-aside-mark">T</div>
            <p className="eyebrow eyebrow-light">WELCOME BACK</p>
            <h1>Your next win<br />starts here.</h1>
            <p>Pick up where you left off and keep moving toward your goals.</p>
            <div className="auth-quote">“Progress is built one task at a time.”</div>
          </section>
          <section className="auth-panel">
            <div className="auth-heading">
              <span className="auth-kicker">YOUR WORKSPACE</span>
              <h2>Welcome back</h2>
              <p>Enter your details to access your tasks.</p>
            </div>
            <form className="auth-form" onSubmit={async (e) => {
              e.preventDefault();
              setLoginLoading(true);
              try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                if (!response.ok) {
                  alert(data.message || "Login failed.");
                  return;
                }
                localStorage.setItem("token", data.token);
                setPage("dashboard");
              } catch {
                alert("Cannot connect to the server. Check that the backend is running.");
              } finally {
                setLoginLoading(false);
              }
            }}>
              <label htmlFor="login-email">Email address</label>
              <input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              <label htmlFor="login-password">Password</label>
              <input id="login-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              <button className="button button-primary button-full" type="submit" disabled={loginLoading}>
                {loginLoading ? "Signing in..." : "Sign in to TaskFlow"} <span aria-hidden="true">→</span>
              </button>
            </form>
            <p className="auth-switch">New to TaskFlow? <button type="button" onClick={openRegister}>Create an account</button></p>
          </section>
        </main>
      )}

      {page === "register" && (
        <main className="auth-page">
          <section className="auth-aside register-aside">
            <div className="auth-aside-mark">T</div>
            <p className="eyebrow eyebrow-light">A FRESH START</p>
            <h1>Make your<br />plans happen.</h1>
            <p>Create a little structure for your big ambitions. Your next chapter starts with one task.</p>
            <div className="auth-quote">“Organize today. Feel ready for tomorrow.”</div>
          </section>
          <section className="auth-panel">
            <div className="auth-heading">
              <span className="auth-kicker">GET STARTED</span>
              <h2>Create your account</h2>
              <p>It only takes a minute to get organized.</p>
            </div>
            {registerError && <div className="form-alert form-alert-error" role="alert">{registerError}</div>}
            {registerSuccess && <div className="form-alert form-alert-success" role="status">{registerSuccess}</div>}
            <form className="auth-form" onSubmit={async (e) => {
              e.preventDefault();
              setRegisterError("");
              setRegisterSuccess("");

              if (name.trim().length < 2) {
                setRegisterError("Name must contain at least 2 characters.");
                return;
              }
              if (password.length < 6) {
                setRegisterError("Password must be at least 6 characters.");
                return;
              }

              setRegisterLoading(true);
              try {
                const response = await fetch(`${API_BASE}/api/auth/register`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Registration failed.");

                setRegisterSuccess("Account created successfully. Redirecting to login...");
                setName("");
                setEmail("");
                setPassword("");
                setTimeout(() => {
                  setRegisterSuccess("");
                  setPage("login");
                }, 1200);
              } catch (err) {
                setRegisterError(err.message || "Cannot connect to the server.");
              } finally {
                setRegisterLoading(false);
              }
            }}>
              <label htmlFor="register-name">Full name</label>
              <input id="register-name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} minLength={2} autoComplete="name" required />
              <label htmlFor="register-email">Email address</label>
              <input id="register-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              <label htmlFor="register-password">Password</label>
              <input id="register-password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} autoComplete="new-password" required />
              <button className="button button-primary button-full" type="submit" disabled={registerLoading}>
                {registerLoading ? "Creating account..." : "Create account"} <span aria-hidden="true">→</span>
              </button>
            </form>
            <p className="auth-switch">Already have an account? <button type="button" onClick={() => { setRegisterError(""); setRegisterSuccess(""); setPage("login"); }}>Sign in</button></p>
          </section>
        </main>
      )}

      {page === "dashboard" && (
        <main className="dashboard-page">
          <section className="dashboard-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" /> YOUR WORKSPACE</p>
              <h1>Task dashboard<span className="heading-period">.</span></h1>
              <p className="dashboard-subtitle">A clear mind starts with a clear plan. What will you get done today?</p>
            </div>
            <div className="date-chip"><span>◷</span> Your personal task space</div>
          </section>

          <section className="stats-grid" aria-label="Task statistics">
            <article className="stat-card stat-total">
              <div className="stat-top"><span className="stat-icon">▦</span><span className="stat-label">ALL TASKS</span></div>
              <div className="stat-number">{totalTasks}</div>
              <p>Tasks in your workspace</p>
            </article>
            <article className="stat-card stat-pending">
              <div className="stat-top"><span className="stat-icon">◷</span><span className="stat-label">PENDING</span></div>
              <div className="stat-number">{pendingTasks}</div>
              <p>Still on your list</p>
            </article>
            <article className="stat-card stat-completed">
              <div className="stat-top"><span className="stat-icon">✓</span><span className="stat-label">COMPLETED</span></div>
              <div className="stat-number">{completedTasks}</div>
              <p>Wins worth celebrating</p>
            </article>
            <article className="stat-card stat-progress">
              <div className="stat-top"><span className="stat-icon">↗</span><span className="stat-label">PROGRESS</span></div>
              <div className="stat-number">{completionRate}<span className="stat-percent">%</span></div>
              <div className="stat-progress-track"><span style={{ width: `${completionRate}%` }} /></div>
            </article>
          </section>

          <section className="dashboard-content">
            <div className="task-main-column">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">YOUR TO-DO LIST</span>
                  <h2>{editingTaskId ? "Edit task" : "Tasks that move you forward"}</h2>
                </div>
                <span className="task-count">{filteredTasks.length} shown</span>
              </div>

              <div className="task-toolbar">
                <div className="filter-tabs" role="group" aria-label="Filter tasks">
                  {["All", "Pending", "Completed"].map((status) => (
                    <button key={status} type="button" className={`filter-tab ${filter === status ? "active" : ""}`} onClick={() => setFilter(status)}>
                      {status}
                      {status === "All" && <span>{totalTasks}</span>}
                    </button>
                  ))}
                </div>
                <label className="search-box">
                  <span aria-hidden="true">⌕</span>
                  <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks" />
                </label>
              </div>

              {loading && <div className="state-card"><span className="spinner" />Loading your tasks...</div>}
              {error && <div className="state-card state-error"><strong>We couldn't load your tasks.</strong><span>{error}</span><button className="button button-secondary" type="button" onClick={() => setPage("home")}>Back to home</button></div>}
              {!loading && !error && filteredTasks.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">✓</div>
                  <h3>{search ? "No matching tasks" : filter === "Completed" ? "No completed tasks yet" : filter === "Pending" ? "You're all caught up" : "Your workspace is ready"}</h3>
                  <p>{search ? "Try a different search term." : "Add a task and turn your plans into progress."}</p>
                  {!search && <button className="button button-primary" type="button" onClick={() => { setFilter("All"); document.getElementById("task-title")?.focus(); }}>Create your first task <span>→</span></button>}
                </div>
              )}

              {!loading && !error && filteredTasks.length > 0 && (
                <div className="task-list">
                  {filteredTasks.map((task) => (
                    <article className={`task-card ${task.completed ? "task-card-done" : ""}`} key={task._id}>
                      <button className={`task-check ${task.completed ? "is-checked" : ""}`} type="button" aria-label={task.completed ? "Mark task pending" : "Mark task completed"} onClick={() => handleToggleTask(task)}>
                        {task.completed ? "✓" : ""}
                      </button>
                      <div className="task-card-body">
                        <div className="task-card-title-row">
                          <h3>{task.title}</h3>
                          <span className={`status-pill ${task.completed ? "status-completed" : "status-pending"}`}>{task.completed ? "Completed" : "In progress"}</span>
                        </div>
                        <p className="task-description">{task.description || "No description added for this task."}</p>
                        <div className="task-card-footer">
                          <span className="task-meta"><span>◷</span> Personal task</span>
                          <div className="task-actions">
                            <button type="button" className="text-action" onClick={() => handleEditTask(task)}>Edit</button>
                            <button type="button" className="text-action text-action-danger" onClick={() => handleDeleteTask(task._id)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="task-sidebar">
              <section className="create-card">
                <div className="create-card-heading">
                  <span className="create-icon">{editingTaskId ? "✎" : "+"}</span>
                  <div><span className="section-kicker">{editingTaskId ? "MAKE A CHANGE" : "NEW PRIORITY"}</span><h2>{editingTaskId ? "Update task" : "Add a task"}</h2></div>
                </div>
                <p className="create-helper">Break your goals into small, actionable steps.</p>
                <form className="task-form" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!title.trim()) {
                    alert("Task title is required.");
                    return;
                  }

                  try {
                    const isEditing = editingTaskId !== null;
                    const response = await fetch(isEditing ? `${API_BASE}/api/tasks/${editingTaskId}` : `${API_BASE}/api/tasks`, {
                      method: isEditing ? "PUT" : "POST",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                      body: JSON.stringify({ title: title.trim(), description: description.trim() }),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || "Failed to save task.");

                    if (isEditing) {
                      const updatedTask = data.task || data;
                      setTasks((previous) => previous.map((task) => task._id === editingTaskId ? { ...task, ...updatedTask } : task));
                    } else {
                      const newTask = data.task || data;
                      setTasks((previous) => [newTask, ...previous]);
                    }
                    setTitle("");
                    setDescription("");
                    setEditingTaskId(null);
                    setFilter("All");
                    setSearch("");
                  } catch (err) {
                    alert(err.message || "Something went wrong.");
                  }
                }}>
                  <label htmlFor="task-title">Task title</label>
                  <input id="task-title" type="text" placeholder="e.g. Finish project proposal" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <label htmlFor="task-description">Description <span className="optional-label">Optional</span></label>
                  <textarea id="task-description" placeholder="Add a few details..." rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
                  <button className="button button-primary button-full" type="submit">
                    {editingTaskId ? "Save changes" : "Add to my tasks"} <span aria-hidden="true">→</span>
                  </button>
                  {editingTaskId && <button className="button button-secondary button-full" type="button" onClick={() => { setEditingTaskId(null); setTitle(""); setDescription(""); }}>Cancel edit</button>}
                </form>
              </section>

              <section className="focus-card">
                <span className="focus-spark">✦</span>
                <h3>Keep your momentum</h3>
                <p>Every task you complete is progress toward something bigger. Keep showing up.</p>
                <div className="focus-progress-label"><span>Completion rate</span><strong>{completionRate}%</strong></div>
                <div className="focus-progress-track"><span style={{ width: `${completionRate}%` }} /></div>
              </section>
            </aside>
          </section>

          <footer className="dashboard-footer"><span className="footer-brand-mark">T</span><span>TaskFlow</span><span className="footer-dot">•</span><span>One task at a time.</span><button type="button" onClick={handleLogout}>Log out</button></footer>
        </main>
      )}
    </div>
  );
}

export default App;
