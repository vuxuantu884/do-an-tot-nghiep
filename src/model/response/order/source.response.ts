import { BaseObject } from "model/base/base.response";

export interface SourceResponse extends BaseObject {
	active: boolean,
  name: string,
  reference_url: string | null;
  department_id: number | null;
  department: string | null;
}

export interface SourceEcommerceResponse extends BaseObject{
  company_id:number;
  company:string;
  name: string,
  reference_url: string | null;
  department_id: number | null;
  department: string | null;
  channel_id:number|null;
  default:boolean;
  active:boolean;
  deleted:boolean;
  ecommerce:boolean;
}