import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Wallet } from 'lucide-react';

interface ReturnsTrendChartProps {
  monthlyChartData: Array<{
    month: string;
    'Actual Returns': number;
    'Projected': number;
  }>;
}

export function ReturnsTrendChart({ monthlyChartData }: ReturnsTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Returns Trend</CardTitle>
        <CardDescription>
          Monthly actual returns vs projected — based on your real transaction history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {monthlyChartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Actual Returns"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
                <Line
                  type="monotone"
                  dataKey="Projected"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No return transactions yet. Chart will populate as returns are credited.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
