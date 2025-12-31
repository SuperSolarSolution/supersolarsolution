import { SolarAsset } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AssetTableProps {
  assets: SolarAsset[];
  onAssetClick?: (asset: SolarAsset) => void;
}

const statusColors: Record<SolarAsset['status'], string> = {
  planning: 'bg-muted text-muted-foreground',
  under_construction: 'bg-primary/20 text-primary',
  operational: 'bg-green-100 text-green-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
};

const statusLabels: Record<SolarAsset['status'], string> = {
  planning: 'Planning',
  under_construction: 'Under Construction',
  operational: 'Operational',
  maintenance: 'Maintenance',
};

const riskColors: Record<SolarAsset['riskScore'], string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function AssetTable({ assets, onAssetClick }: AssetTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Investment</TableHead>
            <TableHead className="text-right">Funded</TableHead>
            <TableHead className="text-right">IRR</TableHead>
            <TableHead>Risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow
              key={asset.id}
              className={cn(
                onAssetClick && 'cursor-pointer hover:bg-muted/50'
              )}
              onClick={() => onAssetClick?.(asset)}
            >
              <TableCell className="font-medium">{asset.name}</TableCell>
              <TableCell className="text-muted-foreground">{asset.location}</TableCell>
              <TableCell className="text-right">{asset.capacityKW.toLocaleString()} kW</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('font-medium', statusColors[asset.status])}>
                  {statusLabels[asset.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(asset.totalInvestment)}</TableCell>
              <TableCell className="text-right">
                {((asset.fundedAmount / asset.totalInvestment) * 100).toFixed(0)}%
              </TableCell>
              <TableCell className="text-right font-medium text-green-600">{asset.expectedIRR}%</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('font-medium', riskColors[asset.riskScore])}>
                  {asset.riskScore.charAt(0).toUpperCase() + asset.riskScore.slice(1)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
