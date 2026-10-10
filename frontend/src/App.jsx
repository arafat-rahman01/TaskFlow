import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2>TaskFlow</h2>
        <button className="login-btn">Login</button>
      </nav>

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

        <button className="start-btn">
          Get Started
        </button>
      </main>
    </div>
  );
}

export default App;