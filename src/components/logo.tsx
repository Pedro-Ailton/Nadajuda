'use client';

import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  foregroundClass?: string;
}

// Custom SVG component combining heart-pulse and waves
function HeartWaveIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.4 15.6a.9.9 0 0 1 .9-.9c.4 0 .8.2 1.1.5l1.6 1.1c.3.2.7.2 1 0l1.6-1.2a.9.9 0 0 1 1.1-.4c.4.1.8.4 1 .8l1.6 1.2c.3.2.7.2 1 0l1.6-1.1c.3-.3.7-.5 1.1-.5.4 0 .8.2 1.1.5.3.3.4.7.4 1.1" />
    </svg>
  );
}


export function Logo({ className, foregroundClass }: LogoProps) {
  return (
    <h1 className={cn("flex items-center gap-3 text-2xl font-headline font-bold text-foreground", className)}>
      <div className="bg-accent rounded-full p-2">
        <HeartWaveIcon className="text-accent-foreground" />
      </div>
      <span className={cn(foregroundClass)}>
        NadAjuda
      </span>
    </h1>
  );
}
