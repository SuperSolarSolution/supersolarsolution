import { Card, CardContent } from '@/components/ui/card';
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

interface ReturnsSummaryCardsProps {
  totalInvested: number;
  totalActualReturns: number;
  totalExpectedReturns: number;
}

export function ReturnsSummaryCards({
  totalInvested,
  totalActualReturns,
  totalExpectedReturns,
}: ReturnsSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold">₹{(totalInvested / 100000).toFixed(2)}L</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Actual Returns</p>
              <p className="text-2xl font-bold text-green-600">₹{(totalActualReturns / 100000).toFixed(2)}L</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expected Returns</p>
              <p className="text-2xl font-bold text-primary">₹{(totalExpectedReturns / 100000).toFixed(2)}L</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ROI Achieved</p>
              <p className="text-2xl font-bold">
                {totalInvested > 0 ? ((totalActualReturns / totalInvested) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
