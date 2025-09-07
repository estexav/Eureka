'use server';
/**
 * @fileOverview Predicts stock depletion of ingredients based on past sales data and a set of rules.
 *
 * - predictStockDepletion - A function that handles the stock depletion prediction process.
 * - PredictStockDepletionInput - The input type for the predictStockDepletion function.
 * - PredictStockDepletionOutput - The return type for the predictStockDepletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictStockDepletionInputSchema = z.object({
  salesData: z
    .string()
    .describe(
      'A string containing sales data. Should be in JSON format with the keys being recipe names and values being the units sold.'
    ),
  recipes: z
    .string()
    .describe(
      'A string containing the recipes. Should be in JSON format with the keys being the recipe names and values being the ingredients with units required.'
    ),
  currentStock: z
    .string()
    .describe(
      'A string containing the current stock levels of ingredients. Should be in JSON format with the keys being the ingredient names and values being the units in stock.'
    ),
});
export type PredictStockDepletionInput = z.infer<typeof PredictStockDepletionInputSchema>;

const PredictStockDepletionOutputSchema = z.object({
  ingredientDepletionEstimates: z
    .string()
    .describe(
      'JSON formatted string, each key represents an ingredient name, and its value is the estimated days until depletion.'
    ),
  purchaseList: z
    .string()
    .describe(
      'JSON formatted string, a list of ingredients to purchase, including quantity. Keys are ingredient names, values are amounts to purchase.'
    ),
  lowStockIngredients: z
    .string()
    .describe(
      'JSON formatted string, a list of ingredients that are running low. Keys are ingredient names, values are the units left.'
    ),
  suggestedIngredientQuantities: z
    .string()
    .describe(
      'JSON formatted string, suggested ingredient quantities for future recipes. Keys are ingredient names, values are suggested amounts to use in recipes.'
    ),
});

export type PredictStockDepletionOutput = z.infer<typeof PredictStockDepletionOutputSchema>;

export async function predictStockDepletion(
  input: PredictStockDepletionInput
): Promise<PredictStockDepletionOutput> {
  return predictStockDepletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictStockDepletionPrompt',
  input: {schema: PredictStockDepletionInputSchema},
  output: {schema: PredictStockDepletionOutputSchema},
  prompt: `You are an AI assistant helping a bakery manage its stock levels.

  Analyze the provided sales data, recipes, and current stock levels to predict when ingredients will run out. Provide a purchase list, identify low stock ingredients, and suggest ingredient quantities for future recipes.

  Sales Data: {{{salesData}}}
  Recipes: {{{recipes}}}
  Current Stock: {{{currentStock}}}

  Based on this data, generate the following information in JSON format:

  1.  ingredientDepletionEstimates: Estimate how many days until each ingredient runs out. (Keys: ingredient names, Values: days until depletion)
  2.  purchaseList: List of ingredients to purchase, including quantity. (Keys: ingredient names, Values: amount to purchase)
  3.  lowStockIngredients: List of ingredients that are running low, including the quantity left.  (Keys: ingredient names, Values: amount remaining)
  4.  suggestedIngredientQuantities: Suggested ingredient quantities for future recipes. (Keys: ingredient names, Values: suggested amounts)
  Make sure all the data is returned as valid JSON.
  `,
});

const predictStockDepletionFlow = ai.defineFlow(
  {
    name: 'predictStockDepletionFlow',
    inputSchema: PredictStockDepletionInputSchema,
    outputSchema: PredictStockDepletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
