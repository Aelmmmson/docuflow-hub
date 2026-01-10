import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
  { name: "Electric", amount: 4200, color: "hsl(var(--primary))" },
  { name: "Newspaper", amount: 1800, color: "hsl(var(--accent))" },
  { name: "Office", amount: 2400, color: "hsl(var(--success))" },
  { name: "Travel", amount: 3100, color: "hsl(var(--warning))" },
  { name: "Software", amount: 2800, color: "hsl(var(--destructive))" },
];

export function ExpensesChart() {
  return (
    <div className="rounded-xl bg-card p-4 shadow-card-md animate-fade-in" style={{ animationDelay: "300ms" }}>
      <h3 className="text-xs font-semibold text-card-foreground mb-3">Paid Expenses</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "11px",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
