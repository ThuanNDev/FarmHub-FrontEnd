'use server';
/**
 * @fileOverview An AI agent for generating intelligent business reports.
 *
 * - generateReportInsights - A function that analyzes sales data and provides insights.
 * - GenerateReportInsightsInput - The input type for the generateReportInsights function.
 * - GenerateReportInsightsOutput - The return type for the generateReportInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductDataSchema = z.object({
  name: z.string(),
  quantity: z.number(),
});

const CustomerDataSchema = z.object({
  name: z.string(),
  total: z.number(),
});

const GenerateReportInsightsInputSchema = z.object({
  totalRevenue: z.number().describe('Total revenue for the period.'),
  totalOrders: z.number().describe('Total number of orders for the period.'),
  topSellingProducts: z.array(ProductDataSchema).describe('List of top-selling products.'),
  topCustomers: z.array(CustomerDataSchema).describe('List of top-spending customers.'),
});
export type GenerateReportInsightsInput = z.infer<typeof GenerateReportInsightsInputSchema>;

const GenerateReportInsightsOutputSchema = z.object({
  insights: z.string().describe('The report insights in Vietnamese Markdown format.'),
});
export type GenerateReportInsightsOutput = z.infer<typeof GenerateReportInsightsOutputSchema>;

export async function generateReportInsights(input: GenerateReportInsightsInput): Promise<GenerateReportInsightsOutput> {
  return generateReportInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportInsightsPrompt',
  input: { schema: GenerateReportInsightsInputSchema },
  output: { schema: GenerateReportInsightsOutputSchema },
  prompt: `You are a business analyst for an agricultural machinery store. Based on the following sales data for a specific period, generate a concise and insightful report in **Vietnamese** using **Markdown** formatting.

The report should:
1.  Provide a brief, high-level summary of the business performance.
2.  Highlight key achievements (e.g., strong revenue, a particularly successful product).
3.  Identify potential opportunities or areas for attention (e.g., a customer who buys a lot, a product that is not selling well if it appears in the top list with low quantity).
4.  Offer 1-2 actionable recommendations.

Keep the tone professional and data-driven.

**Sales Data:**
- **Tổng doanh thu:** {{{totalRevenue}}} VND
- **Tổng số đơn hàng:** {{{totalOrders}}}
- **Sản phẩm bán chạy nhất:** 
{{#each topSellingProducts}}
  - {{name}}: {{quantity}}
{{/each}}
- **Khách hàng chi tiêu nhiều nhất:**
{{#each topCustomers}}
  - {{name}}: {{total}} VND
{{/each}}
`,
});

const generateReportInsightsFlow = ai.defineFlow(
  {
    name: 'generateReportInsightsFlow',
    inputSchema: GenerateReportInsightsInputSchema,
    outputSchema: GenerateReportInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
