'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { BrainCircuit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateWorkoutSuggestionsAction } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

const formSchema = z.object({
  pastPerformance: z.string().min(10, {
    message: 'Por favor, forneça alguns detalhes sobre seu desempenho anterior.',
  }),
  goals: z.string().min(10, {
    message: 'Por favor, descreva seus objetivos.',
  }),
  athleteType: z.string({
    required_error: 'Por favor, selecione um tipo de atleta.',
  }),
  eventPreference: z.string({
    required_error: 'Por favor, selecione uma preferência de prova.',
  }),
});

export function WorkoutSuggestions() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pastPerformance: '',
      goals: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);

    const result = await generateWorkoutSuggestionsAction(values);

    if (result.success && result.data) {
      setSuggestion(result.data.workoutSuggestions);
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: result.error,
      });
    }

    setIsLoading(false);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit />
                Sugestões de Treino com IA
              </CardTitle>
              <CardDescription>
                Preencha seus dados para obter ideias de treino personalizadas do nosso treinador de IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pastPerformance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumo do Desempenho Anterior</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: 'Meu tempo recente nos 50m livre é 25.5s. Tenho dificuldade na resistência do nado borboleta.'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivos de Treinamento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: 'Baixar de 55s nos 100m borboleta. Melhorar as pernadas submersas.'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="athleteType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Atleta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua principal força" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sprinter">Velocista (50m-100m)</SelectItem>
                        <SelectItem value="mid-distance">Meio-Fundo (200m-400m)</SelectItem>
                        <SelectItem value="distance">Fundo (800m+)</SelectItem>
                        <SelectItem value="all-rounder">Completo (Medley)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prova/Estilo Preferido</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua prova favorita" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="freestyle">Livre</SelectItem>
                        <SelectItem value="backstroke">Costas</SelectItem>
                        <SelectItem value="breaststroke">Peito</SelectItem>
                        <SelectItem value="butterfly">Borboleta</SelectItem>
                        <SelectItem value="individual-medley">Medley Individual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Gerando...' : 'Obter Sugestões'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      {(isLoading || suggestion) && (
        <Card className="shadow-md mt-4">
            <CardContent className="pt-6">
            <CardTitle className="text-lg mb-4">Seu Treino Sugerido</CardTitle>
                {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                )}
                {suggestion && (
                    <div className="text-sm text-foreground whitespace-pre-wrap rounded-md bg-muted/50 p-4 border">
                        {suggestion}
                    </div>
                )}
            </CardContent>
        </Card>
      )}
    </>
  );
}
