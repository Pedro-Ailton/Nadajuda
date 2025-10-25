'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';


export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');

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
    </div>
  );
}
