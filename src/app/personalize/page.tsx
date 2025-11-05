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
import { parse } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function PersonalizePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [date, setDate] = useState<string | undefined>();
  const [gender, setGender] = useState<'female' | 'male' | 'other' | undefined>();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

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

    let parsedDate: Date | undefined;
    if (date) {
        parsedDate = parse(date, 'dd/MM/yyyy', new Date());
        if (isNaN(parsedDate.getTime())) {
            setDateError("Data inválida. Use o formato DD/MM/AAAA.");
            setIsLoading(false);
            return;
        }
    }
    setDateError(null);


    const userProfile: UserProfile = {
      id: user.uid,
      name,
      email: user.email || '',
      dateOfBirth: parsedDate?.toISOString(),
      gender: gender,
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
                <Label htmlFor="dob">Data de Nascimento</Label>
                <Input id="dob" placeholder="DD/MM/AAAA" value={date || ''} onChange={(e) => setDate(e.target.value)} />
                {dateError && <p className="text-sm text-destructive">{dateError}</p>}
            </div>
            <div className="space-y-2">
                <Label>Gênero</Label>
                <RadioGroup
                    onValueChange={(value: 'female' | 'male' | 'other') => setGender(value)}
                    className="flex items-center gap-6"
                    value={gender}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Feminino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Outro</Label>
                    </div>
                </RadioGroup>
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
