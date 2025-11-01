// Solar irradiation data by PIN code (units per kW per day)
// Fallback default: 4.5 units/day/kW

export const IRRADIATION_DATA: Record<string, number> = {
  // Telangana
  "500001": 5.2, // Hyderabad
  "500003": 5.2,
  "500016": 5.2,
  "500081": 5.2,
  
  // Andhra Pradesh
  "520001": 5.4, // Vijayawada
  "530001": 5.3, // Visakhapatnam
  "517501": 5.5, // Tirupati
  
  // Karnataka
  "560001": 5.0, // Bangalore
  "560066": 5.0,
  
  // Tamil Nadu
  "600001": 5.3, // Chennai
  "641001": 5.4, // Coimbatore
  
  // Maharashtra
  "400001": 5.1, // Mumbai
  "411001": 5.2, // Pune
};

export const DEFAULT_IRRADIATION = 4.5;

export const getIrradiation = (pinCode: string): number => {
  return IRRADIATION_DATA[pinCode] || DEFAULT_IRRADIATION;
};
