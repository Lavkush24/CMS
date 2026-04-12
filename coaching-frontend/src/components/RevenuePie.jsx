import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

function RevenuePie({ data }) {

  const cleanData = data.map(t => ({
    name: t.name,
    value: t.totalRevenue
  }));

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer>
        <PieChart>

          <Pie
            data={cleanData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={({ percent }) =>
              `${(percent * 100).toFixed(0)}%`
            }
          >
            {cleanData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip formatter={(v) => `₹${v}`} />

          <Legend
            verticalAlign="bottom"
            height={36}
          />

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenuePie;