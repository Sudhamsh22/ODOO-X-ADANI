'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import EquipmentTable from './_components/equipment-table';
import { Equipment, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllEquipment } from '@/lib/api/equipment';
import { getUsers } from '@/lib/api/users';

export default function EquipmentPage() {
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // The backend GET /api/equipment is expected to nest category and other details
        const [equipmentData, usersData] = await Promise.all([
          getAllEquipment(),
          getUsers(),
        ]);
        setEquipment(equipmentData);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline">
        Equipment
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Asset Management</CardTitle>
          <CardDescription>
            Search, filter, and manage all company assets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-80" />
              </div>
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <EquipmentTable equipment={equipment} users={users} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
