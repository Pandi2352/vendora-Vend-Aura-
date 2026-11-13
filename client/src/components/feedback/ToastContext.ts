import { createContext } from 'react';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

export interface ToastApi {
  show: (toast: Omit<ToastItem, 'id'>, durationMs?: number) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
