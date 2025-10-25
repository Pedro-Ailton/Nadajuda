'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavMenu } from '@/components/nav-menu';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else {
        const checkUserProfile = async () => {
          if (firestore) {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
              router.push('/personalize');
            }
          }
        };
        checkUserProfile();
      }
    }
  }, [user, isUserLoading, router, firestore]);

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-xl font-semibold">Carregando...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <NavMenu />
        </SidebarContent>
        <SidebarFooter>
          <div className='flex flex-col gap-2'>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2" onClick={handleSignOut}>
                <LogOut/>
                <span>Sair</span>
            </Button>
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
