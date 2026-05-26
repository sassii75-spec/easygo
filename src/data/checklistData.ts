export interface ChecklistLink {
  label: string;
  url: string;
}

export interface ChecklistItem {
  id: string;
  category: 'D-30' | 'D-10' | 'D-3' | 'D-1' | '출발지' | '도착지';
  title: string;
  authority?: string;
  links?: ChecklistLink[];
}

export const CHECKLIST_DATA: ChecklistItem[] = [
  // -------- D-30 --------
  { id: 'd30-1', category: 'D-30', title: '이사, 청소 견적 확인 및 예약', authority: '이사 청소 업체', links: [{label: '이사비용 줄이는 꿀팁', url: '#'}] },
  { id: 'd30-2', category: 'D-30', title: '이사할 집 점검 및 하자 수리 의뢰', authority: '인테리어 업체, 관리사무소' },
  { id: 'd30-3', category: 'D-30', title: '필요없는 물건 정리', links: [{label: '방문 수거 예약하기', url: '#'}] },

  // -------- D-10 --------
  { id: 'd10-1', category: 'D-10', title: '통장 / 카드 / 우편물 주소 변경', authority: '금융기관 / 우체국', links: [{label: '주소변경 원클릭 서비스', url: 'https://www.kcredit.or.kr/customer/address/guide.do'}, {label: '우편물 주거이전 서비스', url: 'https://service.epost.go.kr/front.RetrieveAddressMoveInfo.postal'}] },
  { id: 'd10-2', category: 'D-10', title: '신문, 우유 등 정기 배달 중지 요청', authority: '각 보급소' },
  { id: 'd10-3', category: 'D-10', title: '전출 신고', authority: '관리사무소' },
  { id: 'd10-4', category: 'D-10', title: '이사 할 집 엘리베이터 사전 예약', authority: '관리사무소' },
  { id: 'd10-5', category: 'D-10', title: '사다리차 주차공간 예약', authority: '관리사무소' },
  { id: 'd10-6', category: 'D-10', title: '평수별 쓰레기 봉투 준비' },
  { id: 'd10-7', category: 'D-10', title: '집 열쇠, 리모컨 찾아두기' },
  { id: 'd10-8', category: 'D-10', title: '냉장고 천천히 비우기' },
  { id: 'd10-9', category: 'D-10', title: '폐가전 / 대형폐기물 수거예약 및 신고', authority: '주민센터' },
  { id: 'd10-10', category: 'D-10', title: '이사할 집에서 사용할 물건 주문 및 확인 (도배, 장판 포함)', authority: '인테리어 업체' },
  { id: 'd10-11', category: 'D-10', title: '가구 배치도 작성', authority: '인테리어 업체' },
  { id: 'd10-12', category: 'D-10', title: '인터넷, 정수기 이전 설치 예약', authority: '인터넷, 정수기 업체' },

  // -------- D-3 --------
  { id: 'd3-1', category: 'D-3', title: '도시가스 철거, 설치 신청', authority: '한국 도시가스 협회', links: [{label: '한국 도시가스협회', url: 'http://www.citygas.or.kr/'}] },
  { id: 'd3-2', category: 'D-3', title: '자동이체 해지 신청', authority: '각 영업소' },
  { id: 'd3-3', category: 'D-3', title: '세탁기 물빼기' },
  { id: 'd3-4', category: 'D-3', title: '이사 당일 사용할 물건 따로 포장' },
  { id: 'd3-5', category: 'D-3', title: '전세권 설정에 필요한 서류 준비', authority: '등기소' },

  // -------- D-1 --------
  { id: 'd1-1', category: 'D-1', title: '이사 일정 최종 확인', authority: '이사업체' },
  { id: 'd1-2', category: 'D-1', title: '이체 한도 증액', authority: '은행' },
  { id: 'd1-3', category: 'D-1', title: '주차공간 확보 확인', authority: '관리사무소' },
  { id: 'd1-4', category: 'D-1', title: '귀중품, 귀금속 별도 보관' },
  { id: 'd1-5', category: 'D-1', title: '이사 시작 전 가구, 가전 사진 촬영' },
  { id: 'd1-6', category: 'D-1', title: '잔금 결제 확인', authority: '부동산' },
  { id: 'd1-7', category: 'D-1', title: '입주 아파트일 경우 입주증 발급', authority: '관리사무소' },

  // -------- 출발지 --------
  { id: 'dday-dep-1', category: '출발지', title: '전기, 가스요금, 관리비 정산', authority: '관리사무소' },
  { id: 'dday-dep-2', category: '출발지', title: '장기수선충당금 환급 요청', authority: '관리사무소 / 집주인' },
  { id: 'dday-dep-3', category: '출발지', title: '이삿짐 반출 후, 잔여 이삿짐 체크' },
  { id: 'dday-dep-4', category: '출발지', title: '문단속 및 열쇠 반납', authority: '부동산' },

  // -------- 도착지 --------
  { id: 'dday-arr-1', category: '도착지', title: '이삿짐 분실, 파손 확인 후 비용 정산', authority: '이사업체' },
  { id: 'dday-arr-2', category: '도착지', title: '전화, 인터넷 TV 설치 후 개통', authority: '통신사, 대리점' },
  { id: 'dday-arr-3', category: '도착지', title: '도어락 비밀번호 변경' },
  { id: 'dday-arr-4', category: '도착지', title: '잔금 지급, 관리비, 중개료 정산, 열쇠 받기', authority: '부동산' },
  { id: 'dday-arr-5', category: '도착지', title: '전입신고 및 확정일자 받기', authority: '주민센터', links: [{label: '전입신고: 정부 24', url: 'https://www.gov.kr'}, {label: '확정일자: 대법원인터넷 등기소', url: 'http://www.iros.go.kr'}] },
  { id: 'dday-arr-6', category: '도착지', title: '전기, 수도 명의 변경', authority: '한전 고객센터' },
  { id: 'dday-arr-7', category: '도착지', title: '가스 설치', authority: '한국 도시가스 협회' },
  { id: 'dday-arr-8', category: '도착지', title: '주차증 발급 및 주차등록변경 신고', authority: '관리사무소' }
];
