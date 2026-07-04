import type { LuggageStation } from '@/types/luggage';

export const MOCK_LUGGAGE_STATIONS: LuggageStation[] = [
  {
    id: 'juryeo',
    name: '주례',
    lineLabel: '2호선',
    totalLockers: 16,
    detailLocation: '(B1) 1,3번 출입구 방향',
    operator: '(주)테크앤롤',
    lat: 35.1799,
    lng: 128.9974,
  },
  {
    id: 'seomyeon',
    name: '서면',
    lineLabel: '1호선·2호선',
    totalLockers: 24,
    detailLocation: '(B1) 5번 출입구 방향',
    operator: '(주)테크앤롤',
    lat: 35.1577,
    lng: 129.0594,
  },
  {
    id: 'haeundae',
    name: '해운대',
    lineLabel: '2호선',
    totalLockers: 20,
    detailLocation: '(지상) 3번 출입구 방향',
    operator: '(주)테크앤롤',
    lat: 35.1631,
    lng: 129.1632,
  },
  {
    id: 'busan-station',
    name: '부산역',
    lineLabel: '1호선',
    totalLockers: 30,
    detailLocation: '(B1) 대합실 내',
    operator: '(주)테크앤롤',
    lat: 35.1152,
    lng: 129.0414,
  },
];
