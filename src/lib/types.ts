export type Competition = {
  id: string;
  event: string;
  time: string;
  date: string;
};

export type WorkoutItem = {
  fase: string;
  repeticoes: number;
  descricao: string;
  intensidade: string;
  observacoes: string;
  temposRegistrados: string[];
};

export type Workout = {
  id: string;
  name: string;
  date: string;
  workoutItems: WorkoutItem[];
  userProfileId: string;
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

export type Event = {
    id: string;
    name: string;
    distance: number;
    stroke: string;
}
