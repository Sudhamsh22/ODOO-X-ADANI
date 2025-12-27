'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { createEquipment } from '@/lib/api/equipment';
import { Skeleton } from '@/components/ui/skeleton';
import request from '@/lib/api-client';

type NewEquipment = Partial<Omit<Equipment, 'id'>>;

type MetaData = {
    categories: EquipmentCategory[];
    teams: Team[];
    technicians: User[];
    employees: User[];
    workCenters: WorkCenter[];
}

export default function NewEquipmentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [equipment, setEquipment] = React.useState<NewEquipment>({});
  const [meta, setMeta] = React.useState<MetaData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMetaData = async () => {
      setLoading(true);
      try {
        const metaData = await request('/meta/create-equipment');
        setMeta(metaData);
      } catch (error) {
        console.error('Failed to fetch meta data for new equipment form', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load necessary data for the form.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMetaData();
  }, [toast]);

  const handleInputChange = (
    field: keyof NewEquipment,
    value: string | number
  ) => {
      setEquipment({ ...equipment, [field]: value });
  };

  const handleSave = async () => {
    if (!equipment.categoryId || !equipment.maintenanceTeamId || !equipment.name) {
        toast({
            variant: 'destructive',
            title: 'Missing Fields',
            description: 'Please fill out Name, Equipment Category, and Maintenance Team.'
        })
        return;
    }

    try {
        await createEquipment(equipment);
        toast({
          title: 'Equipment Created',
          description: `"${equipment.name}" has been successfully created.`,
        });
        router.push('/equipment');
    } catch (error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: error.message || 'Could not create the new equipment.'
        })
    }
  };

  if (loading || !meta) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-7 w-64" />
                </div>
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-24">
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
            <span className="text-primary">New Equipment</span>
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Equipment</CardTitle>
          <CardDescription>
            Fill in the details for the new piece of equipment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Section */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={equipment.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g. Dell XPS 15"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="categoryId">Equipment Category *</Label>
                <Select
                  value={equipment.categoryId?.toString()}
                  onValueChange={(v) => handleInputChange('categoryId', Number(v))}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
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
                <Label htmlFor="maintenanceTeamId">Maintenance Team *</Label>
                <Select
                  value={equipment.maintenanceTeamId?.toString()}
                  onValueChange={(v) =>
                    handleInputChange('maintenanceTeamId', Number(v))
                  }
                >
                  <SelectTrigger id="maintenanceTeamId">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.teams.map((team) => (
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
                   disabled={!equipment.maintenanceTeamId}
                >
                  <SelectTrigger id="assignedTechnicianId">
                    <SelectValue placeholder="Select a technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.technicians
                      .filter(
                        (u) =>
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
                      {meta.employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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
                    {meta.workCenters.map((wc) => (
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
      
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 p-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl justify-end">
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
            </Button>
        </div>
      </div>
    </div>
  );
}
