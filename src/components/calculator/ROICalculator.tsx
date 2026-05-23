import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { mockSolarAssets } from '@/data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Calculator, TrendingUp, Clock, IndianRupee } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ScenarioResults {
  irr: number;
  xirr: number;
  paybackPeriod: number;
  totalReturns: number;
  netProfit: number;
  cashFlows: { year: number; inflow: number; cumulative: number }[];
}

function calculateScenario(
  investment: number,
  tenure: number,
  expectedLife: number,
  baseIRR: number,
  degradation: number,
  modifier: number
): ScenarioResults {
  const adjustedIRR = baseIRR * modifier;
  const annualReturn = investment * (adjustedIRR / 100);

  let cashFlows: { year: number; inflow: number; cumulative: number }[] = [];
  let cumulative = -investment;
  let paybackYear = tenure;

  for (let year = 1; year <= tenure; year++) {
    const degradationFactor = Math.pow(1 - degradation / 100, year - 1);
    const yearlyReturn = annualReturn * degradationFactor;
    cumulative += yearlyReturn;

    if (cumulative >= 0 && paybackYear === tenure) {
      paybackYear = year;
    }

    cashFlows.push({
      year,
      inflow: Math.round(yearlyReturn),
      cumulative: Math.round(cumulative),
    });
  }

  const totalReturns = cashFlows.reduce((sum, cf) => sum + cf.inflow, 0);

  // Calculate residual value of the asset at the end of tenure
  // Linear depreciation assuming the asset is worth 0 at end of life
  const remainingLife = Math.max(0, expectedLife - tenure);
  const residualValue = (investment * remainingLife) / expectedLife;

  return {
    irr: adjustedIRR,
    xirr: adjustedIRR * 0.95,
    paybackPeriod: paybackYear,
    totalReturns: Math.round(totalReturns),
    netProfit: Math.round(totalReturns + residualValue - investment),
    cashFlows,
  };
}

export function ROICalculator() {
  const [selectedAsset, setSelectedAsset] = useState(mockSolarAssets[0].id);
  const [investmentAmount, setInvestmentAmount] = useState(500000);
  const [tenure, setTenure] = useState(5);
  const [scenario, setScenario] = useState<'conservative' | 'expected' | 'aggressive'>('expected');

  const asset = mockSolarAssets.find(a => a.id === selectedAsset)!;

  const scenarioModifiers = {
    conservative: 0.85,
    expected: 1.0,
    aggressive: 1.15,
  };

  const results = useMemo(() => ({
    conservative: calculateScenario(investmentAmount, tenure, asset.expectedLifeYears, asset.expectedIRR, asset.annualDegradation, scenarioModifiers.conservative),
    expected: calculateScenario(investmentAmount, tenure, asset.expectedLifeYears, asset.expectedIRR, asset.annualDegradation, scenarioModifiers.expected),
    aggressive: calculateScenario(investmentAmount, tenure, asset.expectedLifeYears, asset.expectedIRR, asset.annualDegradation, scenarioModifiers.aggressive),
  }), [investmentAmount, tenure, asset]);

  const currentResult = results[scenario];

  const comparisonData = results.expected.cashFlows.map((cf, idx) => ({
    year: `Year ${cf.year}`,
    Conservative: results.conservative.cashFlows[idx].inflow,
    Expected: results.expected.cashFlows[idx].inflow,
    Aggressive: results.aggressive.cashFlows[idx].inflow,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Investment Parameters
            </CardTitle>
            <CardDescription>Configure your investment to see projected returns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Solar Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockSolarAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {asset.location} • {asset.capacityKW.toLocaleString()} kW • Expected IRR: {asset.expectedIRR}%
              </p>
            </div>

            <div className="space-y-2">
              <Label>Investment Amount</Label>
              <Input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                min={100}
                step={100}
              />
              <Slider
                value={[investmentAmount]}
                onValueChange={([val]) => setInvestmentAmount(val)}
                min={100}
                max={5000000}
                step={100}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹100</span>
                <span>₹50L</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Investment Tenure: {tenure} Years</Label>
              <Slider
                value={[tenure]}
                onValueChange={([val]) => setTenure(val)}
                min={3}
                max={25}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 Years</span>
                <span>25 Years</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Scenario</Label>
              <Tabs value={scenario} onValueChange={(v) => setScenario(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="conservative" className="text-xs">Conservative</TabsTrigger>
                  <TabsTrigger value="expected" className="text-xs">Expected</TabsTrigger>
                  <TabsTrigger value="aggressive" className="text-xs">Aggressive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Asset Details</p>
              <p className="text-xs">Annual Degradation: {asset.annualDegradation}%</p>
              <p className="text-xs">Expected Life: {asset.expectedLifeYears} years</p>
              <p className="text-xs">Risk Score: <span className="font-medium capitalize">{asset.riskScore}</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Projected Returns</CardTitle>
            <CardDescription>
              {scenario.charAt(0).toUpperCase() + scenario.slice(1)} scenario analysis for {tenure}-year investment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg bg-primary/10 p-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">IRR</span>
                </div>
                <p className="text-2xl font-bold">{currentResult.irr.toFixed(1)}%</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-xs font-medium">Total Returns</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(currentResult.totalReturns)}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">Payback Period</span>
                </div>
                <p className="text-2xl font-bold">{currentResult.paybackPeriod} Years</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">Net Profit</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(currentResult.netProfit)}</p>
              </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Cumulative Cash Flow</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentResult.cashFlows}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" tickFormatter={(y) => `Y${y}`} className="text-xs" />
                    <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} className="text-xs" />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelFormatter={(year) => `Year ${year}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      name="Cumulative Returns"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scenario Comparison */}
            <div className="space-y-4 mt-6">
              <h4 className="text-sm font-medium">Scenario Comparison (Annual Returns)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} className="text-xs" />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                    <Legend />
                    <Bar dataKey="Conservative" fill="hsl(var(--muted))" />
                    <Bar dataKey="Expected" fill="hsl(var(--primary))" />
                    <Bar dataKey="Aggressive" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> These projections are estimates based on historical performance and market assumptions.
            Actual returns may vary due to market conditions, regulatory changes, and operational factors.
            Past performance is not indicative of future results. Please consult with a financial advisor before making investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
