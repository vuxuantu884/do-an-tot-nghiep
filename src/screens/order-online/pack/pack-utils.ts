import { FulFillmentResponse } from "model/response/order/order.response";
import { FulFillmentStatus } from "utils/Constants";

/*
*lấy dữ liệu ffm đã đóng gói
*/
export const getFullfilmentPacked=(fullfilment:FulFillmentResponse[])=>{
    let fulfillmentResult = fullfilment.filter(p => p.status === FulFillmentStatus.PACKED)
    return fulfillmentResult;
}

/*
*lấy dữ liệu ffm đang hoàn
*/
export const getFullfilmentReturning=(fullfilment:FulFillmentResponse[])=>{
    let fulfillmentResult = fullfilment.filter(p => p.status === FulFillmentStatus.SHIPPING && p.return_status=== FulFillmentStatus.RETURNING)
    return fulfillmentResult;
}


/*
*kiểm tra là đơn xuất kho hoặc đơn thành công
*/
export const bolFullfilmentShiping=(fullfilment?:FulFillmentResponse[]|null)=>{
    let fulfillmentBol = fullfilment?.some(p => (p.status === FulFillmentStatus.SHIPPING
        && p.return_status !== FulFillmentStatus.RETURNING)
        || p.status === FulFillmentStatus.SHIPPED);

    return fulfillmentBol;
}

export const insertArray = (arr: any, index: number, newItem: any) => [
    ...arr.slice(0, index),
    newItem,
    ...arr.slice(index)
]