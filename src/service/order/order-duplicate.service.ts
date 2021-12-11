import { CustomerDuplicateModel } from './../../model/order/duplicate.model';
import { generateQuery } from 'utils/AppUtils';
import { ApiConfig } from 'config/api.config';
import BaseAxios from 'base/base.axios';
import { DuplicateOrderSearchQuery } from './../../model/order/order.model';
import BaseResponse from 'base/base.response';
import { PageResponse } from 'model/base/base-metadata.response';

export const getOrderDuplicateService=(param:DuplicateOrderSearchQuery):Promise<BaseResponse<PageResponse<CustomerDuplicateModel>>>=>{
    const queryString=generateQuery(param);
    return BaseAxios.get(`${ApiConfig.ORDER}/orders-duplicate?${queryString}`)
}