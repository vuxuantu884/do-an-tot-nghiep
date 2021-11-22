import {BaseMetadata} from "model/base/base-metadata.response";
import {BaseObject} from "model/base/base.response";

export interface OrderSourceModel {
  company?: string;
  name?: string;
  company_id?: number;
  department?: string;
  department_id?: string;
  type: string;
  is_active: boolean;
  id: number;
  channel_id: number;
  is_default: boolean;
  code?: string|null;
  is_channel: boolean;
  channel_type: {
    id: number;
    code: string;
    name: string;
  } | null;
  active: boolean;
  default: boolean;
}

export interface ChannelModel {
  id: number;
  code: string;
  name: string|undefined;
  channel_type_id: number|undefined;
}

export interface ChannelTypeModel {
  code: string;
  name: string;
}
export interface OrderSourceResponseModel {
  items: OrderSourceModel[];
  metadata: BaseMetadata;
}

export interface OrderSourceCompanyModel extends BaseObject {
  code: string;
  country?: string;
  country_id?: number;
  currency_code?: string;
  id: number;
  name: string;
}
