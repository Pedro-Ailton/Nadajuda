'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Flame, Trophy, User } from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/workouts', label: 'Treinos', icon: Flame },
  { href: '/competitions', label: 'Competições', icon: Trophy },
  { href: '/profile', label: 'Perfil', icon: User },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
