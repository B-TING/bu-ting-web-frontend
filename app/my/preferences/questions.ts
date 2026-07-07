import type { PreferenceQuestionData } from '@/app/my/preferences/types';

export const PREFERENCE_QUESTIONS: PreferenceQuestionData[] = [
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
    description: '복수 선택 가능해요. 관심 있는 항목을 골라 주세요.',
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
