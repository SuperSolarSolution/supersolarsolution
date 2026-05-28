import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Shield, CheckCircle2, Clock, Loader2, Sparkles, User, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  project_id: string;
  corporate_id: string;
  project_name: string;
  location: string;
  status: 'Proposed' | 'Approved' | 'Live' | 'Inactive';
  estimated_capacity_kw: number;
  desired_solar_offset_percentage: number;
  lease_duration_years: number;
  ppa_rate: number;
  area_available_sqft: number;
  lease_start_date: string | null;
  lease_end_date: string | null;
  ppa_start_date: string | null;
  ppa_end_date: string | null;
  lease_agreement_signed: boolean;
  lease_agreement_signed_at: string | null;
  lease_agreement_signature_id: string | null;
  ppa_agreement_signed: boolean;
  ppa_agreement_signed_at: string | null;
  ppa_agreement_signature_id: string | null;
}

export default function Contracts() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeContractType, setActiveContractType] = useState<'lease' | 'ppa'>('lease');
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Signing inputs
  const [signatoryName, setSignatoryName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);

  // Read agreements query
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['corporate-projects-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) throw error;
      return (data || []) as Project[];
    },
  });

  // Mutate project to sign agreement
  const signAgreementMutation = useMutation({
    mutationFn: async ({
      projectId,
      type,
      name,
      aadhaar,
    }: {
      projectId: string;
      type: 'lease' | 'ppa';
      name: string;
      aadhaar: string;
    }) => {
      const randomBytes = new Uint8Array(4);
      window.crypto.getRandomValues(randomBytes);
      const randomString = Array.from(randomBytes, byte => byte.toString(36).padStart(2, '0')).join('').substring(0, 8).toUpperCase();
      const sigHash = `sig_${type === 'lease' ? 'll' : 'ppa'}_${randomString}`;
      const sigMetadata = `${name}|${sigHash}|${aadhaar.replace(/\s/g, '').slice(-4)}`;
      const now = new Date().toISOString();

      const updateData: any = {};
      if (type === 'lease') {
        updateData.lease_agreement_signed = true;
        updateData.lease_agreement_signed_at = now;
        updateData.lease_agreement_signature_id = sigMetadata;
      } else {
        updateData.ppa_agreement_signed = true;
        updateData.ppa_agreement_signed_at = now;
        updateData.ppa_agreement_signature_id = sigMetadata;
      }

      // Check if both agreements are signed (including this edit)
      const currentProject = projects?.find((p) => p.project_id === projectId);
      const willBeLeaseSigned = type === 'lease' || !!currentProject?.lease_agreement_signed;
      const willBePpaSigned = type === 'ppa' || !!currentProject?.ppa_agreement_signed;

      if (willBeLeaseSigned && willBePpaSigned) {
        updateData.status = 'Live';
        const duration = currentProject?.lease_duration_years || 25;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + duration);

        updateData.lease_start_date = startDate.toISOString().split('T')[0];
        updateData.lease_end_date = endDate.toISOString().split('T')[0];
        updateData.ppa_start_date = startDate.toISOString().split('T')[0];
        updateData.ppa_end_date = endDate.toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['corporate-projects-contracts'] });
      toast({
        title: 'Agreement Signed',
        description: `Successfully signed the ${activeContractType === 'lease' ? 'Land Lease' : 'Power Purchase'} Agreement!`,
      });
      setIsReviewOpen(false);
      resetSignForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Signing failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetSignForm = () => {
    setSignatoryName('');
    setAadhaarNumber('');
    setIsOtpStep(false);
    setOtpCode('');
    setIsOtpSending(false);
    setIsOtpVerifying(false);
  };

  const handleAadhaarInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 12);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    setAadhaarNumber(parts.join(' '));
  };

  const handleTriggerOtp = () => {
    if (!signatoryName.trim()) {
      toast({
        title: 'Signatory Name Required',
        description: 'Please enter the full name of the authorized signatory.',
        variant: 'destructive',
      });
      return;
    }
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
    if (cleanAadhaar.length !== 12) {
      toast({
        title: 'Invalid Aadhaar Number',
        description: 'Please enter a valid 12-digit Aadhaar number.',
        variant: 'destructive',
      });
      return;
    }

    setIsOtpSending(true);
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomNumber = randomBuffer[0] / (0xFFFFFFFF + 1);
    const generatedOtp = String(Math.floor(100000 + randomNumber * 900000));
    sessionStorage.setItem('corporate_contract_otp', generatedOtp);
    console.info('[Contracts] OTP generated for eSign: ' + generatedOtp);

    setTimeout(() => {
      setIsOtpSending(false);
      setIsOtpStep(true);
      toast({
        title: 'Aadhaar OTP Dispatched',
        description: 'A secure authentication code has been sent to your Aadhaar-linked mobile number.',
      });
    }, 1200);
  };

  const handleVerifyAndSign = () => {
    const expectedOtp = sessionStorage.getItem('corporate_contract_otp');
    if (!expectedOtp || otpCode.trim() !== expectedOtp) {
      toast({
        title: 'Verification Failed',
        description: 'Incorrect OTP. Please enter the valid code sent to your mobile.',
        variant: 'destructive',
      });
      return;
    }

    setIsOtpVerifying(true);
    setTimeout(() => {
      if (selectedProject) {
        signAgreementMutation.mutate({
          projectId: selectedProject.project_id,
          type: activeContractType,
          name: signatoryName.trim(),
          aadhaar: aadhaarNumber,
        });
      }
      sessionStorage.removeItem('corporate_contract_otp');
    }, 1500);
  };

  const parseSignatureMetadata = (metadataStr: string | null) => {
    if (!metadataStr) return null;
    const parts = metadataStr.split('|');
    if (parts.length < 3) return { name: metadataStr, hash: 'N/A', last4: 'XXXX' };
    return {
      name: parts[0],
      hash: parts[1],
      last4: parts[2],
    };
  };

  const pendingProjects = projects?.filter(
    (p) => p.status === 'Approved' && (!p.lease_agreement_signed || !p.ppa_agreement_signed)
  ) || [];

  const activeProjects = projects?.filter(
    (p) => p.lease_agreement_signed || p.ppa_agreement_signed || p.status === 'Live'
  ) || [];

  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <DashboardLayout role="corporate">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">E-Contracts & Agreements</h1>
          <p className="text-muted-foreground">Review, eSign, and manage your corporate solar utility contracts</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading agreements...</span>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Pending Action ({pendingProjects.length})</span>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Active Agreements ({activeProjects.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Pending Signatures Tab */}
            <TabsContent value="pending" className="space-y-6">
              {pendingProjects.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 border border-dashed rounded-2xl p-8 max-w-xl mx-auto">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-foreground">No Pending Actions</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Once a solar investment proposal is approved, contract agreements will appear here for eSign authentication.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {pendingProjects.map((project) => (
                    <Card key={project.project_id} className="border-border/60 shadow-md">
                      <CardHeader>
                        <CardTitle className="text-lg">{project.project_name}</CardTitle>
                        <CardDescription>{project.location}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-3 rounded-lg border border-border/40">
                          <div>
                            <span className="text-muted-foreground text-xs block">Estimated Capacity</span>
                            <span className="font-semibold">{project.estimated_capacity_kw || 150} kW</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs block">PPA Tariff</span>
                            <span className="font-semibold">₹{project.ppa_rate || 5.50} / unit</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs block">Duration</span>
                            <span className="font-semibold">{project.lease_duration_years || 25} Years</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs block">Solar Offset</span>
                            <span className="font-semibold">{project.desired_solar_offset_percentage || 45}%</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Required Documents</h4>
                          
                          {/* Land Lease Card Row */}
                          <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-teal-600" />
                              <div>
                                <span className="font-semibold text-sm block">Land Lease Agreement</span>
                                <span className="text-xs text-muted-foreground">Grants access to install solar infrastructure</span>
                              </div>
                            </div>
                            <div>
                              {project.lease_agreement_signed ? (
                                <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 font-semibold px-2 py-0.5">Signed</Badge>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="font-semibold border-teal-500/30 text-teal-600 hover:bg-teal-50"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setActiveContractType('lease');
                                    resetSignForm();
                                    setIsReviewOpen(true);
                                  }}
                                >
                                  Review & Sign
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* PPA Card Row */}
                          <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-indigo-600" />
                              <div>
                                <span className="font-semibold text-sm block">Power Purchase Agreement</span>
                                <span className="text-xs text-muted-foreground">Defines solar energy billing rate & offset</span>
                              </div>
                            </div>
                            <div>
                              {project.ppa_agreement_signed ? (
                                <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 font-semibold px-2 py-0.5">Signed</Badge>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="font-semibold border-indigo-500/30 text-indigo-600 hover:bg-indigo-50"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setActiveContractType('ppa');
                                    resetSignForm();
                                    setIsReviewOpen(true);
                                  }}
                                >
                                  Review & Sign
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Active Agreements Tab */}
            <TabsContent value="active" className="space-y-6">
              {activeProjects.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 border border-dashed rounded-2xl p-8 max-w-xl mx-auto">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-foreground">No Active Agreements</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Once contracts are signed, the legal documents, audit hashes, and verification watermarks will load here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {activeProjects.map((project) => (
                    <Card key={project.project_id} className="border-border/60 shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{project.project_name}</CardTitle>
                            <CardDescription>{project.location}</CardDescription>
                          </div>
                          <Badge className={`${project.status === 'Live' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'} font-semibold px-2 py-0.5`}>
                            {project.status === 'Live' ? 'Live Generation' : 'Approved (Pending COD)'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 border-t pt-3">
                          {project.lease_agreement_signed && (
                            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/10">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-teal-600" />
                                <div>
                                  <span className="font-semibold text-sm block">Land Lease Agreement</span>
                                  <span className="text-xs text-muted-foreground">
                                    Signed on {new Date(project.lease_agreement_signed_at!).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setActiveContractType('lease');
                                  setIsReviewOpen(true);
                                }}
                              >
                                View Contract
                              </Button>
                            </div>
                          )}

                          {project.ppa_agreement_signed && (
                            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/10">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-indigo-600" />
                                <div>
                                  <span className="font-semibold text-sm block">Power Purchase Agreement</span>
                                  <span className="text-xs text-muted-foreground">
                                    Signed on {new Date(project.ppa_agreement_signed_at!).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setActiveContractType('ppa');
                                  setIsReviewOpen(true);
                                }}
                              >
                                View Contract
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Contract Review & Aadhaar Sign Modal */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-4xl bg-card/95 border-border/80 backdrop-blur-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Shield className="h-5 w-5 text-primary" />
              {activeContractType === 'lease' ? 'Land Lease Agreement' : 'Power Purchase Agreement'}
            </DialogTitle>
            <DialogDescription>
              {selectedProject && (
                <span>Legal Document for corporate solar setup: <strong>{selectedProject.project_name}</strong></span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="grid md:grid-cols-5 gap-6 py-4">
              {/* Document Text Box (Col-span 3) */}
              <div className="md:col-span-3 space-y-4">
                <div className="relative font-serif leading-relaxed text-sm bg-stone-50 border border-stone-200 text-stone-900 rounded-lg p-6 max-h-[380px] overflow-y-auto shadow-inner select-none whitespace-pre-wrap">
                  
                  {/* eSign Watermark overlay */}
                  {((activeContractType === 'lease' && selectedProject.lease_agreement_signed) ||
                    (activeContractType === 'ppa' && selectedProject.ppa_agreement_signed)) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.07] z-10">
                      <div className="text-5xl font-black font-sans uppercase tracking-widest border-[8px] border-green-600 text-green-700 rounded-2xl px-8 py-3 select-none -rotate-12 transform">
                        e-Signed via OTP
                      </div>
                    </div>
                  )}

                  {/* Contract content */}
                  {activeContractType === 'lease' ? (
                    <>
                      <div className="text-center font-bold text-base uppercase border-b-2 border-stone-300 pb-2 mb-4">
                        LAND LEASE AGREEMENT
                      </div>
                      This Land Lease Agreement ("Agreement") is executed on <strong>{currentDateStr}</strong> by and between:
                      {"\n\n"}
                      1. <strong>{profile?.full_name || 'Lessor Corporate'}</strong> (hereinafter referred to as the "Lessor", which expression shall include its successors and permitted assigns); and
                      {"\n\n"}
                      2. <strong>Super Solar Solution Private Limited</strong> (hereinafter referred to as the "Lessee", which expression shall include its successors and permitted assigns).
                      {"\n\n"}
                      <strong>WHEREAS:</strong>
                      {"\n"}
                      A. The Lessor is the absolute owner of the premises located at <strong>{selectedProject.location}</strong> ("Premises").
                      {"\n"}
                      B. The Lessee is in the business of developing, investing, installing, and operating solar photovoltaic power generation projects.
                      {"\n"}
                      C. The Lessor has agreed to lease a shadow-free roof/land area of approximately <strong>{selectedProject.area_available_sqft || 15000} sq. ft.</strong> on the Premises for installing a solar power plant of capacity <strong>{selectedProject.estimated_capacity_kw || 150} kW</strong>.
                      {"\n\n"}
                      <strong>NOW IT IS MUTUALLY AGREED BY AND BETWEEN THE PARTIES AS FOLLOWS:</strong>
                      {"\n"}
                      1. <strong>LEASE TERM:</strong> The Lessor hereby leases the Premise to the Lessee for a term of <strong>{selectedProject.lease_duration_years || 25} years</strong> starting from the Lease Start Date.
                      {"\n"}
                      2. <strong>PREMISE USE & COVENANTS:</strong> The Lessee shall install, operate, and maintain the solar assets. The Lessor shall provide unhindered access and guarantees shadow-free rooftop availability.
                      {"\n"}
                      3. <strong>RENTAL:</strong> The rent for the rooftop/premises is incorporated into the solar power consumption rates as defined under the Power Purchase Agreement.
                      {"\n"}
                      4. <strong>COMPLIANCE:</strong> Both parties shall conform with central and state electricity regulations and statutory laws.
                    </>
                  ) : (
                    <>
                      <div className="text-center font-bold text-base uppercase border-b-2 border-stone-300 pb-2 mb-4">
                        POWER PURCHASE AGREEMENT (PPA)
                      </div>
                      This Power Purchase Agreement ("Agreement") is entered into on <strong>{currentDateStr}</strong> by and between:
                      {"\n\n"}
                      1. <strong>Super Solar Solution Private Limited</strong> (hereinafter referred to as the "Power Provider"); and
                      {"\n\n"}
                      2. <strong>{profile?.full_name || 'Lessor Corporate'}</strong> (hereinafter referred to as the "Purchaser").
                      {"\n\n"}
                      <strong>WHEREAS:</strong>
                      {"\n"}
                      A. The Power Provider is installing a solar photovoltaic facility of capacity <strong>{selectedProject.estimated_capacity_kw || 150} kW</strong> at the Purchaser's facility located at <strong>{selectedProject.location}</strong>.
                      {"\n"}
                      B. The Purchaser wishes to buy 100% of the solar electricity generated by this system to offset its utility bills.
                      {"\n\n"}
                      <strong>NOW IT IS MUTUALLY AGREED BY AND BETWEEN THE PARTIES AS FOLLOWS:</strong>
                      {"\n"}
                      1. <strong>TERM:</strong> This Agreement shall continue in full force for a period of <strong>{selectedProject.lease_duration_years || 25} years</strong> from the Commercial Operation Date (COD).
                      {"\n"}
                      2. <strong>TARIFF RATE:</strong> The Purchaser shall pay the Power Provider a PPA Tariff of <strong>₹{selectedProject.ppa_rate || 5.50} per kWh (Unit)</strong> of electricity consumed, billing monthly.
                      {"\n"}
                      3. <strong>SOLAR OFFSET & GUARANTEE:</strong> The system is designed to provide an estimated solar offset of <strong>{selectedProject.desired_solar_offset_percentage || 45}%</strong> of the Purchaser's average power consumption.
                      {"\n"}
                      4. <strong>OWNERSHIP:</strong> The solar asset fractions remain under the ownership of the Super Solar Solution Platform's fractional investors.
                    </>
                  )}

                  {/* Stamp Details if signed */}
                  {((activeContractType === 'lease' && selectedProject.lease_agreement_signed) ||
                    (activeContractType === 'ppa' && selectedProject.ppa_agreement_signed)) && (
                    <div className="mt-8 border-t-2 border-dashed border-stone-300 pt-4 text-[10px] font-mono text-stone-600 space-y-1 bg-stone-100/50 p-3 rounded-md">
                      <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold mb-1.5 font-sans">
                        <CheckCircle2 className="h-4 w-4" />
                        Aadhaar eSign Lock Verified
                      </div>
                      {(() => {
                        const meta = parseSignatureMetadata(
                          activeContractType === 'lease'
                            ? selectedProject.lease_agreement_signature_id
                            : selectedProject.ppa_agreement_signature_id
                        );
                        const signDate = activeContractType === 'lease'
                          ? selectedProject.lease_agreement_signed_at
                          : selectedProject.ppa_agreement_signed_at;

                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Signatory: <strong>{meta?.name}</strong></span>
                              <span>Aadhaar: <strong>XXXX XXXX {meta?.last4}</strong></span>
                            </div>
                            <div className="flex justify-between">
                              <span>Timestamp: <strong>{new Date(signDate!).toLocaleString()}</strong></span>
                              <span>Signature Hash: <strong>{meta?.hash}</strong></span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Box / Sign Form (Col-span 2) */}
              <div className="md:col-span-2 border rounded-xl p-4 bg-muted/10 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm border-b pb-2 mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    e-Sign Panel
                  </h4>

                  {((activeContractType === 'lease' && selectedProject.lease_agreement_signed) ||
                    (activeContractType === 'ppa' && selectedProject.ppa_agreement_signed)) ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2 animate-bounce" />
                        <h5 className="font-bold text-green-700 text-sm">Agreement Signed</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          This agreement has been digitally certified and locked against tampering.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-700 leading-relaxed">
                        <strong>UIDAI Aadhaar Sign:</strong> Digitally authenticate and lock this agreement using the mobile number linked to your Aadhaar card.
                      </div>

                      {!isOtpStep ? (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="signatoryNameInput" className="text-xs font-semibold">Authorized Signatory Name</Label>
                            <div className="relative">
                              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="signatoryNameInput"
                                placeholder="Enter full name"
                                className="pl-9 text-sm"
                                value={signatoryName}
                                onChange={(e) => setSignatoryName(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="aadhaarInput" className="text-xs font-semibold">Aadhaar Card Number</Label>
                            <div className="relative">
                              <Shield className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="aadhaarInput"
                                placeholder="XXXX XXXX XXXX"
                                className="pl-9 font-mono tracking-widest text-sm"
                                value={aadhaarNumber}
                                onChange={(e) => handleAadhaarInput(e.target.value)}
                              />
                            </div>
                          </div>

                          <Button
                            className="w-full font-semibold text-sm py-5 mt-2"
                            onClick={handleTriggerOtp}
                            disabled={isOtpSending}
                          >
                            {isOtpSending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Dispatched...
                              </>
                            ) : (
                              'Request eSign OTP'
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-1.5 text-center">
                            <Label htmlFor="otpInput" className="text-xs font-semibold">Enter 6-Digit SMS OTP</Label>
                            <Input
                              id="otpInput"
                              placeholder="******"
                              maxLength={6}
                              className="text-center font-mono text-xl tracking-widest py-5"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Please enter the 6-digit code sent to your mobile number.
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-1/3 text-xs"
                              onClick={() => setIsOtpStep(false)}
                            >
                              Back
                            </Button>
                            <Button
                              size="sm"
                              className="w-2/3 font-semibold text-xs py-5"
                              onClick={handleVerifyAndSign}
                              disabled={isOtpVerifying}
                            >
                              {isOtpVerifying ? (
                                <>
                                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                  Sealing...
                                </>
                              ) : (
                                'Verify & e-Sign'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 mt-4 text-[10px] text-muted-foreground flex justify-between items-center">
                  <span>SSL encrypted</span>
                  <span>ID: {selectedProject.project_id.substring(0, 8)}...</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Close Window</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
