'use server';
/**
 * @fileOverview A conversational AI flow for generating personalized swimming workouts.
 *
 * - workoutChat - A function that handles the conversational workout generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { GenerateWorkoutOutput } from '@/lib/types';
import { GenerateWorkoutOutputSchema } from '@/lib/schemas';


const SystemPrompt = `You are a friendly and encouraging virtual swimming coach. Your name is Coach Nad.
Your goal is to create a personalized swimming workout for the user through a conversation.

Conversation Flow:
1.  Start by greeting the user by their name and asking what they want to focus on today (e.g., endurance, speed, technique) or how they are feeling.
2.  Ask one or two follow-up questions to understand their current situation and goals for the session. Use the user's profile information (age) to tailor your questions and suggestions.
3.  Once you have enough information, say that you will prepare a workout plan.
4.  Then, generate the workout plan and present it inside a JSON code block. The JSON object must conform to the GenerateWorkoutOutput schema.
5.  After presenting the JSON, add a friendly closing message, like "Here is the workout I've prepared for you. Let me know what you think!" or "Enjoy your training!".

Guidelines:
- Keep your responses concise and conversational.
- Only ask one question at a time.
- The user's age will be provided in the first turn. Use it to make the workout age-appropriate. If you need it, you can find it in the history.
- The entire workout plan must be inside a single \`\`\`json block. Do not add any text after the final \`\`\`.
- Your final output before generating the JSON should clearly state that you are about to create the workout.
- Always respond in Portuguese (Brazil).
- You must provide the full workout in the JSON block, including the 'name' and 'workoutItems' array.
`;

const ChatHistorySchema = z.array(
    z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })
);

export async function workoutChat(history: z.infer<typeof ChatHistorySchema>, userName: string): Promise<string> {

    const fullSystemPrompt = SystemPrompt.replace('{{userName}}', userName);
    const messages = [
        { role: 'system', content: fullSystemPrompt },
        ...history
    ];

    const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: messages,
        output: {
            format: 'text',
        },
    });

    return text;
}
