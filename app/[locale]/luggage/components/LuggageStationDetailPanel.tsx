import { cn } from '@/lib/utils';
import type { LuggagePricingTable, LuggageStation } from '@/types/luggage';

interface LuggageStationDetailPanelProps {
  station: LuggageStation;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
}

const PRICING_DAY_LABEL: Record<LuggagePricingTable['dayType'], string> = {
  weekday: '평일',
  weekend: '주말',
};

export function LuggageStationDetailPanel({
  station,
  isFavorite,
  onToggleFavorite,
  onBack,
}: LuggageStationDetailPanelProps) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-bold text-gray-900">{station.name}</h2>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
            {station.lineLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={cn(
            'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
            isFavorite
              ? 'border-yellow-300 bg-yellow-50 text-yellow-600'
              : 'border-gray-200 text-gray-500 hover:border-gray-300',
          )}
        >
          <span>{isFavorite ? '★' : '☆'}</span>
          북마크
        </button>
      </div>

      <div className="flex-1 p-4">
        <p className="text-sm text-gray-600">총 보관함: {station.totalLockers}</p>

        <div className="mt-3 space-y-1">
          <p className="text-sm text-gray-600">
            <span className="text-gray-400">상세 위치</span> {station.detailLocation}
          </p>
          <p className="text-sm text-gray-600">
            <span className="text-gray-400">운영</span> {station.operator}
          </p>
        </div>

        <h3 className="mt-5 mb-2 text-sm font-semibold text-gray-900">이용 요금</h3>
        <div className="space-y-3">
          {station.pricing.map((table) => (
            <div key={table.dayType} className="rounded-xl bg-blue-50/60 p-3">
              <p className="mb-2 text-xs font-semibold text-blue-600">
                {PRICING_DAY_LABEL[table.dayType]}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400">
                    <th className="pb-1.5 text-left font-medium">종류</th>
                    <th className="pb-1.5 text-left font-medium">개수</th>
                    <th className="pb-1.5 text-right font-medium">가격</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => (
                    <tr key={row.sizeType} className="text-gray-700">
                      <td className="py-1">{row.sizeType}</td>
                      <td className="py-1">{row.count}</td>
                      <td className="py-1 text-right">{row.price.toLocaleString()}원</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
