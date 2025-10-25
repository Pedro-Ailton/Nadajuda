import { mockCompetitions } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy } from 'lucide-react';

export default function CompetitionsPage() {
  const sortedCompetitions = [...mockCompetitions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-semibold">Competições</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy />
            Histórico de Competições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead className="text-right">Tempo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCompetitions.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell>
                    {new Date(comp.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">{comp.event}</TableCell>
                  <TableCell className="text-right font-mono">
                    {comp.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
