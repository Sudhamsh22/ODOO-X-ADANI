
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  LayoutDashboard,
  Wrench,
  Users,
  Calendar,
  FolderGit2,
  PanelLeft,
  LogOut,
  LineChart,
  Building,
  Shapes,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { NavItem, UserRole } from '@/lib/types';

const allNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredRoles: ['admin', 'manager', 'technician'] },
    { href: '/requests', label: 'Requests', icon: Wrench, requiredRoles: ['admin', 'manager', 'technician'] },
    { href: '/equipment', label: 'Equipment', icon: Wrench, requiredRoles: ['admin', 'manager', 'technician'] },
    { href: '/equipment-categories', label: 'Equipment Categories', icon: Shapes, requiredRoles: ['admin', 'manager', 'technician'] },
    { href: '/work-centers', label: 'Work Centers', icon: Building, requiredRoles: ['admin', 'manager', 'technician'] },
    { href: '/calendar', label: 'Maintenance Calendar', icon: Calendar, requiredRoles: ['admin', 'manager', 'technician'] },
    { href: '/teams', label: 'Teams', icon: Users, requiredRoles: ['admin', 'manager'] },
];

export default function Header() {
  const pathname = usePathname();
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole') as UserRole;
      setUserRole(role);
    }
  }, [pathname]);

  const navItems = React.useMemo(() => {
    if (!userRole) return [];
    if (userRole === 'employee') {
        return [
            { href: '/my-requests', label: 'My Requests', icon: Wrench, requiredRoles: ['employee'] },
        ]
    }
    return allNavItems.filter(item => item.requiredRoles.includes(userRole));
  }, [userRole]);

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }
  
  // Render a placeholder while determining the role on authenticated pages
  if (!userRole && pathname !== '/login' && pathname !== '/register') {
     return (
       <header className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex h-16 items-center gap-4 border border-white/10 bg-white/5 px-4 md:px-6 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 rounded-lg w-[calc(100%-2rem)] max-w-7xl">
         <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <FolderGit2 className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg">GearGuard</span>
            </Link>
          </div>
       </header>
    )
  }


  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex h-16 items-center gap-4 border border-white/10 bg-white/5 px-4 md:px-6 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 rounded-lg w-[calc(100%-2rem)] max-w-7xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FolderGit2 className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg">GearGuard</span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-4 ml-6">
        {navItems.map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname.startsWith(item.href) && item.href !== '/' ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
         <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <FolderGit2 className="h-6 w-6" />
                  <span className="sr-only">GearGuard</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className={cn(
                      "hover:text-foreground",
                       pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        
        <Button asChild variant="outline" size="sm">
            <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
            </Link>
        </Button>
      </div>
    </header>
  );
}
