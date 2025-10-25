export type Competition = {
  id: string;
  event: string;
  time: string;
  date: string;
};

export type WorkoutItem = {
  id: string;
  workoutId: string;
  description: string;
  estimatedTime?: number;
  actualTime?: number;
};

export type Workout = {
  id: string;
  name: string;
  date: string;
  description?: string;
  workoutItems?: WorkoutItem[];
};


export type UserProfile = {
  id: string;
  name: string;
  dateOfBirth?: string;
  email: string;
  personalNotes?: string;
  avatarUrl?: string;
};

export type CompetitionTime = {
    id: string;
    userProfileId: string;
    eventId: string;
    eventName: string;
    time: number; // in seconds
    date: string; // ISO 8601
};
