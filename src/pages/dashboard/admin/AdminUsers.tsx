import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import { useAllProfilesWithRoles, useUpdateKYCStatus, useUpdateUserRole } from '@/hooks/useProfiles';
import { Search, Filter, Shield, UserCog, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState<string>('');

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

    const handleKYCAction = async (userId: string, status: 'approved' | 'rejected') => {
        try {
            await updateKYCStatus.mutateAsync({ userId, status });
            toast({
                title: `KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                description: `User KYC status has been updated.`,
            });
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
                        <div className="flex items-center justify-between">
                            <CardTitle>All Users ({filteredUsers?.length || 0})</CardTitle>
                            <div className="flex gap-2">
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
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell>
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
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">Verified</Badge>
                                                    )}
                                                    {user.kyc_status === 'pending' && (
                                                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>
                                                    )}
                                                    {user.kyc_status === 'rejected' && (
                                                        <Badge variant="destructive">Rejected</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openRoleDialog(user)} title="Change Role">
                                                            <UserCog className="h-4 w-4" />
                                                        </Button>

                                                        {user.kyc_status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    onClick={() => handleKYCAction(user.id, 'approved')}
                                                                    title="Approve KYC"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleKYCAction(user.id, 'rejected')}
                                                                    title="Reject KYC"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">No users found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Role Dialog */}
                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update User Role</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <label className="text-sm font-medium mb-2 block">Select Role</label>
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
            </div>
        </DashboardLayout>
    );
}
