
"use client";

import * as React from 'react';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MaintenanceRequest, Team } from '@/lib/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

function getTeamColor(teamId: string, teams: Team[]) {
    const teamIndex = teams.findIndex(t => t.id === teamId);
    const colors = ['bg-blue-500/70', 'bg-green-500/70', 'bg-yellow-500/70', 'bg-purple-500/70', 'bg-pink-500/70'];
    return colors[teamIndex % colors.length];
}

export function MaintenanceCalendar({ requests, teams }: { requests: MaintenanceRequest[], teams: Team[] }) {
  let today = startOfToday();
  let [selectedDay, setSelectedDay] = React.useState(today);
  let [currentMonth, setCurrentMonth] = React.useState(format(today, 'MMM-yyyy'));
  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  let days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  function previousMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentMonth(format(date, 'MMM-yyyy'));
      setSelectedDay(date);
    }
  };

  let colStartClasses = [
    '',
    'col-start-2',
    'col-start-3',
    'col-start-4',
    'col-start-5',
    'col-start-6',
    'col-start-7',
  ];

  return (
    <div className="p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
         <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className="w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(firstDayCurrentMonth, 'MMMM yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={firstDayCurrentMonth}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className='flex items-center'>
            <Button onClick={previousMonth} variant="ghost" size="icon">
            <span className="sr-only">Previous month</span>
            <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button onClick={nextMonth} variant="ghost" size="icon">
            <span className="sr-only">Next month</span>
            <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 mt-4 text-xs leading-6 text-center text-muted-foreground">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>
      <div className="grid grid-cols-7 mt-2 text-sm">
        {days.map((day, dayIdx) => (
          <div
            key={day.toString()}
            className={cn(
              dayIdx === 0 && colStartClasses[getDay(day)],
              'py-1.5'
            )}
          >
            <button
              type="button"
              onClick={() => setSelectedDay(day)}
              className={cn(
                isEqual(day, selectedDay) && 'text-white',
                !isEqual(day, selectedDay) && isToday(day) && 'text-primary',
                !isEqual(day, selectedDay) &&
                  !isSameMonth(day, firstDayCurrentMonth) &&
                  'text-muted-foreground',
                isEqual(day, selectedDay) && isToday(day) && 'bg-primary',
                isEqual(day, selectedDay) && !isToday(day) && 'bg-accent',
                !isEqual(day, selectedDay) && 'hover:bg-accent/50',
                (isEqual(day, selectedDay) || isToday(day)) &&
                  'font-semibold',
                'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
              )}
            >
              <time dateTime={format(day, 'yyyy-MM-dd')}>
                {format(day, 'd')}
              </time>
            </button>
             <div className="w-full text-center">
               {requests.filter(req => req.scheduledDate && isSameDay(parseISO(req.scheduledDate), day)).map(req => (
                 <div key={req.id} className={cn("text-xs p-1 rounded-md mt-1 truncate text-white", getTeamColor(req.teamId, teams))}>
                    {req.subject}
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
