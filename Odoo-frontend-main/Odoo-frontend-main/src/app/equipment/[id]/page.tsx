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
import { Equipment, User, Team, WorkCenter, EquipmentCategory } from '@/lib/types';
import { ArrowLeft, Save, Wrench, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getEquipmentById, updateEquipment, deleteEquipment } from '@/lib/api/equipment';
import { getUsers } from '@/lib/api/users';
import { getTeams } from '@/lib/api/teams';
import { getWorkCenters } from '@/lib/api/work-centers';
import { getEquipmentCategories } from '@/lib/api/equipment-categories';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EquipmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = Number(params.id);

  const [equipment, setEquipment] = React.useState<Equipment | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [workCenters, setWorkCenters] = React.useState<WorkCenter[]>([]);
  const [categories, setCategories] = React.useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [equipData, usersData, teamsData, wcData, catData] = await Promise.all([
          getEquipmentById(id),
          getUsers(),
          getTeams(),
          getWorkCenters(),
          getEquipmentCategories(),
        ]);

        setEquipment(equipData);
        setUsers(usersData);
        setTeams(teamsData);
        setWorkCenters(wcData);
        setCategories(catData);

      } catch (error) {
        console.error('Failed to fetch equipment details', error);
        toast({
          variant: 'destructive',
          title: 'Not Found',
          description: 'Equipment not found or failed to load data.',
        });
        router.push('/equipment');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, toast]);

  const handleInputChange = (
    field: keyof Equipment,
    value: string | number
  ) => {
    if (equipment) {
      setEquipment({ ...equipment, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!equipment) return;
    
    try {
        const { id: equipmentId, ...updateData } = equipment;
        await updateEquipment(equipmentId, updateData);
        
        toast({
          title: 'Equipment Saved',
          description: `Changes to "${equipment.name}" have been saved.`,
        });
        router.push('/equipment');

    } catch (error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: error.message || 'Could not save equipment changes.'
        })
    }
  };

  const handleDelete = async () => {
    if (!equipment) return;
    try {
      await deleteEquipment(equipment.id);
      toast({
        title: 'Equipment Deleted',
        description: `"${equipment.name}" has been deleted.`,
      });
      router.push('/equipment');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: error.message || 'Could not delete the equipment.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading || !equipment) {
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
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-headline text-muted-foreground">
            <Link href="/equipment" className="hover:text-primary">
              Equipment
            </Link>
            <span className="text-primary mx-2">&gt;</span>
            <span className="text-primary">{equipment.name}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" asChild>
            <Link href={`/requests?equipmentId=${equipment.id}`}>
              <Wrench className="mr-2 h-4 w-4" /> Maintenance
            </Link>
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Equipment</CardTitle>
          <CardDescription>
            Update the details for this piece of equipment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Section */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={equipment.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="categoryId">Equipment Category</Label>
                <Select
                  value={equipment.categoryId.toString()}
                  onValueChange={(v) => handleInputChange('categoryId', Number(v))}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={equipment.serialNumber || ''}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="maintenanceTeamId">Maintenance Team</Label>
                <Select
                  value={equipment.maintenanceTeamId.toString()}
                  onValueChange={(v) =>
                    handleInputChange('maintenanceTeamId', Number(v))
                  }
                >
                  <SelectTrigger id="maintenanceTeamId">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description"
                  className="min-h-[100px]"
                  value={equipment.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="assignedTechnicianId">Technician</Label>
                <Select
                  value={equipment.assignedTechnicianId?.toString()}
                  onValueChange={(v) =>
                    handleInputChange('assignedTechnicianId', Number(v))
                  }
                >
                  <SelectTrigger id="assignedTechnicianId">
                    <SelectValue placeholder="Select a technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(
                        (u) =>
                          u.role === 'technician' &&
                          u.teamId === equipment.maintenanceTeamId
                      )
                      .map((tech) => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>
                          {tech.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

                <div className="grid gap-2">
                  <Label htmlFor="assignedEmployeeId">Employee</Label>
                  <Select
                    value={equipment.assignedEmployeeId?.toString()}
                    onValueChange={(v) =>
                      handleInputChange('assignedEmployeeId', Number(v))
                    }
                  >
                    <SelectTrigger id="assignedEmployeeId">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.role === 'employee')
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Used in Location</Label>
                <Input
                  id="location"
                  value={equipment.location || ''}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="workCenterId">Work Center</Label>
                <Select
                  value={equipment.workCenterId?.toString()}
                  onValueChange={(v) => handleInputChange('workCenterId', Number(v))}
                >
                  <SelectTrigger id="workCenterId">
                    <SelectValue placeholder="Select a work center" />
                  </SelectTrigger>
                  <SelectContent>
                    {workCenters.map((wc) => (
                      <SelectItem key={wc.id} value={wc.id.toString()}>
                        {wc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        <div className="mt-4">
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Equipment
            </Button>
        </div>
        <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              equipment "{equipment?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
