import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssessmentForm, type FormData } from "@/components/assessment/AssessmentForm";
import { FinancingOptions, type FinancingData } from "@/components/assessment/FinancingOptions";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { Charts } from "@/components/dashboard/Charts";
import { calculateAssessment, type SiteInputs, type FinancingInputs, type CalculationResults } from "@/lib/calculations";
import { getStatePolicy } from "@/lib/state-policies";
import { AlertCircle, Download, Printer, FileText } from "lucide-react";
import { toast } from "sonner";
import uniteLogo from "@/assets/unite-logo.png";

const Index = () => {
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    businessType: "",
    address: "",
    pinCode: "",
    contactNumber: "",
    email: "",
    shedType: "",
    sitePhotos: [],
    netUnits: "",
    cmd: "",
    transformerCapacity: "",
    availableSpace: "",
    requiredSpace: "",
    spaceUtilization: 80,
    stateKey: "telangana",
    tariffPerUnit: "6.50",
    systemCostPerKw: "1000",
    gstPercent: "8.9",
    cmdEnhancementCost: "500",
    sqftPerKw: "100",
  });

  const [financingData, setFinancingData] = useState<FinancingData>({
    financingModel: "zero",
    bankInterestRate: "9.0",
    udbFlatRate: "8.75",
    privateBank: false,
    loanTermYears: "5"
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showReport, setShowReport] = useState(false);
  
  // Real-time auto-calculations
  const [permittedSystemKw, setPermittedSystemKw] = useState(0);
  const [autoSystemCost, setAutoSystemCost] = useState(0);
  const [autoGst, setAutoGst] = useState(0);
  const [autoTotalCost, setAutoTotalCost] = useState(0);

  // Auto-calculate permitted KW and costs when CMD or state changes
  useEffect(() => {
    const cmdValue = parseFloat(formData.cmd);
    if (cmdValue > 0) {
      const policy = getStatePolicy(formData.stateKey);
      const permitted = cmdValue * policy.cmdMultiplier;
      setPermittedSystemKw(permitted);
      
      // Calculate auto system cost based on permitted KW and financing model
      let ratePerKw = 45000;
      if (financingData.financingModel === "bank" || financingData.financingModel === "udb") {
        if (permitted >= 500) {
          ratePerKw = 33000;
        } else if (permitted >= 200) {
          ratePerKw = 35000;
        } else if (permitted >= 100) {
          ratePerKw = 40000;
        } else if (permitted >= 50) {
          ratePerKw = 40000;
        } else {
          ratePerKw = 45000;
        }
      } else if (financingData.financingModel === "zero") {
        ratePerKw = parseFloat(formData.systemCostPerKw) || 1000;
      }
      
      const baseCost = permitted * ratePerKw;
      const gst = baseCost * 0.089;
      const total = baseCost + gst;
      
      setAutoSystemCost(baseCost);
      setAutoGst(gst);
      setAutoTotalCost(total);
      
      // Update required space
      const sqft = parseFloat(formData.sqftPerKw) || 100;
      const requiredSpace = Math.ceil(permitted * sqft);
      if (formData.requiredSpace !== requiredSpace.toString()) {
        setFormData(prev => ({
          ...prev,
          requiredSpace: requiredSpace.toString()
        }));
      }
    } else {
      setPermittedSystemKw(0);
      setAutoSystemCost(0);
      setAutoGst(0);
      setAutoTotalCost(0);
    }
  }, [formData.cmd, formData.stateKey, formData.sqftPerKw, formData.systemCostPerKw, financingData.financingModel]);

  const handleCalculate = () => {
    try {
      const siteInputs: SiteInputs = {
        customerName: formData.customerName,
        businessType: formData.businessType,
        address: formData.address,
        pinCode: formData.pinCode,
        contactNumber: formData.contactNumber,
        email: formData.email,
        netUnits: parseFloat(formData.netUnits) || 0,
        cmd: parseFloat(formData.cmd) || 0,
        transformerCapacity: formData.transformerCapacity ? parseFloat(formData.transformerCapacity) : undefined,
        availableSpace: parseFloat(formData.availableSpace) || 0,
        spaceUtilization: formData.spaceUtilization,
        stateKey: formData.stateKey,
        tariffPerUnit: parseFloat(formData.tariffPerUnit) || 7.5,
        systemCostPerKw: parseFloat(formData.systemCostPerKw) || 1000,
        gstPercent: parseFloat(formData.gstPercent) || 18,
        cmdEnhancementCost: parseFloat(formData.cmdEnhancementCost) || 500,
        sqftPerKw: parseFloat(formData.sqftPerKw) || 100
      };

      const financing: FinancingInputs = {
        financingModel: financingData.financingModel,
        bankInterestRate: parseFloat(financingData.bankInterestRate) || 8.9,
        udbFlatRate: parseFloat(financingData.udbFlatRate) || 8.75,
        privateBank: financingData.privateBank,
        loanTermYears: parseFloat(financingData.loanTermYears) || 6
      };

      const calculationResults = calculateAssessment(siteInputs, financing);
      setResults(calculationResults);
      setShowReport(true);
      
      toast.success("Assessment calculated successfully!");
    } catch (error) {
      toast.error("Error calculating assessment. Please check your inputs.");
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    toast.info("PDF export functionality will be available soon");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-card shadow-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={uniteLogo} alt="Unite Solar" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Site Assessment Tool</h1>
                <p className="text-sm text-muted-foreground">Professional solar capacity analysis</p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden md:block">v1.0</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="assessment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="assessment">Assessment Form</TabsTrigger>
            <TabsTrigger value="report" disabled={!results}>
              <FileText className="mr-2 h-4 w-4" />
              Report & Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-6">
            {/* Auto-Calculated Summary Card */}
            {permittedSystemKw > 0 && (
              <Card className="p-6 shadow-card bg-primary/5 border-primary">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Real-Time Calculation Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Permitted System (kW)</p>
                    <p className="text-xl font-bold text-primary">{permittedSystemKw.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Base System Cost</p>
                    <p className="text-xl font-bold text-foreground">₹{(autoSystemCost / 100000).toFixed(2)}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GST (8.9%)</p>
                    <p className="text-xl font-bold text-foreground">₹{(autoGst / 100000).toFixed(2)}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total System Cost</p>
                    <p className="text-xl font-bold text-primary">₹{(autoTotalCost / 100000).toFixed(2)}L</p>
                  </div>
                </div>
              </Card>
            )}
            
            <AssessmentForm 
              formData={formData} 
              onChange={setFormData} 
              onCalculate={handleCalculate}
            />
            
            {results && (
              <FinancingOptions 
                data={financingData}
                onChange={setFinancingData}
                systemSize={results.recommendedKw}
              />
            )}
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            {results && (
              <>
                {/* Warnings */}
                {results.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {results.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Summary Cards */}
                <SummaryCards results={results} />

                {/* CMD Enhancement Recommendation */}
                {results.cmdEnhancementNeeded && (
                  <Card className="p-6 shadow-card bg-accent/5 border-accent">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">CMD Enhancement Opportunity</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your available space can accommodate {results.additionalKwPossible.toFixed(1)} kW more capacity.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Additional CMD Required</p>
                        <p className="text-xl font-bold text-foreground">{results.requiredAdditionalCmd.toFixed(1)} kVA</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Enhancement Cost</p>
                        <p className="text-xl font-bold text-foreground">₹{(results.cmdEnhancementCostTotal / 100000).toFixed(2)}L</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">New Total Capacity</p>
                        <p className="text-xl font-bold text-primary">{(results.recommendedKw + results.additionalKwPossible).toFixed(1)} kW</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Charts */}
                <Charts results={results} monthlyConsumption={parseFloat(formData.netUnits) || 0} />

                {/* Capacity Details */}
                <Card className="p-6 shadow-card">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Capacity Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Permitted by CMD</p>
                      <p className="text-lg font-bold text-foreground">{results.permittedByCmdKw.toFixed(1)} kW</p>
                    </div>
                    {results.permittedByTransformerKw && (
                      <div>
                        <p className="text-sm text-muted-foreground">Permitted by Transformer</p>
                        <p className="text-lg font-bold text-foreground">{results.permittedByTransformerKw.toFixed(1)} kW</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Space Limited</p>
                      <p className="text-lg font-bold text-foreground">{results.spaceLimitedKw.toFixed(1)} kW</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Irradiation</p>
                      <p className="text-lg font-bold text-foreground">{results.unitsPerKwPerDay.toFixed(2)} units/kW/day</p>
                    </div>
                  </div>
                </Card>

                {/* Financial Details */}
                <Card className="p-6 shadow-card">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Financial Summary</h3>
                  <div className="space-y-6">
                    {/* Cost Breakdown */}
                    <div>
                      <h4 className="text-md font-semibold mb-3 text-foreground">Cost Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Base System Cost</p>
                          <p className="text-lg font-bold text-foreground">₹{(results.baseSystemCost / 100000).toFixed(2)}L</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">GST (8.9%)</p>
                          <p className="text-lg font-bold text-foreground">₹{(results.gstAmount / 100000).toFixed(2)}L</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total System Cost</p>
                          <p className="text-lg font-bold text-primary">₹{(results.totalSystemCost / 100000).toFixed(2)}L</p>
                        </div>
                      </div>
                    </div>

                    {/* Financing Breakdown */}
                    {financingData.financingModel !== "zero" && (
                      <div>
                        <h4 className="text-md font-semibold mb-3 text-foreground">Financing Details ({financingData.financingModel.toUpperCase()})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Down Payment</p>
                            <p className="text-lg font-bold text-foreground">₹{(results.downPayment / 100000).toFixed(2)}L</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Loan Amount</p>
                            <p className="text-lg font-bold text-foreground">₹{(results.loanPrincipal / 100000).toFixed(2)}L</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Interest</p>
                            <p className="text-lg font-bold text-foreground">₹{(results.totalInterest / 100000).toFixed(2)}L</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Monthly EMI</p>
                            <p className="text-lg font-bold text-primary">₹{results.monthlyEmi.toFixed(0)}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">Total Repayable (Principal + Interest)</p>
                            <p className="text-xl font-bold text-foreground">₹{(results.totalRepayable / 100000).toFixed(2)}L</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Site Photos Section */}
                {formData.sitePhotos && formData.sitePhotos.length > 0 && (
                  <Card className="p-6 shadow-card">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Site Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formData.sitePhotos.map((photo, index) => (
                        <div key={index} className="relative aspect-video overflow-hidden rounded-lg border border-border">
                          <img 
                            src={photo} 
                            alt={`Site photo ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 print:hidden">
                  <Button onClick={handlePrint} variant="outline" className="flex-1">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                  </Button>
                  <Button onClick={handleExportPDF} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-card border-t border-border print:hidden">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Unite Solar. Professional solar assessment and sales reporting tool.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
