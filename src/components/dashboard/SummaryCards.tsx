import { Card } from "@/components/ui/card";
import { CalculationResults } from "@/lib/calculations";
import { Zap, TrendingUp, DollarSign, Calendar } from "lucide-react";

interface Props {
  results: CalculationResults;
}

export const SummaryCards = ({ results }: Props) => {
  const cards = [
    {
      title: "Recommended Capacity",
      value: `${results.recommendedKw.toFixed(1)} kW`,
      subtitle: `${results.estimatedMonthlyUnits.toFixed(0)} units/month`,
      icon: Zap,
      gradient: "from-primary to-accent"
    },
    {
      title: "Consumption Coverage",
      value: `${results.coveragePercent.toFixed(1)}%`,
      subtitle: `${results.estimatedAnnualUnits.toFixed(0)} units/year`,
      icon: TrendingUp,
      gradient: "from-accent to-primary"
    },
    {
      title: "System Investment",
      value: `₹${(results.totalSystemCost / 100000).toFixed(2)}L`,
      subtitle: `EMI: ₹${results.monthlyEmi.toFixed(0)}/month`,
      icon: DollarSign,
      gradient: "from-secondary to-primary"
    },
    {
      title: "Payback Period",
      value: `${results.paybackYears.toFixed(1)} years`,
      subtitle: `Savings: ₹${(results.annualSavings / 100000).toFixed(2)}L/year`,
      icon: Calendar,
      gradient: "from-primary to-secondary"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="p-6 shadow-elevated hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{card.value}</h3>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
