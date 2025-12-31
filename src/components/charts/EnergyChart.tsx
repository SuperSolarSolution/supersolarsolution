import { EnergyGeneration } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface EnergyChartProps {
  data: EnergyGeneration[];
  title?: string;
}

export function EnergyChart({ data, title = 'Energy Generation vs Consumption' }: EnergyChartProps) {
  const chartData = data.map((d) => ({
    date: format(d.date, 'MMM'),
    Generated: d.generatedKWh,
    Consumed: d.consumedKWh,
    Exported: d.exportedKWh,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} className="text-xs" />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} kWh`, '']}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="Generated" 
                stackId="1"
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary) / 0.3)" 
              />
              <Area 
                type="monotone" 
                dataKey="Consumed" 
                stackId="2"
                stroke="hsl(var(--chart-5))" 
                fill="hsl(var(--chart-5) / 0.3)" 
              />
              <Area 
                type="monotone" 
                dataKey="Exported" 
                stackId="3"
                stroke="hsl(var(--chart-1))" 
                fill="hsl(var(--chart-1) / 0.3)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
