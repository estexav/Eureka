import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-ingredient-quantities.ts';
import '@/ai/flows/predict-stock-depletion.ts';
