export interface PaymentMethodResponse {
  id: number;
  code: string;
  version?: number;
  created_by?: string;
  created_name?: string;
  created_date?: number;
  updated_by?: string;
  updated_name?: string;
  updated_date?: number;
  name: string;
}
