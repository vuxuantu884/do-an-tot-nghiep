export interface YDPageCustomerResponse {
  id: string;
  name: string;
  default_phone: string | null;
  phones: Array<string>;
  notes?: customerNoteInfo[];
}

export interface customerNoteInfo {
  created_at: Date;
  created_by: string;
  content: string;
  updated_at?: Date;
  updated_by?: string;
}
