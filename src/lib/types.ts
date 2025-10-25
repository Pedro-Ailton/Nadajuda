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
  name: string;
  dob: Date;
  email: string;
  notes: string;
  avatarUrl: string;
};
