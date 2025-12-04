export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  rpmFree: number;
  rpmPay: number;
  tpmFree: number;
  tpmPay: number;
  rpdFree: number;
  rpdPay: number;
}

export interface LatencyPoint {
  timestamp: number;
  latency: number; // in ms
  modelId: string;
}

export enum PlanType {
  FREE = 'Free',
  PAID = 'Paid',
}

export interface HealthStatus {
  status: 'online' | 'degraded' | 'offline' | 'checking';
  lastCheck: number;
  message?: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}