import { useNavigate } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* HERO */}
      <section className="hero">
        <h1>Manage Your Coaching Smarter 🚀</h1>
        <p>
          Track students, batches, and revenue in one place.
          Built for modern coaching institutes.
        </p>

        <button onClick={() => navigate("/login")}>
          Get Started with Google
        </button>
      </section>

      {/* PROBLEM */}
      <section className="section">
        <h2>Why Coaching Management is Hard?</h2>

        <div className="grid-3">
          <div className="card">
            <h3>Manual Records</h3>
            <p>Managing students in notebooks or Excel is messy.</p>
          </div>

          <div className="card">
            <h3>No Revenue Tracking</h3>
            <p>You don’t know where your money comes from.</p>
          </div>

          <div className="card">
            <h3>Teacher Payments</h3>
            <p>Calculating salary manually is error-prone.</p>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="section">
        <h2>What We Provide</h2>

        <div className="grid-3">
          <div className="card">
            <h3>Student Management</h3>
            <p>Add, track, and manage all students easily.</p>
          </div>

          <div className="card">
            <h3>Batch System</h3>
            <p>Organize classes with teachers and schedules.</p>
          </div>

          <div className="card">
            <h3>Revenue Analytics</h3>
            <p>Know exactly how much each teacher earns.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start Managing Your Coaching Today</h2>

        <button onClick={() => navigate("/login")}>
          Login with Google
        </button>
      </section>

    </div>
  );
}

export default Landing;