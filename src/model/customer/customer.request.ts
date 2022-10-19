export interface CustomerFamilyInfoRequest {
  customer_id: number;
  name: string;
  birthday: any;
  gender: string | null;
  relation_type: string | null;
}
