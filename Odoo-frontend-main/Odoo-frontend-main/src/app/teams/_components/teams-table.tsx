'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Team } from '@/lib/types';

type TeamsTableProps = {
  teams: Team[];
  onRowClick: (team: Team) => void;
};

export default function TeamsTable({ teams, onRowClick }: TeamsTableProps) {
  return (
    <div className="rounded-md border bg-card/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Total Members</TableHead>
            <TableHead>Team Member IDs</TableHead>
            <TableHead>Company</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id} onClick={() => onRowClick(team)} className="cursor-pointer">
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell>{team.totalMembers}</TableCell>
              <TableCell>{team.members.join(', ')}</TableCell>
              <TableCell>My Company</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
