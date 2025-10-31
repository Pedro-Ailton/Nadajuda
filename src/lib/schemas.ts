import { z } from 'zod';

export const WorkoutItemSchema = z.object({
  fase: z.string().describe("Phase of the workout (e.g., 'Aquecimento', 'Série Principal', 'Relaxamento')."),
  repeticoes: z.number().describe("Number of repetitions for the set. Should be 0 if not applicable."),
  descricao: z.string().describe("Description of the set (e.g., '50m Livre'). Should be an empty string if not applicable."),
  intensidade: z.string().describe("Optional intensity of the set (e.g., 'A1', 'A2', 'MAX'). Should be an empty string if not applicable."),
  observacoes: z.string().describe("Optional observations, like equipment used or rest time. Should be an empty string if not applicable."),
  temposRegistrados: z.record(z.string()).describe("A map of recorded times for repetitions. Should be an empty object if not applicable."),
});

export const WorkoutSchema = z.object({
  id: z.string().describe("Unique identifier for the Workout entity."),
  name: z.string().describe("Name of the workout session (e.g., 'Treino de Velocidade')."),
  date: z.string().describe("Date the workout was performed (ISO 8601 format)."),
  workoutItems: z.array(WorkoutItemSchema).describe("An array of workout items that make up the session."),
  userProfileId: z.string().describe("Reference to UserProfile."),
});

export const UserProfileSchema = z.object({
  id: z.string().describe("Unique identifier for the UserProfile entity (matches Firebase Auth UID)."),
  name: z.string().describe("User's full name."),
  dateOfBirth: z.string().optional().describe("User's date of birth (ISO 8601 format)."),
  email: z.string().email().describe("User's email address."),
  personalNotes: z.string().optional().describe("Personal notes or information provided by the user."),
  avatarUrl: z.string().url().optional().describe("URL for the user's avatar image."),
});

export const CompetitionTimeSchema = z.object({
    id: z.string().describe("Unique identifier for the CompetitionTime entity."),
    userProfileId: z.string().describe("Reference to UserProfile."),
    eventId: z.string().describe("Reference to Event."),
    eventName: z.string().describe("Name of the event (e.g., 100m Freestyle)."),
    time: z.number().describe("The recorded time for the competition event (in seconds)."),
    date: z.string().describe("Date of the competition (ISO 8601 format)."),
});

export const EventSchema = z.object({
    id: z.string().describe("Unique identifier for the Event entity."),
    name: z.string().describe("Name of the event (e.g., 100m Freestyle)."),
    distance: z.number().describe("Distance of the event (e.g., 100 for 100m)."),
    stroke: z.string().describe("Swimming stroke used in the event (e.g., Freestyle, Backstroke)."),
});
