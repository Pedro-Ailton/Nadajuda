'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, addDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Event as ProvaType } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const competitionSchema = z.object({
  eventId: z.string({ required_error: 'Selecione uma prova.' }),
  time: z.coerce.number().positive('O tempo deve ser um número positivo.'),
  date: z.date({ required_error: 'A data da competição é obrigatória.' }),
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

export function AddCompetitionForm() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'events'));
  }, [firestore]);

  const { data: provas, isLoading: isLoadingProvas } = useCollection<ProvaType>(eventsQuery);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
  });

  const onSubmit = (data: CompetitionFormData) => {
    if (!user || !firestore || !provas) return;

    const competitionTimesCollection = collection(
      firestore,
      'users',
      user.uid,
      'competitionTimes'
    );
    
    const selectedProva = provas.find(p => p.id === data.eventId);

    if (!selectedProva) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Prova selecionada não encontrada.',
        });
        return;
    }
    
    const submissionData = {
        ...data,
        eventName: selectedProva.name,
        date: data.date.toISOString(),
        userProfileId: user.uid,
    };

    addDocumentNonBlocking(competitionTimesCollection, submissionData);

    toast({
      title: 'Sucesso!',
      description: 'Sua competição foi registrada.',
    });

    reset({ eventId: undefined, time: undefined, date: undefined });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Registrar Competição
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Nova Competição</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Prova</Label>
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
             {errors.eventId && (
              <p className="text-sm text-destructive">{errors.eventId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Tempo (em segundos)</Label>
            <Input id="time" type="number" step="0.01" {...register('time')} placeholder="Ex: 58.43" />
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time.message}</p>
            )}
          </div>
           <div className="space-y-2">
            <Label htmlFor="date">Data da Competição</Label>
             <Controller
                name="date"
                control={control}
                render={({ field }) => (
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
                )}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
