'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { MaintenanceRequest, Team } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { getRequests } from '@/lib/api/requests';
import { getTeams } from '@/lib/api/teams';

const chartConfig = {
  requests: {
    label: 'Requests',
    color: 'hsl(var(--chart-1))',
  },
};

export default function RequestsByTeamChart() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [maintenanceRequests, teams] = await Promise.all([
          getRequests(),
          getTeams(),
        ]);

        const requestCountsByTeam = teams.map((team) => {
          const requestCount = maintenanceRequests.filter(
            (req) => req.teamId === team.id
          ).length;
          return {
            team: team.name,
            requests: requestCount,
          };
        });
        setChartData(requestCountsByTeam);
      } catch (error) {
        console.error('Failed to fetch data for chart', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="team"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="requests" fill="var(--color-requests)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
