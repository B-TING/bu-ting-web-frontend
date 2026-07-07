import type { OnboardingQuestionId } from '@/types/onboarding';

export interface OnboardingOption {
  value: string;
  label: string;
}

export interface OnboardingQuestion {
  id: OnboardingQuestionId;
  title: string;
  description: string;
  multiple?: boolean;
  options: OnboardingOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'travelStyle',
    title: '여행 스타일은 어떤 편인가요?',
    description: '계획적인 편과 즉흥적인 편 중 선택해 주세요.',
    options: [
      { value: 'planned', label: '계획적인 편' },
      { value: 'spontaneous', label: '즉흥적인 편' },
    ],
  },
  {
    id: 'schedulePace',
    title: '일정은 어떻게 짜는 편인가요?',
    description: '여유롭게와 빡빡하게 중 선택해 주세요.',
    options: [
      { value: 'relaxed', label: '여유롭게' },
      { value: 'packed', label: '빡빡하게' },
    ],
  },
  {
    id: 'companions',
    title: '누구와 여행하나요?',
    description: '혼자와 함께 중 선택해 주세요.',
    options: [
      { value: 'solo', label: '혼자 여행' },
      { value: 'group', label: '함께 여행' },
    ],
  },
  {
    id: 'luggage',
    title: '짐은 어느 정도 챙기시나요?',
    description: '가볍게와 많이 챙김 중 선택해 주세요.',
    options: [
      { value: 'light', label: '가볍게' },
      { value: 'heavy', label: '많이 챙김' },
    ],
  },
  {
    id: 'purposes',
    title: '부산에서 가장 하고 싶은 것은?',
    description: '관심 있는 항목을 모두 선택해 주세요.',
    multiple: true,
    options: [
      { value: 'food', label: '음식' },
      { value: 'scenery', label: '풍경' },
      { value: 'culture', label: '문화체험' },
      { value: 'shopping', label: '쇼핑' },
      { value: 'nightlife', label: '나이트라이프' },
      { value: 'relaxation', label: '휴식' },
    ],
  },
  {
    id: 'busanFamiliarity',
    title: '부산에 대해 얼마나 아시나요?',
    description: '잘 모른다와 아는 편이다 중 선택해 주세요.',
    options: [
      { value: 'novice', label: '잘 모른다' },
      { value: 'familiar', label: '아는 편이다' },
    ],
  },
];

export const FEATURE_STEPS = [
  {
    title: '당신에게 맞는 기능',
    description: '여행 스타일에 따라 필요한 기능을 먼저 보여드려요.',
    cards: [
      ['calendar', '일정 플래너', '시간과 이동을 고려한 맞춤 일정을 만들어요.'],
      ['pin', '인근 장소 추천', '지금 위치 주변의 맛집과 명소를 찾아요.'],
    ],
  },
  {
    title: '원하는 일정 속도를 골라보세요',
    description: '선택한 속도는 일정의 장소 수와 이동 간격에 반영돼요.',
    cards: [
      ['navigation', '여유로운 코스', '휴식과 이동 시간을 넉넉하게 구성해요.'],
      ['calendar', '알찬 하루 코스', '하루에 더 많은 장소를 경험하도록 구성해요.'],
    ],
  },
  {
    title: '함께·혼자 여행에 유용한 기능',
    description: '여행 방식에 맞는 편의 기능을 준비했어요.',
    cards: [
      ['sync', '일정 동기화', '일행과 실시간으로 일정을 맞출 수 있어요.'],
      ['offline', '오프라인 모드', '데이터가 없어도 저장한 일정과 지도를 봐요.'],
    ],
  },
  {
    title: '짐에 맞는 편의 기능',
    description: '가볍게 다니도록 주변 편의시설을 안내해 드려요.',
    cards: [
      ['luggage', '짐 보관 안내', '역과 관광지 근처 보관소를 안내해요.'],
      ['building', '편의 시설 위치', '화장실과 약국 등 필요한 시설을 찾아요.'],
    ],
  },
  {
    title: '목적에 맞는 추천 기능',
    description: '선택한 관심사에 맞춘 부산 콘텐츠를 보여드려요.',
    cards: [
      ['food', '맛집 리스트', '취향에 맞는 부산 맛집을 모아볼 수 있어요.'],
      ['party', '축제·문화행사', '방문 시기에 맞는 문화 행사와 축제를 알려드려요.'],
    ],
  },
  {
    title: '부산 숙련도에 맞는 기능',
    description: '처음 방문해도, 익숙해도 알맞게 도와드려요.',
    cards: [
      ['navigation', 'GPS 인근 안내', '위치를 기반으로 주변 여행지를 설명해요.'],
      ['book', '여행기', '방문 기록과 팁을 다른 여행자와 공유해요.'],
    ],
  },
] as const;
