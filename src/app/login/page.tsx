'use client';
import { Logo } from '@/components/logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      const checkUserProfile = async () => {
        if(firestore) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            router.push('/dashboard');
          } else {
            router.push('/personalize');
          }
        }
      };
      checkUserProfile();
    }
  }, [user, isUserLoading, router, firestore]);

  if (isUserLoading || user) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-xl font-semibold">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-8 left-8">
         <Logo />
      </div>
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Criar Conta</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo de Volta</CardTitle>
              <CardDescription>
                Faça login na sua conta NadAjuda para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Crie uma Conta</CardTitle>
              <CardDescription>
                Comece a usar o NadAjuda criando sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
