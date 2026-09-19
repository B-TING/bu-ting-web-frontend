import type { routing } from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];

export const SITE_URL = 'https://buting.store';
export const SITE_NAME = 'B-ting';
export const SITE_ALT_NAME = '부팅';

interface LocaleSeoCopy {
  title: string;
  description: string;
  keywords: string[];
}

export const LOCALE_SEO_COPY: Record<Locale, LocaleSeoCopy> = {
  ko: {
    title: '부팅(B-ting) | 부산 여행 플래너',
    description:
      '해운대, 광안리 등 부산 인기 명소와 축제 정보를 확인하고 취향에 맞는 부산 여행 일정을 AI로 계획해 보세요. 캐리어 보관까지 한 번에 준비하는 부산 여행 플래너, 부팅.',
    keywords: [
      '부산',
      '부산여행',
      '부팅',
      '광안리',
      '해운대',
      '부산 여행 코스',
      '부산 일정 짜기',
      'AI 여행 플래너',
      '부산 축제',
    ],
  },
  en: {
    title: 'B-ting | Busan Trip Planner',
    description:
      'Plan a Busan trip tailored to your taste with AI, and prep places, festivals, and luggage storage in one place.',
    keywords: ['Busan travel', 'Busan itinerary', 'AI trip planner', 'Busan festivals'],
  },
  zh: {
    title: 'B-ting | 釜山旅行规划',
    description: '用 AI 规划符合喜好的釜山旅行行程，一站式准备景点、节庆信息与行李寄存。',
    keywords: ['釜山旅游', '釜山行程', 'AI旅行规划', '釜山节庆'],
  },
  ja: {
    title: 'B-ting | 釜山旅行プランナー',
    description:
      'AIが好みに合わせた釜山旅行の日程を作成。観光地・祭り情報からキャリー保管まで一度に準備。',
    keywords: ['釜山旅行', '釜山旅行プラン', 'AI旅行プランナー', '釜山祭り'],
  },
};

export const OG_LOCALE_MAP: Record<Locale, string> = {
  ko: 'ko_KR',
  en: 'en_US',
  zh: 'zh_CN',
  ja: 'ja_JP',
};
