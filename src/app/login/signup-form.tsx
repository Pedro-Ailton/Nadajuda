'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useState } from 'react';
import { FirebaseError } from 'firebase/app';

const formSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export function SignupForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await initiateEmailSignUp(auth, values.email, values.password);
      // Let onAuthStateChanged handle redirect
    } catch (error) {
       if (error instanceof FirebaseError) {
        toast({
            variant: 'destructive',
            title: 'Sign-up Failed',
            description: error.message,
        });
       } else {
         toast({
            variant: 'destructive',
            title: 'Sign-up Failed',
            description: 'An unexpected error occurred.',
        });
       }
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
