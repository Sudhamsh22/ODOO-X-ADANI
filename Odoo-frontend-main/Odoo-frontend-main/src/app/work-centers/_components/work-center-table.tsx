
'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Search,
  Trash2,
  Pencil,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkCenter } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

type WorkCenterTableProps = {
  workCenters: WorkCenter[];
  onEdit: (workCenter: WorkCenter) => void;
  onDelete: (workCenter: WorkCenter) => void;
  onSelectRow: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  selectedRows: string[];
};

export default function WorkCenterTable({
  workCenters,
  onEdit,
  onDelete,
  onSelectRow,
  onSelectAll,
  selectedRows,
}: WorkCenterTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredWorkCenters = React.useMemo(() => {
    return workCenters.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tag && item.tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [workCenters, searchTerm]);

  const isAllSelected =
    filteredWorkCenters.length > 0 &&
    selectedRows.length === filteredWorkCenters.length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search work centers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-sm"
          />
        </div>
      </div>
      <div className="rounded-md border bg-card/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead padding="checkbox">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Work Center</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Alternative</TableHead>
              <TableHead>Cost/Hour</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>OEE Target</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkCenters.length > 0 ? (
              filteredWorkCenters.map((item) => (
                <TableRow
                  key={item.id}
                  data-state={selectedRows.includes(item.id) && 'selected'}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={() => onSelectRow(item.id)}
                      aria-label={`Select row ${item.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="font-code">{item.id}</TableCell>
                  <TableCell>{item.tag ? <Badge variant="outline">{item.tag}</Badge> : 'N/A'}</TableCell>
                  <TableCell>{item.alternativeWorkCenterIds?.join(', ') || 'N/A'}</TableCell>
                  <TableCell>${item.costPerHour?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{item.capacity ? `${item.capacity}%` : 'N/A'}</TableCell>
                  <TableCell>{item.oeeTarget ? `${item.oeeTarget}%` : 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => onDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
