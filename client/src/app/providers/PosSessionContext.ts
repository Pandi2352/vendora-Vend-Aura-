import { createContext } from 'react';
import type { PosSessionValue } from './PosSessionProvider';

export const PosSessionContext = createContext<PosSessionValue | null>(null);
