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
  renderAction?: (asset: SolarAsset) => React.ReactNode;
}

const statusColors: Record<SolarAsset['status'], string> = {
  planning: 'bg-indigo-100 text-indigo-700', // Match Live/Active color
  under_construction: 'bg-primary/20 text-primary',
  operational: 'bg-green-100 text-green-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  Pending: 'bg-orange-100 text-orange-700',
  Approved: 'bg-blue-100 text-blue-700',
  Live: 'bg-indigo-100 text-indigo-700',
  Rejected: 'bg-red-100 text-red-700',
  Proposed: 'bg-orange-100 text-orange-700', // Same as Pending
  Inactive: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<SolarAsset['status'], string> = {
  planning: 'Live', // User prefers "Live" for Planning phase
  under_construction: 'Under Construction',
  operational: 'Operational',
  maintenance: 'Maintenance',
  Pending: 'Pending',
  Approved: 'Approved',
  Live: 'Live',
  Rejected: 'Rejected',
  Proposed: 'Proposed',
  Inactive: 'Inactive',
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

export function AssetTable({ assets, onAssetClick, renderAction }: AssetTableProps) {
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
            {onAssetClick ? null : <TableHead className="text-right">Actions</TableHead>}
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
              {onAssetClick ? null : (
                <TableCell className="text-right">
                  {renderAction?.(asset)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
