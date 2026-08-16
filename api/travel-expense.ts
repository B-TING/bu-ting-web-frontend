import { apiRequest } from '@/lib/api-client';
import type {
  TravelExpenseCreateRequest,
  TravelExpenseListResponse,
  TravelExpenseSummaryResponse,
  TravelSettlementResponse,
} from '@/types/budget';

export function getTravelExpenses(travelId: string) {
  return apiRequest<TravelExpenseListResponse>(
    `/api/v1/travels/${travelId}/expenses?size=100&sort=spentAt,desc`,
  );
}

export function createTravelExpense(travelId: string, request: TravelExpenseCreateRequest) {
  return apiRequest<unknown>(`/api/v1/travels/${travelId}/expenses`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function getTravelExpenseSummary(travelId: string) {
  return apiRequest<TravelExpenseSummaryResponse>(
    `/api/v1/travels/${travelId}/expenses/summary`,
  );
}

export function getTravelSettlement(travelId: string) {
  return apiRequest<TravelSettlementResponse>(
    `/api/v1/travels/${travelId}/expenses/settlements`,
  );
}

export function confirmTravelSettlement(travelId: string) {
  return apiRequest<TravelSettlementResponse>(
    `/api/v1/travels/${travelId}/expenses/settlements/confirm`,
    { method: 'POST' },
  );
}
