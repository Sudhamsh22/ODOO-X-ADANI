'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlusCircle, ListFilter } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import {
  MaintenanceRequest,
  MaintenanceRequestStatus,
  MaintenanceRequestPriority,
  Team,
  User,
  Equipment,
} from '@/lib/types';
import RequestCard from './_components/request-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getRequests, createRequest, updateRequestStatus } from '@/lib/api/requests';
import { getTeams } from '@/lib/api/teams';
import { getUsers } from '@/lib/api/users';
import { getAllEquipment } from '@/lib/api/equipment';

const statusColumns: MaintenanceRequestStatus[] = [
  'NEW',
  'IN_PROGRESS',
  'REPAIRED',
  'SCRAP',
];

const statusDisplayMap: Record<MaintenanceRequestStatus, string> = {
    NEW: 'New',
    IN_PROGRESS: 'In Progress',
    REPAIRED: 'Repaired',
    SCRAP: 'Scrap'
}

// This wrapper ensures DndContext only renders on the client.
function ClientOnlyDndContext({
  children,
  ...props
}: React.ComponentProps<typeof DndContext> & { children: React.ReactNode }) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return <DndContext {...props}>{children}</DndContext>;
}

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [requests, setRequests] = React.useState<MaintenanceRequest[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newRequest, setNewRequest] = React.useState<
    Partial<MaintenanceRequest>
  >({
    status: 'NEW',
    requestType: 'CORRECTIVE',
    priority: 'MEDIUM',
  });

  const equipmentIdParam = searchParams.get('equipmentId');
  const createParam = searchParams.get('create');

  React.useEffect(() => {
    if(createParam) {
      setIsModalOpen(true);
      // Remove the query param from the URL
      router.replace('/requests');
    }
  }, [createParam, router]);


  const [teamFilter, setTeamFilter] = React.useState<number[]>([]);
  const [technicianFilter, setTechnicianFilter] = React.useState<number[]>([]);
  const [requestTypeFilter, setRequestTypeFilter] = React.useState<string[]>(
    []
  );

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [requestsData, teamsData, usersData, equipmentData] =
          await Promise.all([
            getRequests(),
            getTeams(),
            getUsers(),
            getAllEquipment(),
          ]);

        setRequests(requestsData);
        setTeams(teamsData);
        setUsers(usersData);
        setEquipment(equipmentData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load data from the server.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredRequests = React.useMemo(() => {
    let result = requests;
    if (equipmentIdParam) {
      result = result.filter((r) => r.equipmentId === Number(equipmentIdParam));
    }
    if (teamFilter.length > 0) {
      result = result.filter((r) => teamFilter.includes(r.teamId));
    }
    if (technicianFilter.length > 0) {
      result = result.filter((r) =>
        r.assignedTechnicianId && technicianFilter.includes(r.assignedTechnicianId)
      );
    }
    if (requestTypeFilter.length > 0) {
      result = result.filter((r) => requestTypeFilter.includes(r.requestType));
    }
    return result;
  }, [
    requests,
    equipmentIdParam,
    teamFilter,
    technicianFilter,
    requestTypeFilter,
  ]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = Number(active.id);
    const overContainer = over.data.current?.sortable?.containerId || over.id;
    const activeContainer = active.data.current?.sortable.containerId;

    if (activeContainer !== overContainer) {
      const newStatus = overContainer as MaintenanceRequestStatus;
      const originalRequest = requests.find(r => r.id === activeId);
      if (!originalRequest) return;

      // Optimistic UI update
      setRequests((prev) =>
        prev.map((r) => (r.id === activeId ? { ...r, status: newStatus } : r))
      );

      try {
        await updateRequestStatus(activeId, newStatus);
        toast({
          title: 'Status Updated',
          description: `Request moved to ${statusDisplayMap[newStatus]}.`,
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update request status.',
        });
        // Revert UI change
        setRequests((prev) =>
          prev.map((r) =>
            r.id === activeId ? originalRequest : r
          )
        );
      }
    } else {
        // Reordering within the same column
        const activeIndex = filteredRequests.findIndex((r) => r.id === active.id);
        const overIndex = filteredRequests.findIndex((r) => r.id === over.id);
        if (activeIndex !== overIndex) {
            setRequests((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }
  };

  const handleCreateRequest = async () => {
    if (
      !newRequest.subject ||
      !newRequest.equipmentId ||
      !newRequest.dueDate ||
      !newRequest.teamId
    ) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    try {
      const requestToCreate = {
        ...newRequest,
        requesterId: Number(localStorage.getItem('userId')), // Mock user until auth is complete
      } as Omit<MaintenanceRequest, 'id'>;

      const createdRequest = await createRequest(requestToCreate);
      setRequests((prev) => [createdRequest, ...prev]);
      setIsModalOpen(false);
      setNewRequest({
        status: 'NEW',
        requestType: 'CORRECTIVE',
        priority: 'MEDIUM',
      });

      toast({
        title: 'Success',
        description: 'New maintenance request created.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'Could not create the new request.',
      });
    }
  };

  const techniciansForFilter = users.filter((u) => u.role === 'technician');
  
  if (loading) {
    return (
        <div className="flex flex-col gap-8 h-full">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-64" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                {statusColumns.map(status => (
                    <div key={status} className="flex flex-col gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Maintenance Requests
          </h1>
          {equipmentIdParam && (
            <p className="text-muted-foreground">
              Showing requests for:{' '}
              {equipment.find((e) => e.id === Number(equipmentIdParam))?.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Filter requests by team, technician, or type.
                  </p>
                </div>
                <div className="grid gap-2">
                  <h5 className="text-sm font-medium">Team</h5>
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`team-${team.id}`}
                        checked={teamFilter.includes(team.id)}
                        onCheckedChange={(checked) => {
                          setTeamFilter((prev) =>
                            checked
                              ? [...prev, team.id]
                              : prev.filter((t) => t !== team.id)
                          );
                        }}
                      />
                      <Label htmlFor={`team-${team.id}`}>{team.name}</Label>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2">
                  <h5 className="text-sm font-medium">Technician</h5>
                  {techniciansForFilter.map((tech) => (
                    <div key={tech.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tech-${tech.id}`}
                        checked={technicianFilter.includes(tech.id)}
                        onCheckedChange={(checked) => {
                          setTechnicianFilter((prev) =>
                            checked
                              ? [...prev, tech.id]
                              : prev.filter((t) => t !== tech.id)
                          );
                        }}
                      />
                      <Label htmlFor={`tech-${tech.id}`}>{tech.name}</Label>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2">
                  <h5 className="text-sm font-medium">Request Type</h5>
                  {['CORRECTIVE', 'PREVENTIVE'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={requestTypeFilter.includes(type)}
                        onCheckedChange={(checked) => {
                          setRequestTypeFilter((prev) =>
                            checked
                              ? [...prev, type]
                              : prev.filter((t) => t !== type)
                          );
                        }}
                      />
                      <Label htmlFor={`type-${type}`}>{type.charAt(0) + type.slice(1).toLowerCase()}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Request
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        <ClientOnlyDndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          {statusColumns.map((status) => (
            <Card key={status} className="flex flex-col h-full bg-card/50">
              <CardHeader>
                <CardTitle>{statusDisplayMap[status]}</CardTitle>
                <CardDescription>
                  {
                    filteredRequests.filter((r) => r.status === status).length
                  }{' '}
                  requests
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 flex-1 overflow-y-auto">
                <SortableContext
                  items={filteredRequests
                    .filter((r) => r.status === status)
                    .map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                  id={status}
                >
                  {filteredRequests
                    .filter((r) => r.status === status)
                    .map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        user={users.find(
                          (u) => u.id === request.assignedTechnicianId
                        )}
                        equipment={equipment.find(
                          (e) => e.id === request.equipmentId
                        )}
                      />
                    ))}
                </SortableContext>
              </CardContent>
            </Card>
          ))}
        </ClientOnlyDndContext>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Maintenance Request</DialogTitle>
            <DialogDescription>
              Fill in the details for the new maintenance request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                value={newRequest.subject || ''}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, subject: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equipment" className="text-right">
                Equipment
              </Label>
              <Select
                value={newRequest.equipmentId?.toString()}
                onValueChange={(value) => {
                  const selectedEquipment = equipment.find(
                    (e) => e.id === Number(value)
                  );
                  if (selectedEquipment) {
                    setNewRequest({
                      ...newRequest,
                      equipmentId: Number(value),
                      teamId: selectedEquipment.maintenanceTeamId,
                    });
                  }
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="request-type" className="text-right">
                Type
              </Label>
              <Select
                value={newRequest.requestType}
                onValueChange={(value: 'CORRECTIVE' | 'PREVENTIVE') =>
                  setNewRequest({ ...newRequest, requestType: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                  <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={newRequest.priority}
                onValueChange={(value: MaintenanceRequestPriority) =>
                  setNewRequest({ ...newRequest, priority: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due-date" className="text-right">
                {newRequest.requestType === 'PREVENTIVE'
                  ? 'Scheduled Date'
                  : 'Due Date'}
              </Label>
              <Input
                id="due-date"
                type="date"
                value={
                  newRequest.dueDate ? newRequest.dueDate.split('T')[0] : ''
                }
                onChange={(e) =>
                  setNewRequest({ ...newRequest, dueDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team" className="text-right">
                Team
              </Label>
              <Select
                value={newRequest.teamId?.toString()}
                onValueChange={(value) =>
                  setNewRequest({
                    ...newRequest,
                    teamId: Number(value),
                    assignedTechnicianId: undefined,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="technician" className="text-right">
                Technician
              </Label>
              <Select
                value={newRequest.assignedTechnicianId?.toString()}
                onValueChange={(value) =>
                  setNewRequest({ ...newRequest, assignedTechnicianId: Number(value) })
                }
                disabled={!newRequest.teamId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(
                      (u) =>
                        u.teamId === newRequest.teamId &&
                        u.role === 'technician'
                    )
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={newRequest.notes || ''}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, notes: e.target.value })
                }
                className="col-span-3"
                placeholder="Add any relevant notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
