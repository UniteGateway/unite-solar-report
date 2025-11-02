import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

export interface FinancingData {
  financingModel: "bank" | "udb" | "zero";
  bankInterestRate: string;
  udbFlatRate: string;
  privateBank: boolean;
  loanTermYears: string;
}

interface Props {
  data: FinancingData;
  onChange: (data: FinancingData) => void;
  systemSize: number;
}

export const FinancingOptions = ({ data, onChange, systemSize }: Props) => {
  const updateField = (field: keyof FinancingData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // Auto-suggest loan term based on system size
  const suggestedTerm = systemSize > 100 ? 5 : data.financingModel === "zero" ? 7 : 6;

  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Financing Options</h3>
      
      <div className="space-y-4">
        <div>
          <Label>Financing Model</Label>
          <RadioGroup value={data.financingModel} onValueChange={(v: any) => updateField("financingModel", v)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank" id="bank" />
              <Label htmlFor="bank" className="font-normal cursor-pointer">
                Bank Loan (10% advance + 90% loan @ diminishing)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="udb" id="udb" />
              <Label htmlFor="udb" className="font-normal cursor-pointer">
                UDB (100% loan @ flat rate)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="zero" id="zero" />
              <Label htmlFor="zero" className="font-normal cursor-pointer">
                Zero Investment (60 months, tiered pricing)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bankInterestRate">Bank Interest Rate (% p.a.)</Label>
            <Input
              id="bankInterestRate"
              type="number"
              step="0.1"
              value={data.bankInterestRate}
              onChange={(e) => updateField("bankInterestRate", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="udbFlatRate">UDB Flat Rate (% p.a.)</Label>
            <Input
              id="udbFlatRate"
              type="number"
              step="0.1"
              value={data.udbFlatRate}
              onChange={(e) => updateField("udbFlatRate", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="loanTermYears">Loan Term (years)</Label>
            <Input
              id="loanTermYears"
              type="number"
              value={data.loanTermYears}
              onChange={(e) => updateField("loanTermYears", e.target.value)}
              placeholder={`Suggested: ${suggestedTerm}`}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="privateBank"
              checked={data.privateBank}
              onCheckedChange={(checked) => updateField("privateBank", checked)}
            />
            <Label htmlFor="privateBank" className="font-normal cursor-pointer">
              Private Bank (+1 year ROI)
            </Label>
          </div>
        </div>
      </div>
    </Card>
  );
};
