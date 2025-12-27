'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Team } from '@/lib/types';
import { Trash2, PlusCircle } from 'lucide-react';

type TeamFormData = {
  name: string;
  members: string[]; // member IDs will be stored as strings in the form state
  company: string;
};

type TeamFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: TeamFormData) => void;
  onDelete?: () => void;
  team: Team | null;
};

export default function TeamForm({ isOpen, onOpenChange, onSave, onDelete, team }: TeamFormProps) {
  const [formData, setFormData] = React.useState<TeamFormData>({ name: '', members: [''], company: '' });

  React.useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        members: team.members.length > 0 ? team.members.map(String) : [''],
        company: 'My Company (San Francisco)', // company name is not on team object
      });
    } else {
      setFormData({ name: '', members: [''], company: 'My Company (San Francisco)' });
    }
  }, [team, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = value;
    setFormData(prev => ({ ...prev, members: newMembers }));
  };
  
  const addMemberInput = () => {
    setFormData(prev => ({ ...prev, members: [...prev.members, ''] }));
  };

  const removeMemberInput = (index: number) => {
    const newMembers = formData.members.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, members: newMembers.length > 0 ? newMembers : [''] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{team ? 'Edit Team' : 'Create Team'}</DialogTitle>
            <DialogDescription>
              {team ? 'Update the details of the team.' : 'Fill in the details for the new team.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Team Name
              </Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalMembers" className="text-right">
                Total Members
              </Label>
              <Input id="totalMembers" value={formData.members.filter(Boolean).length} className="col-span-3" readOnly disabled />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
               <Label htmlFor="memberIds" className="text-right pt-2">
                Member IDs
              </Label>
              <div className="col-span-3 space-y-2">
                {formData.members.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      placeholder="User ID"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMemberInput(index)} disabled={formData.members.length === 1 && team === null}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addMemberInput} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input id="company" value={formData.company} className="col-span-3" readOnly disabled />
            </div>
          </div>
          <DialogFooter className="justify-between">
            {team && onDelete ? (
              <Button type="button" variant="destructive" onClick={onDelete} className="mr-auto">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            ) : <div />}
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
