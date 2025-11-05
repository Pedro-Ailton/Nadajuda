'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Workout, WorkoutItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { Textarea } from '@/components/ui/textarea';
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import dynamic from 'next/dynamic';


const AddWorkoutForm = dynamic(() => import('./add-workout-form').then(mod => mod.AddWorkoutForm));
const EditWorkoutForm = dynamic(() => import('./edit-workout-form').then(mod => mod.EditWorkoutForm));


function WorkoutRow({ workout, item, itemIndex, onDelete }: { workout: Workout, item: WorkoutItem, itemIndex: number, onDelete: (index: number) => void }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const descTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    

    const debouncedUpdate = useDebouncedCallback((updatedItems) => {
        if (!user || !firestore) return;
        const workoutRef = doc(firestore, 'users', user.uid, 'workouts', workout.id);
        updateDoc(workoutRef, { workoutItems: updatedItems });
    }, 1000);

    const handleItemChange = (field: keyof WorkoutItem, value: any) => {
        if (!workout.workoutItems) return;
        const updatedItems = [...workout.workoutItems];
        let processedValue = value;
        if (field === 'repeticoes') {
            const num = parseInt(value, 10);
            processedValue = isNaN(num) ? 0 : num;
        }
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], [field]: processedValue };
        debouncedUpdate(updatedItems);
    };

    const handleDescTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target) {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
        }
        handleItemChange('descricao', e.target.value);
    };

    React.useEffect(() => {
        const textarea = descTextareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [item.descricao]);


    const handleTimeChange = (timeIndex: number, value: string) => {
        if (!workout.workoutItems) return;
        const updatedItems = [...workout.workoutItems];
        const currentItem = updatedItems[itemIndex];
        const updatedTimes = [...(currentItem.temposRegistrados || [])];
        updatedTimes[timeIndex] = value;
        updatedItems[itemIndex] = { ...currentItem, temposRegistrados: updatedTimes };
        debouncedUpdate(updatedItems);
    }
    
    const addRegisteredTime = () => {
        if (!workout.workoutItems) return;
        const updatedItems = [...workout.workoutItems];
        const currentItem = updatedItems[itemIndex];
        const updatedTimes = [...(currentItem.temposRegistrados || []), ''];
        updatedItems[itemIndex] = { ...currentItem, temposRegistrados: updatedTimes };
        debouncedUpdate(updatedItems);
    }

    const handleDeleteTimeEntry = (timeIndex: number) => {
        if (!workout.workoutItems) return;
        const updatedItems = [...workout.workoutItems];
        const currentItem = updatedItems[itemIndex];
        const tempos = [...(currentItem.temposRegistrados || [])];
        tempos.splice(timeIndex, 1);
        updatedItems[itemIndex] = { ...currentItem, temposRegistrados: tempos };
        debouncedUpdate(updatedItems);
    }
    
    const temposRegistradosCount = item.temposRegistrados?.length || 0;
    const maxTemposInWorkout = workout.workoutItems?.reduce((max, item) => Math.max(max, item.temposRegistrados?.length || 0), 0) || 0;

    return (
        <TableRow>
            <TableCell className="p-1 align-top"><Input defaultValue={item.fase} onChange={(e) => handleItemChange('fase', e.target.value)} className="w-32" /></TableCell>
            <TableCell className="p-1 align-top"><Input type="number" defaultValue={item.repeticoes || ''} onChange={(e) => handleItemChange('repeticoes', e.target.value)} className="w-24" /></TableCell>
            <TableCell className="p-1 align-top min-w-[350px]">
                <Textarea 
                    ref={descTextareaRef}
                    defaultValue={item.descricao} 
                    onChange={handleDescTextareaChange} 
                    className="text-left min-h-[40px] resize-none overflow-hidden"
                    rows={1}
                />
            </TableCell>
            <TableCell className="p-1 align-top"><Input defaultValue={item.intensidade} onChange={(e) => handleItemChange('intensidade', e.target.value)} className="w-20" /></TableCell>
            <TableCell className="p-1 align-top">
                <Input 
                    defaultValue={item.observacoes} 
                    onChange={(e) => handleItemChange('observacoes', e.target.value)}
                    className="text-left"
                />
            </TableCell>
             {Array.from({ length: maxTemposInWorkout }).map((_, i) => (
                 <TableCell key={i} className="text-center p-1 align-top">
                    {i < temposRegistradosCount ? (
                        <div className='flex items-start'>
                             <Input 
                                defaultValue={item.temposRegistrados?.[i] || ''}
                                onChange={(e) => handleTimeChange(i, e.target.value)}
                                className="text-center" 
                            />
                             <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDeleteTimeEntry(i)}>
                                <Trash2 className="h-4 w-4 text-destructive/70" />
                            </Button>
                        </div>
                    ) : (
                        <div className="h-10" /> 
                    )}
                </TableCell>
            ))}
            <TableCell className="text-center p-1 align-top">
                 <Button variant="ghost" size="icon" onClick={addRegisteredTime}><Plus className="h-4 w-4"/></Button>
            </TableCell>
            <TableCell className="p-1 align-top">
                <Button variant="ghost" size="icon" onClick={() => onDelete(itemIndex)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </TableCell>
        </TableRow>
    )
};

const WorkoutTable = ({ workout }: { workout: Workout }) => {
    const { user } = useUser();
    const firestore = useFirestore();

    const updateItems = (updatedItems: WorkoutItem[]) => {
        if (!user || !firestore) return;
        const workoutRef = doc(firestore, 'users', user.uid, 'workouts', workout.id);
        updateDoc(workoutRef, { workoutItems: updatedItems });
    };

    const debouncedUpdate = useDebouncedCallback(updateItems, 1000);


    const addNewRow = () => {
        if (!user || !firestore) return;
        const newWorkoutItem: WorkoutItem = {
            fase: '',
            repeticoes: 0,
            descricao: '',
            intensidade: '',
            observacoes: '',
            temposRegistrados: [''], // Start with one time column
        };
        const updatedItems = [...(workout.workoutItems || []), newWorkoutItem];
        updateItems(updatedItems);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        if (!workout.workoutItems) return;
        const updatedItems = workout.workoutItems.filter((_, index) => index !== indexToDelete);
        updateItems(updatedItems);
    };

    const handleDeleteTimeColumn = (colIndex: number) => {
        if (!workout.workoutItems) return;
        
        const updatedItems = workout.workoutItems.map(item => {
            const tempos = [...(item.temposRegistrados || [])];
            tempos.splice(colIndex, 1);
            return { ...item, temposRegistrados: tempos };
        });

        debouncedUpdate(updatedItems);
    }
    
    const maxTempos = workout.workoutItems?.reduce((max, item) => Math.max(max, item.temposRegistrados?.length || 0), 0) || 1;

    return (
        <div className="p-2 overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="bg-muted text-muted-foreground">Fase</TableHead>
                        <TableHead className="bg-muted text-muted-foreground">Repetições</TableHead>
                        <TableHead className="bg-muted text-muted-foreground min-w-[350px]">Descrição</TableHead>
                        <TableHead className="bg-muted text-muted-foreground">Intensidade</TableHead>
                        <TableHead className="bg-muted text-muted-foreground">Obs.</TableHead>
                        {Array.from({ length: maxTempos }).map((_, i) => (
                            <TableHead key={i} className="text-center bg-muted text-muted-foreground">
                                <div className='flex items-center justify-center gap-1'>
                                    <span>{i+1}º Tempo</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTimeColumn(i)}>
                                        <Trash2 className="h-3 w-3 text-destructive/70" />
                                    </Button>
                                </div>
                            </TableHead>
                        ))}
                        <TableHead className="text-center bg-muted text-muted-foreground">Tempos</TableHead>
                        <TableHead className="text-center bg-muted text-muted-foreground">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workout.workoutItems?.map((item, index) => (
                        <WorkoutRow key={index} workout={workout} item={item} itemIndex={index} onDelete={handleDeleteRow} />
                    ))}
                </TableBody>
            </Table>
            <Button onClick={addNewRow} variant="outline" className="mt-4 w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Linha
            </Button>
        </div>
    )
}


export default function WorkoutsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);

  const workoutsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'workouts'), orderBy('date', 'desc'));
  }, [user, firestore]);

  const { data: workouts, isLoading } = useCollection<Workout>(workoutsQuery);

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user || !firestore) return;
    try {
        const workoutRef = doc(firestore, 'users', user.uid, 'workouts', workoutId);
        await deleteDoc(workoutRef);
        toast({
            title: "Treino Apagado",
            description: "O treino foi removido com sucesso.",
        });
    } catch (error) {
        console.error("Error deleting workout: ", error);
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível apagar o treino.",
        });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Treinos</h1>
        <AddWorkoutForm />
      </div>

       {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : workouts && workouts.length > 0 ? (
             <Accordion type="single" collapsible className="w-full space-y-4">
                {workouts.map(workout => (
                     <AccordionItem value={workout.id} key={workout.id} className="border rounded-lg shadow-md bg-card">
                        <div className="flex w-full items-center gap-4 p-4">
                            <AccordionTrigger className="flex-1 text-left p-0 hover:no-underline">
                                <div>
                                    <span className="font-bold text-lg">{workout.name}</span>
                                    <div className="text-muted-foreground text-sm flex-shrink-0">{new Date(workout.date).toLocaleDateString('pt-BR')}</div>
                                </div>
                            </AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <EditWorkoutForm workout={workout} />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className='h-8 w-8 flex-shrink-0'>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação não pode ser desfeita. Isto irá apagar permanentemente o seu treino.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={() => handleDeleteWorkout(workout.id)}
                                            className={cn(buttonVariants({ variant: "destructive" }))}
                                        >
                                            Apagar
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                        <AccordionContent>
                           <WorkoutTable workout={workout} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        ) : (
            <div className="text-center py-12 text-muted-foreground">
                Nenhum treino registrado. Clique em "Novo Treino" para começar.
            </div>
        )}
    </div>
  );
}
