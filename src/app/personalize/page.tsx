'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';

export default function PersonalizePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (user) {
        setName(user.displayName || '');
    }
  }, [user, isUserLoading, router]);

  const handleSaveProfile = async () => {
    if (!user || !firestore) return;

    setIsLoading(true);

    const userProfile: UserProfile = {
      id: user.uid,
      name,
      email: user.email || '',
      dateOfBirth: date?.toISOString(),
      personalNotes: notes,
    };

    const userDocRef = doc(firestore, 'users', user.uid);
    setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

    toast({
      title: 'Perfil Salvo!',
      description: 'Suas informações foram salvas com sucesso.',
    });
    
    router.push('/tutorial');
    setIsLoading(false);
  };
  
  if (isUserLoading || !user) {
    return (
     <div className="flex h-screen w-full items-center justify-center">
       <div className="text-xl font-semibold">Carregando...</div>
     </div>
   );
 }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Personalize seu Perfil</CardTitle>
          <CardDescription>
            Conte-nos um pouco sobre você para personalizar sua experiência.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dob">Data de Nascimento</Label>                 <Popover>
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
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Pessoais</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Foco em melhorar o nado borboleta e a resistência para a próxima temporada..."
                className="min-h-[120px]"
              />
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full">
              {isLoading ? 'Salvando...' : 'Salvar e Continuar'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
