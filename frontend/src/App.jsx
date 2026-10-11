
import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");

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
      onSubmit={(e) => {
        e.preventDefault();
        alert("Login form submitted!");
      }}
      className="login-form"
    >
      <input
        type="email"
        placeholder="Enter your email"
        required
      />

      <input
        type="password"
        placeholder="Enter your password"
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
