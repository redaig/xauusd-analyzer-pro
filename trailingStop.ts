// ============================================================
// TRAILING STOP DYNAMIQUE
// Ajuste le SL en fonction du mouvement du prix
// Lock des profits a 50%, 75%, 100% du TP
// ============================================================

export interface TrailingStopConfig {
  activationPercent: number;  // % du TP pour activer le trailing
  trailingDistance: number;   // Distance ATR multiplier
  breakevenPercent: number;   // % pour mettre le SL au BE
}

export interface TrailingStopState {
  originalSL: number;
  currentSL: number;
  highestPrice: number;       // Pour LONG: prix max atteint
  lowestPrice: number;        // Pour SHORT: prix min atteint
  isActive: boolean;
  lockedProfit: number;       // % de profit verrouille
  moveCount: number;
}

// Configuration par defaut
export const DEFAULT_TRAILING_CONFIG: TrailingStopConfig = {
  activationPercent: 30,   // Active le trailing a 30% du TP
  trailingDistance: 1.5,   // Distance de 1.5 ATR
  breakevenPercent: 20,    // Met le SL au BE a 20% du TP
};

// Initialiser le trailing stop
export function initTrailingStop(
  entry: number,
  originalSL: number,
  direction: 'long' | 'short'
): TrailingStopState {
  return {
    originalSL,
    currentSL: originalSL,
    highestPrice: direction === 'long' ? entry : Infinity,
    lowestPrice: direction === 'short' ? entry : Infinity,
    isActive: false,
    lockedProfit: 0,
    moveCount: 0,
  };
}

// Mettre a jour le trailing stop
export function updateTrailingStop(
  state: TrailingStopState,
  currentPrice: number,
  entry: number,
  tp: number,
  atr: number,
  direction: 'long' | 'short',
  config: TrailingStopConfig = DEFAULT_TRAILING_CONFIG
): TrailingStopState {
  const newState = { ...state };
  
  // Calculer la progression vers le TP
  const tpDistance = Math.abs(tp - entry);
  const currentProgress = direction === 'long' 
    ? Math.abs(currentPrice - entry) 
    : Math.abs(entry - currentPrice);
  const progressPercent = tpDistance > 0 ? (currentProgress / tpDistance) * 100 : 0;
  
  // Mettre a jour le prix extreme
  if (direction === 'long') {
    if (currentPrice > newState.highestPrice) {
      newState.highestPrice = currentPrice;
    }
  } else {
    if (currentPrice < newState.lowestPrice) {
      newState.lowestPrice = currentPrice;
    }
  }
  
  // 1. Breakeven: a 20% du TP, mettre le SL au prix d'entree
  if (progressPercent >= config.breakevenPercent && newState.lockedProfit < 1) {
    newState.currentSL = entry;
    newState.lockedProfit = 1;
  }
  
  // 2. Activation du trailing a 30% du TP
  if (progressPercent >= config.activationPercent) {
    newState.isActive = true;
    
    const trailingDist = atr * config.trailingDistance;
    
    if (direction === 'long') {
      // Pour LONG: le SL monte avec le prix max - distance de trailing
      const proposedSL = newState.highestPrice - trailingDist;
      if (proposedSL > newState.currentSL) {
        newState.currentSL = proposedSL;
        newState.moveCount += 1;
      }
    } else {
      // Pour SHORT: le SL descend avec le prix min + distance de trailing
      const proposedSL = newState.lowestPrice + trailingDist;
      if (proposedSL < newState.currentSL || newState.currentSL === state.originalSL) {
        newState.currentSL = proposedSL;
        newState.moveCount += 1;
      }
    }
    
    // Calculer le profit verrouille
    const slImprovement = direction === 'long'
      ? Math.abs(newState.currentSL - newState.originalSL)
      : Math.abs(newState.originalSL - newState.currentSL);
    const maxPossible = Math.abs(tp - entry);
    newState.lockedProfit = maxPossible > 0 ? (slImprovement / maxPossible) * 100 : 0;
  }
  
  return newState;
}

// Verifier si le trailing stop a ete touche
export function isTrailingStopHit(
  state: TrailingStopState,
  currentPrice: number,
  direction: 'long' | 'short'
): boolean {
  void direction; // used in logic below
  if (direction === 'long') {
    return currentPrice <= state.currentSL;
  }
  return currentPrice >= state.currentSL;
}

// Formater le status du trailing stop
export function formatTrailingStatus(state: TrailingStopState, _direction: 'long' | 'short'): string {
  void _direction;
  if (!state.isActive && state.lockedProfit === 0) {
    return `Trailing: En attente (activation a 30% du TP)`;
  }
  if (state.lockedProfit === 1 && !state.isActive) {
    return `Trailing: SL au BreakEven ✓`;
  }
  if (state.isActive) {
    return `Trailing: ACTIF | SL: $${state.currentSL.toFixed(2)} | Profit verrouille: ${state.lockedProfit.toFixed(0)}% | Moves: ${state.moveCount}`;
  }
  return `Trailing: Inactif`;
}
