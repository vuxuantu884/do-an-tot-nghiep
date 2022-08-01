import { ApiConfig } from 'config/api.config';
import BaseAxios from "base/base.axios";
import BaseResponse from 'base/base.response';
import { FulfillmentDto } from 'model/handover/fulfillment.dto';
import { PageResponse } from 'model/base/base-metadata.response';

const fulfillmentSearchService =  (code: string): Promise<BaseResponse<FulfillmentDto>> => {
  return BaseAxios.get(
    `${ApiConfig.ORDER}/fulfillments/${code}`
  );
}

const fulfillmentListService =  (codes: Array<string>): Promise<BaseResponse<PageResponse<FulfillmentDto>>> => {
  return BaseAxios.get(
    `${ApiConfig.ORDER}/shipments?fulfillment_code=${codes.join(",")}&limit=${codes.length}`
  );
}


export {fulfillmentSearchService, fulfillmentListService};