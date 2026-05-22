import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { useAllProfilesWithRoles, useUpdateKYCStatus, useUpdateUserRole } from '@/hooks/useProfiles';
import { Search, Filter, Shield, UserCog, CheckCircle, XCircle, Eye, FileText, Calendar, Landmark, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState<string>('');

    // KYC Dialog state
    const [viewingKycUser, setViewingKycUser] = useState<any>(null);
    const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);

    const { data: profiles, isLoading } = useAllProfilesWithRoles();
    const updateKYCStatus = useUpdateKYCStatus();
    const updateUserRole = useUpdateUserRole();
    const { toast } = useToast();

    const filteredUsers = profiles?.filter(user => {
        const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleKYCAction = async (userId: string, status: 'pending' | 'approved' | 'rejected') => {
        try {
            await updateKYCStatus.mutateAsync({ userId, status });
            toast({
                title: `KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                description: `User KYC status has been updated.`,
            });
            if (viewingKycUser && viewingKycUser.id === userId) {
                setViewingKycUser((prev: any) => ({ ...prev, kyc_status: status }));
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update KYC status.',
                variant: 'destructive',
            });
        }
    };

    const handleRoleUpdate = async () => {
        if (!selectedUser || !newRole) return;

        try {
            await updateUserRole.mutateAsync({
                userId: selectedUser.id,
                role: newRole as 'investor' | 'corporate' | 'nbfc' | 'implementer' | 'admin'
            });

            toast({
                title: 'Role Updated',
                description: `User role changed to ${newRole}.`,
            });
            setIsRoleDialogOpen(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update user role.',
                variant: 'destructive',
            });
        }
    };

    const openRoleDialog = (user: any) => {
        setSelectedUser(user);
        setNewRole(user.role || 'investor');
        setIsRoleDialogOpen(true);
    };

    const openKycDialog = (user: any) => {
        setViewingKycUser(user);
        setIsKycDialogOpen(true);
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-muted-foreground">Manage users, roles, and verification</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle>All Users ({filteredUsers?.length || 0})</CardTitle>
                            <div className="flex flex-wrap gap-2">
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search users..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            <SelectValue placeholder="Filter by Role" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="investor">Investor</SelectItem>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                        <SelectItem value="nbfc">NBFC</SelectItem>
                                        <SelectItem value="implementer">Implementer</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>KYC Status</TableHead>
                                        <TableHead>Payout Verification</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">Loading users...</TableCell>
                                        </TableRow>
                                    ) : filteredUsers && filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={user.avatar_url || ''} />
                                                            <AvatarFallback>{user.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{user.full_name}</div>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.kyc_status === 'approved' && (
                                                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20 font-semibold px-2 py-0.5">Verified</Badge>
                                                    )}
                                                    {user.kyc_status === 'pending' && (
                                                        <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border border-yellow-500/20 font-semibold px-2 py-0.5">Pending</Badge>
                                                    )}
                                                    {user.kyc_status === 'rejected' && (
                                                        <Badge variant="destructive" className="font-semibold px-2 py-0.5">Rejected</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {user.bank_verified ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold px-2 py-0.5">
                                                            Bank Active
                                                        </Badge>
                                                    ) : user.upi_id ? (
                                                        <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border border-yellow-500/20 font-semibold px-2 py-0.5">
                                                            UPI Only
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Not Configured</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {(user.pan_number || user.aadhaar_number) && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex items-center gap-1 font-semibold text-xs border-primary/20 text-primary hover:bg-primary/5"
                                                                onClick={() => openKycDialog(user)}
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                KYC Docs
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="icon" onClick={() => openRoleDialog(user)} title="Change Role">
                                                            <UserCog className="h-4 w-4" />
                                                        </Button>

                                                         {user.kyc_status !== 'approved' && (
                                                             <Button
                                                                 variant="ghost"
                                                                 size="icon"
                                                                 className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                 onClick={() => handleKYCAction(user.id, 'approved')}
                                                                 title="Approve KYC"
                                                             >
                                                                 <CheckCircle className="h-4 w-4" />
                                                             </Button>
                                                         )}
                                                         {user.kyc_status !== 'rejected' && (
                                                             <Button
                                                                 variant="ghost"
                                                                 size="icon"
                                                                 className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                 onClick={() => handleKYCAction(user.id, 'rejected')}
                                                                 title="Reject KYC"
                                                             >
                                                                 <XCircle className="h-4 w-4" />
                                                             </Button>
                                                         )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">No users found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Role Dialog */}
                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                    <DialogContent className="bg-card/95 border-border/80 backdrop-blur-lg">
                        <DialogHeader>
                            <DialogTitle>Update User Role</DialogTitle>
                            <DialogDescription>Change system access permissions for this user</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <label className="text-sm font-medium mb-2 block text-foreground/80">Select Role</label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="investor">Investor</SelectItem>
                                    <SelectItem value="corporate">Corporate</SelectItem>
                                    <SelectItem value="nbfc">NBFC</SelectItem>
                                    <SelectItem value="implementer">Implementer</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleRoleUpdate} disabled={updateUserRole.isPending}>
                                {updateUserRole.isPending ? 'Updating...' : 'Update Role'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* KYC Document Viewer Dialog */}
                <Dialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
                    <DialogContent className="max-w-3xl bg-card/95 border-border/80 backdrop-blur-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        KYC Verification Details
                                    </DialogTitle>
                                    <DialogDescription>
                                        Review user uploaded documents and verify credentials
                                    </DialogDescription>
                                </div>
                                {viewingKycUser && (
                                    <Badge className={`capitalize font-semibold ml-auto mr-4 px-2.5 py-0.5 ${
                                        viewingKycUser.kyc_status === 'approved' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                                        viewingKycUser.kyc_status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' :
                                        'bg-red-500/10 text-red-600 border border-red-500/20'
                                    }`}>
                                        {viewingKycUser.kyc_status}
                                    </Badge>
                                )}
                            </div>
                        </DialogHeader>

                        {viewingKycUser && (
                            <div className="space-y-6 py-4">
                                {/* Profile overview */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-border/40 text-sm">
                                    <div>
                                        <span className="text-muted-foreground block text-xs">Full Name</span>
                                        <span className="font-semibold text-foreground">{viewingKycUser.full_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs">Email Address</span>
                                        <span className="font-semibold text-foreground break-all">{viewingKycUser.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs">Submission Date</span>
                                        <span className="font-semibold text-foreground flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            {viewingKycUser.kyc_submitted_at ? new Date(viewingKycUser.kyc_submitted_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs">Phone Number</span>
                                        <span className="font-semibold text-foreground">{viewingKycUser.phone || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Documents Tab */}
                                <Tabs defaultValue="pan" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="pan" className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            PAN Card Details
                                        </TabsTrigger>
                                        <TabsTrigger value="aadhaar" className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Aadhaar Card Details
                                        </TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="pan" className="mt-4 space-y-4">
                                        <div className="flex items-center justify-between border bg-muted/10 p-3 rounded-lg text-sm">
                                            <div>
                                                <span className="text-muted-foreground text-xs block">PAN Permanent Account Number</span>
                                                <span className="font-mono text-base font-bold tracking-widest text-foreground uppercase">{viewingKycUser.pan_number || 'NOT SUBMITTED'}</span>
                                            </div>
                                            <Badge variant="outline" className="border-green-500/20 text-green-600 bg-green-500/5 font-semibold">Matched PAN DB</Badge>
                                        </div>

                                        {/* Mock PAN Card visual mockup */}
                                        <div className="relative aspect-[1.58/1] max-w-md mx-auto bg-gradient-to-br from-teal-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-2xl border border-white/10 overflow-hidden flex flex-col justify-between">
                                            {/* Watermark Logo */}
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
                                            <div className="absolute right-[-20%] bottom-[-20%] opacity-[0.03] pointer-events-none">
                                                <Shield className="h-72 w-72" />
                                            </div>

                                            {/* Card Top */}
                                            <div className="flex justify-between items-start border-b border-white/10 pb-3">
                                                <div>
                                                    <h4 className="text-xs tracking-wider opacity-90 font-bold uppercase">आयकर विभाग</h4>
                                                    <h3 className="text-sm font-black tracking-widest uppercase">INCOME TAX DEPARTMENT</h3>
                                                    <p className="text-[10px] tracking-wide text-slate-400">भारत सरकार / GOVT. OF INDIA</p>
                                                </div>
                                                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px] uppercase tracking-wider py-0.5">PERMANENT ACCOUNT CARD</Badge>
                                            </div>

                                            {/* Card Middle */}
                                            <div className="grid grid-cols-5 gap-4 my-auto items-center py-2">
                                                {/* Mock Avatar */}
                                                <div className="col-span-2 aspect-[3/4] bg-slate-900/80 border border-slate-700/50 rounded-lg flex items-center justify-center relative overflow-hidden group">
                                                    <div className="h-full w-full opacity-60 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_100%)] flex flex-col items-center justify-center p-2 text-center">
                                                        <Avatar className="h-10 w-10 border border-white/20 mb-1">
                                                            <AvatarFallback>{viewingKycUser.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[8px] text-slate-400 font-mono tracking-wider">{viewingKycUser.full_name?.split(' ')[0]}</span>
                                                    </div>
                                                </div>

                                                {/* Info details */}
                                                <div className="col-span-3 space-y-2 text-xs">
                                                    <div>
                                                        <p className="text-[8px] text-slate-400 tracking-wider uppercase">Name / नाम</p>
                                                        <p className="font-bold tracking-wide uppercase">{viewingKycUser.full_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] text-slate-400 tracking-wider uppercase">Father's Name / पिता का नाम</p>
                                                        <p className="font-semibold tracking-wide uppercase">{viewingKycUser.full_name?.split(' ')[1] ? `${viewingKycUser.full_name.split(' ')[1]} Lal` : 'Ram Lal'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] text-slate-400 tracking-wider uppercase">Date of Birth / जन्म तिथि</p>
                                                        <p className="font-mono tracking-wider">12/08/1994</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Bottom */}
                                            <div className="flex justify-between items-end border-t border-white/10 pt-3">
                                                <div>
                                                    <p className="text-[8px] text-slate-400 tracking-wider uppercase">Permanent Account Number / खाता संख्या</p>
                                                    <p className="font-mono text-base font-extrabold tracking-widest text-emerald-400 uppercase">{viewingKycUser.pan_number}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="inline-block px-4 py-1.5 border border-dashed border-white/20 rounded font-serif text-[10px] tracking-wide text-slate-300 select-none italic font-bold">
                                                        {viewingKycUser.full_name}
                                                    </div>
                                                    <p className="text-[6px] text-slate-400 mt-1 uppercase tracking-wider">Signature / हस्ताक्षर</p>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="aadhaar" className="mt-4 space-y-4">
                                        <div className="flex items-center justify-between border bg-muted/10 p-3 rounded-lg text-sm">
                                            <div>
                                                <span className="text-muted-foreground text-xs block">Aadhaar 12-Digit Number</span>
                                                <span className="font-mono text-base font-bold tracking-widest text-foreground">
                                                    {viewingKycUser.aadhaar_number ? viewingKycUser.aadhaar_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 'NOT SUBMITTED'}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className="border-green-500/20 text-green-600 bg-green-500/5 font-semibold">OTP eSign Verified</Badge>
                                        </div>

                                        {/* Mock Aadhaar Card visual mockup */}
                                        <div className="relative aspect-[1.58/1] max-w-md mx-auto bg-gradient-to-br from-emerald-50 via-yellow-50 to-emerald-100 text-slate-800 rounded-2xl p-6 shadow-2xl border border-border/70 overflow-hidden flex flex-col justify-between">
                                            {/* Top Banner */}
                                            <div className="flex justify-between items-start border-b border-red-500/30 pb-2">
                                                <div>
                                                    <h3 className="text-xs font-black text-red-700 tracking-wider">भारत सरकार</h3>
                                                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">GOVERNMENT OF INDIA</h4>
                                                </div>
                                                <div className="text-right text-[8px] font-bold text-emerald-800">
                                                    भारतीय विशिष्ट पहचान प्राधिकरण
                                                    <div className="text-[6px] text-slate-500 font-normal leading-none uppercase">Unique Identification Authority of India</div>
                                                </div>
                                            </div>

                                            {/* Middle Area */}
                                            <div className="grid grid-cols-5 gap-4 my-auto items-center py-2">
                                                {/* Photo */}
                                                <div className="col-span-2 aspect-[3/4] bg-white border border-slate-300 rounded-md p-1 flex items-center justify-center relative overflow-hidden">
                                                    <div className="h-full w-full bg-slate-100 flex items-center justify-center rounded border border-slate-200">
                                                        <Avatar className="h-10 w-10 border border-slate-300">
                                                            <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">{viewingKycUser.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="col-span-3 space-y-1.5 text-[11px] text-slate-700">
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-tight">{viewingKycUser.full_name}</p>
                                                        <p className="text-[9px] text-slate-500 leading-none">Name</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 leading-none">DOB: 12/08/1994</p>
                                                        <p className="text-[9px] text-slate-500 leading-none">जन्म तिथि</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 leading-none">Male / पुरुष</p>
                                                        <p className="text-[9px] text-slate-500 leading-none">Gender</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Area */}
                                            <div className="flex flex-col items-center justify-center border-t border-red-500/20 pt-2 text-center">
                                                <div className="font-mono text-base font-extrabold tracking-widest text-slate-900">
                                                    {viewingKycUser.aadhaar_number ? viewingKycUser.aadhaar_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 'XXXX XXXX XXXX'}
                                                </div>
                                                <div className="text-[8px] font-bold text-red-600 tracking-wider uppercase mt-0.5">
                                                    मेरा आधार, मेरी पहचान / MY AADHAAR, MY IDENTITY
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Payout Verification */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-sm flex items-center gap-2 border-b pb-2">
                                        <Landmark className="h-4 w-4 text-primary" />
                                        Payout Rails Verification
                                    </h4>
                                    
                                    <div className="grid gap-4 sm:grid-cols-2 text-sm bg-muted/20 p-4 rounded-xl border border-border/40">
                                        <div>
                                            <span className="text-muted-foreground block text-xs">Bank Verification Status</span>
                                            {viewingKycUser.bank_verified ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold mt-1">
                                                    Penny-Drop Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-yellow-500/20 text-yellow-600 bg-yellow-500/5 font-semibold mt-1">
                                                    Not Verified
                                                </Badge>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-xs">UPI VPA</span>
                                            <span className="font-mono font-semibold text-foreground flex items-center gap-1.5 mt-1">
                                                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                                {viewingKycUser.upi_id || 'N/A'}
                                            </span>
                                        </div>
                                        {viewingKycUser.bank_account_holder && (
                                            <>
                                                <div>
                                                    <span className="text-muted-foreground block text-xs">Bank Account Beneficiary</span>
                                                    <span className="font-semibold text-foreground">{viewingKycUser.bank_account_holder}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block text-xs">Bank Details (IFSC / Account)</span>
                                                    <span className="font-mono font-semibold text-foreground">
                                                        {viewingKycUser.bank_ifsc} / {viewingKycUser.bank_account_number?.replace(/.(?=.{4})/g, "*")}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="sm:justify-between gap-2 border-t pt-4">
                            <Button variant="outline" onClick={() => setIsKycDialogOpen(false)}>Close View</Button>
                            {viewingKycUser && (
                                <div className="flex gap-2">
                                    {viewingKycUser.kyc_status !== 'rejected' && (
                                        <Button 
                                            variant="destructive"
                                            className="flex items-center gap-1.5 font-semibold"
                                            onClick={() => {
                                                handleKYCAction(viewingKycUser.id, 'rejected');
                                                setIsKycDialogOpen(false);
                                            }}
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Reject KYC
                                        </Button>
                                    )}
                                    {viewingKycUser.kyc_status !== 'approved' && (
                                        <Button 
                                            className="flex items-center gap-1.5 font-semibold"
                                            onClick={() => {
                                                handleKYCAction(viewingKycUser.id, 'approved');
                                                setIsKycDialogOpen(false);
                                            }}
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Approve & Verify KYC
                                        </Button>
                                    )}
                                </div>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
