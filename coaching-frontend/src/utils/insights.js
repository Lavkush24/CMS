export function generateInsights(stats, salary) {
  if (!salary || salary.length === 0) {
    return ["No revenue data available"];
  }

  const totalRevenue = salary.reduce(
    (sum, t) => sum + (t.totalRevenue || 0),
    0
  );

  const sorted = [...salary].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  const top = sorted[0];
  const insights = [];

  // 🔥 Top teacher dominance
  const dominance = (top.totalRevenue / totalRevenue) * 100;

  if (dominance > 50) {
    insights.push(
      `⚠️ ${top.name} generates ${dominance.toFixed(
        0
      )}% of total revenue. Risk of dependency.`
    );
  } else {
    insights.push(
      `✅ Revenue is well distributed across teachers.`
    );
  }

  // 📊 Average revenue per student
  if (stats?.totalStudents) {
    const avg = totalRevenue / stats.totalStudents;

    if (avg < 2000) {
      insights.push(
        `📉 Average revenue per student is low (₹${Math.round(avg)}). Consider pricing strategy.`
      );
    } else {
      insights.push(
        `💰 Healthy revenue per student (₹${Math.round(avg)}).`
      );
    }
  }

  // 🚨 No revenue case
  if (totalRevenue === 0) {
    insights.push(" No revenue detected. Check student fees.");
  }

  return insights;
}