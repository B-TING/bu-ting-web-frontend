import type { Metadata } from 'next';
import EventAdmin from './components/EventAdmin';

export const metadata: Metadata = {
  title: '구역 이벤트 운영 | B-TING',
  robots: { index: false, follow: false },
};

export default function EventAdminPage() {
  return <EventAdmin />;
}
