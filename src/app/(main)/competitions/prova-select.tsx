'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useFormContext, Controller } from 'react-hook-form';
import type { Event as ProvaType } from '@/lib/types';

type ProvaAutocompleteProps = {
  provas: ProvaType[];
  isLoading: boolean;
};

export function ProvaAutocomplete({ provas, isLoading }: ProvaAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const { control, setValue, watch } = useFormContext();

  const eventName = watch('eventName');

  return (
    <Controller
      name="eventName"
      control={control}
      render={({ field }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={isLoading}
            >
              {isLoading
                ? 'Carregando provas...'
                : field.value
                ? provas.find((prova) => prova.name === field.value)?.name
                : 'Selecione uma prova...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Pesquisar prova..." />
              <CommandList>
                <CommandEmpty>Nenhuma prova encontrada.</CommandEmpty>
                <CommandGroup>
                  {provas.map((prova) => (
                    <CommandItem
                      key={prova.id}
                      value={prova.name}
                      onSelect={(currentValue) => {
                        const selectedProva = provas.find(p => p.name.toLowerCase() === currentValue.toLowerCase());
                        if (selectedProva) {
                            setValue('eventName', selectedProva.name);
                            setValue('eventId', selectedProva.id);
                        }
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          eventName === prova.name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {prova.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    />
  );
}
