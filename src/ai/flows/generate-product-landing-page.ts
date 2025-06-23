'use server';
/**
 * @fileOverview An AI agent for generating a product landing page.
 *
 * - generateProductLandingPage - A function that handles the product landing page generation process.
 * - GenerateProductLandingPageInput - The input type for the function.
 * - GenerateProductLandingPageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductLandingPageInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  targetAudience: z.string().describe('The target audience for the product (e.g., "farmers", "gardeners").'),
  keyFeatures: z.array(z.string()).describe('A list of key features of the product.'),
  tone: z.enum(['professional', 'friendly', 'technical']).describe('The desired tone of the content.'),
});
export type GenerateProductLandingPageInput = z.infer<typeof GenerateProductLandingPageInputSchema>;

const GenerateProductLandingPageOutputSchema = z.object({
  headline: z.string().describe('A catchy, compelling headline for the landing page in Vietnamese.'),
  subheadline: z.string().describe('A brief, engaging subheadline that elaborates on the headline, in Vietnamese.'),
  introduction: z.string().describe('An introductory paragraph about the product, in Vietnamese.'),
  featuresSection: z.array(z.object({
    title: z.string().describe('The title of the feature.'),
    description: z.string().describe('A short description of the feature.'),
  })).describe('A list of key features with titles and descriptions, in Vietnamese.'),
  callToAction: z.string().describe('A strong call to action to encourage purchase or contact, in Vietnamese.'),
  imagePrompt: z.string().describe('A descriptive prompt for an image generation model to create a hero image for this product. E.g., "A powerful red chainsaw cutting through a log in a sunny forest."'),
});
export type GenerateProductLandingPageOutput = z.infer<typeof GenerateProductLandingPageOutputSchema>;

export async function generateProductLandingPage(input: GenerateProductLandingPageInput): Promise<GenerateProductLandingPageOutput> {
  return generateProductLandingPageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductLandingPagePrompt',
  input: { schema: GenerateProductLandingPageInputSchema },
  output: { schema: GenerateProductLandingPageOutputSchema },
  prompt: `You are a world-class marketing copywriter specializing in creating landing pages for agricultural and industrial machinery. Your task is to generate content for a product landing page in Vietnamese.

The tone should be {{tone}}.

The target audience is: {{targetAudience}}.

The product is: {{{productName}}}.

The key features are:
{{#each keyFeatures}}
- {{this}}
{{/each}}

Generate the following content sections based on the information provided. Ensure all text is in Vietnamese.
1.  **Headline:** A short, powerful, and attractive headline.
2.  **Subheadline:** A slightly longer sentence that supports the headline and adds more detail.
3.  **Introduction:** A short paragraph (2-3 sentences) that introduces the product and its main benefit.
4.  **Features Section:** For each key feature provided, create a title and a short, benefit-oriented description.
5.  **Call to Action:** A clear and persuasive call to action, like "Liên hệ ngay" or "Mua ngay hôm nay".
6.  **Image Prompt:** A descriptive prompt for a text-to-image AI to generate a compelling hero image for the product. The prompt should be in English.
`,
});

const generateProductLandingPageFlow = ai.defineFlow(
  {
    name: 'generateProductLandingPageFlow',
    inputSchema: GenerateProductLandingPageInputSchema,
    outputSchema: GenerateProductLandingPageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
