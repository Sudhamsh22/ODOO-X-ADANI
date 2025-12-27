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
import { Team } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import TeamsTable from './_components/teams-table';
import TeamForm from './_components/team-form';
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
import { getTeams, createTeam, updateTeam, deleteTeam } from '@/lib/api/teams';

export default function TeamsPage() {
  const { toast } = useToast();
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentTeam, setCurrentTeam] = React.useState<Team | null>(null);

  const fetchTeams = React.useCallback(async () => {
    try {
        const teamsData = await getTeams();
        setTeams(teamsData);
    } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load teams data.',
        });
    }
  }, [toast]);


  React.useEffect(() => {
    setLoading(true);
    fetchTeams().finally(() => setLoading(false));
  }, [fetchTeams]);

  const handleAddNew = () => {
    setCurrentTeam(null);
    setIsModalOpen(true);
  };

  const handleEdit = (team: Team) => {
    setCurrentTeam(team);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!currentTeam) return;
    setIsModalOpen(false); // Close the edit modal first
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentTeam) return;
    try {
      await deleteTeam(currentTeam.id);
      await fetchTeams(); // Refetch
      toast({
        title: 'Team Deleted',
        description: `"${currentTeam.name}" has been successfully deleted.`,
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || `Could not delete team "${currentTeam.name}".`,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentTeam(null);
    }
  };

  const handleSave = async (
    formData: { name: string, members: string[], company: string }
  ) => {
    
    if (!formData.name) {
        toast({
            variant: 'destructive',
            title: 'Validation Failed',
            description: 'Team Name is required.'
        });
        return;
    }

    // Assuming member IDs are numbers. The form gives us strings.
    const memberIds = formData.members.map(m => parseInt(m.trim())).filter(id => !isNaN(id));

    const teamData = {
      name: formData.name,
      members: memberIds,
      companyId: 1, // Mock company ID
    };

    const isEditing = !!currentTeam;

    try {
      if (isEditing) {
        await updateTeam(currentTeam.id, teamData);
        toast({
          title: 'Team Updated',
          description: `"${formData.name}" has been successfully updated.`,
        });
      } else {
        await createTeam(teamData);
        toast({
          title: 'Team Created',
          description: `"${formData.name}" has been successfully created.`,
        });
      }
      await fetchTeams();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error.message || `Could not save team "${formData.name}".`,
      });
    } finally {
      setIsModalOpen(false);
      setCurrentTeam(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Maintenance Teams
        </h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Teams</CardTitle>
          <CardDescription>
            Create and manage your maintenance teams.
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
            <TeamsTable
              teams={teams}
              onRowClick={handleEdit}
            />
          )}
        </CardContent>
      </Card>

      <TeamForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        onDelete={handleDelete}
        team={currentTeam}
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
              team "{currentTeam?.name}".
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
