'use client';

import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
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
import { getAuth, deleteUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';


export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setDate(userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth) : undefined);
      setNotes(userProfile.personalNotes || '');
    } else if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [userProfile, user]);

  const handleSaveChanges = () => {
    if (!userDocRef) return;
    const updatedProfile: Partial<UserProfile> = {
      name,
      email,
      dateOfBirth: date?.toISOString(),
      personalNotes: notes,
    };
    setDocumentNonBlocking(userDocRef, updatedProfile, { merge: true });
    toast({
      title: 'Sucesso!',
      description: 'Seu perfil foi atualizado.',
    });
  };

  const handleDeleteProfile = async () => {
    if (!user || !firestore || !userDocRef) return;

    setIsDeleting(true);

    try {
      // 1. Delete user data from Firestore
      await deleteDoc(userDocRef);
      
      // 2. Delete user from Firebase Auth
      // This is a sensitive operation and requires recent sign-in.
      // Re-authentication might be needed in a real-world scenario.
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        await deleteUser(currentUser);
      }

      toast({
        title: 'Perfil Deletado',
        description: 'Sua conta e todos os seus dados foram removidos.',
      });

      // Redirect to login page is handled by the auth state listener in the layout
      router.push('/login');

    } catch (error: any) {
      console.error("Error deleting profile:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Deletar Perfil',
        description: error.code === 'auth/requires-recent-login'
          ? 'Esta operação é sensível e requer autenticação recente. Por favor, faça login novamente e tente de novo.'
          : error.message,
      });
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
       <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center">
            <h1 className="font-headline text-3xl font-semibold">Meu Perfil</h1>
        </div>
         <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex items-center gap-6">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2 md:col-span-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </CardContent>
         </Card>
       </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-semibold">Meu Perfil</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-6">
            <Image
              src={userProfile?.avatarUrl || "https://picsum.photos/seed/10/200/200"}
              alt="User Avatar"
              width={80}
              height={80}
              className="rounded-full"
              data-ai-hint="portrait person"
            />
            <Button variant="outline">Mudar Avatar</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Endereço de Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dob">Data de Nascimento</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="dob"
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas Pessoais</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md border-destructive">
          <CardHeader>
              <CardTitle className='text-destructive'>Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent>
              <p className='text-sm text-muted-foreground'>
                  A exclusão da sua conta é uma ação irreversível. Todos os seus dados, incluindo tempos de competição e treinos, serão permanentemente removidos.
              </p>
          </CardContent>
          <CardFooter className='flex justify-end'>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? 'Deletando...' : 'Deletar Perfil'}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá deletar permanentemente sua conta e remover seus dados de nossos servidores.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProfile} className={cn(buttonVariants({ variant: "destructive" }))}>
                        Sim, deletar perfil
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
      </Card>
    </div>
  );
}

    