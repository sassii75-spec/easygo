// MVP 기능 점검용 모의 거리 측정 및 요금 계산 엔진

/**
 * 15km 초과 시 10km당 3만 원 추가금 책정 (올림 처리)
 * 예: 15km = 0, 16km = 3만, 25km = 3만, 26km = 6만
 */
export function calculateDistanceCost(distanceKm: number): number {
    if (distanceKm <= 15) return 0;
    
    // 15km를 뺀 나머지 거리
    const extraDistance = distanceKm - 15;
    
    // 10km 단위로 몫 계산 (올림)
    const multiplier = Math.ceil(extraDistance / 10);
    
    return multiplier * 3; // 단위: 만 원
}

/**
 * MVP 시뮬레이션을 위해 주소 텍스트 기반으로 일관된 임의의 거리를 생성해주는 함수.
 * 실 환경에선 지도 Geo API로 대체됩니다.
 */
export function calculateMockDistance(fromAddress: string, toAddress: string): number {
    if (!fromAddress || !toAddress) return 0;
    
    const str = fromAddress + toAddress;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // 절대값 처리 후 대략 5km ~ 85km 사이 범위 지정
    const mockValue = Math.abs(hash) % 80 + 5;
    
    // 동일한 동(시/구/동)이 발견되면 거리를 낮춰줄 수도 있지만, 여기선 단순 난수만 적용
    return mockValue;
}
