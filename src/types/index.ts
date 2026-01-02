// Core types for S3 - Super Solar Solutions

export type UserRole = 'investor' | 'corporate' | 'nbfc' | 'implementer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface SolarAsset {
  id: string;
  name: string;
  location: string;
  capacityKW: number;
  status: 'planning' | 'under_construction' | 'operational' | 'maintenance' | 'Pending' | 'Approved' | 'Live' | 'Rejected' | 'Proposed' | 'Inactive';
  installationDate: Date | null;
  expectedLifeYears: number;
  annualDegradation: number; // percentage
  corporateId: string;
  implementerId: string;
  totalInvestment: number;
  fundedAmount: number;
  expectedIRR: number;
  riskScore: 'low' | 'medium' | 'high';
}

export interface Investment {
  id: string;
  assetId: string;
  investorId: string;
  amount: number;
  status: 'committed' | 'deployed' | 'returned';
  expectedReturns: number;
  actualReturns: number;
  startDate: Date;
  maturityDate: Date;
}

export interface NBFCFunding {
  id: string;
  assetId: string;
  nbfcId: string;
  sanctionedAmount: number;
  disbursedAmount: number;
  status: 'sanctioned' | 'partially_disbursed' | 'fully_disbursed' | 'closed';
  milestones: FundingMilestone[];
}

export interface FundingMilestone {
  id: string;
  name: string;
  targetDate: Date;
  completedDate: Date | null;
  disbursementAmount: number;
  status: 'pending' | 'completed' | 'delayed';
}

export interface EnergyGeneration {
  id: string;
  assetId: string;
  date: Date;
  generatedKWh: number;
  consumedKWh: number;
  exportedKWh: number;
}

export interface Transaction {
  id: string;
  type: 'investment' | 'return' | 'disbursement' | 'billing';
  amount: number;
  fromEntity: string;
  toEntity: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
}

export interface ROICalculation {
  investmentAmount: number;
  assetId: string;
  tenure: number; // years
  scenario: 'conservative' | 'expected' | 'aggressive';
  irr: number;
  xirr: number;
  paybackPeriod: number;
  totalReturns: number;
  cashFlows: CashFlow[];
}

export interface CashFlow {
  year: number;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeFlow: number;
}

export interface KPIMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
}
