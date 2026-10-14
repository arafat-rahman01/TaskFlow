import { useState,useEffect } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);


  
  const handleToggleTask = async (task) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/tasks/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: !task.completed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update task");
        return;
      }

      setTasks((prevTasks) =>
        prevTasks.map((item) =>
          item._id === task._id
            ? { ...item, completed: !task.completed }
            : item
        )
      );
    } catch (error) {
      console.error("Update task error:", error);
      alert("Server connection failed!");
    }
  };

  
    const handleEditTask = (task) => {
      setEditingTaskId(task._id);
      setTitle(task.title);
      setDescription(task.description || "");
    };

  
    const handleDeleteTask = async (taskId) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this task?"
      );

      if (!confirmed) return;

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/tasks/${taskId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete task");
        }

        setTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== taskId)
        );

        alert("Task deleted successfully!");
      } catch (error) {
        console.error("Delete task error:", error);
        alert(error.message || "Something went wrong");
      }
    };

  useEffect(() => {
    if (page !== "dashboard") return;

    const fetchTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/tasks",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load tasks");
        }

        setTasks(data.tasks || data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [page]);
    
  const filteredTasks = tasks.filter((task) => {
    if (filter === "Pending") {
      return !task.completed;
    }

    if (filter === "Completed") {
      return task.completed;
    }

    return true;
  });

  return (
    <div className="app">
      <nav className="navbar">
        <h2 onClick={() => setPage("home")}>TaskFlow</h2>

        <button
          className="login-btn"
          onClick={() => setPage("login")}
        >
          Login
        </button>
      </nav>

      {page === "home" && (
        <main className="hero">
          <p className="tagline">STUDY SMARTER</p>

          <h1>
            Manage Your Tasks.
            <br />
            Achieve Your Goals.
          </h1>

          <p className="description">
            Organize assignments, track deadlines,
            and manage your university projects
            in one place.
          </p>

          <button
            className="start-btn"
            onClick={() => setPage("register")}
          >
            Get Started
          </button>
        </main>
      )}

      
{page === "login" && (
  <main className="hero">
    <h1>Welcome Back!</h1>

    <p className="description">
      Login to manage your tasks.
    </p>

    <form
      onSubmit={async (e) => {
      e.preventDefault();

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/login",
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
          alert(data.message || "Login failed!");
          return;
        }

        localStorage.setItem("token", data.token);

        setPage("dashboard");
      } catch (error) {
        alert("Cannot connect to server. Check your backend.");
      }
    }}
      className="login-form"
    >
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" className="start-btn">
        Login
      </button>
    </form>

    <button
      className="login-btn"
      onClick={() => setPage("home")}
      style={{ marginTop: "20px" }}
    >
      Back to Home
      </button>
    </main>
    )}


      {page === "register" && (
        <main className="hero">
          <h1>Create Your Account</h1>
          <p className="description">
            Registration page will be built here.
          </p>
          <button
            className="start-btn"
            onClick={() => setPage("home")}
          >
            Back to Home
          </button>
        </main>
      )}

      
      
    {page === "dashboard" && (
      <main className="hero">
        <p className="tagline">TASKFLOW DASHBOARD</p>

        <h1>Welcome to TaskFlow!</h1>

        <p className="description">
          Manage your academic tasks in one place.
        </p>

        
        
      <form
        className="task-form"
        onSubmit={async (e) => {
          e.preventDefault();

          try {
            const token = localStorage.getItem("token");

            const isEditing = editingTaskId !== null;

            const url = isEditing
              ? `http://localhost:5000/api/tasks/${editingTaskId}`
              : "http://localhost:5000/api/tasks";

            const response = await fetch(url, {
              method: isEditing ? "PUT" : "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ title, description }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message || "Failed to save task"
              );
            }

            if (isEditing) {
              const updatedTask = data.task || data;

              setTasks((prevTasks) =>
                prevTasks.map((task) =>
                  task._id === editingTaskId
                    ? { ...task, ...updatedTask }
                    : task
                )
              );

              alert("Task updated successfully!");
            } else {
              const newTask = data.task || data;

              setTasks((prevTasks) => [
                newTask,
                ...prevTasks,
              ]);

              alert("Task added successfully!");
            }

            setTitle("");
            setDescription("");
            setEditingTaskId(null);

          } catch (err) {
            alert(err.message || "Something went wrong");
          }
        }}
      >
        <h2>{editingTaskId !== null ? "Edit Task" : "Add New Task"}</h2>

        <input
          type="text"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
        />

        <button type="submit" className="start-btn">
          {editingTaskId !== null ? "Save Changes" : "+ Add Task"}
        </button>

        {editingTaskId !== null && (
          <button
            type="button"
            className="login-btn"
            onClick={() => {
              setEditingTaskId(null);
              setTitle("");
              setDescription("");
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>


        {loading && <p>Loading tasks...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && tasks.length === 0 && (
          <p>No tasks found. Add your first task soon!</p>
        )}

        
        <div className="task-filters">
          {["All", "Pending", "Completed"].map((status) => (
            <button
              key={status}
              type="button"
              className="login-btn"
              onClick={() => setFilter(status)}
              style={{
                marginRight: "10px",
                backgroundColor:
                  filter === status ? "#2563eb" : undefined,
                color: filter === status ? "white" : undefined,
              }}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="task-list">
          {filteredTasks.map((task) => (
            <div className="task-card" key={task._id}>
              
              <h3>{task.title}</h3>

              <p>{task.description || "No description"}</p>

              <p>
                Status: {task.completed ? "Completed" : "Pending"}
              </p>
              
              
              <button
                type="button"
                className="start-btn"
                onClick={() => handleToggleTask(task)}
              >
                {task.completed ? "Mark Pending" : "Mark Completed"}
              </button>

              <button
                type="button"
                className="start-btn"
                onClick={() => handleDeleteTask(task._id)}
              >
                Delete
              </button>

              <button
                type="button"
                className="login-btn"
                onClick={() => handleEditTask(task)}
              >
                Edit
              </button>

            </div>
          ))}
        </div>

        <button
          className="start-btn"
          onClick={() => {
            localStorage.removeItem("token");
            setPage("home");
          }}
        >
          Logout
        </button>
      </main>
    )}



    </div>
  );
}

export default App;
