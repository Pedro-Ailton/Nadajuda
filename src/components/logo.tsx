import { Swimmer } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-sidebar-accent rounded-lg p-2">
        <Swimmer className="text-sidebar-accent-foreground" />
      </div>
      <h1 className="text-2xl font-headline font-bold text-sidebar-foreground">
        SwimWise
      </h1>
    </div>
  );
}
