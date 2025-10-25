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
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-xl font-semibold">Loading...</div>
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
                <span>Sign Out</span>
            </Button>
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
