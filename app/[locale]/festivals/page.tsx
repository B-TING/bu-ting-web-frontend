import { FestivalCalendar } from '@/app/[locale]/festivals/components/festival-calendar';
import {
  getAdjacentMonth,
  getFestivals,
  getMonthLabel,
  getMonthParam,
} from '@/lib/festival';

interface FestivalsPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function FestivalsPage({ searchParams }: FestivalsPageProps) {
  const { month } = await searchParams;
  const festivals = await getFestivals(month);
  const currentMonth = month ?? getMonthParam(new Date());

  return (
    <FestivalCalendar
      festivals={festivals}
      monthLabel={getMonthLabel(currentMonth)}
      previousMonth={getAdjacentMonth(currentMonth, -1)}
      nextMonth={getAdjacentMonth(currentMonth, 1)}
    />
  );
}
