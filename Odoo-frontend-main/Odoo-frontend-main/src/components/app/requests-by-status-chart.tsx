'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { MaintenanceRequest, MaintenanceRequestStatus } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { getRequests } from '@/lib/api/requests';

const chartConfig = {
  count: {
    label: 'Count',
  },
  NEW: {
    label: 'New',
    color: 'hsl(var(--chart-1))',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'hsl(var(--chart-2))',
  },
  REPAIRED: {
    label: 'Repaired',
    color: 'hsl(var(--chart-3))',
  },
  SCRAP: {
    label: 'Scrap',
    color: 'hsl(var(--chart-4))',
  },
};

export default function RequestsByStatusChart() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const maintenanceRequests: MaintenanceRequest[] = await getRequests();

        const statusData = maintenanceRequests.reduce((acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {} as Record<MaintenanceRequestStatus, number>);

        const data = Object.entries(statusData).map(([status, count]) => ({
          status,
          count,
          fill: chartConfig[status as keyof typeof chartConfig]?.color,
        }));
        setChartData(data);
      } catch (error) {
        console.error('Failed to fetch request data for chart', error);
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
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="status" />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={60}
          strokeWidth={5}
        >
          {chartData.map((entry) => (
            <Cell
              key={`cell-${entry.status}`}
              fill={entry.fill}
            />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="status" />}
          className="-mt-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
