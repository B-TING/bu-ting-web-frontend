/** Backend dev 02459f8, 2026-09-12. JSON is narrowed at the transport boundary. */
export type AdminJson = string | number | boolean | null | AdminJson[] | AdminRecord;
export interface AdminRecord {
  [key: string]: AdminJson;
}
export interface AdminPage {
  items: AdminRecord[];
  page: number;
  totalPages: number;
  totalElements: number;
  nextCursor?: string | null;
  hasNext?: boolean;
}
export interface AdminField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'datetime-local' | 'checkbox' | 'textarea' | 'file';
  required?: boolean;
  min?: number;
  max?: number;
  options?: readonly { value: string; label: string }[];
  value?: string;
  readonly?: boolean;
}
export interface AdminOperation {
  label: string;
  path: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  fields?: AdminField[];
  initial?: AdminRecord;
  fixed?: AdminRecord;
  placePrefix?: string;
  placeRequired?: boolean;
  description?: string;
}
export interface AdminResource {
  key: string;
  label: string;
  path: string;
  id: string;
  columns: string[];
  filters: AdminField[];
  create?: AdminOperation;
}
