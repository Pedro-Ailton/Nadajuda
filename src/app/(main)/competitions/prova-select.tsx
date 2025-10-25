'use client';

import type { Event as ProvaType } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useFormContext } from 'react-hook-form';

type ProvaSelectProps = {
  control: any;
  provas: ProvaType[];
  isLoading: boolean;
};

export function ProvaSelect({ control, provas, isLoading }: ProvaSelectProps) {
  const { setValue } = useFormContext();

  return (
    <Controller
      name="eventId"
      control={control}
      render={({ field }) => (
        <Select
          onValueChange={(value) => {
            field.onChange(value);
            const selectedProva = provas?.find(p => p.id === value);
            if (selectedProva) {
              setValue('eventName', selectedProva.name);
            }
          }}
          defaultValue={field.value}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Carregando provas..." : "Selecione uma prova..."} />
          </SelectTrigger>
          <SelectContent>
            {provas.map((prova) => (
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
