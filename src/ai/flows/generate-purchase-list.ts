'use server';

/**
 * @fileOverview A purchase list generator AI agent.
 *
 * - generatePurchaseList - A function that generates a purchase list based on stock levels and predicted depletion.
 * - GeneratePurchaseListInput - The input type for the generatePurchaseList function.
 * - GeneratePurchaseListOutput - The return type for the generatePurchaseList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePurchaseListInputSchema = z.object({
  ingredients: z
    .array(
      z.object({
        name: z.string().describe('The name of the ingredient.'),
        stock: z.number().describe('The current stock quantity of the ingredient.'),
        unit: z.string().describe('The measurement unit for the ingredient (e.g., g, ml, units).'),
        reorderPoint: z
          .number()
          .describe('The stock level at which a reorder should be triggered.'),
      })
    )
    .describe('A list of ingredients with their stock levels, units, and reorder points.'),
  salesData: z
    .string()
    .describe('A JSON string of recent sales data (recipe name and quantity sold) to help estimate consumption.'),
});
export type GeneratePurchaseListInput = z.infer<typeof GeneratePurchaseListInputSchema>;

const GeneratePurchaseListOutputSchema = z.object({
  purchaseList: z
    .array(
      z.object({
        ingredientName: z.string().describe('The name of the ingredient to purchase.'),
        quantityToBuy: z.number().describe('The suggested quantity of the ingredient to purchase.'),
        reason: z.string().describe('A brief reason for why this ingredient and quantity are being suggested.'),
      })
    )
    .describe('A list of ingredients to purchase with quantities and reasons.'),
});
export type GeneratePurchaseListOutput = z.infer<typeof GeneratePurchaseListOutputSchema>;

export async function generatePurchaseList(
  input: GeneratePurchaseListInput
): Promise<GeneratePurchaseListOutput> {
  return generatePurchaseListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePurchaseListPrompt',
  input: {schema: GeneratePurchaseListInputSchema},
  output: {schema: GeneratePurchaseListOutputSchema},
  prompt: `You are an expert purchasing assistant for a bakery. Your task is to generate a smart purchase list.

Analyze the provided data:
1.  Current ingredient stock levels.
2.  The reorder point for each ingredient.
3.  Recent sales data to understand consumption trends.

Your goal is to create a purchase list that ensures the bakery never runs out of key ingredients.

Follow these rules:
- Only include an ingredient in the purchase list if its current stock is AT or BELOW its reorder point.
- The 'quantityToBuy' should be a sensible amount that brings the stock comfortably above the reorder point. A good rule of thumb is to buy enough for at least 7-14 days of average consumption, but don't overstock perishable items.
- The 'reason' should be concise, mentioning that the stock is low and justifying the suggested amount (e.g., "Stock bajo el punto de pedido. Compra para cubrir 1 semana de ventas.").
- If no ingredients need to be reordered, return an empty purchase list.
- Base your consumption estimates on the provided sales data.

Current Ingredients Data:
{{#each ingredients}}
- {{this.name}}: Stock: {{this.stock}} {{this.unit}}, Punto de Pedido: {{this.reorderPoint}} {{this.unit}}
{{/each}}

Recent Sales Data (JSON):
{{{salesData}}}

Generate the purchase list now.
`,
});

const generatePurchaseListFlow = ai.defineFlow(
  {
    name: 'generatePurchaseListFlow',
    inputSchema: GeneratePurchaseListInputSchema,
    outputSchema: GeneratePurchaseListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
