import { useState,useEffect } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  
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

        {loading && <p>Loading tasks...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && tasks.length === 0 && (
          <p>No tasks found. Add your first task soon!</p>
        )}

        <div className="task-list">
          {tasks.map((task) => (
            <div className="task-card" key={task._id}>
              <h3>{task.title}</h3>

              <p>{task.description || "No description"}</p>

              <p>
                Status: {task.completed ? "Completed" : "Pending"}
              </p>
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
