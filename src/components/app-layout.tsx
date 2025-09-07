'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BookOpenText,
  Carrot,
  ClipboardList,
  BrainCircuit,
  Database,
  Cookie,
} from 'lucide-react';
import { Button } from './ui/button';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ingredients', label: 'Ingredientes', icon: Carrot },
  { href: '/recipes', label: 'Recetas', icon: BookOpenText },
  { href: '/sales', label: 'Ventas', icon: ClipboardList },
  { href: '/stock-prediction', label: 'Predicción de Stock', icon: BrainCircuit },
  { href: '/data-management', label: 'Datos', icon: Database },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="shrink-0" asChild>
                <Link href="/dashboard"><Cookie className="size-5 text-primary" /></Link>
             </Button>
            <h2 className="text-lg font-semibold font-headline text-primary-foreground group-data-[collapsible=icon]:hidden">
              Panadería Inteligente
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-4 md:p-6">
        <header className="flex items-center gap-4 mb-6 md:hidden">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
                 <Cookie className="size-6 text-primary" />
                <h1 className="text-xl font-bold font-headline">Panadería Inteligente</h1>
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
