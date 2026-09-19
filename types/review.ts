// 일정 장소(PlanPlace) 후기.
// POST/PATCH 요청 body는 동일하며, GET/DELETE는 경로 파라미터(travelId, planPlaceId)만 사용한다.

export interface PlanPlaceReviewRequest {
  rating: number;
  content: string;
  tags: string[];
  stayMinutes: number;
  /**
   * 업로드된 미디어 파일 키. 별도 업로드 플로우 연동 전까지는 비워서 보낸다.
   * PATCH도 이 필드를 그대로 받으므로, 미디어 편집 UI가 생기기 전에는
   * 기존 미디어를 유지하려면 서버가 "필드 생략 = 변경 없음"으로 처리해야 한다.
   */
  mediaFileKeys?: string[];
}

export interface PlanPlaceReviewResponse {
  placeReviewId: string;
  planPlaceId: string;
  travelRecordPlaceId: string;
  rating: number;
  stayMinutes: number;
  content: string;
  tags: string[];
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
}
