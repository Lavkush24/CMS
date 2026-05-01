import { useEffect, useState } from "react";
import { Users, GraduationCap, IndianRupee, TrendingUp } from "lucide-react";
import { apiRequest } from "../api/client";
import "./Dashboard.css";
import RevenueChart from "../components/RevenueChart";
import RevenuePie from "../components/RevenuePie";
import RevenueTrend from "../components/RevenueTrend";
import { generateInsights } from "../utils/insights";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [batchStats, setBatchStats] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [teacherChart, setTeacherChart] = useState([]);

  const insights = generateInsights(stats || {}, teacherChart);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [overview, batch, trend, teacherPerf] = await Promise.all([
          apiRequest("/dash/overview"),
          apiRequest("/chart/revenue-per-batch"),
          apiRequest("/chart/monthly-revenue"),
          apiRequest("/chart/teacher-performance")
        ]);

        setStats(overview || {});
        setBatchStats(batch || []);
        setTrendData(trend || []);
        setTeacherChart(teacherPerf || []);

      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);


  // console.log(stats);
  if (loading || !stats) return <DashboardSkeleton />;
  // console.log(teacherChart);

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your coaching performance</p>
        </div>
      </div>

      {/* KPI */}
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
          <p>₹{stats?.summary.totalRevenue || 0}</p>
        </div>

        <div className="kpi-card highlight">
          <TrendingUp size={20} />
          <h4>Top Batch</h4>
          <p>{batchStats[0]?.batchName || "N/A"}</p>
          <small>₹{batchStats[0]?.revenue || 0}</small>
        </div>

      </div>

      {/* CHARTS */}
      <div className="section grid-2">

        {/* Teacher Chart */}
        <div className="chart-card">
          <h3>Revenue by Teacher</h3>
          <RevenueChart
            data={teacherChart.map(t => ({
              name: t.name,
              totalRevenue: t.revenue
            }))}
          />
        </div>

        {/* Pie */}
        <div className="chart-card">
          <h3>Revenue Distribution</h3>
          <RevenuePie
            data={teacherChart.map(t => ({
              name: t.name,
              value: t.revenue
            }))}
          />
        </div>

        {/* Trend */}
        <div className="chart-card full">
          <h3>Revenue Growth</h3>
          <RevenueTrend data={trendData} />
        </div>

        {/* Batch Chart */}
        <div className="chart-card">
          <h3>Batch Performance</h3>
          <RevenueChart
            data={batchStats.map(b => ({
              name: b.batchName,
              totalRevenue: b.revenue
            }))}
          />
        </div>

        {/* Batch Table */}
        <div className="chart-card full">
          <h3>Batch Details</h3>

          <table className="batch-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Students</th>
                <th>Revenue</th>
                <th>Teachers</th>
              </tr>
            </thead>

            <tbody>
              {batchStats.map(b => (
                <tr key={b.batchId}>
                  <td>{b.batchName}</td>
                  <td>{b.totalStudents}</td>
                  <td>₹{b.revenue}</td>
                  <td>{b.teachers?.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

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

function DashboardSkeleton() {
  return <div className="dashboard-container">Loading...</div>;
}

export default Dashboard;