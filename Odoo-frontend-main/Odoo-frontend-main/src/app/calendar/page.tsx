'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MaintenanceCalendar } from '@/components/app/maintenance-calendar';
import { MaintenanceRequest, Team } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getRequests } from '@/lib/api/requests';
import { getTeams } from '@/lib/api/teams';

export default function CalendarPage() {
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<MaintenanceRequest[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [requestsData, teamsData] = await Promise.all([
          getRequests(),
          getTeams(),
        ]);
        setRequests(requestsData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to fetch calendar data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load calendar data.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const preventiveRequests = requests.filter(
    (req) => req.requestType === 'Preventive'
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline">
        Maintenance Calendar
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Preventive Maintenance Schedule</CardTitle>
          <CardDescription>
            Monthly view of all scheduled preventive maintenance tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[600px] w-full" />
          ) : (
            <MaintenanceCalendar
              requests={preventiveRequests as MaintenanceRequest[]}
              teams={teams as Team[]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
