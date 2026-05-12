// ============================================================
// ANALYSE 24/7 AUTONOME
// Analyse complete toutes les 30 secondes
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import type { AnalysisReport, PriceQuote } from '@/types';
import { fetchXAUUSDData, getSessionInfo } from '@/services/marketData';
import { runTechnicalAnalysis } from '@/services/technicalAnalysis';
import { getMacroSummary } from '@/services/macroAnalysis';
import { applyQualityFilters } from '@/services/qualityFilter';
import { updatePipeline } from '@/services/signalPipeline';
import type { QualitySignal } from '@/services/qualityFilter';
import type { PipelineSignal } from '@/services/signalPipeline';

const ANALYSIS_INTERVAL = 30000; // 30 secondes

function createDefaultReport(price: number): AnalysisReport {
  return {
    id: `report-${Date.now()}`,
    timestamp: Date.now(),
    currentPrice: price,
    dailyChange: -15.355,
    dailyChangePercent: -0.33,
    trend: 'neutral',
    trendStrength: 0,
    setups: [],
    indicators: {
      rsi: 50, macd: { macd: 0, signal: 0, histogram: 0 },
      bollingerBands: { upper: price + 10, middle: price, lower: price - 10 },
      ema20: price, ema50: price, ema200: price,
      atr: 5, stochastic: { k: 50, d: 50 },
      cci: 0, williamsR: 0, volumeSMA: 0,
    },
    keyLevels: { support: [], resistance: [] },
    recommendation: 'Analyse en cours...',
    riskLevel: 'low',
    next24hForecast: '',
    orderBlocks: [], fvgs: [], liquidityPools: [],
    marketStructure: { structure: '', signals: [] },
    keyLevelsDetailed: [],
  };
}

export function useAnalysis(priceQuote: PriceQuote) {
  const [report, setReport] = useState<AnalysisReport>(() => createDefaultReport(priceQuote.bid));
  const [sessionInfo] = useState(getSessionInfo());
  const [macroSummary, setMacroSummary] = useState<any>(null);
  const [confirmedSignals, setConfirmedSignals] = useState<PipelineSignal[]>([]);
  const [formingSignals, setFormingSignals] = useState<PipelineSignal[]>([]);
  const [swingPremiumSignals, setSwingPremiumSignals] = useState<PipelineSignal[]>([]);
  const [squeezeData, setSqueezeData] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState('Analyse toutes les 30s...');
  const [analysisCount, setAnalysisCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isRunningRef = useRef(false);
  const countRef = useRef(0);

  const runAnalysis = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setIsLoading(true);

    try {
      const macro = getMacroSummary();
      setMacroSummary(macro);

      const h1Data = fetchXAUUSDData('H1');

      if (h1Data.length >= 30) {
        const analysis = runTechnicalAnalysis(h1Data, priceQuote.bid);

        // Filtrage qualite
        const qualitySignals: QualitySignal[] = [];
        for (const setup of analysis.setups) {
          const { signal } = applyQualityFilters(setup, {
            currentPrice: priceQuote.bid,
            trend: analysis.trend,
            ema20: analysis.ema20,
            ema50: analysis.ema50,
            ema200: analysis.ema200,
            atr: analysis.atr,
            data: h1Data,
            macro: macro.score,
            hasBOS: analysis.marketStructure.signals.some((s: any) => s.type === 'BOS'),
            bosDirection: analysis.trend,
            volumeRatio: 1,
          });

          if (signal.quality.status === 'confirmed' && signal.quality.score >= 85) {
            qualitySignals.push(signal);
          }
        }

        // Pipeline
        const { confirmed, forming, swingPremium } = updatePipeline(qualitySignals);
        setConfirmedSignals(confirmed);
        setFormingSignals(forming);
        setSwingPremiumSignals(swingPremium);
        setSqueezeData(analysis.squeeze);

        const newCount = countRef.current + 1;
        countRef.current = newCount;
        setAnalysisCount(newCount);
        setStatusMsg(`Analyse #${newCount} | ${confirmed.length} signal${confirmed.length > 1 ? 's' : ''} | Prix: $${priceQuote.bid.toFixed(2)}`);

        setReport({
          id: `report-${Date.now()}`,
          timestamp: Date.now(),
          currentPrice: priceQuote.bid,
          dailyChange: priceQuote.change,
          dailyChangePercent: priceQuote.changePercent,
          trend: analysis.trend,
          trendStrength: analysis.trendStrength,
          setups: analysis.setups,
          indicators: {
            rsi: analysis.rsi,
            macd: analysis.macd,
            bollingerBands: analysis.bollinger,
            ema20: analysis.ema20,
            ema50: analysis.ema50,
            ema200: analysis.ema200,
            atr: analysis.atr,
            stochastic: analysis.stochastic,
            cci: analysis.cci,
            williamsR: analysis.williamsR,
            volumeSMA: analysis.volumeSMA,
          },
          keyLevels: {
            support: analysis.keyLevels.support.slice(0, 5).map((k: any) => k.price),
            resistance: analysis.keyLevels.resistance.slice(0, 5).map((k: any) => k.price),
          },
          recommendation: analysis.recommendation,
          riskLevel: analysis.riskLevel,
          next24hForecast: analysis.forecast,
          orderBlocks: analysis.orderBlocks,
          fvgs: analysis.fvgs,
          liquidityPools: analysis.liquidityPools,
          marketStructure: analysis.marketStructure,
          keyLevelsDetailed: analysis.keyLevelsDetailed,
        });
      }
    } catch (e) {
      console.error('Erreur analyse:', e);
      setStatusMsg('Erreur analyse — Retry');
    } finally {
      setIsLoading(false);
      isRunningRef.current = false;
    }
  }, [priceQuote.bid]);

  useEffect(() => {
    runAnalysis();
    const interval = setInterval(runAnalysis, ANALYSIS_INTERVAL);
    return () => clearInterval(interval);
  }, [runAnalysis]);

  return {
    report,
    sessionInfo,
    macroSummary,
    confirmedSignals,
    formingSignals,
    swingPremiumSignals,
    squeezeData,
    statusMsg,
    analysisCount,
    isLoading,
    runAnalysis,
  };
}
