// src/lib/moveMetricEngine.ts

// 이지고(EasyGo) 프로토타입용 모의(Mock) 계수
const ALPHA = 1.0; 
const BETA = 0.5;
const SECURITY_FACTOR = 1.15; // 85% 적재 효율 환산 계수

export interface Furniture {
  id: string;
  name: string;
  volumeCBM: number; // 부피 (Cubic Meter)
  disassemblyWeight: number; // Ci (조립/분해에 따른 부피 감소 가중치)
}

// Layer 1 가상 DB: 흔히 감지되는 표준 대형 가구
export const standardFurnitures: Furniture[] = [
  { id: 'f1', name: '4도어 양문형 냉장고', volumeCBM: 1.2, disassemblyWeight: 1.0 },
  { id: 'f2', name: '스탠드 에어컨', volumeCBM: 0.6, disassemblyWeight: 1.0 },
  { id: 'f3', name: '통돌이/드럼 세탁기', volumeCBM: 0.8, disassemblyWeight: 1.0 },
  { id: 'f4', name: '퀸사이즈 침대 (프레임 포함)', volumeCBM: 2.5, disassemblyWeight: 0.6 }, // 분해하면 부피가 60% 로 감소
  { id: 'f5', name: '책상', volumeCBM: 1.0, disassemblyWeight: 0.5 },
  { id: 'f6', name: '3인용 소파', volumeCBM: 1.8, disassemblyWeight: 1.0 },
];

export interface HouseParams {
  area: number; // S: 평수
  people: number; // P: 인원수
  durationYears: number; // K: 거주 기간(년)
}

export interface MoveQuote {
  workers: string;
  minPrice: number;
  maxPrice: number;
}

export interface CalculationResult {
  qValue: number;
  totalVolume: number;
  boxEstimate: number;
  truckTons: number;
  fullPack: MoveQuote;
  halfPack: MoveQuote;
}

/**
 * Move-Metric 통합 산출 함수 (사용자 입력 + AI 객체인식 혼합)
 */
export function calculateMoveMetric(params: HouseParams, detectedItems: Furniture[]): CalculationResult {
  // Layer 2: Parametric Estimation
  // 공식: Q = α * Σ(Vi * Ci) + β(S * P * K)
  
  let furnitureSum = 0;
  for (const f of detectedItems) {
    furnitureSum += f.volumeCBM * f.disassemblyWeight;
  }
  
  // (S * P * K) 조합으로 도출되는 기본 잔짐 부피. 보통 1박스가 0.1 CBM
  // 프로토타입임을 감안해 적당한 현실감을 주도록 비율 조정
  const baseBoxVolume = params.area * params.people * (params.durationYears * 0.5) * 0.05;
  const qValue = (ALPHA * furnitureSum) + (BETA * baseBoxVolume);

  // Layer 3: Bin Packing 최적화
  // 공식: V_total = Σ(V_item * SecurityFactor) + V_boxes
  let actualFurnitureVol = 0;
  for (const f of detectedItems) {
    actualFurnitureVol += (f.volumeCBM * SECURITY_FACTOR);
  }
  
  const vBoxes = baseBoxVolume * SECURITY_FACTOR; // 박스들 총 면적
  const totalVolume = actualFurnitureVol + vBoxes;
  const estimatedBoxesCounts = Math.round(vBoxes / 0.1); 

  // 실제 배차 및 비용 시뮬레이션
  let truckTons = 1;
  if (totalVolume <= 5) truckTons = 1;
  else if (totalVolume <= 12) truckTons = 2.5;
  else if (totalVolume <= 18) truckTons = 5;
  else if (totalVolume <= 24) truckTons = 7.5;
  else truckTons = 10;

  let fullPack: MoveQuote;
  let halfPack: MoveQuote;

  if (truckTons === 1) {
    fullPack = { workers: '작업자 1명', minPrice: 50, maxPrice: 60 };
    halfPack = { workers: '작업자 1명', minPrice: 30, maxPrice: 40 };
  } else if (truckTons === 2.5) {
    fullPack = { workers: '작업자 2명 + 주방여사님 1명', minPrice: 100, maxPrice: 110 };
    halfPack = { workers: '작업자 2명', minPrice: 80, maxPrice: 90 };
  } else if (truckTons === 5) {
    fullPack = { workers: '작업자 3명 + 주방여사님 1명', minPrice: 130, maxPrice: 150 };
    halfPack = { workers: '작업자 3명', minPrice: 110, maxPrice: 130 };
  } else if (truckTons === 7.5) {
    fullPack = { workers: '작업자 4명 + 주방여사님 1명', minPrice: 190, maxPrice: 210 };
    halfPack = { workers: '작업자 4명', minPrice: 170, maxPrice: 190 };
  } else {
    fullPack = { workers: '작업자 5명 + 주방여사님 2명', minPrice: 250, maxPrice: 270 };
    halfPack = { workers: '작업자 5명', minPrice: 210, maxPrice: 230 };
  }

  return {
    qValue: parseFloat(qValue.toFixed(2)),
    totalVolume: parseFloat(totalVolume.toFixed(2)),
    boxEstimate: estimatedBoxesCounts,
    truckTons,
    fullPack,
    halfPack
  };
}
