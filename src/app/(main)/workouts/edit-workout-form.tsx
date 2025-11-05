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
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';
import { format, parse } from 'date-fns';
import type { Workout } from '@/lib/types';

const workoutSchema = z.object({
  name: z.string().min(1, 'O nome do treino é obrigatório.'),
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
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

type EditWorkoutFormProps = {
    workout: Workout;
}

export function EditWorkoutForm({ workout }: EditWorkoutFormProps) {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
        name: workout.name,
        date: format(new Date(workout.date), 'dd/MM/yyyy'),
    },
  });

  const onSubmit = (data: WorkoutFormData) => {
    if (!user || !firestore) return;

    const workoutRef = doc(firestore, 'users', user.uid, 'workouts', workout.id);

    updateDocumentNonBlocking(workoutRef, {
      ...data,
      date: data.date.toISOString(),
    });

    toast({
      title: 'Sucesso!',
      description: 'O seu treino foi atualizado.',
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className='h-8 w-8 flex-shrink-0' onClick={(e) => e.stopPropagation()}>
            <Edit className="h-4 w-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Editar Treino</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Treino</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Treino de Velocidade" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
           <div className="space-y-2">
            <Label htmlFor="date">Data do Treino</Label>
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
            <Button type="submit">Guardar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
