import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATE_POLICIES } from "@/lib/state-policies";
import { Camera, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface FormData {
  customerName: string;
  businessType: string;
  address: string;
  pinCode: string;
  contactNumber: string;
  email: string;
  netUnits: string;
  cmd: string;
  transformerCapacity: string;
  availableSpace: string;
  spaceUtilization: number;
  stateKey: string;
  tariffPerUnit: string;
  systemCostPerKw: string;
  gstPercent: string;
  cmdEnhancementCost: string;
  sqftPerKw: string;
}

interface Props {
  formData: FormData;
  onChange: (data: FormData) => void;
  onCalculate: () => void;
}

export const AssessmentForm = ({ formData, onChange, onCalculate }: Props) => {
  const [ocrStatus, setOcrStatus] = useState<string>("");

  const updateField = (field: keyof FormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOcrStatus("Processing power bill...");
      // Simulate OCR processing
      setTimeout(() => {
        setOcrStatus("OCR completed - please verify extracted values");
        // In production, this would call an OCR API
      }, 1500);
    }
  };

  const isFormValid = () => {
    return formData.customerName && 
           formData.netUnits && 
           formData.cmd && 
           formData.availableSpace &&
           formData.pinCode;
  };

  return (
    <div className="space-y-6">
      {/* Site Information */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Site Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Select value={formData.businessType} onValueChange={(v) => updateField("businessType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industry">Industry</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Enter site address"
            />
          </div>
          
          <div>
            <Label htmlFor="pinCode">PIN Code *</Label>
            <Input
              id="pinCode"
              value={formData.pinCode}
              onChange={(e) => updateField("pinCode", e.target.value)}
              placeholder="Enter PIN code"
            />
          </div>
          
          <div>
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => updateField("contactNumber", e.target.value)}
              placeholder="Enter contact number"
            />
          </div>
        </div>
      </Card>

      {/* Power Bill Input */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Power Bill Information</h3>
        
        <div className="mb-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => document.getElementById('camera')?.click()}>
            <Camera className="mr-2 h-4 w-4" />
            Capture Bill
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => document.getElementById('file')?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Bill
          </Button>
          <input
            id="camera"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
          <input
            id="file"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        
        {ocrStatus && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{ocrStatus}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="netUnits">Net Units (kWh) *</Label>
            <Input
              id="netUnits"
              type="number"
              value={formData.netUnits}
              onChange={(e) => updateField("netUnits", e.target.value)}
              placeholder="Monthly consumption"
            />
          </div>
          
          <div>
            <Label htmlFor="cmd">Contract Load (CMD in kVA) *</Label>
            <Input
              id="cmd"
              type="number"
              value={formData.cmd}
              onChange={(e) => updateField("cmd", e.target.value)}
              placeholder="Enter CMD"
            />
          </div>
          
          <div>
            <Label htmlFor="transformerCapacity">Transformer Capacity (kVA)</Label>
            <Input
              id="transformerCapacity"
              type="number"
              value={formData.transformerCapacity}
              onChange={(e) => updateField("transformerCapacity", e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
      </Card>

      {/* Space & State Policy */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Space & Policy Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="availableSpace">Available Space (sqft) *</Label>
            <Input
              id="availableSpace"
              type="number"
              value={formData.availableSpace}
              onChange={(e) => updateField("availableSpace", e.target.value)}
              placeholder="Total available space"
            />
          </div>
          
          <div>
            <Label htmlFor="state">State</Label>
            <Select value={formData.stateKey} onValueChange={(v) => updateField("stateKey", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATE_POLICIES).map(([key, policy]) => (
                  <SelectItem key={key} value={key}>
                    {policy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.stateKey && (
              <Badge variant="secondary" className="mt-2">
                {STATE_POLICIES[formData.stateKey]?.description}
              </Badge>
            )}
          </div>
          
          <div className="md:col-span-2">
            <Label>Space Utilization: {formData.spaceUtilization}%</Label>
            <Slider
              value={[formData.spaceUtilization]}
              onValueChange={(v) => updateField("spaceUtilization", v[0])}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Pricing Configuration */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Pricing Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="tariffPerUnit">Tariff (₹/unit)</Label>
            <Input
              id="tariffPerUnit"
              type="number"
              step="0.01"
              value={formData.tariffPerUnit}
              onChange={(e) => updateField("tariffPerUnit", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="systemCostPerKw">System Cost (₹/kW)</Label>
            <Input
              id="systemCostPerKw"
              type="number"
              value={formData.systemCostPerKw}
              onChange={(e) => updateField("systemCostPerKw", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="gstPercent">GST %</Label>
            <Input
              id="gstPercent"
              type="number"
              value={formData.gstPercent}
              onChange={(e) => updateField("gstPercent", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="cmdEnhancementCost">CMD Enhancement (₹/kVA)</Label>
            <Input
              id="cmdEnhancementCost"
              type="number"
              value={formData.cmdEnhancementCost}
              onChange={(e) => updateField("cmdEnhancementCost", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="sqftPerKw">Space Required (sqft/kW)</Label>
            <Input
              id="sqftPerKw"
              type="number"
              value={formData.sqftPerKw}
              onChange={(e) => updateField("sqftPerKw", e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Button 
        onClick={onCalculate} 
        disabled={!isFormValid()}
        className="w-full"
        size="lg"
      >
        Calculate Assessment
      </Button>
    </div>
  );
};
