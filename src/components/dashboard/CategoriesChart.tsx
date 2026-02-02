// src/components/dashboard/CategoriesChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CategoryItem } from "@/pages/Dashboard";

interface CategoriesChartProps {
  categoriesData: CategoryItem[];
}

export function CategoriesChart({ categoriesData }: CategoriesChartProps) {
  const totalQuantity = categoriesData.reduce((sum, item) => sum + item.quantity, 0);
  const chartData = categoriesData.map(item => ({
    name: item.description,
    value: totalQuantity > 0 ? (item.quantity / totalQuantity * 100) : 0,
    color: item.color_code,
  }));

  return (
    <div className="relative w-full h-64 animate-fade-in" style={{ animationDelay: "400ms" }}>
      {/* Folder tab on TOP RIGHT */}
      <div className="work-5 bg-gradient-to-r from-emerald-300 to-emerald-300 w-full h-full rounded-2xl rounded-tr-none relative 
        after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-32 after:h-4 after:bg-gradient-to-r after:from-emerald-300 after:to-emerald-300 after:rounded-t-2xl 
        before:absolute before:content-[''] before:-top-[14px] before:right-[123px] before:w-4 before:h-4 before:bg-gradient-to-r before:from-emerald-300 before:to-emerald-300 before:[clip-path:polygon(100%_35%,100%_100%,50%_100%)]" />
      
      {/* File layers */}
      <div className="work-4 absolute inset-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl" />
      <div className="work-2 absolute inset-1 bg-emerald-100 dark:bg-emerald-800/40 rounded-2xl" />
      
      {/* Main folder body - with extension on top left */}
      <div className="work-1 absolute bottom-0 bg-gradient-to-t from-emerald-50 to-white dark:from-emerald-950/50 dark:to-card w-full h-[calc(100%-16px)] rounded-2xl rounded-tl-none overflow-hidden
        after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-[80%] after:h-[16px] after:bg-white dark:after:bg-card after:rounded-t-2xl 
        before:absolute before:content-[''] before:-top-[10px] before:left-[calc(80%-12px)] before:size-3 before:bg-white dark:before:bg-card before:[clip-path:polygon(0_14%,50%_100%,0%_100%)]">
        <div className="absolute inset-0 flex flex-col z-10 p-4 space-y-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-foreground">Document Categories</h2>
            <span className="text-2xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded-full inline-flex items-center gap-1 shadow-sm">
              {categoriesData.length} Active
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "hsl(var(--foreground))", // visible in dark mode
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Percentage"]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  iconType="circle"
                  iconSize={6}
                  formatter={(value) => (
                    <span style={{ color: "hsl(var(--card-foreground))", fontSize: "9px" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}