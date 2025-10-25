import { mockCompetitions, mockUserProfile } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Zap, Clock } from 'lucide-react';
import { PerformanceChart } from './performance-chart';

function getMostFrequentEvents(competitions: typeof mockCompetitions) {
  const eventCounts = competitions.reduce((acc, comp) => {
    acc[comp.event] = (acc[comp.event] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

function getLatestBestTime(competitions: typeof mockCompetitions) {
    if (competitions.length === 0) return { time: 'N/A', event: 'No data' };
    const latestCompetition = competitions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return { time: latestCompetition.time, event: latestCompetition.event };
}


export default function DashboardPage() {
  const mostFrequentEvents = getMostFrequentEvents(mockCompetitions);
  const bestTime = getLatestBestTime(mockCompetitions);
  const totalCompetitions = mockCompetitions.length;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-semibold">
          Welcome, {mockUserProfile.name.split(' ')[0]}!
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latest Best Time
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestTime.time}</div>
            <p className="text-xs text-muted-foreground">{bestTime.event}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Competitions
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompetitions}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
         <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Frequent Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="space-y-1">
              {mostFrequentEvents.map(([event, count]) => (
                <div key={event} className="flex justify-between text-sm">
                  <span className="font-medium">{event}</span>
                  <span className="text-muted-foreground">{count} times</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart competitions={mockCompetitions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
