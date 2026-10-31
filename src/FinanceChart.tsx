import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { money, type Bundle } from "./api";
export default function FinanceChart({
  projects,
  currency,
}: {
  projects: Bundle[];
  currency: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={projects.map((p) => ({
          name: p.project.title,
          budget: p.finance.total / 100,
          actual: p.finance.spent / 100,
        }))}
        margin={{ top: 10, right: 20, left: 15, bottom: 10 }}
      >
        <CartesianGrid vertical={false} stroke="#edf0f1" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) =>
            new Intl.NumberFormat("en", { notation: "compact" }).format(v)
          }
        />
        <Tooltip
          formatter={(v: any) => money(Number(v) * 100, currency)}
          contentStyle={{ borderRadius: 10, border: "1px solid #e4e9e8" }}
        />
        <Bar
          name="Budget"
          dataKey="budget"
          fill="#137c6c"
          radius={[4, 4, 0, 0]}
          maxBarSize={30}
        />
        <Bar
          name="Actual spend"
          dataKey="actual"
          fill="#a7cec4"
          radius={[4, 4, 0, 0]}
          maxBarSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
