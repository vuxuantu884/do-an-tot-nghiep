export interface YDPageCustomerResponse {
  id: string;
  name: string;
  default_phone: string | null;
  phones: Array<string>;
}
