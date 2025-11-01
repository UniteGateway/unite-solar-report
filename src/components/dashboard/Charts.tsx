import { Card } from "@/components/ui/card";
import { CalculationResults } from "@/lib/calculations";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface Props {
  results: CalculationResults;
  monthlyConsumption: number;
}

export const Charts = ({ results, monthlyConsumption }: Props) => {
  // Generation vs Consumption
  const genVsConsumption = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    generation: Math.round(results.estimatedMonthlyUnits),
    consumption: Math.round(monthlyConsumption)
  }));

  // Cost breakdown
  const costData = [
    { name: "Base Cost", value: Math.round(results.baseSystemCost), color: "hsl(var(--primary))" },
    { name: "GST", value: Math.round(results.gstAmount), color: "hsl(var(--accent))" },
    { name: "Interest", value: Math.round(results.totalInterest), color: "hsl(var(--secondary))" }
  ];

  // Payback projection
  const paybackData = Array.from({ length: Math.ceil(results.paybackYears) + 1 }, (_, year) => {
    const savings = results.annualSavings * year;
    const loanBalance = Math.max(0, results.totalRepayable - (results.monthlyEmi * 12 * year));
    
    return {
      year: `Y${year}`,
      cumulativeSavings: Math.round(savings / 100000),
      loanBalance: Math.round(loanBalance / 100000)
    };
  });

  return (
    <div className="space-y-6">
      {/* Generation vs Consumption */}
      <Card className="p-6 shadow-card">
        <h4 className="text-lg font-semibold mb-4">Monthly Generation vs Consumption</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={genVsConsumption}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))"
              }}
            />
            <Legend />
            <Bar dataKey="generation" fill="hsl(var(--primary))" name="Solar Generation (kWh)" />
            <Bar dataKey="consumption" fill="hsl(var(--accent))" name="Consumption (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <Card className="p-6 shadow-card">
          <h4 className="text-lg font-semibold mb-4">Investment Breakdown</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))"
                }}
                formatter={(value: number) => `₹${(value / 100000).toFixed(2)}L`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Payback Projection */}
        <Card className="p-6 shadow-card">
          <h4 className="text-lg font-semibold mb-4">Payback Timeline</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paybackData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: '₹ Lakhs', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))"
                }}
                formatter={(value: number) => `₹${value}L`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulativeSavings" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="Cumulative Savings"
              />
              <Line 
                type="monotone" 
                dataKey="loanBalance" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="Loan Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};
