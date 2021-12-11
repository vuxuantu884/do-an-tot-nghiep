import { CustomerDuplicateModel } from './../../../model/order/duplicate.model';

import BaseAction from 'base/base.action';
import { PageResponse } from './../../../model/base/base-metadata.response';
import { DuplicateOrderSearchQuery } from './../../../model/order/order.model';
import { OrderType } from "domain/types/order.type";

export const getOrderDuplicateAction=(param:DuplicateOrderSearchQuery, setData:(data:PageResponse<CustomerDuplicateModel>)=>void)=>{
    return BaseAction(OrderType.GET_ORDER_DUPLICATE_LIST, {param, setData});
}