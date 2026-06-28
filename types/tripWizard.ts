export type CompanionType = '혼자' | '가족' | '애인·연인' | '친구' | '동료';
export type TravelStyle =
  | '문화·역사'
  | '자연·힐링'
  | '미식·맛집'
  | '쇼핑'
  | '액티비티'
  | '사진·인스타'
  | '야경·나이트';
export type TravelConstraint =
  | '짐이 많음'
  | '짐이 적음'
  | '애완동물 동반'
  | '유모차'
  | '휠체어·접근성'
  | '식단·알레르기'
  | '없음';
export type Attraction =
  | '감천문화마을'
  | '해운대 해수욕장'
  | '광안리'
  | '태종대'
  | '자갈치시장'
  | '해동용궁사'
  | '송정 해수욕장'
  | '황령산 봉수대'
  | '용두산 공원'
  | '범어사'
  | '영도 절영로'
  | '부산현대미술관';
export type FoodPreference =
  | '밀면'
  | '돼지국밥'
  | '해물탕·회'
  | '어묵·부산 간식'
  | '팥빙수·디저트'
  | '치맥·야식';
export type AccommodationStatus = 'booked' | 'candidate';
export type AccommodationRegion =
  | '해운대·마린시티'
  | '서면·부전'
  | '남포·중구'
  | '광안리'
  | '영도';
export type GenerationMethod = 'ai' | 'manual';

export interface TripWizardData {
  startDate: string;
  endDate: string;
  headCount: number;
  companionTypes: CompanionType[];
  travelStyles: TravelStyle[];
  constraints: TravelConstraint[];
  attractions: Attraction[];
  foods: FoodPreference[];
  accommodationStatus: AccommodationStatus | null;
  accommodationRegions: AccommodationRegion[];
  generationMethod: GenerationMethod | null;
}
