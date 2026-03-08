import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { Sun, MapPin, Zap, TrendingUp, Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { InvestorInvestModal } from '@/components/dashboard/investor/InvestorInvestModal';
import { SolarAsset } from '@/hooks/useSolarAssets';

export default function InvestorAssets() {
  const { data: assets, isLoading } = useSolarAssets();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<SolarAsset | null>(null);

  const filteredAssets = assets?.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : asset.status === statusFilter;
    const matchesRisk = riskFilter === 'all' ? true : asset.risk_score === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  }) || [];

  const statusColors: Record<string, string> = {
    planning: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    under_construction: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    operational: 'bg-green-500/10 text-green-600 border-green-500/20',
    maintenance: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  };

  const riskColors: Record<string, string> = {
    low: 'bg-green-500/10 text-green-600',
    medium: 'bg-yellow-500/10 text-yellow-600',
    high: 'bg-red-500/10 text-red-600',
  };

  if (isLoading) {
    return (
      <DashboardLayout role="investor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Solar Assets</h1>
          <p className="text-sm text-muted-foreground">Browse and invest in solar projects</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 md:space-y-0 md:flex md:flex-row md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 md:w-40 shrink-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="under_construction">Construction</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-28 md:w-32 shrink-0">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
          <Card>
            <CardContent className="p-3 md:pt-6 md:px-6">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-xs md:text-sm text-muted-foreground">Total Assets</span>
              </div>
              <p className="text-lg md:text-2xl font-bold mt-1">{assets?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:pt-6 md:px-6">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                <span className="text-xs md:text-sm text-muted-foreground">Total Capacity</span>
              </div>
              <p className="text-lg md:text-2xl font-bold mt-1">
                {assets?.reduce((sum, a) => sum + Number(a.capacity_kw), 0).toFixed(0)} kW
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:pt-6 md:px-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                <span className="text-xs md:text-sm text-muted-foreground">Avg. IRR</span>
              </div>
              <p className="text-lg md:text-2xl font-bold mt-1">
                {(assets?.reduce((sum, a) => sum + Number(a.expected_irr), 0) / (assets?.length || 1)).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:pt-6 md:px-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                <span className="text-xs md:text-sm text-muted-foreground">Operational</span>
              </div>
              <p className="text-lg md:text-2xl font-bold mt-1">
                {assets?.filter(a => a.status === 'operational').length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Asset Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset, idx) => {
              const fundingProgress = (Number(asset.funded_amount) / Number(asset.total_investment)) * 100;
              return (
                <Card key={asset.id} className={`overflow-hidden opacity-0 animate-fade-in-up animate-stagger-${Math.min(idx + 1, 6)}`}>
                  <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center shimmer-bg animate-shimmer">
                    <Sun className="h-16 w-16 text-primary/30 animate-float" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{asset.name}</h3>
                      <Badge variant="outline" className={statusColors[asset.status]}>
                        {asset.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3" />
                      {asset.location}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Capacity</p>
                        <p className="font-semibold">{asset.capacity_kw} kW</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected IRR</p>
                        <p className="font-semibold text-green-600">{asset.expected_irr}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Project Life</p>
                        <p className="font-semibold">{asset.expected_life_years} years</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk Score</p>
                        <Badge variant="outline" className={riskColors[asset.risk_score]}>
                          {asset.risk_score.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Funding Progress</span>
                        <span className="font-medium">{fundingProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={fundingProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        ₹{(Number(asset.funded_amount) / 100000).toFixed(1)}L / ₹{(Number(asset.total_investment) / 100000).toFixed(1)}L
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      disabled={fundingProgress >= 100}
                      onClick={() => setSelectedAsset(asset)}
                    >
                      {fundingProgress >= 100 ? 'Fully Funded' : 'Invest Now'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Sun className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No assets found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <InvestorInvestModal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        asset={selectedAsset}
      />
    </DashboardLayout>
  );
}