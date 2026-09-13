import HeroSection from '@/components/landing/HeroSection';
import ScheduleShowcaseSection from '@/components/landing/ScheduleShowcaseSection';
import CommunitySection from '@/components/landing/CommunitySection';
import ChatFeedSection from '@/components/landing/ChatFeedSection';
import FestivalCalendarSection from '@/components/landing/FestivalCalendarSection';

export default function Landing() {
  return (
    <div className="flex w-full flex-col">
      <HeroSection />
      <ScheduleShowcaseSection />
      <CommunitySection />
      <ChatFeedSection />
      <FestivalCalendarSection />
    </div>
  );
}
