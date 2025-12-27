'use client';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import WorkCenterTable from './_components/work-center-table';
import { WorkCenter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { getWorkCenters, createWorkCenter, updateWorkCenter, deleteWorkCenter } from '@/lib/api/work-centers';

export default function WorkCentersPage() {
  const { toast } = useToast();
  const [workCenters, setWorkCenters] = React.useState<WorkCenter[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentWorkCenter, setCurrentWorkCenter] =
    React.useState<WorkCenter | null>(null);

  React.useEffect(() => {
    const fetchWorkCenters = async () => {
      setLoading(true);
      try {
        const data = await getWorkCenters();
        setWorkCenters(data);
      } catch (error) {
        console.error('Failed to fetch work centers', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load work centers.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchWorkCenters();
  }, [toast]);

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? workCenters.map((wc) => wc.id) : []);
  };

  const handleAddNew = () => {
    setCurrentWorkCenter(null);
    setIsModalOpen(true);
  };

  const handleEdit = (workCenter: WorkCenter) => {
    setCurrentWorkCenter(workCenter);
    setIsModalOpen(true);
  };

  const handleDelete = (workCenter: WorkCenter) => {
    setCurrentWorkCenter(workCenter);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentWorkCenter) return;

    try {
      await deleteWorkCenter(currentWorkCenter.id);
      setWorkCenters((prev) =>
        prev.filter((wc) => wc.id !== currentWorkCenter.id)
      );
      toast({
        title: 'Work Center Deleted',
        description: `"${currentWorkCenter.name}" has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the work center.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentWorkCenter(null);
    }
  };

  const handleSave = async (formData: Omit<WorkCenter, 'id'>) => {
    const isEditing = !!currentWorkCenter;

    try {
      if (isEditing) {
        const savedWorkCenter = await updateWorkCenter(currentWorkCenter.id, formData);
        setWorkCenters((prev) =>
          prev.map((wc) =>
            wc.id === savedWorkCenter.id ? savedWorkCenter : wc
          )
        );
        toast({
          title: 'Work Center Updated',
          description: `"${savedWorkCenter.name}" has been successfully updated.`,
        });
      } else {
        const savedWorkCenter = await createWorkCenter(formData);
        setWorkCenters((prev) => [savedWorkCenter, ...prev]);
        toast({
          title: 'Work Center Created',
          description: `"${savedWorkCenter.name}" has been successfully created.`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the work center.',
      });
    } finally {
      setIsModalOpen(false);
      setCurrentWorkCenter(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Work Center
        </h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Work Center
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Work Center Management</CardTitle>
          <CardDescription>Manage your work centers here.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
               <Skeleton className="h-10 w-1/3" />
               <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <WorkCenterTable
              workCenters={workCenters}
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <WorkCenterFormDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        workCenter={currentWorkCenter}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              work center "{currentWorkCenter?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Form Dialog Component
type WorkCenterFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<WorkCenter, 'id'>) => void;
  workCenter: WorkCenter | null;
};

function WorkCenterFormDialog({
  isOpen,
  onOpenChange,
  onSave,
  workCenter,
}: WorkCenterFormDialogProps) {
  const [formData, setFormData] = React.useState<Omit<WorkCenter, 'id'>>({
    name: '',
    description: '',
    department: '',
  });

  React.useEffect(() => {
    if (workCenter) {
      setFormData(workCenter);
    } else {
      setFormData({
        name: '',
        description: '',
        department: '',
        tag: '',
        alternativeWorkCenterIds: [],
        costPerHour: 0,
        capacity: 0,
        oeeTarget: 0,
      });
    }
  }, [workCenter, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData((prev) => ({
      ...prev,
      [id]: isNumber ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {workCenter ? 'Edit Work Center' : 'Create Work Center'}
            </DialogTitle>
            <DialogDescription>
              {workCenter
                ? 'Update the details of the work center.'
                : 'Fill in the details for the new work center.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tag" className="text-right">
                Tag
              </Label>
              <Input
                id="tag"
                value={formData.tag || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="alternativeWorkCenterIds"
                className="text-right"
              >
                Alternatives
              </Label>
              <Input
                id="alternativeWorkCenterIds"
                value={formData.alternativeWorkCenterIds?.join(',') || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    alternativeWorkCenterIds: e.target.value.split(','),
                  }))
                }
                className="col-span-3"
                placeholder="wc-2,wc-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="costPerHour" className="text-right">
                Cost/Hour
              </Label>
              <Input
                id="costPerHour"
                type="number"
                value={formData.costPerHour || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                Capacity (%)
              </Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="oeeTarget" className="text-right">
                OEE Target (%)
              </Label>
              <Input
                id="oeeTarget"
                type="number"
                value={formData.oeeTarget || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
