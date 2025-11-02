'use client';

import { LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  foregroundClass?: string;
}

export function Logo({ className, foregroundClass }: LogoProps) {
  return (
    <h1 className={cn("flex items-center gap-3 text-2xl font-headline font-bold text-foreground", className)}>
      <div className="bg-accent rounded-full p-2">
        <LifeBuoy className="text-accent-foreground" />
      </div>
      <span className={cn(foregroundClass)}>
        NadAjuda
      </span>
    </h1>
  );
}
