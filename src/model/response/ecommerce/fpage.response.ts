export interface FpageCustomerResponse {
  id: string;
  name: string;
  default_phone: string | null;
  phones: Array<string>;
}
