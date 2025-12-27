'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  MaintenanceRequest,
  MaintenanceRequestPriority,
  MaintenanceRequestStatus,
  MaintenanceRequestType,
  Equipment,
  User,
  Team,
  WorkCenter,
} from '@/lib/types';
import { ArrowLeft, Save, FileText, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import WorkflowIndicator from '@/components/app/workflow-indicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import StatusIndicator from '@/components/app/status-indicator';
import { Skeleton } from '@/components/ui/skeleton';
import { getRequestById, updateRequest } from '@/lib/api/requests';
import { getAllEquipment } from '@/lib/api/equipment';
import { getUsers } from '@/lib/api/users';
import { getTeams } from '@/lib/api/teams';
import { getWorkCenters } from '@/lib/api/work-centers';

export default function MaintenanceRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { id } = params;

  const [request, setRequest] = React.useState<MaintenanceRequest | null>(null);
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [workCenters, setWorkCenters] = React.useState<WorkCenter[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [maintenanceFor, setMaintenanceFor] = React.useState('equipment');

  React.useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [requestData, eqData, usersData, teamsData, wcData] = await Promise.all([
          getRequestById(id as string),
          getAllEquipment(),
          getUsers(),
          getTeams(),
          getWorkCenters(),
        ]);

        setRequest(requestData);
        setEquipment(eqData);
        setUsers(usersData);
        setTeams(teamsData);
        setWorkCenters(wcData);
        
        setMaintenanceFor(
          requestData.equipmentId ? 'equipment' : 'work_center'
        );
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          variant: 'destructive',
          title: 'Not Found',
          description: 'Maintenance request not found or failed to load data.',
        });
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, toast]);

  const handleMaintenanceForChange = (value: string) => {
    setMaintenanceFor(value);
    if (value === 'equipment' && request) {
      // Optionally reset work center when switching back to equipment
    } else if (value === 'work_center' && request) {
      setRequest({ ...request, equipmentId: '' });
    }
  };

  const handleInputChange = (
    field: keyof MaintenanceRequest,
    value: string | number
  ) => {
    if (request) {
      setRequest({ ...request, [field]: value });
    }
  };

  const handleDateChange = (
    field: keyof MaintenanceRequest,
    value: string
  ) => {
    if (request) {
      const date = value ? new Date(value).toISOString() : '';
      setRequest({ ...request, [field]: date });
    }
  };

  const handleSelectChange = (field: keyof MaintenanceRequest, value: any) => {
    if (request) {
      const updatedValue = value === 'unassigned' ? '' : value;
      setRequest({ ...request, [field]: updatedValue });
    }
  };

  const handleEquipmentChange = (equipmentId: string) => {
    const selectedEquipment = equipment.find((e) => e.id === equipmentId);
    if (request && selectedEquipment) {
      setRequest({
        ...request,
        equipmentId,
        teamId: selectedEquipment.maintenanceTeamId,
        assignedTechnicianId: '', // Reset technician when equipment/team changes
      });
    }
  };

  const handleSave = async () => {
    if (!request) return;
    try {
      await updateRequest(request.id, request);
      toast({
        title: 'Request Saved',
        description: `Changes to "${request?.subject}" have been saved.`,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Could not save the maintenance request.',
      });
    }
  };

  if (loading || !request) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-7 w-64" />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
             <div className="w-full max-w-2xl mx-auto my-4">
                <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-[500px] w-full" />
        </div>
    );
  }

  const techniciansForTeam = users.filter(
    (u) => u.role === 'technician' && u.teamId === request.teamId
  );

  const selectedEquipment = equipment.find((e) => e.id === request.equipmentId);

  const statuses: MaintenanceRequestStatus[] = [
    'New',
    'In Progress',
    'Repaired',
    'Scrap',
  ];

  const requestDateValue = request.scheduledDate
    ? new Date(request.scheduledDate).toISOString().split('T')[0]
    : '';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-headline text-muted-foreground">
            <Link href="/requests" className="hover:text-primary">
              Maintenance Requests
            </Link>
            <span className="text-primary mx-2">&gt;</span>
            <span className="text-primary">{request.subject}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" /> Worksheet
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto my-4">
        <WorkflowIndicator
          currentStatus={request.status}
          statuses={statuses}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Maintenance Request</CardTitle>
          <CardDescription>
            Update the details of this request below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={request.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="requester">Created By</Label>
                <Input
                  id="requester"
                  value={
                    users.find((u) => u.id === request.requesterId)?.name ||
                    'N/A'
                  }
                  readOnly
                  className="bg-muted/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maintenance-for">Maintenance For</Label>
                <Select
                  value={maintenanceFor}
                  onValueChange={handleMaintenanceForChange}
                >
                  <SelectTrigger id="maintenance-for">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="work_center">Work Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {maintenanceFor === 'equipment' && (
                <div className="grid gap-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Select
                    value={request.equipmentId}
                    onValueChange={handleEquipmentChange}
                  >
                    <SelectTrigger id="equipment">
                      <SelectValue placeholder="Select equipment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {maintenanceFor === 'work_center' && (
                <div className="grid gap-2">
                  <Label htmlFor="work-center">Work Center</Label>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger id="work-center">
                        <SelectValue placeholder="Select work center..." />
                      </SelectTrigger>
                      <SelectContent>
                        {workCenters.map((wc) => (
                          <SelectItem key={wc.id} value={wc.id}>
                            {wc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Navigate to Work Centers?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            To create a new Work Center, you need to navigate
                            to the Work Centers page.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => router.push('/work-centers')}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={selectedEquipment?.category || 'N/A'}
                  readOnly
                  className="bg-muted/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="request-date">Request Date</Label>
                <Input
                  id="request-date"
                  type="date"
                  value={requestDateValue}
                  onChange={(e) =>
                    handleDateChange('scheduledDate', e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Maintenance Type</Label>
                <RadioGroup
                  value={request.requestType}
                  className="flex gap-4"
                  onValueChange={(v: MaintenanceRequestType) =>
                    handleSelectChange('requestType', v)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Corrective" id="corrective" />
                    <Label htmlFor="corrective">Corrective</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Preventive" id="preventive" />
                    <Label htmlFor="preventive">Preventive</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="team">Assigned Team</Label>
                <Select
                  value={request.teamId}
                  onValueChange={(v) => {
                    handleSelectChange('teamId', v);
                    handleSelectChange('assignedTechnicianId', 'unassigned'); // Reset tech on team change
                  }}
                >
                  <SelectTrigger id="team">
                    <SelectValue placeholder="Select team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="technician">Assigned Technician</Label>
                <Select
                  value={request.assignedTechnicianId || 'unassigned'}
                  onValueChange={(v) =>
                    handleSelectChange('assignedTechnicianId', v)
                  }
                  disabled={!request.teamId}
                >
                  <SelectTrigger id="technician">
                    <SelectValue placeholder="Assign a technician..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {techniciansForTeam.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={new Date(request.dueDate).toISOString().split('T')[0]}
                  onChange={(e) => handleDateChange('dueDate', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center gap-2">
                    <StatusIndicator
                      currentStatus={request.status}
                      onChange={(newStatus) =>
                        handleSelectChange('status', newStatus)
                      }
                    />
                    <Select
                      value={request.status}
                      onValueChange={(v: MaintenanceRequestStatus) =>
                        handleSelectChange('status', v)
                      }
                    >
                      <SelectTrigger id="status" className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Repaired">Repaired</SelectItem>
                        <SelectItem value="Scrap">Scrap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={request.priority}
                    onValueChange={(v: MaintenanceRequestPriority) =>
                      handleSelectChange('priority', v)
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <Tabs defaultValue="notes" className="mt-6">
            <TabsList>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>
            <TabsContent value="notes">
              <Textarea
                id="notes"
                value={request.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any relevant notes..."
                className="mt-2"
              />
            </TabsContent>
            <TabsContent value="instructions">
              <Textarea
                id="instructions"
                placeholder="Add step-by-step instructions for the repair..."
                className="mt-2"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
