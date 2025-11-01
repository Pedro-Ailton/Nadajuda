'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Zap, Clock } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { CompetitionTime } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function getMostFrequentEvents(competitions: CompetitionTime[]) {
  if (!competitions || competitions.length === 0) return [];
  const eventCounts = competitions.reduce((acc, comp) => {
    acc[comp.eventName] = (acc[comp.eventName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

function getLatestBestTime(competitions: CompetitionTime[]) {
    if (!competitions || competitions.length === 0) return { time: 'N/A', eventName: 'Sem dados' };
    const latestCompetition = competitions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const minutes = Math.floor(latestCompetition.time / 60);
    const seconds = (latestCompetition.time % 60).toFixed(2);
    const formattedTime = minutes > 0 ? `${minutes}:${seconds.padStart(5, '0')}s` : `${seconds}s`;

    return { time: formattedTime, eventName: latestCompetition.eventName };
}


export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const competitionTimesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'competitionTimes'));
  }, [user, firestore]);

  const { data: competitions, isLoading } = useCollection<CompetitionTime>(competitionTimesQuery);

  const mostFrequentEvents = getMostFrequentEvents(competitions || []);
  const bestTime = getLatestBestTime(competitions || []);
  const totalCompetitions = competitions?.length || 0;

  const userName = user?.displayName?.split(' ')[0] || 'Nadador(a)';

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-semibold">
          Bem-vindo(a), {userName}!
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Melhor Tempo Recente
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestTime.time}</div>
            <p className="text-xs text-muted-foreground">{bestTime.eventName}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Competições
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompetitions}</div>
            <p className="text-xs text-muted-foreground">
              Em todas as provas
            </p>
          </CardContent>
        </Card>
         <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provas Mais Frequentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="space-y-1">
              {mostFrequentEvents.length > 0 ? mostFrequentEvents.map(([event, count]) => (
                <div key={event} className="flex justify-between text-sm">
                  <span className="font-medium">{event}</span>
                  <span className="text-muted-foreground">{count} vezes</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Nenhuma prova registrada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Análise de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='min-h-[300px] w-full flex items-center justify-center'>
                 <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
               <div className='min-h-[300px] w-full flex items-center justify-center text-center text-muted-foreground'>
                  <p>A funcionalidade de gráfico de performance está temporariamente indisponível. <br /> Registre novos tempos e volte em breve!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
