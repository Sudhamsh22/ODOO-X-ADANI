'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EquipmentCategory } from '@/lib/types';
import EquipmentCategoryTable from './_components/equipment-category-table';
import EquipmentCategoryForm from './_components/equipment-category-form';
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
import { Skeleton } from '@/components/ui/skeleton';
import { getEquipmentCategories, createEquipmentCategory, updateEquipmentCategory, deleteEquipmentCategory } from '@/lib/api/equipment-categories';

export default function EquipmentCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = React.useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentCategory, setCurrentCategory] =
    React.useState<EquipmentCategory | null>(null);

  React.useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getEquipmentCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load equipment categories.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  const handleAddNew = () => {
    setCurrentCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: EquipmentCategory) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: EquipmentCategory) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentCategory) return;

    try {
      await deleteEquipmentCategory(currentCategory.id);
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== currentCategory.id)
      );
      toast({
        title: 'Category Deleted',
        description: `"${currentCategory.name}" has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the category.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentCategory(null);
    }
  };

  const handleSave = async (formData: Omit<EquipmentCategory, 'id'>) => {
    const isEditing = !!currentCategory;

    try {
        if (isEditing) {
            const savedCategory = await updateEquipmentCategory(currentCategory.id, formData);
            setCategories((prev) =>
              prev.map((cat) =>
                cat.id === savedCategory.id ? savedCategory : cat
              )
            );
            toast({
              title: 'Category Updated',
              description: `"${savedCategory.name}" has been successfully updated.`,
            });
        } else {
            const savedCategory = await createEquipmentCategory(formData);
            setCategories((prev) => [savedCategory, ...prev]);
            toast({
              title: 'Category Created',
              description: `"${savedCategory.name}" has been successfully created.`,
            });
        }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the category.',
      });
    } finally {
      setIsModalOpen(false);
      setCurrentCategory(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Equipment Categories
        </h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> New
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>
            Create and manage your equipment categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <EquipmentCategoryTable
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <EquipmentCategoryForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        category={currentCategory}
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
              category "{currentCategory?.name}".
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
