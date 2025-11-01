export interface StatePolicy {
  name: string;
  cmdMultiplier: number; // Percentage of CMD allowed (e.g., 0.80 = 80%)
  transformerMultiplier?: number; // Percentage of transformer capacity (e.g., 0.50 = 50%)
  description: string;
}

export const STATE_POLICIES: Record<string, StatePolicy> = {
  telangana: {
    name: "Telangana",
    cmdMultiplier: 0.80,
    transformerMultiplier: 0.50,
    description: "Min of 80% CMD or 50% transformer capacity"
  },
  andhraPradesh: {
    name: "Andhra Pradesh",
    cmdMultiplier: 1.00,
    description: "100% of CMD allowed"
  },
  karnataka: {
    name: "Karnataka",
    cmdMultiplier: 1.00,
    description: "100% of CMD allowed"
  },
  tamilNadu: {
    name: "Tamil Nadu",
    cmdMultiplier: 1.00,
    description: "100% of CMD allowed"
  },
  maharashtra: {
    name: "Maharashtra",
    cmdMultiplier: 1.00,
    description: "100% of CMD allowed"
  }
};

export const getStatePolicy = (stateKey: string): StatePolicy => {
  return STATE_POLICIES[stateKey] || STATE_POLICIES.telangana;
};
