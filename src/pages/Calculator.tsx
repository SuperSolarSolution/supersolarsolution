import { Header } from '@/components/layout/Header';
import { ROICalculator } from '@/components/calculator/ROICalculator';

export default function Calculator() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Pre-Investment ROI Calculator</h1>
          <p className="mt-2 text-muted-foreground">
            Analyze projected returns before committing capital. Compare scenarios and visualize cash flows.
          </p>
        </div>
        <ROICalculator />
      </main>
    </div>
  );
}
