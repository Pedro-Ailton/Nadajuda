'use client';

import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  foregroundClass?: string;
}

const SwimmerIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      {...props}
    >
      <circle cx="12" cy="5" r="1" />
      <path d="m9 11 1.9 1.9" />
      <path d="M10.1 17.9 6 22" />
      <path d="m15.2 16.2-4.5-4.5" />
      <path d="m18 11-2.2 2.2" />
      <path d="m14.2 19.8 3.8-3.8" />
    </svg>
  );

export function Logo({ className, foregroundClass }: LogoProps) {
  return (
    <h1 className={cn("flex items-center gap-3 text-2xl font-headline font-bold text-foreground", className)}>
      <div className="bg-accent rounded-full p-2">
        <SwimmerIcon className="text-accent-foreground" />
      </div>
      <span className={cn(foregroundClass)}>
        NadAjuda
      </span>
    </h1>
  );
}
