'use server';
/**
 * @fileOverview An AI agent for analyzing returned product images.
 *
 * - analyzeReturnImage - A function that suggests the condition of a returned product based on its image.
 * - AnalyzeReturnImageInput - The input type for the analyzeReturnImage function.
 * - AnalyzeReturnImageOutput - The return type for the analyzeReturnImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeReturnImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a returned product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeReturnImageInput = z.infer<typeof AnalyzeReturnImageInputSchema>;

const AnalyzeReturnImageOutputSchema = z.object({
  condition: z
    .enum(['new', 'used', 'damaged'])
    .describe("The assessed condition of the product."),
  reason: z.string().describe('A brief reason for the assessment in Vietnamese.'),
});
export type AnalyzeReturnImageOutput = z.infer<typeof AnalyzeReturnImageOutputSchema>;

export async function analyzeReturnImage(input: AnalyzeReturnImageInput): Promise<AnalyzeReturnImageOutput> {
  return analyzeReturnImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReturnImagePrompt',
  input: { schema: AnalyzeReturnImageInputSchema },
  output: { schema: AnalyzeReturnImageOutputSchema },
  prompt: `You are an expert at inspecting returned agricultural machinery. Analyze the provided image of a returned product. 
  
  Based on visual cues like scratches, dirt, signs of use, wear and tear, or the state of the packaging, determine if the product's condition is 'new', 'used', or 'damaged'. 
  - 'new': The product appears untouched, in original packaging, with no signs of use.
  - 'used': The product shows minor signs of use, like light scuffs, some dirt, or has been taken out of its packaging.
  - 'damaged': The product has clear damage, such as cracks, dents, broken parts, or heavy wear.
  
  Also, provide a brief, one-sentence reason for your assessment in Vietnamese.

  Photo: {{media url=photoDataUri}}`,
});

const analyzeReturnImageFlow = ai.defineFlow(
  {
    name: 'analyzeReturnImageFlow',
    inputSchema: AnalyzeReturnImageInputSchema,
    outputSchema: AnalyzeReturnImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
