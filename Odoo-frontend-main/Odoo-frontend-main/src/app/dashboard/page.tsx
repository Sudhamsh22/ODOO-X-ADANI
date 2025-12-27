'use client';
import * as React from 'react';
import {
  ServerCrash,
  Users,
  Construction,
  Search,
  PlusCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MaintenanceRequest, Equipment, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getRequests } from '@/lib/api/requests';
import { getAllEquipment } from '@/lib/api/equipment';
import { getUsers } from '@/lib/api/users';
import request from '@/lib/api-client';

async function getDashboardSummary() {
    return request('/dashboard');
}

export default function DashboardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [maintenanceRequests, setMaintenanceRequests] = React.useState<MaintenanceRequest[]>([]);
  const [allEquipment, setAllEquipment] = React.useState<Equipment[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [summary, setSummary] = React.useState<{ critical: number, open: number, overdue: number } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [requests, equipment, users, summaryData] = await Promise.all([
          getRequests(),
          getAllEquipment(),
          getUsers(),
          getDashboardSummary(),
        ]);
        setMaintenanceRequests(requests);
        setAllEquipment(equipment);
        setUsers(users);
        setSummary(summaryData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openRequestsCount = summary?.open ?? 0;
  const overdueRequestsCount = summary?.overdue ?? 0;
  const criticalEquipmentCount = summary?.critical ?? 0;

  const technicians = users.filter((u) => u.role === 'technician');
  const assignedTechnicians = new Set(
    maintenanceRequests.filter(r => r.status === 'IN_PROGRESS' || r.status === 'NEW').map((r) => r.assignedTechnicianId)
  );
  const technicianLoad =
    technicians.length > 0
      ? Math.round((assignedTechnicians.size / technicians.length) * 100)
      : 0;

  const handleRowClick = (requestId: number) => {
    router.push(`/requests/${requestId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h1>
      </div>

      <div className="flex justify-between items-center gap-4">
        <Button asChild>
          <Link href="/requests?create=true">
            <PlusCircle className="mr-2 h-4 w-4" /> New
          </Link>
        </Button>
        <div className="flex-1 max-w-sm mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive-foreground">
              Critical Equipment
            </CardTitle>
            <ServerCrash className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {criticalEquipmentCount} Units
            </div>
            <p className="text-xs text-destructive/80">(Health &lt; 30%)</p>
          </CardContent>
        </Card>
        <Card className="border-primary/50 bg-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Technician Load
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {technicianLoad}% Utilized
            </div>
            <p className="text-xs text-primary/80">Assign Carefully</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/50 bg-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Open Requests
            </CardTitle>
            <Construction className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              {openRequestsCount} Pending
            </div>
            <p className="text-xs text-green-600/80 dark:text-green-400/80">
              {overdueRequestsCount} Overdue
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card shadow-soft rounded-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-0">
                <TableHead>Subject</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Company</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceRequests.slice(0, 5).map((request) => {
                const employee = users.find((u) => u.id === request.requesterId);
                const technician = users.find(
                  (u) => u.id === request.assignedTechnicianId
                );
                const equip = allEquipment.find(
                  (e) => e.id === request.equipmentId
                );

                const statusVariant: {
                  [key: string]:
                    | 'outline'
                    | 'secondary'
                    | 'default'
                    | 'destructive';
                } = {
                  NEW: 'outline',
                  IN_PROGRESS: 'secondary',
                  REPAIRED: 'default',
                  SCRAP: 'destructive',
                };
                
                const statusDisplay: {[key: string]: string} = {
                    NEW: 'New',
                    IN_PROGRESS: 'In Progress',
                    REPAIRED: 'Repaired',
                    SCRAP: 'Scrap'
                }

                return (
                  <TableRow
                    key={request.id}
                    className="border-t border-dashed cursor-pointer"
                    onClick={() => handleRowClick(request.id)}
                  >
                    <TableCell>{request.subject}</TableCell>
                    <TableCell>{employee?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {technician?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell>{equip?.category?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[request.status]}>
                        {statusDisplay[request.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>GearGuard Inc.</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
