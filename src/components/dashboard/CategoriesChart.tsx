import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Newspaper Expense", value: 35, color: "hsl(var(--primary))" },
  { name: "Electric Expenses", value: 45, color: "hsl(var(--accent))" },
  { name: "Office Supplies", value: 20, color: "hsl(var(--warning))" },
];

export function CategoriesChart() {
  return (
    <div className="rounded-xl bg-card p-4 shadow-card-md animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="text-xs font-semibold text-card-foreground mb-3">Document Categories</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "11px",
              }}
              formatter={(value: number) => [`${value}%`, "Percentage"]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: "hsl(var(--card-foreground))", fontSize: "10px" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
