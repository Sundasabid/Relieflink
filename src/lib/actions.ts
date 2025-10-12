
"use server";

import { suggestUserRole, SuggestUserRoleInput, SuggestUserRoleOutput } from "@/ai/flows/suggest-user-role";

export async function getSuggestedRole(
  input: SuggestUserRoleInput
): Promise<SuggestUserRoleOutput> {
  console.log("Invoking suggestUserRole flow with input:", input);
  try {
    const result = await suggestUserRole(input);
    console.log("AI suggestion received:", result);
    return result;
  } catch (error) {
    console.error("Error in getSuggestedRole action:", error);
    throw new Error("Failed to get role suggestion from AI.");
  }
}
