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
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const competitionSchema = z.object({
  eventName: z.string().min(1, 'O nome do evento é obrigatório.'),
  time: z.coerce.number().positive('O tempo deve ser um número positivo.'),
  date: z.date({ required_error: 'A data da competição é obrigatória.' }),
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

export function AddCompetitionForm() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

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
    if (!user || !firestore) return;

    const competitionTimesCollection = collection(
      firestore,
      'users',
      user.uid,
      'competitionTimes'
    );

    addDocumentNonBlocking(competitionTimesCollection, {
      ...data,
      date: data.date.toISOString(),
      userProfileId: user.uid,
    });

    toast({
      title: 'Sucesso!',
      description: 'Sua competição foi registrada.',
    });

    reset({ eventName: '', time: undefined, date: undefined });
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
            <Label htmlFor="eventName">Nome do Evento</Label>
            <Input id="eventName" {...register('eventName')} placeholder="Ex: 100m Livre" />
            {errors.eventName && (
              <p className="text-sm text-destructive">{errors.eventName.message}</p>
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
