import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Info } from 'lucide-react';

interface TaxSummaryCardProps {
  totalActualReturns: number;
  tdsApplicable: boolean;
  tdsAmount: number;
  netReturns: number;
  TDS_THRESHOLD: number;
  handleExportForm26AS: () => void;
}

export function TaxSummaryCard({
  totalActualReturns,
  tdsApplicable,
  tdsAmount,
  netReturns,
  TDS_THRESHOLD,
  handleExportForm26AS,
}: TaxSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Tax Summary (FY {new Date().getFullYear()}-{(new Date().getFullYear() + 1).toString().slice(2)})</CardTitle>
            <CardDescription>TDS deducted on returns as per Section 194A</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportForm26AS}>
            <FileText className="mr-2 h-4 w-4" />
            Download Form 26AS
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* TDS Threshold Notice */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-700 mb-6">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong>Section 194A (TDS on Interest Income):</strong> TDS at 10% is applicable only when annual returns exceed ₹40,000.
            {!tdsApplicable && (
              <span className="block mt-1 text-green-700 font-medium">
                ✓ Your current returns are below the ₹40,000 threshold — No TDS applicable.
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Gross Returns</p>
            <p className="text-xl font-bold mt-1">₹{totalActualReturns.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">TDS Threshold (194A)</p>
            <p className="text-xl font-bold mt-1">₹{TDS_THRESHOLD.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              TDS Deducted ({tdsApplicable ? '10%' : 'N/A'})
            </p>
            <p className={`text-xl font-bold mt-1 ${tdsApplicable ? 'text-red-600' : 'text-muted-foreground'}`}>
              {tdsApplicable ? `₹${tdsAmount.toLocaleString('en-IN')}` : '₹0'}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Net Returns</p>
            <p className="text-xl font-bold mt-1 text-green-600">
              ₹{netReturns.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          * Consult your tax advisor for accurate tax filing. TDS certificate (Form 16A) will be issued by the platform at year-end.
        </p>
      </CardContent>
    </Card>
  );
}
