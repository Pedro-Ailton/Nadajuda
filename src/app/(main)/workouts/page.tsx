import { mockWorkouts } from '@/lib/mock-data';
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

export default function WorkoutsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-semibold">Workouts</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame />
                Workout Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workout</TableHead>
                    <TableHead>Estimated Time</TableHead>
                    <TableHead>Actual Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWorkouts.map((workout) => (
                    <TableRow key={workout.id}>
                      <TableCell className="font-medium">
                        {workout.description}
                      </TableCell>
                      <TableCell>{workout.estimatedTime}</TableCell>
                      <TableCell>{workout.actualTime}</TableCell>
                    </TableRow>
                  ))}
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
