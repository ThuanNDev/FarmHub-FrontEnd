'use server';
/**
 * @fileOverview An AI agent for sales forecasting.
 *
 * - forecastSales - A function that predicts future sales based on historical data.
 * - ForecastSalesInput - The input type for the forecastSales function.
 * - ForecastSalesOutput - The return type for the forecastSales function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ForecastSalesInputSchema = z.object({
  historicalData: z.string().describe('A JSON string representing historical product sales. Example: \'[{"productName":"Máy cưa xích","totalQuantity":10},{"productName":"Dây cước","totalQuantity":50}]\''),
  timePeriod: z.string().describe('The time period for which the historical data is provided, e.g., "last 30 days".'),
});
export type ForecastSalesInput = z.infer<typeof ForecastSalesInputSchema>;

const ForecastSalesOutputSchema = z.object({
  forecast: z.array(z.object({
    productName: z.string().describe('The name of the product.'),
    predictedSales: z.number().describe('The predicted sales quantity for the next month.'),
  })).describe('An array of sales forecasts for each product.'),
  summary: z.string().describe('A brief, actionable summary of the forecast in Vietnamese.'),
});
export type ForecastSalesOutput = z.infer<typeof ForecastSalesOutputSchema>;

export async function forecastSales(input: ForecastSalesInput): Promise<ForecastSalesOutput> {
  return forecastSalesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastSalesPrompt',
  input: { schema: ForecastSalesInputSchema },
  output: { schema: ForecastSalesOutputSchema },
  prompt: `You are a data analyst specializing in retail sales forecasting for an agricultural store.
  
  Based on the following historical sales data for the {{timePeriod}}, predict the sales quantity for each product for the **next month**. Also, provide a brief, actionable summary in Vietnamese highlighting any trends or important points.

  Keep the summary concise (2-3 sentences). The forecast should be realistic, considering potential seasonality in agricultural products.

  Historical Data: {{{historicalData}}}
  `,
});

const forecastSalesFlow = ai.defineFlow(
  {
    name: 'forecastSalesFlow',
    inputSchema: ForecastSalesInputSchema,
    outputSchema: ForecastSalesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
