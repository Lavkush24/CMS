import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function RevenueTrend({ total }) {

  const data = [
    { month: "Jan", value: total * 0.3 },
    { month: "Feb", value: total * 0.5 },
    { month: "Mar", value: total * 0.7 },
    { month: "Apr", value: total }
  ];

  return (
    <div style={{ width: "100%", height: "280px" }}>
      <ResponsiveContainer>
        <LineChart data={data}>

          <XAxis dataKey="month" />
          <YAxis />

          <Tooltip formatter={(v) => `₹${Math.round(v)}`} />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#4f46e5"
            strokeWidth={3}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueTrend;