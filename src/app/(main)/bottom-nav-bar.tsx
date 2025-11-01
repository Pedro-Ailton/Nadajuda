'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Flame, Trophy, User, Bot, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const menuItems = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/workouts', label: 'Treinos', icon: Flame },
  { href: '/ai-workouts', label: 'Treino IA', icon: Bot },
  { href: '/competitions', label: 'Competições', icon: Trophy },
  { href: '/profile', label: 'Perfil', icon: User },
];

type BottomNavBarProps = {
    onSignOut: () => void;
};

export function BottomNavBar({ onSignOut }: BottomNavBarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-around">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary',
                isActive && 'text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
