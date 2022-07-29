export interface CreateLoyaltyRequest {
  name: string;
  note: string;
  accumulated_from: number;
  method: string;
  status: string;
}
