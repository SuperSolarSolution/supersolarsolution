import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Upload } from 'lucide-react';

const DOCS = [
  { name: 'EPC Master Agreement.pdf', type: 'Contract', date: '2026-01-12', status: 'signed' },
  { name: 'O&M SLA Annexure.pdf', type: 'SLA', date: '2026-01-12', status: 'signed' },
  { name: 'Site Survey - Pune Plant 2.pdf', type: 'Survey', date: '2026-03-04', status: 'submitted' },
  { name: 'Commissioning Certificate.pdf', type: 'Certificate', date: '2026-04-18', status: 'signed' },
  { name: 'Insurance Policy 2026.pdf', type: 'Compliance', date: '2026-02-01', status: 'active' },
];

export default function ImplementerDocuments() {
  return (
    <DashboardLayout role="implementer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-muted-foreground">Contracts, certificates and compliance records</p>
          </div>
          <Button><Upload className="h-4 w-4 mr-2" />Upload</Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">All Documents</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {DOCS.map(d => (
              <div key={d.name} className="flex items-center justify-between gap-3 border-b last:border-0 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.type} · {d.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="capitalize">{d.status}</Badge>
                  <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
