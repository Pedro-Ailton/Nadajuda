import { LifeBuoy } from 'lucide-react';

export function Logo() {
  return (
    <h1 className="flex items-center gap-3 text-2xl font-headline font-bold text-foreground">
      <div className="bg-primary rounded-full p-2">
        <LifeBuoy className="text-primary-foreground" />
      </div>
      <span>
        NadAjuda
      </span>
    </h1>
  );
}
