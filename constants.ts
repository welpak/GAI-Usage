import { ModelInfo, PlanType } from './types';

export const APP_NAME = "QUOTA OS";

export const MODELS: ModelInfo[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Fast, cost-efficient multimodal',
    rpmFree: 15,
    rpmPay: 1000,
    tpmFree: 1000000,
    tpmPay: 4000000,
    rpdFree: 1500,
    rpdPay: -1, // Unlimited
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3.0 Pro',
    description: 'Complex reasoning & coding',
    rpmFree: 2,
    rpmPay: 360,
    tpmFree: 32000,
    tpmPay: 2000000,
    rpdFree: 50,
    rpdPay: -1,
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Image',
    description: 'Image generation & editing',
    rpmFree: 15,
    rpmPay: 1000,
    tpmFree: 1000000, // Approximate equivalent
    tpmPay: 4000000,
    rpdFree: 1500,
    rpdPay: -1,
  }
];

// Placeholder for simulated initial data
export const INITIAL_LATENCY_DATA = Array.from({ length: 20 }, (_, i) => ({
  timestamp: Date.now() - (20 - i) * 5000,
  latency: 100 + Math.random() * 200,
  modelId: 'gemini-2.5-flash'
}));
