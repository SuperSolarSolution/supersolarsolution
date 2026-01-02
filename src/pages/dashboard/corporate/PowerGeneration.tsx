import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEnergyGeneration } from '@/hooks/useEnergyGeneration';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PowerGeneration() {
    const { data: energyData } = useEnergyGeneration();

    // Mock data if no real data
    const chartData = energyData?.map(e => ({
        date: new Date(e.date).toLocaleDateString(),
        Generated: Number(e.generated_kwh),
        Consumed: Number(e.consumed_kwh),
    })) || [
            { date: 'Jan', Generated: 4000, Consumed: 3500 },
            { date: 'Feb', Generated: 4500, Consumed: 3800 },
            { date: 'Mar', Generated: 5200, Consumed: 4200 },
        ];

    return (
        <DashboardLayout role="corporate">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Power Generation</h1>
                    <p className="text-muted-foreground">Monitor your energy production and consumption</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Generation vs Consumption</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="date" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Generated" fill="hsl(var(--primary))" name="Generated (kWh)" />
                                    <Bar dataKey="Consumed" fill="hsl(var(--muted-foreground))" name="Consumed (kWh)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left font-medium">Period</th>
                                        <th className="p-3 text-right font-medium">Generated (kWh)</th>
                                        <th className="p-3 text-right font-medium">Consumed (kWh)</th>
                                        <th className="p-3 text-right font-medium">Grid Dependency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartData.map((row, i) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-3">{row.date}</td>
                                            <td className="p-3 text-right">{row.Generated.toLocaleString()}</td>
                                            <td className="p-3 text-right">{row.Consumed.toLocaleString()}</td>
                                            <td className="p-3 text-right">
                                                {Math.max(0, row.Consumed - row.Generated).toLocaleString()} kWh
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
