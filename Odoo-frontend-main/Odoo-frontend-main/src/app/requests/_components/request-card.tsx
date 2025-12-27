"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MaintenanceRequest, User, Equipment, MaintenanceRequestPriority } from '@/lib/types';
import { useRouter } from 'next/navigation';

type RequestCardProps = {
  request: MaintenanceRequest;
  user?: User;
  equipment?: Equipment;
};

export default function RequestCard({ request, user, equipment }: RequestCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: request.id });
  const router = useRouter();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors: { [key in MaintenanceRequestPriority]: string } = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
  };
  
  const isOverdue = new Date(request.dueDate) < new Date() && request.status !== 'REPAIRED' && request.status !== 'SCRAP';

  const handleClick = () => {
    router.push(`/requests/${request.id}`);
  }

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="touch-none bg-card/50 hover:bg-card/80 transition-colors duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div {...attributes} {...listeners} className="p-4 cursor-grab active:cursor-grabbing">
        <CardHeader className="p-0 pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base leading-tight pr-2">{request.subject}</CardTitle>
            <Badge
              className={`flex-shrink-0 text-white ${priorityColors[request.priority]}`}
            >
              {request.priority}
            </Badge>
          </div>
          <CardDescription>{equipment?.name || 'Unknown Equipment'}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            {user && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">{user.name}</span>
              </div>
            )}
            <Badge variant={isOverdue ? 'destructive' : 'outline'}>
              Due: {new Date(request.dueDate).toLocaleDateString()}
            </Badge>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
