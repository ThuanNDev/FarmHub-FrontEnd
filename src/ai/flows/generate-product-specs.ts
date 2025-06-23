'use server';
/**
 * @fileOverview An AI agent for generating product specifications from a URL.
 *
 * - generateProductSpecs - A function that creates a product spec JSON from a URL.
 * - GenerateProductSpecsInput - The input type for the generateProductSpecs function.
 * - GenerateProductSpecsOutput - The return type for the generateProductSpecs function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductSpecsInputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  brand: z.string().describe('The brand of the product.'),
  url: z.string().url().describe('The URL of the product page to extract information from.'),
});
export type GenerateProductSpecsInput = z.infer<typeof GenerateProductSpecsInputSchema>;

const GenerateProductSpecsOutputSchema = z.object({
  specs: z
    .string()
    .describe(
      'A JSON string of the product\'s technical specifications. Example: \'{"Công suất": "1.2 kW", "Trọng lượng": "4.1 kg"}\''
    ),
});
export type GenerateProductSpecsOutput = z.infer<typeof GenerateProductSpecsOutputSchema>;

export async function generateProductSpecs(input: GenerateProductSpecsInput): Promise<GenerateProductSpecsOutput> {
  return generateProductSpecsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductSpecsPrompt',
  input: { schema: GenerateProductSpecsInputSchema },
  output: { schema: GenerateProductSpecsOutputSchema },
  prompt: `You are an expert technical data analyst for an agricultural machinery store. Your task is to extract key technical specifications for a product from a given webpage.

  Analyze the content of the webpage at the URL provided. Identify and extract only the most important technical specifications (e.g., engine displacement, power, weight, dimensions, capacity).
  
  The output must be a valid JSON string where keys are the specification names in Vietnamese and values are their corresponding string values. Do not include marketing text. If you cannot find information on the page, do not include that field.

  Product Name: {{{name}}}
  Brand: {{{brand}}}
  Product Page URL: {{{url}}}
  `,
});

const generateProductSpecsFlow = ai.defineFlow(
  {
    name: 'generateProductSpecsFlow',
    inputSchema: GenerateProductSpecsInputSchema,
    outputSchema: GenerateProductSpecsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
