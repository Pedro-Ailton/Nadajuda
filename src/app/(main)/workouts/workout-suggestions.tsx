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
import { Input } from '@/components/ui/input';
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
    message: 'Please provide some details on past performance.',
  }),
  goals: z.string().min(10, {
    message: 'Please describe your goals.',
  }),
  athleteType: z.string({
    required_error: 'Please select an athlete type.',
  }),
  eventPreference: z.string({
    required_error: 'Please select an event preference.',
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
        title: 'Error',
        description: result.error,
      });
    }

    setIsLoading(false);
  }

  return (
    <Card className="shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit />
              AI Workout Suggestions
            </CardTitle>
            <CardDescription>
              Fill in your details to get personalized workout ideas from our AI
              coach.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pastPerformance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Past Performance Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Recent 50m free time is 25.5s. Struggling with butterfly endurance.'"
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
                  <FormLabel>Training Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Break 55s in 100m fly. Improve underwater kicks.'"
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
                  <FormLabel>Athlete Type</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary strength" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sprinter">Sprinter (50m-100m)</SelectItem>
                      <SelectItem value="mid-distance">Mid-Distance (200m-400m)</SelectItem>
                      <SelectItem value="distance">Distance (800m+)</SelectItem>
                      <SelectItem value="all-rounder">All-Rounder (IM)</SelectItem>
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
                  <FormLabel>Preferred Event/Stroke</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your favorite event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="freestyle">Freestyle</SelectItem>
                      <SelectItem value="backstroke">Backstroke</SelectItem>
                      <SelectItem value="breaststroke">Breaststroke</SelectItem>
                      <SelectItem value="butterfly">Butterfly</SelectItem>
                       <SelectItem value="individual-medley">Individual Medley (IM)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Get Suggestions'}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {(isLoading || suggestion) && (
        <CardContent>
          <CardTitle className="text-lg mb-4">Your Suggested Workout</CardTitle>
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
      )}
    </Card>
  );
}
