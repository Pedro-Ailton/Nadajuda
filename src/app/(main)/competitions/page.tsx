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
import { Clock, Plus } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { CompetitionTime } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const AddCompetitionForm = dynamic(() => import('./add-competition-form').then(mod => mod.AddCompetitionForm));

function formatTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds === null) return 'N/A';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2);
  if (minutes > 0) {
    return `${minutes}:${seconds.padStart(5, '0')}`;
  }
  return `${seconds}`;
}

export default function CompetitionsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const competitionTimesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'users', user.uid, 'competitionTimes'), 
        orderBy('date', 'desc')
    );
  }, [user, firestore]);

  const { data: competitions, isLoading: isLoadingCompetitions } = useCollection<CompetitionTime>(competitionTimesQuery);

  return (
    <>
      {isFormOpen && <AddCompetitionForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} />}

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-semibold">Competições</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Tempo
          </Button>
        </div>

        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Clock />
                Histórico de Tempos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Prova</TableHead>
                    <TableHead className="text-right">Tempo</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoadingCompetitions ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                    ) : competitions && competitions.length > 0 ? (
                    competitions.map((comp) => (
                        <TableRow key={comp.id}>
                        <TableCell>
                            {new Date(comp.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className='font-medium'>{comp.eventName}</TableCell>
                        <TableCell className="text-right font-mono">
                            {formatTime(comp.time)}
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                        Nenhum tempo registrado.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
