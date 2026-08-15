// 한국관광공사 TourAPI detailIntro2 필드명 → 한글 라벨.
// 관광지/음식점/쇼핑/숙박 필드명은 실제 API 응답으로 확인한 값 기준으로 정리했고,
// 축제/숙박 일부 라벨은 백엔드에서 전달받은 매핑을 반영했다.
// 라벨이 없는 필드는 원문 API 키를 그대로 노출하지 않기 위해 상세 패널에서 숨긴다.
export const PLACE_DETAIL_TEXT_LABELS: Record<string, string> = {
  // 관광지 (12)
  infocenter: '문의처',
  restdate: '쉬는날',
  usetime: '이용 시간',
  parking: '주차 시설',
  chkbabycarriage: '유모차 대여',
  chkcreditcard: '신용카드',
  expguide: '체험 안내',
  expagerange: '체험 가능 연령',

  // 문화시설 (14)
  usefee: '이용 요금',
  usetimeculture: '이용 시간',
  restdateculture: '쉬는날',
  parkingculture: '주차 시설',
  discountinfo: '할인 정보',
  spendtime: '관람 소요 시간',
  accomcountculture: '수용 인원',

  // 축제공연행사 (15)
  festivalgrade: '축제 등급',
  eventstartdate: '행사 시작',
  eventenddate: '행사 종료',
  playtime: '관람 소요',
  usetimefestival: '행사 시간',
  discountinfofestival: '할인 정보',
  eventplace: '행사 장소',
  sponsor1: '주최자',
  sponsor1tel: '주최자 연락처',
  bookingplace: '예매처',
  program: '행사 프로그램',
  eventhomepage: '행사 홈페이지',

  // 여행코스 (25)
  distance: '코스 거리',
  taketime: '소요 시간',
  schedule: '일정',

  // 레포츠 (28)
  openperiod: '개장 기간',
  reservation: '예약 안내',
  usetimeleports: '이용 시간',
  usefeeleports: '이용 요금',
  parkingleports: '주차 시설',

  // 숙박 (32)
  roomcount: '객실 수',
  roomtype: '객실 유형',
  scalelodging: '규모',
  accomcountlodging: '수용 인원',
  chkcooking: '객실 내 취사',
  checkintime: '체크인',
  checkouttime: '체크아웃',
  parkinglodging: '주차',
  foodplace: '식음료장',
  reservationurl: '예약',
  uselodging: '이용 안내',
  subfacility: '부대시설',
  infocenterlodging: '문의처',
  reservationlodging: '예약 안내',
  refundregulation: '환불 규정',
  pickup: '픽업 서비스',

  // 쇼핑 (38)
  opentime: '영업 시간',
  restdateshopping: '쉬는날',
  infocentershopping: '문의처',
  parkingshopping: '주차 시설',
  shopguide: '매장 안내',
  saleitem: '판매 품목',
  restroom: '화장실',
  chkcreditcardshopping: '신용카드',

  // 음식점 (39)
  infocenterfood: '문의처',
  opentimefood: '영업 시간',
  restdatefood: '쉬는날',
  chkcreditcardfood: '신용카드',
  packing: '포장 가능',
  kidsfacility: '어린이 놀이방',
  parkingfood: '주차 시설',
  treatmenu: '취급 메뉴',
  firstmenu: '대표 메뉴',
  lcnsno: '인허가 번호',
};

// 숙박(32) 부대시설 여부 필드 — 값이 '1'일 때만 보유를 의미한다.
export const PLACE_DETAIL_AMENITY_LABELS: Record<string, string> = {
  seminar: '세미나실',
  beverage: '식음료장',
  sports: '스포츠시설',
  sauna: '사우나실',
  beauty: '뷰티시설',
  karaoke: '노래방',
  barbecue: '바비큐장',
  campfire: '캠프파이어',
  bicycle: '자전거 대여',
  fitness: '휘트니스센터',
  publicpc: '공용 PC실',
  publicbath: '공용 샤워실',
};

// 값이 '1'일 때만 보유를 의미하는 세계유산 지정 여부 필드.
const HERITAGE_LABELS: Record<string, string> = {
  heritage1: '세계문화유산',
  heritage2: '세계자연유산',
  heritage3: '세계기록유산',
};

export const PLACE_DETAIL_FLAG_LABELS: Record<string, string> = {
  ...PLACE_DETAIL_AMENITY_LABELS,
  ...HERITAGE_LABELS,
};

// 숙박 상세 필드를 보여줄 우선순위. 여기 없는 라벨링된 필드는 뒤에 이어 붙인다.
export const LODGING_FIELD_ORDER = [
  'roomcount',
  'roomtype',
  'scalelodging',
  'accomcountlodging',
  'chkcooking',
  'checkintime',
  'checkouttime',
  'parkinglodging',
  'pickup',
  'foodplace',
  'reservationurl',
  'reservationlodging',
  'uselodging',
  'subfacility',
  'refundregulation',
];

export function formatPlaceDetailValue(value: string) {
  return value.replace(/<br\s*\/?>/gi, '\n');
}

// 카테고리마다 문의 전화번호 필드명이 달라 우선순위대로 탐색한다.
const PHONE_FIELD_CANDIDATES = [
  'infocenter',
  'infocenterfood',
  'infocentershopping',
  'infocenterculture',
  'infocenterleports',
  'infocentertourcourse',
  'infocenterlodging',
  'sponsor1tel',
];

export interface PickedField {
  key: string;
  value: string;
}

function pickField(
  details: Record<string, string>,
  candidates: string[],
): PickedField | null {
  for (const key of candidates) {
    if (details[key]) return { key, value: details[key] };
  }
  return null;
}

export function pickPlacePhone(details: Record<string, string>) {
  return pickField(details, PHONE_FIELD_CANDIDATES);
}

const WEBSITE_FIELD_CANDIDATES = ['reservationurl', 'eventhomepage'];

export function pickPlaceWebsite(details: Record<string, string>) {
  return pickField(details, WEBSITE_FIELD_CANDIDATES);
}

// 카테고리마다 영업/이용 시간 필드명이 달라 우선순위대로 탐색한다.
const HOURS_FIELD_CANDIDATES = [
  'opentimefood',
  'opentime',
  'usetime',
  'usetimefestival',
  'usetimeculture',
  'usetimeleports',
];

export function pickPlaceHours(details: Record<string, string>) {
  return pickField(details, HOURS_FIELD_CANDIDATES);
}

export interface BusinessHoursStatus {
  isOpen: boolean;
  label: string;
}

// "07:00~19:00" 형태 문자열을 파싱해 현재 영업 상태를 계산한다.
// 파싱할 수 없는 형식이면 null을 반환하고, 이 경우 원문을 그대로 보여준다.
export function getBusinessHoursStatus(raw: string): BusinessHoursStatus | null {
  const match = raw.match(/(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  const endH = Number(match[3]);
  const endM = Number(match[4]);
  const endMinutes = endH * 60 + endM;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const isOpen =
    startMinutes <= endMinutes
      ? nowMinutes >= startMinutes && nowMinutes < endMinutes
      : nowMinutes >= startMinutes || nowMinutes < endMinutes; // 자정을 넘기는 영업시간

  const endLabel = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  return {
    isOpen,
    label: isOpen ? `영업 중 · ${endLabel}까지` : '영업 종료',
  };
}
