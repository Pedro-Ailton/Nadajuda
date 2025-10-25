'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Flame } from 'lucide-react';
import { WorkoutSuggestions } from './workout-suggestions';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Workout } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AddWorkoutForm } from './add-workout-form';

export default function WorkoutsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const workoutsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'workouts'), orderBy('date', 'desc'));
  }, [user, firestore]);

  const { data: workouts, isLoading } = useCollection<Workout>(workoutsQuery);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Treinos</h1>
        <AddWorkoutForm />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame />
                Registro de Treinos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : workouts && workouts.length > 0 ? (
                    workouts.map((workout) => (
                      <TableRow key={workout.id}>
                         <TableCell>
                          {new Date(workout.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {workout.name}
                        </TableCell>
                        <TableCell>
                          {workout.description}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        Nenhum treino registrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <WorkoutSuggestions />
        </div>
      </div>
    </div>
  );
}
