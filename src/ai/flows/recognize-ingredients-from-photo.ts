'use server';

/**
 * @fileOverview Recognizes ingredients from a photo.
 *
 * - recognizeIngredientsFromPhoto - A function that handles the ingredient recognition process.
 * - RecognizeIngredientsFromPhotoInput - The input type for the recognizeIngredientsFromPhoto function.
 * - RecognizeIngredientsFromPhotoOutput - The return type for the recognizeIngredientsFromPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecognizeIngredientsFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecognizeIngredientsFromPhotoInput = z.infer<typeof RecognizeIngredientsFromPhotoInputSchema>;

const RecognizeIngredientsFromPhotoOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A comprehensive list of all ingredients identified in the photo.'),
});
export type RecognizeIngredientsFromPhotoOutput = z.infer<typeof RecognizeIngredientsFromPhotoOutputSchema>;

export async function recognizeIngredientsFromPhoto(
  input: RecognizeIngredientsFromPhotoInput
): Promise<RecognizeIngredientsFromPhotoOutput> {
  return recognizeIngredientsFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeIngredientsFromPhotoPrompt',
  input: {schema: RecognizeIngredientsFromPhotoInputSchema},
  output: {schema: RecognizeIngredientsFromPhotoOutputSchema},
  prompt: `You are an expert at identifying ingredients from a photo. Your task is to meticulously identify every single ingredient visible in the provided photo. Be as comprehensive as possible.

Ingredients Photo: {{media url=photoDataUri}}

Return a comprehensive list of all identified ingredients.
`,
});

const recognizeIngredientsFromPhotoFlow = ai.defineFlow(
  {
    name: 'recognizeIngredientsFromPhotoFlow',
    inputSchema: RecognizeIngredientsFromPhotoInputSchema,
    outputSchema: RecognizeIngredientsFromPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
