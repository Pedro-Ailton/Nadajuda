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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { parse } from 'date-fns';

const competitionSchema = z.object({
  eventName: z.string().min(1, 'O nome da prova é obrigatório.'),
  minutes: z.coerce.number().min(0).optional().default(0),
  seconds: z.coerce.number().min(0).max(59),
  milliseconds: z.coerce.number().min(0).max(99),
  date: z.string().transform((str, ctx) => {
    const parsed = parse(str, 'dd/MM/yyyy', new Date());
    if (isNaN(parsed.getTime())) {
        ctx.addIssue({
            code: z.ZodIssueCode.invalid_date,
            message: "Data inválida. Use o formato DD/MM/AAAA.",
        });
        return z.NEVER;
    }
    return parsed;
  }),
  distance: z.coerce.number().positive('A distância deve ser um número positivo.'),
  stroke: z.string().min(1, 'O estilo é obrigatório.'),
}).refine(data => data.minutes > 0 || data.seconds > 0 || data.milliseconds > 0, {
    message: 'O tempo não pode ser zero.',
    path: ['seconds'],
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

const provas = [
    { value: '50-Livre', label: '50m Livre', distance: 50, stroke: 'Livre' },
    { value: '100-Livre', label: '100m Livre', distance: 100, stroke: 'Livre' },
    { value: '200-Livre', label: '200m Livre', distance: 200, stroke: 'Livre' },
    { value: '400-Livre', label: '400m Livre', distance: 400, stroke: 'Livre' },
    { value: '800-Livre', label: '800m Livre', distance: 800, stroke: 'Livre' },
    { value: '1500-Livre', label: '1500m Livre', distance: 1500, stroke: 'Livre' },
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
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
        date: '',
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

    const totalSeconds = (data.minutes || 0) * 60 + data.seconds + data.milliseconds / 100;

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
        time: totalSeconds,
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
                <Label>Tempo</Label>
                <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                        <Controller
                            name="minutes"
                            control={control}
                            render={({ field }) => ( <Input type="number" placeholder="0" {...field} value={field.value ?? ''} /> )}
                        />
                        <span className="text-xs text-muted-foreground">minutos</span>
                    </div>
                    <div className="space-y-1">
                        <Controller
                            name="seconds"
                            control={control}
                            render={({ field }) => ( <Input type="number" placeholder="00" {...field} value={field.value ?? ''} /> )}
                        />
                         <span className="text-xs text-muted-foreground">segundos</span>
                    </div>
                     <div className="space-y-1">
                        <Controller
                            name="milliseconds"
                            control={control}
                            render={({ field }) => ( <Input type="number" placeholder="00" {...field} value={field.value ?? ''} /> )}
                        />
                         <span className="text-xs text-muted-foreground">milissegundos</span>
                    </div>
                </div>
                 {errors.minutes && <p className="text-sm text-destructive">{errors.minutes.message}</p>}
                 {errors.seconds && <p className="text-sm text-destructive">{errors.seconds.message}</p>}
                 {errors.milliseconds && <p className="text-sm text-destructive">{errors.milliseconds.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data da Competição</Label>
              <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Input id="date" placeholder="DD/MM/AAAA" {...field} />
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
