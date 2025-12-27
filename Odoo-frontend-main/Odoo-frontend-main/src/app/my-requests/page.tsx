'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  MaintenanceRequest,
  Equipment,
  Team,
  User,
} from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { createRequest, getRequests } from '@/lib/api/requests';
import { getAllEquipment } from '@/lib/api/equipment';
import { getTeams } from '@/lib/api/teams';
import { getUsers } from '@/lib/api/users';

export default function MyRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<MaintenanceRequest[]>([]);
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newRequest, setNewRequest] = React.useState<
    Partial<MaintenanceRequest>
  >({});
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [requestsData, equipmentData, teamsData, usersData] = await Promise.all([
          getRequests({requesterId: userId}),
          getAllEquipment(),
          getTeams(),
          getUsers(),
        ]);

        setRequests(requestsData);
        setEquipment(equipmentData);
        setTeams(teamsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load your requests.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, toast]);


  const handleCreateRequest = async () => {
    if (!newRequest.subject || !newRequest.equipmentId) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    const selectedEquipment = equipment.find(
      (e) => e.id === newRequest.equipmentId
    );

    const requestToAdd = {
      subject: newRequest.subject,
      equipmentId: newRequest.equipmentId,
      status: 'New',
      requestType: 'Corrective',
      priority: 'Medium',
      teamId: selectedEquipment!.maintenanceTeamId,
      requesterId: userId!,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTechnicianId: '',
    } as Omit<MaintenanceRequest, 'id'>;

    try {
        const createdRequest = await createRequest(requestToAdd);
        setRequests((prev) => [createdRequest, ...prev]);
        setIsModalOpen(false);
        setNewRequest({});

        toast({
            title: 'Success',
            description: 'New maintenance request submitted.',
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'Could not submit new request.'
        })
    }
  };

  const statusColors: { [key: string]: string } = {
    New: 'bg-gray-500',
    'In Progress': 'bg-blue-500',
    Repaired: 'bg-green-500',
    Scrap: 'bg-red-500',
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          My Maintenance Requests
        </h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Request
        </Button>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>My Submitted Requests</CardTitle>
          <CardDescription>
            Here is a list of maintenance requests you have submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.subject}</TableCell>
                    <TableCell>
                      {equipment.find((e) => e.id === req.equipmentId)?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-0">
                        <span
                          className={`h-2 w-2 rounded-full mr-2 ${
                            statusColors[req.status]
                          }`}
                        ></span>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(req.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {users.find((u) => u.id === req.assignedTechnicianId)
                        ?.name || 'Unassigned'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    You have not submitted any requests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Maintenance Request</DialogTitle>
            <DialogDescription>
              Describe the issue and select the affected equipment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equipment" className="text-right">
                Equipment
              </Label>
              <Select
                value={newRequest.equipmentId}
                onValueChange={(value) => {
                  const selectedEquipment = equipment.find(
                    (e) => e.id === value
                  );
                  if (selectedEquipment) {
                    setNewRequest({
                      ...newRequest,
                      equipmentId: value,
                    });
                  }
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} ({e.location})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Problem
              </Label>
              <Textarea
                id="subject"
                value={newRequest.subject || ''}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, subject: e.target.value })
                }
                className="col-span-3"
                placeholder="e.g., 'Leaking oil' or 'Printer not responding'"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team" className="text-right">
                Team
              </Label>
              <Input
                id="team"
                readOnly
                value={
                  newRequest.equipmentId
                    ? teams.find(
                        (t) =>
                          t.id ===
                          equipment.find(
                            (e) => e.id === newRequest.equipmentId
                          )?.maintenanceTeamId
                      )?.name
                    : 'Auto-assigned'
                }
                className="col-span-3 bg-muted/50"
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
