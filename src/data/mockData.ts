import { SolarAsset, Investment, Transaction, EnergyGeneration, KPIMetric } from '@/types';

export const mockSolarAssets: SolarAsset[] = [
  {
    id: 'asset-001',
    name: 'Gujarat Solar Park - Unit A',
    location: 'Kutch, Gujarat',
    capacityKW: 5000,
    status: 'operational',
    installationDate: new Date('2023-06-15'),
    expectedLifeYears: 25,
    annualDegradation: 0.5,
    corporateId: 'corp-001',
    implementerId: 'impl-001',
    totalInvestment: 25000000,
    fundedAmount: 22500000,
    expectedIRR: 14.5,
    riskScore: 'low',
  },
  {
    id: 'asset-002',
    name: 'Rajasthan Solar Farm - Phase 1',
    location: 'Jodhpur, Rajasthan',
    capacityKW: 10000,
    status: 'operational',
    installationDate: new Date('2023-01-10'),
    expectedLifeYears: 25,
    annualDegradation: 0.5,
    corporateId: 'corp-002',
    implementerId: 'impl-001',
    totalInvestment: 48000000,
    fundedAmount: 48000000,
    expectedIRR: 15.2,
    riskScore: 'low',
  },
  {
    id: 'asset-003',
    name: 'Karnataka Rooftop Project',
    location: 'Bangalore, Karnataka',
    capacityKW: 2500,
    status: 'under_construction',
    installationDate: null,
    expectedLifeYears: 25,
    annualDegradation: 0.6,
    corporateId: 'corp-003',
    implementerId: 'impl-002',
    totalInvestment: 12500000,
    fundedAmount: 8750000,
    expectedIRR: 13.8,
    riskScore: 'medium',
  },
  {
    id: 'asset-004',
    name: 'Maharashtra Industrial Solar',
    location: 'Pune, Maharashtra',
    capacityKW: 7500,
    status: 'planning',
    installationDate: null,
    expectedLifeYears: 25,
    annualDegradation: 0.5,
    corporateId: 'corp-001',
    implementerId: 'impl-003',
    totalInvestment: 35000000,
    fundedAmount: 10500000,
    expectedIRR: 14.0,
    riskScore: 'medium',
  },
];

export const mockInvestments: Investment[] = [
  {
    id: 'inv-001',
    assetId: 'asset-001',
    investorId: 'user-inv-001',
    amount: 500000,
    status: 'deployed',
    expectedReturns: 72500,
    actualReturns: 68000,
    startDate: new Date('2023-06-15'),
    maturityDate: new Date('2028-06-15'),
  },
  {
    id: 'inv-002',
    assetId: 'asset-002',
    investorId: 'user-inv-001',
    amount: 1000000,
    status: 'deployed',
    expectedReturns: 152000,
    actualReturns: 148500,
    startDate: new Date('2023-01-10'),
    maturityDate: new Date('2028-01-10'),
  },
  {
    id: 'inv-003',
    assetId: 'asset-003',
    investorId: 'user-inv-001',
    amount: 250000,
    status: 'committed',
    expectedReturns: 34500,
    actualReturns: 0,
    startDate: new Date('2024-03-01'),
    maturityDate: new Date('2029-03-01'),
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    type: 'investment',
    amount: 500000,
    fromEntity: 'Investor - Rajesh Kumar',
    toEntity: 'Gujarat Solar Park - Unit A',
    timestamp: new Date('2023-06-15T10:30:00'),
    status: 'completed',
    reference: 'INV-2023-001',
  },
  {
    id: 'txn-002',
    type: 'return',
    amount: 17000,
    fromEntity: 'Gujarat Solar Park - Unit A',
    toEntity: 'Investor - Rajesh Kumar',
    timestamp: new Date('2024-01-15T14:00:00'),
    status: 'completed',
    reference: 'RET-2024-Q1-001',
  },
  {
    id: 'txn-003',
    type: 'disbursement',
    amount: 5000000,
    fromEntity: 'NBFC - Green Finance Ltd',
    toEntity: 'Karnataka Rooftop Project',
    timestamp: new Date('2024-02-01T09:00:00'),
    status: 'completed',
    reference: 'DIS-2024-001',
  },
];

export const mockEnergyData: EnergyGeneration[] = [
  { id: 'eg-001', assetId: 'asset-001', date: new Date('2024-01-01'), generatedKWh: 18500, consumedKWh: 15200, exportedKWh: 3300 },
  { id: 'eg-002', assetId: 'asset-001', date: new Date('2024-02-01'), generatedKWh: 19200, consumedKWh: 16100, exportedKWh: 3100 },
  { id: 'eg-003', assetId: 'asset-001', date: new Date('2024-03-01'), generatedKWh: 21500, consumedKWh: 17800, exportedKWh: 3700 },
  { id: 'eg-004', assetId: 'asset-001', date: new Date('2024-04-01'), generatedKWh: 23100, consumedKWh: 18500, exportedKWh: 4600 },
  { id: 'eg-005', assetId: 'asset-001', date: new Date('2024-05-01'), generatedKWh: 24800, consumedKWh: 19200, exportedKWh: 5600 },
  { id: 'eg-006', assetId: 'asset-001', date: new Date('2024-06-01'), generatedKWh: 22300, consumedKWh: 18100, exportedKWh: 4200 },
];

export const investorKPIs: KPIMetric[] = [
  { label: 'Total Invested', value: '₹17,50,000', change: 15.2, trend: 'up' },
  { label: 'Expected Returns', value: '₹2,59,000', change: 12.8, trend: 'up' },
  { label: 'Actual Returns', value: '₹2,16,500', change: 8.5, trend: 'up' },
  { label: 'Active Assets', value: 3, trend: 'stable' },
];

export const corporateKPIs: KPIMetric[] = [
  { label: 'Monthly Savings', value: '₹4,85,000', change: 22.3, trend: 'up' },
  { label: 'Energy Generated', value: '129.4 MWh', change: 18.5, trend: 'up' },
  { label: 'Carbon Offset', value: '92.5 tCO₂', change: 18.5, trend: 'up' },
  { label: 'Grid Cost Avoided', value: '₹8.5/kWh', trend: 'stable' },
];

export const nbfcKPIs: KPIMetric[] = [
  { label: 'Total Sanctioned', value: '₹12.5 Cr', change: 35.0, trend: 'up' },
  { label: 'Total Disbursed', value: '₹9.8 Cr', change: 28.5, trend: 'up' },
  { label: 'Assets Funded', value: 8, change: 2, trend: 'up' },
  { label: 'Portfolio Health', value: '96.5%', change: 1.2, trend: 'up' },
];

export const implementerKPIs: KPIMetric[] = [
  { label: 'Active Projects', value: 5, trend: 'stable' },
  { label: 'Completed This Year', value: 3, change: 50, trend: 'up' },
  { label: 'SLA Compliance', value: '98.2%', change: 2.1, trend: 'up' },
  { label: 'Avg. Installation Time', value: '45 days', change: -5, trend: 'up' },
];

export const adminKPIs: KPIMetric[] = [
  { label: 'Total Platform AUM', value: '₹120.5 Cr', change: 42.0, trend: 'up' },
  { label: 'Active Users', value: 1247, change: 18.5, trend: 'up' },
  { label: 'Solar Assets', value: 24, change: 6, trend: 'up' },
  { label: 'System Health', value: '99.9%', trend: 'stable' },
];
