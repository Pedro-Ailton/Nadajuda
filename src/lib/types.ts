export type Competition = {
  id: string;
  event: string;
  time: string;
  date: string;
};

export type Workout = {
  id: string;
  description: string;
  estimatedTime: string;
  actualTime: string;
};

export type UserProfile = {
  id: string;
  name: string;
  dateOfBirth?: string;
  email: string;
  personalNotes?: string;
  avatarUrl?: string;
};
