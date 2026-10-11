
import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

        alert("Login successful!");
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
    </div>
  );
}

export default App;
