
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Event as ProvaType } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from 'react-hook-form';

type ProvaSelectProps = {
  control: any;
};

export function ProvaSelect({ control }: ProvaSelectProps) {
  const firestore = useFirestore();

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'events'));
  }, [firestore]);

  const { data: provas, isLoading: isLoadingProvas } = useCollection<ProvaType>(eventsQuery);

  return (
    <Controller
      name="eventId"
      control={control}
      render={({ field }) => (
        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingProvas}>
          <SelectTrigger>
            <SelectValue placeholder={isLoadingProvas ? "Carregando provas..." : "Selecione uma prova..."} />
          </SelectTrigger>
          <SelectContent>
            {provas?.map((prova) => (
              <SelectItem key={prova.id} value={prova.id}>
                {prova.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
