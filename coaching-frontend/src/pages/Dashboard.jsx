import { useEffect, useState } from "react";
import { Users, GraduationCap, IndianRupee, TrendingUp } from "lucide-react";
import { apiRequest } from "../api/client";
import "./Dashboard.css";
import RevenueChart from "../components/RevenueChart";
import RevenuePie from "../components/RevenuePie";
import RevenueTrend from "../components/RevenueTrend";
import { generateInsights } from "../utils/insights";

function Dashboard() {
  const [stats, setStats] = useState({});
  const [salary, setSalary] = useState([]);
  const [loading, setLoading] = useState(true);
  const insights = generateInsights(stats, salary);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const dash = await apiRequest("/dash/dashboard");

        let sal = [];

        try {
          sal = await apiRequest("/teacher/salary");
        } catch (e) {
          console.log("Salary locked (premium)");
        }

        setStats(dash || {});
        setSalary(sal || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // console.log(stats);
  //  Safe calculations
  // const totalRevenue = salary.reduce(
  //   (sum, t) => sum + (t.totalRevenue || 0),
  //   0
  // );

  // const topTeacher = [...salary].sort(
  //   (a, b) => b.totalRevenue - a.totalRevenue
  // )[0];


  function DashboardSkeleton() {
    return (
      <div className="dashboard-container">

        {/* KPI skeleton */}
        <div className="kpi-grid">
          {[...Array(4)].map((_, i) => (
            <div className="kpi-card" key={i}>
              <div className="skeleton" style={{ height: 14, width: "40%" }} />
              <div className="skeleton" style={{ height: 28, marginTop: 10 }} />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="section grid-2">

          <div className="chart-card">
            <div className="skeleton" style={{ height: 20, width: "50%" }} />
            <div className="skeleton" style={{ height: 200, marginTop: 10 }} />
          </div>

          <div className="chart-card">
            <div className="skeleton" style={{ height: 20, width: "50%" }} />
            <div className="skeleton" style={{ height: 200, marginTop: 10 }} />
          </div>

          <div className="chart-card full">
            <div className="skeleton" style={{ height: 20, width: "50%" }} />
            <div className="skeleton" style={{ height: 200, marginTop: 10 }} />
          </div>

        </div>

        {/* Insights */}
        <div className="insight-card">
          <div className="skeleton" style={{ height: 16, width: "30%" }} />
          <div className="skeleton" style={{ height: 14, marginTop: 10 }} />
          <div className="skeleton" style={{ height: 14, marginTop: 8 }} />
        </div>

      </div>
    );
  }

  if (loading) return <DashboardSkeleton />;


  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your coaching performance</p>
        </div>
      </div>

      {/* KPI SECTION */}
      <div className="kpi-grid">

        <div className="kpi-card">
          <Users size={20} />
          <h4>Total Students</h4>
          <p>{stats?.summary.totalStudents || 0}</p>
        </div>

        <div className="kpi-card">
          <GraduationCap size={20} />
          <h4>Total Teachers</h4>
          <p>{stats?.summary.totalTeachers || 0}</p>
        </div>

        <div className="kpi-card revenue">
          <IndianRupee size={20} />
          <h4>Total Revenue</h4>
          <p>₹{stats?.summary.totalRevenue}</p>
        </div>

        <div className="kpi-card highlight">
          <TrendingUp size={20} />
          <h4>Top Teacher</h4>
          <p>{stats.topTeacher?.name || "N/A"}</p>
          <small>₹{stats.topTeacher?.revenue || 0}</small>
        </div>

      </div>

      {/* CHART SECTION */}
     <div className="section grid-2">

        <div className="chart-card">
          <h3>Revenue by Teacher</h3>
          <RevenueChart data={salary} />
        </div>

        <div className="chart-card">
          <h3>Revenue Distribution</h3>
          <RevenuePie data={salary} />
        </div>  

        <div className="chart-card full">
          <h3>Revenue Growth</h3>
          <RevenueTrend total={stats.summary.totalRevenue} />
        </div>

      </div>

      {/* INSIGHTS */}
      <div className="insight-card">

        <h3>Smart Insights</h3>

        <div className="insight-list">
          {insights.map((insight, i) => (
            <div key={i} className="insight-item">
              {insight}
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

export default Dashboard;