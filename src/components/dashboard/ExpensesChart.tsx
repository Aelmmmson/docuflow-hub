// src/components/dashboard/ExpensesChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ExpenseItem } from "@/pages/Dashboard"; // import type

interface ExpensesChartProps {
  expensesData: ExpenseItem[];
}

export function ExpensesChart({ expensesData }: ExpensesChartProps) {
  return (
    <div className="relative w-full h-64 animate-fade-in" style={{ animationDelay: "300ms" }}>
      {/* Folder tab – unchanged */}
      <div className="work-5 bg-gradient-to-r from-indigo-300 to-indigo-300 w-full h-full rounded-2xl rounded-tl-none relative 
        after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-32 after:h-4 after:bg-gradient-to-r after:from-indigo-300 after:to-indigo-300 after:rounded-t-2xl 
        before:absolute before:content-[''] before:-top-[14px] before:left-[123px] before:w-4 before:h-4 before:bg-gradient-to-r before:from-indigo-300 before:to-indigo-300 before:[clip-path:polygon(0_35%,0%_100%,50%_100%)]" />
      
      {/* File layers – unchanged */}
      <div className="work-4 absolute inset-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl" />
      <div className="work-2 absolute inset-1 bg-indigo-100 dark:bg-indigo-800/40 rounded-2xl" />
      
      {/* Main folder body – unchanged */}
      <div className="work-1 absolute bottom-0 bg-gradient-to-t from-indigo-50 to-white dark:from-indigo-950/50 dark:to-card w-full h-[calc(100%-16px)] rounded-2xl rounded-tr-none overflow-hidden
        after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[80%] after:h-[16px] after:bg-white dark:after:bg-card after:rounded-t-2xl 
        before:absolute before:content-[''] before:-top-[10px] before:right-[calc(80%-12px)] before:size-3 before:bg-white dark:before:bg-card before:[clip-path:polygon(100%_14%,50%_100%,100%_100%)]">
        <div className="absolute inset-0 flex flex-col z-10 p-4 space-y-2">
          <h2 className="text-sm font-bold text-foreground mb-2">Paid Expenses</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="description"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                  tickFormatter={(value) => `ghs${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "hsl(var(--foreground))", // visible in dark mode
                  }}
                  formatter={(value: number) => [`ghs${value.toLocaleString()}`, "Amount"]}
                />
                <Bar dataKey="requested_amount" radius={[4, 4, 0, 0]}>
                  {expensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color_code} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}