import { useNavigate } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Stop Managing Coaching Manually.
            <br />
            <span>Run It Like a Business.</span>
          </h1>

          <p>
            From student records to revenue analytics — everything in one dashboard.
            Built for coaching owners who want clarity and control.
          </p>

          <div className="hero-actions">
            <button
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`;
              }}
            >
              Get started with Google
            </button>

            <button className="secondary">
              See Demo
            </button>
          </div>

          {/* <div className="hero-stats">
            <div>
              <h3>100+</h3>
              <p>Students Managed</p>
            </div>
            <div>
              <h3>₹50K+</h3>
              <p>Revenue Tracked</p>
            </div>
            <div>
              <h3>10x</h3>
              <p>Time Saved</p>
            </div>
          </div> */}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section">
        <h2>Running a Coaching is Hard — Here’s Why</h2>

        <div className="grid-3">
          <div className="card">
            <h3>📉 No Visibility</h3>
            <p>
              You don’t know which batch earns more or which one is failing.
            </p>
          </div>

          <div className="card">
            <h3>🧾 Manual Work</h3>
            <p>
              Registers, Excel sheets, WhatsApp — everything is scattered.
            </p>
          </div>

          <div className="card">
            <h3>💸 Confusing Payments</h3>
            <p>
              Teacher salary and revenue split becomes messy over time.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="section alt">
        <h2>One System. Total Control.</h2>

        <div className="grid-3">
          <div className="card">
            <h3>📚 Smart Student System</h3>
            <p>
              Add students, auto-assign batches, track fees — all in seconds.
            </p>
          </div>

          <div className="card">
            <h3>🧩 Batch Intelligence</h3>
            <p>
              Know which batch performs best. Optimize your teaching strategy.
            </p>
          </div>

          <div className="card">
            <h3>📊 Revenue Clarity</h3>
            <p>
              See exactly how much each teacher earns and where money flows.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <h2>How It Works</h2>

        <div className="steps">
          <div className="step">
            <span>1</span>
            <p>Login with Google</p>
          </div>

          <div className="step">
            <span>2</span>
            <p>Add your students & batches</p>
          </div>

          <div className="step">
            <span>3</span>
            <p>Track revenue automatically</p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="section alt">
        <h2>Built for Real Coaching Owners</h2>
        <p className="center">
          Designed to solve real problems — not just another dashboard.
        </p>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start Managing Smarter Today</h2>
        <p>No setup. No complexity. Just results.</p>

        <button onClick={() => navigate("/login")}>
          Login with Google →
        </button>
      </section>

    </div>
  );
}

export default Landing;