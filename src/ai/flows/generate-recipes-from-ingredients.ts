'use server';
/**
 * @fileOverview Recipe generation flow based on identified ingredients.
 *
 * - generateRecipesFromIngredients - A function that generates recipe suggestions based on the identified ingredients.
 * - GenerateRecipesFromIngredientsInput - The input type for the generateRecipesFromIngredients function.
 * - GenerateRecipesFromIngredientsOutput - The return type for the generateRecipesFrom-ingredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipesFromIngredientsInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients recognized from the uploaded photo.'),
  dietaryRestrictions: z
    .string()
    .optional()
    .describe('Optional dietary restrictions to consider when generating recipes (e.g., vegetarian, gluten-free).'),
});
export type GenerateRecipesFromIngredientsInput = z.infer<
  typeof GenerateRecipesFromIngredientsInputSchema
>;

const RecipeSchema = z.object({
    title: z.string().describe("The title of the recipe."),
    ingredients: z.array(z.string()).describe("A list of ingredients for the recipe."),
    instructions: z.array(z.string()).describe("The step-by-step instructions for preparing the recipe."),
});

const GenerateRecipesFromIngredientsOutputSchema = z.object({
  recipes: z
    .array(RecipeSchema)
    .describe('An array of recipe suggestions based on the identified ingredients.'),
});
export type GenerateRecipesFromIngredientsOutput = z.infer<
  typeof GenerateRecipesFromIngredientsOutputSchema
>;

export async function generateRecipesFromIngredients(
  input: GenerateRecipesFromIngredientsInput
): Promise<GenerateRecipesFromIngredientsOutput> {
  return generateRecipesFromIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipesFromIngredientsPrompt',
  input: {schema: GenerateRecipesFromIngredientsInputSchema},
  output: {schema: GenerateRecipesFromIngredientsOutputSchema},
  prompt: `You are a recipe generation expert. Given a list of ingredients, you will generate multiple recipe suggestions. For each recipe, provide a title, a list of ingredients, and step-by-step instructions.

Ingredients: {{{ingredients}}}

{{#if dietaryRestrictions}}
Dietary Restrictions: {{{dietaryRestrictions}}}
{{/if}}

Generate a variety of recipe options.`,
});

const generateRecipesFromIngredientsFlow = ai.defineFlow(
  {
    name: 'generateRecipesFromIngredientsFlow',
    inputSchema: GenerateRecipesFromIngredientsInputSchema,
    outputSchema: GenerateRecipesFromIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
