import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function ProjectCreate() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        project_name: '',
        location: '',
        project_type: 'Rooftop',
        land_ownership_type: 'Owned',
        avg_power_consumption_kwh: '',
        peak_load_kw: '',
        desired_solar_offset_percentage: '',
        area_available_sqft: '',
        shadow_free_area: false,
        roof_type: 'Concrete',
        lease_duration_years: '20',
        billing_model: 'Fixed',
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            // Calculate estimated capacity (rough estimate: 100 sqft = 1kW)
            const estimated_capacity_kw = Number(formData.area_available_sqft) / 100;

            const { error } = await supabase.from('projects').insert({
                corporate_id: user.id,
                project_name: formData.project_name,
                location: formData.location,
                project_type: formData.project_type,
                land_ownership_type: formData.land_ownership_type,
                avg_power_consumption_kwh: Number(formData.avg_power_consumption_kwh),
                peak_load_kw: Number(formData.peak_load_kw),
                desired_solar_offset_percentage: Number(formData.desired_solar_offset_percentage),
                area_available_sqft: Number(formData.area_available_sqft),
                shadow_free_area: formData.shadow_free_area,
                roof_type: formData.project_type === 'Rooftop' ? formData.roof_type : null,
                lease_duration_years: Number(formData.lease_duration_years),
                billing_model: formData.billing_model,
                estimated_capacity_kw: estimated_capacity_kw,
                status: 'Proposed'
            });

            if (error) throw error;

            toast.success('Project submitted successfully!');
            navigate('/dashboard/corporate/projects');
        } catch (error: any) {
            toast.error('Failed to submit project: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="corporate">
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">New Solar Project</h1>
                    <p className="text-muted-foreground">Initiate a new solar project for your facility</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Basic Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Details</CardTitle>
                                <CardDescription>Location and property type</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="project_name">Project Name</Label>
                                        <Input
                                            id="project_name"
                                            placeholder="e.g. Warehouse A Solar"
                                            required
                                            value={formData.project_name}
                                            onChange={e => handleChange('project_name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location / Address</Label>
                                        <Input
                                            id="location"
                                            placeholder="City, State"
                                            required
                                            value={formData.location}
                                            onChange={e => handleChange('location', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Project Type</Label>
                                        <Select value={formData.project_type} onValueChange={v => handleChange('project_type', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Rooftop">Rooftop</SelectItem>
                                                <SelectItem value="Ground-mounted">Ground-mounted</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Land Ownership</Label>
                                        <Select value={formData.land_ownership_type} onValueChange={v => handleChange('land_ownership_type', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Owned">Owned</SelectItem>
                                                <SelectItem value="Leased">Leased</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Power Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Power & Usage</CardTitle>
                                <CardDescription>Your energy consumption profile</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="consumption">Avg. Monthly Consumption (kWh)</Label>
                                        <Input
                                            id="consumption"
                                            type="number"
                                            required
                                            value={formData.avg_power_consumption_kwh}
                                            onChange={e => handleChange('avg_power_consumption_kwh', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="peak_load">Peak Load (kW)</Label>
                                        <Input
                                            id="peak_load"
                                            type="number"
                                            required
                                            value={formData.peak_load_kw}
                                            onChange={e => handleChange('peak_load_kw', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="offset">Desired Solar Offset (%)</Label>
                                        <Input
                                            id="offset"
                                            type="number"
                                            placeholder="e.g. 50"
                                            required
                                            value={formData.desired_solar_offset_percentage}
                                            onChange={e => handleChange('desired_solar_offset_percentage', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Site Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Site & Infrastructure</CardTitle>
                                <CardDescription>Available area for installation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="area">Available Area (sq.ft)</Label>
                                        <Input
                                            id="area"
                                            type="number"
                                            required
                                            value={formData.area_available_sqft}
                                            onChange={e => handleChange('area_available_sqft', e.target.value)}
                                        />
                                    </div>
                                    {formData.project_type === 'Rooftop' && (
                                        <div className="space-y-2">
                                            <Label>Roof Type</Label>
                                            <Select value={formData.roof_type} onValueChange={v => handleChange('roof_type', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Concrete">Concrete</SelectItem>
                                                    <SelectItem value="Metal Sheet">Metal Sheet</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="shadow"
                                        checked={formData.shadow_free_area}
                                        onCheckedChange={c => handleChange('shadow_free_area', c as boolean)}
                                    />
                                    <Label htmlFor="shadow">Area is shadow-free (no tall buildings/trees nearby)</Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financials */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Preferences</CardTitle>
                                <CardDescription>Contractual preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Lease Duration (Years)</Label>
                                        <Select value={formData.lease_duration_years} onValueChange={v => handleChange('lease_duration_years', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10 Years</SelectItem>
                                                <SelectItem value="15">15 Years</SelectItem>
                                                <SelectItem value="20">20 Years</SelectItem>
                                                <SelectItem value="25">25 Years</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Billing Preference</Label>
                                        <Select value={formData.billing_model} onValueChange={v => handleChange('billing_model', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Fixed">Fixed Monthly Lease</SelectItem>
                                                <SelectItem value="Per Unit">Pay Per Unit (PPA)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/corporate/projects')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Project Proposal'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
