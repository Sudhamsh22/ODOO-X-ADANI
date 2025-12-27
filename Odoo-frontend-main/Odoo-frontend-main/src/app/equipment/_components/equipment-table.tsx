'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  PlusCircle,
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
import { Equipment, User } from '@/lib/types';

type EquipmentTableProps = {
  equipment: Equipment[];
  users: User[];
};

export default function EquipmentTable({
  equipment: allEquipment,
  users,
}: EquipmentTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');

  const getEmployeeName = (employeeId?: number) => {
    if (!employeeId) return 'N/A';
    return users.find((u) => u.id === employeeId)?.name || 'N/A';
  };
  
  const getTechnicianName = (technicianId?: number) => {
      if (!technicianId) return 'N/A';
      return users.find(u => u.id === technicianId)?.name || 'N'
  }

  const handleRowClick = (equipmentId: number) => {
    router.push(`/equipment/${equipmentId}`);
  };

  const filteredEquipment = React.useMemo(() => {
    return allEquipment.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allEquipment, searchTerm]);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Button asChild>
          <Link href="/equipment/new">
            <PlusCircle className="mr-2 h-4 w-4" /> New Equipment
          </Link>
        </Button>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
      <div className="rounded-md border bg-card/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment Name</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Equipment Category</TableHead>
              <TableHead>Company</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.length > 0 ? (
              filteredEquipment.map((item) => (
                <TableRow 
                    key={item.id} 
                    onClick={() => handleRowClick(item.id)}
                    className="cursor-pointer"
                >
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{getEmployeeName(item.assignedEmployeeId)}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell className="font-code">{item.serialNumber}</TableCell>
                  <TableCell>{getTechnicianName(item.assignedTechnicianId)}</TableCell>
                  <TableCell>
                    <Link href="/equipment-categories" className="hover:underline text-primary" onClick={(e) => e.stopPropagation()}>
                        {item.category?.name || 'N/A'}
                    </Link>
                  </TableCell>
                  <TableCell>My Company (San Francisco)</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
