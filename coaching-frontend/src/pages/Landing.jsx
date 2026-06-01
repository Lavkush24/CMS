import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  Layers, 
  ShieldCheck, 
  Zap,
  ArrowRight
} from "lucide-react";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`;
  };

  return (
    <div className="landing-container">
      
      {/* ─── NAVBAR (Simple Landing Nav) ─── */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <Layers className="logo-icon" />
          <span>Coaching Manager</span>
        </div>
        <button className="btn-nav-login" onClick={handleLogin}>
          Login
        </button>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-badge">✨ The #1 OS for Coaching Institutes</div>
          
          <h1>
            Stop Managing Coaching Manually.<br />
            <span className="text-gradient">Run It Like a Business.</span>
          </h1>

          <p className="hero-subtitle">
            From student records to revenue analytics — everything in one beautiful dashboard. 
            Built specifically for coaching owners who demand clarity and control.
          </p>

          <div className="hero-actions">
            <button className="btn-primary-large" onClick={handleLogin}>
              Get started with Google <ArrowRight size={18} />
            </button>
            <button className="btn-secondary-large">
              See Live Demo
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat-card">
              <h3 className="mono-number">ONE</h3>
              <p>Central Dashboard</p>
            </div>
            <div className="hero-stat-card highlight">
              <h3 className="mono-number">100%</h3>
              <p>Revenue Clarity</p>
            </div>
            <div className="hero-stat-card">
              <h3 className="mono-number">ZERO</h3>
              <p>Spreadsheets Needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM vs SOLUTION ─── */}
      <section className="features-section">
        <div className="section-header">
          <h2>One System. <span className="text-gradient">Total Control.</span></h2>
          <p>Replace scattered Excel sheets and messy WhatsApp groups with a single source of truth.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-wrapper blue">
              <Users size={24} />
            </div>
            <h3>Smart Student System</h3>
            <p>Add students, auto-assign batches, and track fee defaults instantly. Never lose track of a single admission.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper green">
              <TrendingUp size={24} />
            </div>
            <h3>Batch Intelligence</h3>
            <p>Know exactly which batches are highly profitable and which are failing. Optimize your teaching strategy dynamically.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper purple">
              <Wallet size={24} />
            </div>
            <h3>Revenue & Salary Split</h3>
            <p>Automate teacher salary splits based on custom percentages. See exactly where your money flows with 100% clarity.</p>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get your coaching digitized and running smoothly in under 3 minutes.</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <h4>Secure Login</h4>
            <p>One-click Google authentication. No complex setups.</p>
          </div>
          <div className="step-connector"></div>
          
          <div className="step-card">
            <div className="step-number">02</div>
            <h4>Map Your Institute</h4>
            <p>Add your teachers, define revenue shares, and create batches.</p>
          </div>
          <div className="step-connector"></div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h4>Automate Growth</h4>
            <p>Enroll students, log fees, and let the dashboard do the math.</p>
          </div>
        </div>
      </section>

      {/* ─── TRUST / CTA SECTION ─── */}
      <section className="cta-section">
        <div className="cta-card">
          <ShieldCheck size={48} className="cta-icon" />
          <h2>Start Managing Smarter Today</h2>
          <p>Join top coaching owners who have transitioned from chaos to complete control. No credit card required. No complex setup.</p>
          
          <button className="btn-cta" onClick={handleLogin}>
            Login with Google <Zap size={18} />
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Coaching Manager. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default Landing;