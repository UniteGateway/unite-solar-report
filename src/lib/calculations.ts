import { getIrradiation } from "./irradiation-data";
import { getStatePolicy } from "./state-policies";

export interface SiteInputs {
  customerName: string;
  businessType: string;
  address: string;
  pinCode: string;
  contactNumber: string;
  email: string;
  netUnits: number;
  cmd: number;
  transformerCapacity?: number;
  availableSpace: number;
  spaceUtilization: number;
  stateKey: string;
  tariffPerUnit: number;
  systemCostPerKw: number;
  gstPercent: number;
  cmdEnhancementCost: number;
  sqftPerKw: number;
}

export interface FinancingInputs {
  financingModel: "bank" | "udb" | "zero";
  bankInterestRate: number;
  udbFlatRate: number;
  privateBank: boolean;
  loanTermYears: number;
}

export interface CalculationResults {
  // Capacity
  permittedByCmdKw: number;
  permittedByTransformerKw?: number;
  permittedByPolicyKw: number;
  spaceLimitedKw: number;
  recommendedKw: number;
  
  // Generation
  unitsPerKwPerDay: number;
  estimatedDailyUnits: number;
  estimatedMonthlyUnits: number;
  estimatedAnnualUnits: number;
  coveragePercent: number;
  
  // Costs
  baseSystemCost: number;
  gstAmount: number;
  totalSystemCost: number;
  
  // CMD Enhancement
  cmdEnhancementNeeded: boolean;
  additionalKwPossible: number;
  requiredAdditionalCmd: number;
  cmdEnhancementCostTotal: number;
  
  // Financing
  downPayment: number;
  loanPrincipal: number;
  totalInterest: number;
  monthlyEmi: number;
  totalRepayable: number;
  
  // ROI
  annualSavings: number;
  paybackYears: number;
  paybackMonths: number;
  
  // Warnings
  warnings: string[];
}

export function calculateAssessment(
  inputs: SiteInputs,
  financing: FinancingInputs
): CalculationResults {
  const warnings: string[] = [];
  
  // Get state policy
  const policy = getStatePolicy(inputs.stateKey);
  
  // Calculate permitted capacity by CMD
  const permittedByCmdKw = inputs.cmd * policy.cmdMultiplier;
  
  // Calculate permitted capacity by transformer (if provided)
  let permittedByTransformerKw: number | undefined;
  if (inputs.transformerCapacity) {
    permittedByTransformerKw = inputs.transformerCapacity * (policy.transformerMultiplier || 0.50);
    
    // Warning if transformer < CMD * 0.8
    if (inputs.transformerCapacity * 0.8 < inputs.cmd) {
      warnings.push("Transformer capacity may restrict CMD - consult electrical team");
    }
  }
  
  // Final permitted by policy
  const permittedByPolicyKw = permittedByTransformerKw 
    ? Math.min(permittedByCmdKw, permittedByTransformerKw)
    : permittedByCmdKw;
  
  // Calculate space-limited capacity
  const effectiveSpace = inputs.availableSpace * (inputs.spaceUtilization / 100);
  const spaceLimitedKw = Math.floor(effectiveSpace / inputs.sqftPerKw);
  
  // Final recommendation
  const recommendedKw = Math.min(permittedByPolicyKw, spaceLimitedKw);
  
  // Generation calculations
  const unitsPerKwPerDay = getIrradiation(inputs.pinCode);
  const estimatedDailyUnits = recommendedKw * unitsPerKwPerDay;
  const estimatedMonthlyUnits = estimatedDailyUnits * 30;
  const estimatedAnnualUnits = estimatedDailyUnits * 365;
  
  // Coverage
  const monthlyConsumption = inputs.netUnits;
  const coveragePercent = monthlyConsumption > 0 
    ? (estimatedMonthlyUnits / monthlyConsumption) * 100 
    : 0;
  
  if (monthlyConsumption <= 0) {
    warnings.push("Net units consumed is zero or negative - please verify bill data");
  }
  
  if (coveragePercent > 100) {
    warnings.push("Estimated generation exceeds consumption - verify net metering policy");
  }
  
  // System cost
  const baseSystemCost = recommendedKw * inputs.systemCostPerKw;
  const gstAmount = baseSystemCost * (inputs.gstPercent / 100);
  const totalSystemCost = baseSystemCost + gstAmount;
  
  // CMD Enhancement recommendation
  const cmdEnhancementNeeded = spaceLimitedKw > permittedByPolicyKw;
  const additionalKwPossible = Math.max(0, spaceLimitedKw - permittedByPolicyKw);
  const requiredAdditionalCmd = additionalKwPossible / policy.cmdMultiplier;
  const cmdEnhancementCostTotal = requiredAdditionalCmd * inputs.cmdEnhancementCost;
  
  // Financing calculations
  let downPayment = 0;
  let loanPrincipal = 0;
  let totalInterest = 0;
  let monthlyEmi = 0;
  
  const loanTermMonths = financing.loanTermYears * 12;
  
  if (financing.financingModel === "bank") {
    // Bank loan: 10% down, 90% loan, diminishing interest
    downPayment = totalSystemCost * 0.10;
    loanPrincipal = totalSystemCost * 0.90;
    
    const monthlyRate = financing.bankInterestRate / 12 / 100;
    const n = loanTermMonths;
    
    if (monthlyRate > 0) {
      monthlyEmi = loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, n) / 
                   (Math.pow(1 + monthlyRate, n) - 1);
      totalInterest = (monthlyEmi * n) - loanPrincipal;
    } else {
      monthlyEmi = loanPrincipal / n;
      totalInterest = 0;
    }
  } else {
    // UDB: 100% financed, flat interest
    downPayment = 0;
    loanPrincipal = totalSystemCost;
    
    totalInterest = loanPrincipal * (financing.udbFlatRate / 100) * financing.loanTermYears;
    monthlyEmi = (loanPrincipal + totalInterest) / loanTermMonths;
  }
  
  const totalRepayable = downPayment + loanPrincipal + totalInterest;
  
  // ROI calculations
  const annualSavings = estimatedAnnualUnits * inputs.tariffPerUnit;
  const annualEmi = monthlyEmi * 12;
  const netAnnualCashflow = annualSavings - annualEmi;
  
  // Simple payback: total outlay / annual savings
  let paybackYears = totalRepayable / annualSavings;
  
  // Add 1 year if private bank selected
  if (financing.privateBank) {
    paybackYears += 1;
  }
  
  const paybackMonths = Math.ceil(paybackYears * 12);
  
  return {
    permittedByCmdKw,
    permittedByTransformerKw,
    permittedByPolicyKw,
    spaceLimitedKw,
    recommendedKw,
    unitsPerKwPerDay,
    estimatedDailyUnits,
    estimatedMonthlyUnits,
    estimatedAnnualUnits,
    coveragePercent,
    baseSystemCost,
    gstAmount,
    totalSystemCost,
    cmdEnhancementNeeded,
    additionalKwPossible,
    requiredAdditionalCmd,
    cmdEnhancementCostTotal,
    downPayment,
    loanPrincipal,
    totalInterest,
    monthlyEmi,
    totalRepayable,
    annualSavings,
    paybackYears,
    paybackMonths,
    warnings
  };
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  years: number
): Array<{ month: number; emi: number; interest: number; principalPaid: number; balance: number }> {
  const schedule = [];
  const monthlyRate = annualRate / 12 / 100;
  const n = years * 12;
  
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, n) / 
              (Math.pow(1 + monthlyRate, n) - 1);
  
  let balance = principal;
  
  for (let month = 1; month <= n; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance = Math.max(0, balance - principalPaid);
    
    schedule.push({
      month,
      emi: Math.round(emi),
      interest: Math.round(interest),
      principalPaid: Math.round(principalPaid),
      balance: Math.round(balance)
    });
  }
  
  return schedule;
}
