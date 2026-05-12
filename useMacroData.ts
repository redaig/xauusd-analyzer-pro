// ============================================================
// HOOK: Donnees Macro FRED en temps reel
// Fetch toutes les 5 minutes
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { fetchRealMacroData, analyzeImpact, calculateMacroBias } from '@/services/fredApi';
import type { RealMacroData, ImpactAnalysis } from '@/services/fredApi';

interface MacroState {
  data: RealMacroData | null;
  impacts: ImpactAnalysis[];
  bias: { bias: 'bullish' | 'bearish' | 'neutral'; score: number; strength: number };
  isLoading: boolean;
  error: string | null;
  lastFetch: number;
}

export function useMacroData(): MacroState & { refresh: () => void } {
  const [state, setState] = useState<MacroState>({
    data: null,
    impacts: [],
    bias: { bias: 'neutral', score: 50, strength: 0 },
    isLoading: true,
    error: null,
    lastFetch: 0,
  });

  const fetchData = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await fetchRealMacroData();
      if (!data) {
        setState(s => ({ ...s, isLoading: false, error: 'Failed to fetch FRED data', lastFetch: Date.now() }));
        return;
      }

      const impacts = analyzeImpact(data);
      const bias = calculateMacroBias(impacts);

      setState({
        data,
        impacts,
        bias,
        isLoading: false,
        error: null,
        lastFetch: Date.now(),
      });
    } catch (err) {
      setState(s => ({ ...s, isLoading: false, error: String(err), lastFetch: Date.now() }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 300000); // 5 minutes
    return () => clearInterval(timer);
  }, [fetchData]);

  return { ...state, refresh: fetchData };
}
