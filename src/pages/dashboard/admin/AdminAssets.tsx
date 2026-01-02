import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AssetTable } from '@/components/dashboard/AssetTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Check, Edit2, Rocket } from 'lucide-react';
import { useSolarAssets, useCreateSolarAsset } from '@/hooks/useSolarAssets';
import { useAllProjects, useUpdateProject } from '@/hooks/useProjects';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SolarAsset } from '@/types';

export default function AdminAssets() {
    const { data: allAssets, isLoading: assetsLoading } = useSolarAssets();
    const { data: allProjects, isLoading: projectsLoading } = useAllProjects();
    const updateProject = useUpdateProject();
    const createSolarAsset = useCreateSolarAsset();
    const { toast } = useToast();

    // Dialog States
    const [manageDialogOpen, setManageDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: ''
    });
    const [investmentData, setInvestmentData] = useState({
        totalInvestment: '',
        expectedIRR: ''
    });

    const isLoading = assetsLoading || projectsLoading;

    // Map existing solar_assets
    const mappedSolarAssets = allAssets?.map(asset => ({
        id: asset.id,
        name: asset.name,
        location: asset.location,
        capacityKW: Number(asset.capacity_kw),
        status: asset.status,
        installationDate: asset.installation_date ? new Date(asset.installation_date) : null,
        expectedLifeYears: asset.expected_life_years,
        annualDegradation: Number(asset.annual_degradation),
        corporateId: asset.corporate_id || '',
        implementerId: asset.implementer_id || '',
        totalInvestment: Number(asset.total_investment),
        fundedAmount: Number(asset.funded_amount),
        expectedIRR: Number(asset.expected_irr),
        riskScore: asset.risk_score,
        type: 'asset' // Distinguish from project
    })) || [];

    // Map projects table items (Proposed/Pipeline)
    const mappedProjects = allProjects?.map(project => ({
        id: project.project_id,
        name: project.project_name,
        location: project.location,
        capacityKW: Number(project.estimated_capacity_kw),
        status: project.status as SolarAsset['status'],
        installationDate: null,
        expectedLifeYears: 25, // Default
        annualDegradation: 0.5, // Default
        corporateId: project.corporate_id || '',
        implementerId: '',
        totalInvestment: 0, // Placeholder for proposal
        fundedAmount: 0,
        expectedIRR: 0,
        riskScore: 'medium' as const,
        type: 'project'
    })).filter(p => p.status !== 'Live') || [];

    // Combine for All Assets view
    const allCombined = [...mappedSolarAssets, ...mappedProjects];

    const proposedAssets = [
        ...mappedSolarAssets.filter(a => a.status === 'planning'),
        ...mappedProjects // Treat all from 'projects' table as proposed/pipeline for now
    ];

    const activeAssets = mappedSolarAssets.filter(a => a.status === 'operational' || a.status === 'under_construction');
    const fullySubscribedAssets = mappedSolarAssets.filter(a => a.fundedAmount >= a.totalInvestment && a.totalInvestment > 0);


    // --- Actions ---

    const handleManageClick = (item: any) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            location: item.location,
            capacity: item.capacityKW.toString()
        });
        setInvestmentData({ totalInvestment: '', expectedIRR: '' });
        setManageDialogOpen(true);
    };

    const handleUpdateDetails = async () => {
        if (!selectedItem) return;
        try {
            if (selectedItem.type === 'project') {
                await updateProject.mutateAsync({
                    projectId: selectedItem.id,
                    updates: {
                        project_name: formData.name,
                        location: formData.location,
                        estimated_capacity_kw: Number(formData.capacity)
                    }
                });
                toast({ title: "Project Details Updated" });
            } else {
                toast({ title: "Asset Update", description: "Editing asset details is restricted." });
            }
            setManageDialogOpen(false);
        } catch (e) {
            toast({ title: "Error", description: "Failed to update details", variant: "destructive" });
        }
    };

    const handleStatusChange = async (newStatus: 'Approved' | 'Rejected') => {
        if (!selectedItem) return;
        try {
            await updateProject.mutateAsync({
                projectId: selectedItem.id,
                updates: { status: newStatus }
            });
            toast({ title: `Project ${newStatus}` });
            setManageDialogOpen(false);
        } catch (e) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const handleMakeLive = async () => {
        if (!selectedItem) return;

        try {
            // 1. Create Solar Asset
            await createSolarAsset.mutateAsync({
                name: formData.name,
                location: formData.location,
                capacity_kw: Number(formData.capacity),
                status: 'planning',
                total_investment: Number(investmentData.totalInvestment),
                expected_irr: Number(investmentData.expectedIRR),
                corporate_id: selectedItem.corporateId,
                annual_degradation: 0.5,
                expected_life_years: 25,
                funded_amount: 0,
                risk_score: 'medium',
                implementer_id: null,
                installation_date: null
            });

            // 2. Update Project Status
            if (selectedItem.type === 'project') {
                await updateProject.mutateAsync({
                    projectId: selectedItem.id,
                    updates: { status: 'Live' }
                });
            }

            toast({ title: "Project is now Live!", description: "Asset created successfully." });
            setManageDialogOpen(false);
        } catch (e) {
            toast({ title: "Error", description: "Failed to make live", variant: "destructive" });
        }
    };

    const renderActions = (asset: any) => {
        return (
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleManageClick(asset)}>
                    Manage
                </Button>
            </div>
        );
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Solar Asset Management</h1>
                        <p className="text-muted-foreground">Manage platform assets and listings</p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Asset
                    </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                        <TabsTrigger value="all">All Assets</TabsTrigger>
                        <TabsTrigger value="proposed">Proposed</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="subscribed">Fully Subscribed</TabsTrigger>
                    </TabsList>

                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Assets List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="all" className="mt-0">
                                        <AssetTable assets={allCombined} renderAction={renderActions} />
                                    </TabsContent>
                                    <TabsContent value="proposed" className="mt-0">
                                        <AssetTable assets={proposedAssets} renderAction={renderActions} />
                                    </TabsContent>
                                    <TabsContent value="active" className="mt-0">
                                        <AssetTable assets={activeAssets} renderAction={renderActions} />
                                    </TabsContent>
                                    <TabsContent value="subscribed" className="mt-0">
                                        <AssetTable assets={fullySubscribedAssets} renderAction={renderActions} />
                                    </TabsContent>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Tabs>

                {/* Unified Manage Dialog */}
                <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Manage Project: {selectedItem?.name}</DialogTitle>
                            <DialogDescription>
                                Current Status: <span className="font-bold">{selectedItem?.status}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Editable Fields */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Project Details</h3>
                                <div className="space-y-2">
                                    <Label>Project Name</Label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Capacity (kW)</Label>
                                    <Input value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                                </div>
                                <Button size="sm" variant="outline" onClick={handleUpdateDetails} className="w-full">
                                    Update Details
                                </Button>
                            </div>

                            {/* Status-Based Actions */}
                            {selectedItem?.type === 'project' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Status Actions</h3>

                                    {(selectedItem.status === 'Pending' || selectedItem.status === 'Proposed') && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Button variant="destructive" onClick={() => handleStatusChange('Rejected')}>
                                                Reject
                                            </Button>
                                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('Approved')}>
                                                Approve
                                            </Button>
                                        </div>
                                    )}

                                    {selectedItem.status === 'Approved' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 bg-muted p-3 rounded-md">
                                                <div className="space-y-2">
                                                    <Label>Total Investment (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        value={investmentData.totalInvestment}
                                                        onChange={e => setInvestmentData({ ...investmentData, totalInvestment: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Expected IRR (%)</Label>
                                                    <Input
                                                        type="number"
                                                        value={investmentData.expectedIRR}
                                                        onChange={e => setInvestmentData({ ...investmentData, expectedIRR: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <Button className="w-full" onClick={handleMakeLive}>
                                                <Rocket className="mr-2 h-4 w-4" />
                                                Launch (Make Live)
                                            </Button>
                                        </div>
                                    )}

                                    {selectedItem.status === 'Live' && (
                                        <div className="text-center text-sm text-green-600 font-medium">
                                            Project is Live and Active.
                                        </div>
                                    )}
                                    {selectedItem.status === 'Rejected' && (
                                        <div className="text-center text-sm text-red-600 font-medium">
                                            Project has been Rejected.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
