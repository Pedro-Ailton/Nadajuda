'use client';

import Image from 'next/image';
import { mockUserProfile } from '@/lib/mock-data';
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
import { useState } from 'react';

export default function ProfilePage() {
  const [date, setDate] = useState<Date | undefined>(mockUserProfile.dob);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-semibold">My Profile</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-6">
            <Image
              src={mockUserProfile.avatarUrl}
              alt="User Avatar"
              width={80}
              height={80}
              className="rounded-full"
              data-ai-hint="portrait person"
            />
            <Button variant="outline">Change Avatar</Button>
          </div>

          <form className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={mockUserProfile.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={mockUserProfile.email} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
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
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                    />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Personal Notes</Label>
              <Textarea
                id="notes"
                defaultValue={mockUserProfile.notes}
                className="min-h-[120px]"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
