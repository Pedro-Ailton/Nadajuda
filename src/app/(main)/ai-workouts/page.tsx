'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore } from '@/firebase';
import { doc, collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Save, Send, User as UserIcon } from 'lucide-react';
import type { Workout, GenerateWorkoutOutput, WorkoutItem } from '@/lib/types';
import { workoutChat } from '@/ai/flows/workout-chat-flow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


type Message = {
    role: 'user' | 'assistant';
    content: string;
    workout?: GenerateWorkoutOutput;
};

export default function AiWorkoutsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const startConversation = async () => {
            setIsGenerating(true);
            try {
                const initialResponse = await workoutChat([], user?.displayName || 'nadador(a)');
                setMessages([{ role: 'assistant', content: initialResponse }]);
            } catch (error) {
                console.error(error);
                toast({
                    variant: 'destructive',
                    title: 'Erro de IA',
                    description: 'Não foi possível iniciar a conversa com o treinador de IA.',
                });
            } finally {
                setIsGenerating(false);
            }
        };
        startConversation();
    }, [toast, user]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isGenerating) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsGenerating(true);

        try {
            const chatHistory = newMessages.map(m => ({ role: m.role, content: m.content }));
            const assistantResponse = await workoutChat(chatHistory, user?.displayName || 'nadador(a)');
            
            let workoutPlan: GenerateWorkoutOutput | undefined;
            try {
                // Check if the response contains a JSON workout plan
                const jsonMatch = assistantResponse.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch && jsonMatch[1]) {
                    workoutPlan = JSON.parse(jsonMatch[1]);
                }
            } catch (parseError) {
                console.error("Failed to parse workout JSON:", parseError);
                 toast({
                    variant: 'destructive',
                    title: 'Erro de IA',
                    description: 'A IA retornou um plano de treino num formato inválido.',
                });
            }

            setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse.replace(/```json\n([\s\S]*?)\n```/, ''), workout: workoutPlan }]);

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro de IA',
                description: 'Houve um problema na comunicação com a IA. Tente novamente.',
            });
             setMessages(prev => [...prev, { role: 'assistant', content: "Desculpe, ocorreu um erro. Pode tentar de novo?"}]);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSaveWorkout = async (workoutToSave: GenerateWorkoutOutput) => {
        if (!user || !firestore) return;
        
        setIsSaving(true);
        try {
          const workoutsCollection = collection(firestore, 'users', user.uid, 'workouts');
          
          const newWorkout: Omit<Workout, 'id'> = {
            name: workoutToSave.name,
            date: new Date().toISOString(),
            userProfileId: user.uid,
            workoutItems: workoutToSave.workoutItems.map(item => ({...item, temposRegistrados: []})),
          };
    
          await addDoc(workoutsCollection, newWorkout);
    
          toast({
            title: 'Treino Salvo!',
            description: `O treino "${workoutToSave.name}" foi adicionado à sua lista.`,
          });

        } catch (error) {
          console.error("Error saving workout: ", error);
          toast({
            variant: 'destructive',
            title: 'Erro ao Salvar',
            description: 'Não foi possível salvar o treino. Tente novamente.',
          });
        } finally {
            setIsSaving(false);
        }
      };


    return (
        <div className="flex flex-1 flex-col p-4 md:p-6 h-[calc(100vh-120px)]">
            <div className="flex items-center gap-3 mb-4">
                <Bot className="h-8 w-8" />
                <h1 className="font-headline text-3xl font-semibold">Seu Treinador IA</h1>
            </div>

            <Card className="flex flex-1 flex-col">
                <CardContent className="flex-1 flex flex-col p-0">
                    <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-4", message.role === 'user' && "justify-end")}>
                                {message.role === 'assistant' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-md rounded-lg p-3", message.role === 'assistant' ? "bg-muted" : "bg-primary text-primary-foreground")}>
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                     {message.workout && (
                                        <Card className="mt-4 bg-background">
                                            <CardHeader>
                                                <CardTitle>{message.workout.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Fase</TableHead>
                                                                <TableHead>Repetições</TableHead>
                                                                <TableHead>Descrição</TableHead>
                                                                <TableHead>Intensidade</TableHead>
                                                                <TableHead>Observações</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {message.workout.workoutItems.map((item, itemIndex) => (
                                                                <TableRow key={itemIndex}>
                                                                    <TableCell className="font-medium">{item.fase}</TableCell>
                                                                    <TableCell>{item.repeticoes > 0 ? item.repeticoes : '-'}</TableCell>
                                                                    <TableCell>{item.descricao}</TableCell>
                                                                    <TableCell>{item.intensidade}</TableCell>
                                                                    <TableCell>{item.observacoes}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                 <Button onClick={() => handleSaveWorkout(message.workout!)} disabled={isSaving} className='mt-4 w-full'>
                                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                                    Salvar Treino
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                                 {message.role === 'user' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isGenerating && messages[messages.length - 1]?.role === 'user' && (
                            <div className="flex items-start gap-4">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                                <div className="max-w-md rounded-lg p-3 bg-muted flex items-center">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="border-t p-4 bg-background">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Descreva o que pretende treinar hoje..."
                                disabled={isGenerating}
                            />
                            <Button type="submit" disabled={!input.trim() || isGenerating}>
                               <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
