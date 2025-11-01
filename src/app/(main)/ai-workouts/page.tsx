'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function AiWorkoutsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-semibold">Gerador de Treinos com IA</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            Funcionalidade em Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>
              O gerador de treinos com IA está temporariamente indisponível.
              <br />
              Estamos a trabalhar para o trazer de volta o mais rápido possível.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
