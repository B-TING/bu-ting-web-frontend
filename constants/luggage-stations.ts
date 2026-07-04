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
    pricing: [
      {
        dayType: 'weekday',
        rows: [
          { sizeType: '특대형', count: 2, price: 6000 },
          { sizeType: '대형', count: 4, price: 4500 },
          { sizeType: '소형', count: 10, price: 2500 },
        ],
      },
      {
        dayType: 'weekend',
        rows: [
          { sizeType: '특대형', count: 2, price: 6000 },
          { sizeType: '대형', count: 4, price: 4500 },
          { sizeType: '소형', count: 10, price: 2500 },
        ],
      },
    ],
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
    pricing: [
      {
        dayType: 'weekday',
        rows: [
          { sizeType: '특대형', count: 3, price: 6000 },
          { sizeType: '대형', count: 8, price: 4500 },
          { sizeType: '소형', count: 13, price: 2500 },
        ],
      },
      {
        dayType: 'weekend',
        rows: [
          { sizeType: '특대형', count: 3, price: 6000 },
          { sizeType: '대형', count: 8, price: 4500 },
          { sizeType: '소형', count: 13, price: 2500 },
        ],
      },
    ],
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
    pricing: [
      {
        dayType: 'weekday',
        rows: [
          { sizeType: '특대형', count: 2, price: 6000 },
          { sizeType: '대형', count: 6, price: 4500 },
          { sizeType: '소형', count: 12, price: 2500 },
        ],
      },
      {
        dayType: 'weekend',
        rows: [
          { sizeType: '특대형', count: 2, price: 7000 },
          { sizeType: '대형', count: 6, price: 5000 },
          { sizeType: '소형', count: 12, price: 3000 },
        ],
      },
    ],
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
    pricing: [
      {
        dayType: 'weekday',
        rows: [
          { sizeType: '특대형', count: 4, price: 6000 },
          { sizeType: '대형', count: 10, price: 4500 },
          { sizeType: '소형', count: 16, price: 2500 },
        ],
      },
      {
        dayType: 'weekend',
        rows: [
          { sizeType: '특대형', count: 4, price: 6000 },
          { sizeType: '대형', count: 10, price: 4500 },
          { sizeType: '소형', count: 16, price: 2500 },
        ],
      },
    ],
  },
];
