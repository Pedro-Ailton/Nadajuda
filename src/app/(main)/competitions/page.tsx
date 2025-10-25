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
import { Trophy, Clock, Plus } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import type { CompetitionTime, Event as ProvaType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AddCompetitionForm } from './add-competition-form';
import { AddEventData } from './add-event-data';
import { useState } from 'react';

function formatTime(totalSeconds: number): string {
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
  const [selectedProva, setSelectedProva] = useState<ProvaType | null>(null);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'events'), orderBy('distance'), orderBy('name'));
  }, [firestore]);

  const { data: provas, isLoading: isLoadingProvas } = useCollection<ProvaType>(eventsQuery);

  const competitionTimesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !selectedProva) return null;
    return query(
        collection(firestore, 'users', user.uid, 'competitionTimes'), 
        where('eventId', '==', selectedProva.id),
        orderBy('date', 'desc')
    );
  }, [user, firestore, selectedProva]);

  const { data: competitions, isLoading: isLoadingCompetitions } = useCollection<CompetitionTime>(competitionTimesQuery);

  return (
    <>
      <AddEventData />
      <AddCompetitionForm prova={selectedProva} onOpenChange={(isOpen) => !isOpen && setSelectedProva(null)} />

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-semibold">Competições</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy />
                        Provas Disponíveis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Prova</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingProvas ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : provas && provas.length > 0 ? (
                                provas.map((prova) => (
                                    <TableRow key={prova.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedProva(prova)}>
                                        <TableCell className="font-medium">{prova.name}</TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedProva(prova); }}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Registrar Tempo
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center h-24">
                                        Nenhuma prova encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Clock />
                    {selectedProva ? `Histórico de ${selectedProva.name}` : 'Selecione uma Prova'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Tempo (segundos)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingCompetitions ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                        ) : competitions && competitions.length > 0 ? (
                        competitions.map((comp) => (
                            <TableRow key={comp.id}>
                            <TableCell>
                                {new Date(comp.date).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {formatTime(comp.time)}
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center h-24">
                            {selectedProva ? 'Nenhum tempo registrado para esta prova.' : 'Selecione uma prova para ver o histórico.'}
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
