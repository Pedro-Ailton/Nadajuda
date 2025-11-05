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
import { Plus } from 'lucide-react';
import { parse } from 'date-fns';

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

export function AddWorkoutForm() {
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
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
  });

  const onSubmit = (data: WorkoutFormData) => {
    if (!user || !firestore) return;

    const workoutsCollection = collection(
      firestore,
      'users',
      user.uid,
      'workouts'
    );

    addDocumentNonBlocking(workoutsCollection, {
      ...data,
      date: data.date.toISOString(),
      userProfileId: user.uid,
      // Add an initial empty workout item
      workoutItems: []
    });

    toast({
      title: 'Sucesso!',
      description: 'Seu treino foi criado. Adicione os detalhes na tabela.',
    });

    reset({ name: '', date: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Novo Treino
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Treino</DialogTitle>
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
            <Button type="submit">Criar Treino</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
