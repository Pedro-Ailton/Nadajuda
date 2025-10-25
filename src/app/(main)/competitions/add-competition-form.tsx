'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const competitionSchema = z.object({
  eventName: z.string().min(1, 'O nome da prova é obrigatório.'),
  time: z.coerce.number().positive('O tempo deve ser um número positivo.'),
  date: z.date({ required_error: 'A data da competição é obrigatória.' }),
  distance: z.coerce.number().positive('A distância deve ser um número positivo.'),
  stroke: z.string().min(1, 'O estilo é obrigatório.'),
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

type AddCompetitionFormProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function AddCompetitionForm({ isOpen, onOpenChange }: AddCompetitionFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
        eventName: '',
        time: undefined,
        date: undefined,
        distance: undefined,
        stroke: '',
    }
  });

  useEffect(() => {
    if (!isOpen) {
        reset();
    }
  }, [isOpen, reset]);


  const onSubmit = (data: CompetitionFormData) => {
    if (!user || !firestore) return;

    const competitionTimesCollection = collection(
      firestore,
      'users',
      user.uid,
      'competitionTimes'
    );
    
    // We can still create a unique eventId for potential grouping later
    const eventId = `${data.stroke.toLowerCase()}-${data.distance}`;

    const submissionData = {
        eventId: eventId,
        eventName: data.eventName,
        time: data.time,
        date: data.date.toISOString(),
        distance: data.distance,
        stroke: data.stroke,
        userProfileId: user.uid,
    };

    addDocumentNonBlocking(competitionTimesCollection, submissionData);

    toast({
      title: 'Sucesso!',
      description: `Tempo para ${data.eventName} foi registrado.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Novo Tempo de Competição</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Nome da Prova</Label>
              <Input
                id="eventName"
                placeholder="Ex: 100m Livre, Torneio Regional"
                {...register('eventName')}
              />
              {errors.eventName && (
                <p className="text-sm text-destructive">{errors.eventName.message}</p>
              )}
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="distance">Distância (metros)</Label>
                    <Input
                        id="distance"
                        type="number"
                        placeholder="Ex: 100"
                        {...register('distance')}
                    />
                    {errors.distance && (
                        <p className="text-sm text-destructive">{errors.distance.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stroke">Estilo</Label>
                    <Input
                        id="stroke"
                        placeholder="Ex: Livre"
                        {...register('stroke')}
                    />
                    {errors.stroke && (
                        <p className="text-sm text-destructive">{errors.stroke.message}</p>
                    )}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Tempo (em segundos)</Label>
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <Input
                    id="time"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 58.43"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />
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
