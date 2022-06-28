import { FulFillmentResponse } from "model/response/order/order.response";
import { FulFillmentStatus } from "utils/Constants";

/*
*lấy dữ liệu ffm đã đóng gói
*/
export const getFullfilmentPacked = (fullfilment: FulFillmentResponse[]) => {
    let fulfillmentResult = fullfilment.filter(p => p.status === FulFillmentStatus.PACKED)
    return fulfillmentResult;
}

/*
*lấy dữ liệu ffm đang hoàn
*/
export const getFullfilmentReturning = (fullfilment: FulFillmentResponse[]) => {
    let fulfillmentResult = fullfilment.filter(p => p.status === FulFillmentStatus.SHIPPING && p.return_status === FulFillmentStatus.RETURNING)
    return fulfillmentResult;
}

/*
*kiểm tra là đơn đã đóng gói
*/
export const isFullfilmentPacked = (fullfilment: FulFillmentResponse | any) => {
    let fulfillmentBol = fullfilment.status === FulFillmentStatus.PACKED;

    return fulfillmentBol;
}

/*
*Thêm item vào vị trí chỉ định
*/
export const insertArray = (arr: any, index: number, newItem: any) => [
    ...arr.slice(0, index),
    newItem,
    ...arr.slice(index)
]

/*
*kiểm tra là đơn xuất kho hoặc đơn thành công
*/
export const isFullfilmentShiping = (fullfilment: FulFillmentResponse | any) => {
    let fulfillmentBol = (fullfilment.status === FulFillmentStatus.SHIPPING || fullfilment.status === FulFillmentStatus.SHIPPED)
        && fullfilment.return_status === FulFillmentStatus.UNRETURNED;

    return fulfillmentBol;
}

/*
*kiểm tra là đơn hvc đang hoàn
*/
export const isFullfilmentReturning = (fullfilment: FulFillmentResponse | any) => {
    let fulfillmentBol = fullfilment.status === FulFillmentStatus.SHIPPING && fullfilment.return_status === FulFillmentStatus.RETURNING;

    return fulfillmentBol;
}

/*
*kiểm tra là đơn hvc đã hoàn
*/
export const isFullfilmentReturned = (fullfilment: FulFillmentResponse | any) => {
    let fulfillmentBol = fullfilment.status === FulFillmentStatus.CANCELLED
        && fullfilment.return_status === FulFillmentStatus.RETURNED
    //&& fullfilment.status_before_cancellation === FulFillmentStatus.SHIPPING;

    return fulfillmentBol;
}