import { LifeBuoy } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary rounded-full p-2">
        <LifeBuoy className="text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-headline font-bold text-foreground">
        NadAjuda
      </h1>
    </div>
  );
}
