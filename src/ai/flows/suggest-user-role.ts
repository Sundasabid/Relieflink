'use server';

/**
 * @fileOverview A user role suggestion AI agent.
 *
 * - suggestUserRole - A function that suggests a user role based on user data.
 * - SuggestUserRoleInput - The input type for the suggestUserRole function.
 * - SuggestUserRoleOutput - The return type for the suggestUserRole function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestUserRoleInputSchema = z.object({
  profile: z.string().describe('User profile information.'),
  requests: z.string().describe('User requests information.'),
  volunteerData: z.string().describe('User volunteer data.'),
  donorInfo: z.string().describe('User donor information.'),
});
export type SuggestUserRoleInput = z.infer<typeof SuggestUserRoleInputSchema>;

const SuggestUserRoleOutputSchema = z.object({
  suggestedRole: z.string().describe('The suggested user role (e.g., donor, volunteer, requester).'),
  confidence: z.number().describe('A confidence score (0-1) for the role suggestion.'),
  reasoning: z.string().describe('The reasoning behind the role suggestion.'),
});
export type SuggestUserRoleOutput = z.infer<typeof SuggestUserRoleOutputSchema>;

export async function suggestUserRole(input: SuggestUserRoleInput): Promise<SuggestUserRoleOutput> {
  return suggestUserRoleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestUserRolePrompt',
  input: {schema: SuggestUserRoleInputSchema},
  output: {schema: SuggestUserRoleOutputSchema},
  prompt: `You are an AI assistant designed to suggest user roles for the ReliefLink platform.

  Based on the user's information, including their profile, requests, volunteer data, and donor information, you will suggest an appropriate initial role for them (e.g., donor, volunteer, requester).

  Provide a confidence score (0-1) for your suggestion and explain your reasoning.

  Profile: {{{profile}}}
  Requests: {{{requests}}}
  Volunteer Data: {{{volunteerData}}}
  Donor Info: {{{donorInfo}}}

  Format your response as a JSON object matching the following schema:
  ${JSON.stringify(SuggestUserRoleOutputSchema.describe(''))}`,
});

const suggestUserRoleFlow = ai.defineFlow(
  {
    name: 'suggestUserRoleFlow',
    inputSchema: SuggestUserRoleInputSchema,
    outputSchema: SuggestUserRoleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
