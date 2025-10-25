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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const competitionSchema = z.object({
  eventName: z.string().min(1, 'O nome da prova é obrigatório.'),
  time: z.coerce.number().positive('O tempo deve ser um número positivo.'),
  date: z.date({ required_error: 'A data da competição é obrigatória.' }),
  distance: z.coerce.number().positive('A distância deve ser um número positivo.'),
  stroke: z.string().min(1, 'O estilo é obrigatório.'),
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

const provas = [
    { value: '50-Livre', label: '50m Livre', distance: 50, stroke: 'Livre' },
    { value: '100-Livre', label: '100m Livre', distance: 100, stroke: 'Livre' },
    { value: '200-Livre', label: '200m Livre', distance: 200, stroke: 'Livre' },
    { value: '400-Livre', label: '400m Livre', distance: 400, stroke: 'Livre' },
    { value: '50-Costas', label: '50m Costas', distance: 50, stroke: 'Costas' },
    { value: '100-Costas', label: '100m Costas', distance: 100, stroke: 'Costas' },
    { value: '200-Costas', label: '200m Costas', distance: 200, stroke: 'Costas' },
    { value: '50-Peito', label: '50m Peito', distance: 50, stroke: 'Peito' },
    { value: '100-Peito', label: '100m Peito', distance: 100, stroke: 'Peito' },
    { value: '200-Peito', label: '200m Peito', distance: 200, stroke: 'Peito' },
    { value: '50-Borboleta', label: '50m Borboleta', distance: 50, stroke: 'Borboleta' },
    { value: '100-Borboleta', label: '100m Borboleta', distance: 100, stroke: 'Borboleta' },
    { value: '200-Borboleta', label: '200m Borboleta', distance: 200, stroke: 'Borboleta' },
    { value: '200-Medley', label: '200m Medley', distance: 200, stroke: 'Medley' },
    { value: '400-Medley', label: '400m Medley', distance: 400, stroke: 'Medley' },
];

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
    reset,
    setValue,
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
              <Label>Prova</Label>
              <Controller
                name="eventName"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={(value) => {
                        const prova = provas.find(p => p.value === value);
                        if (prova) {
                            setValue('eventName', prova.label);
                            setValue('distance', prova.distance);
                            setValue('stroke', prova.stroke);
                        }
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione a prova" />
                        </SelectTrigger>
                        <SelectContent>
                            {provas.map((prova) => (
                                <SelectItem key={prova.value} value={prova.value}>
                                    {prova.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                />
              {errors.eventName && (
                <p className="text-sm text-destructive">{errors.eventName.message}</p>
              )}
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
