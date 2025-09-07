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
        depletionRate: z
          .number()
          .describe('The predicted daily depletion rate of the ingredient.'),
        reorderPoint: z
          .number()
          .describe('The stock level at which a reorder should be triggered.'),
      })
    )
    .describe('A list of ingredients with their stock levels, depletion rates, and reorder points.'),
  salesData: z
    .string()
    .describe('Historical sales data to use for calculating depletion rates.'),
});
export type GeneratePurchaseListInput = z.infer<typeof GeneratePurchaseListInputSchema>;

const GeneratePurchaseListOutputSchema = z.object({
  purchaseList: z
    .array(
      z.object({
        ingredientName: z.string().describe('The name of the ingredient to purchase.'),
        quantity: z.number().describe('The quantity of the ingredient to purchase.'),
        reason: z.string().describe('The reason for including the ingredient in the list'),
      })
    )
    .describe('A list of ingredients to purchase with quantities.'),
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
  prompt: `You are a purchasing assistant for a bakery. Based on the current stock levels, predicted depletion rates, and reorder points of the following ingredients, generate a purchase list of ingredients to order.

Historical Sales Data: {{{salesData}}}

Ingredients:
{{#each ingredients}}
- Name: {{this.name}}, Stock: {{this.stock}}, Depletion Rate: {{this.depletionRate}}, Reorder Point: {{this.reorderPoint}}
{{/each}}

Consider the following when determining the quantity to order:
- Order enough to bring the stock level up to a reasonable level above the reorder point.
- Account for any upcoming events or promotions that may increase demand.
- Do not recommend purchasing items that are already above their reorder point, unless there is a specific reason.

Output the purchase list as a JSON object with an array of ingredients to purchase. For each ingredient, include the ingredient name, the quantity to purchase, and a brief reason for including it in the list.
`,  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
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
