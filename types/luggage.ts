export type LuggageSizeType = '특대형' | '대형' | '소형';

export type LuggagePricingDayType = 'weekday' | 'weekend';

export interface LuggagePricingRow {
  sizeType: LuggageSizeType;
  count: number;
  price: number;
}

export interface LuggagePricingTable {
  dayType: LuggagePricingDayType;
  rows: LuggagePricingRow[];
}

export interface LuggageStation {
  id: string;
  name: string;
  lineLabel: string;
  totalLockers: number;
  detailLocation: string;
  operator: string;
  lat: number;
  lng: number;
  pricing: LuggagePricingTable[];
}
