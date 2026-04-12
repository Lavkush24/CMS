
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer  // ✅ THIS WAS MISSING
} from "recharts";


function RevenueChart({ data }) {

  const cleanData = data.map(t => ({
    name: t.name || "Unknown",
    totalRevenue: Number(t.totalRevenue || 0)
  }));

  const textColor = getComputedStyle(document.body)
    .getPropertyValue("--text");

  const primaryColor = getComputedStyle(document.body)
    .getPropertyValue("--primary");

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cleanData}>
          
          <XAxis dataKey="name" stroke={textColor} />
          <YAxis stroke={textColor} />

          <Tooltip formatter={(v) => `₹${v}`} />

          <Bar
            dataKey="totalRevenue"
            fill={primaryColor}
            radius={[6, 6, 0, 0]}
          />

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


export default RevenueChart;