import { OrderPaymentRequest } from "model/request/order.request";
import { FulFillmentResponse, OrderPaymentResponse, OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { sortFulfillments } from "./AppUtils";
import { DELIVERY_SERVICE_PROVIDER_CODE, FulFillmentStatus, PaymentMethodCode } from "./Constants";
import { FulfillmentCancelStatus, ORDER_PAYMENT_STATUS } from "./Order.constants";

export const isOrderDetailHasPointPayment = (
  OrderDetail: OrderResponse | null | undefined,
  paymentMethods: PaymentMethodResponse[],
) => {
  const pointPaymentMethodId = paymentMethods.find(
    (payment) => payment.code === PaymentMethodCode.POINT,
  )?.code;
  if (!pointPaymentMethodId) {
    return false;
  }
  if (!OrderDetail?.payments) {
    return false;
  }
  return OrderDetail?.payments?.some((single) => {
    return single.payment_method_code === pointPaymentMethodId;
  });
};

export const findPaymentMethodByCode = (
  paymentMethods: PaymentMethodResponse[],
  code: string,
) => {
  return paymentMethods.find((single) => single.code === code);
};

export const checkIfOrderHasNoPayment = (OrderDetail: OrderResponse | null) => {
  if (!OrderDetail?.payments || OrderDetail.payments.length === 0) {
    return true;
  }
  return false;
};

export const getOrderAmountPayment = (
  items: Array<OrderPaymentResponse | OrderPaymentRequest> | null | undefined,
) => {
  let value = 0;
  if (items) {
    if (items.length > 0) {
      items.forEach((a) => (value = value + a.amount));
    }
  }
  return value;
};

export const checkIfOrderHasPaidAllMoneyAmount = (
  OrderDetail: OrderResponse | null,
) => {
  const amountPayment = getOrderAmountPayment(OrderDetail?.payments);
  if (amountPayment >= (OrderDetail?.total || 0)) {
    return true;
  }
  return false;
};

export const renderContentWithBreakLine = (content: string | null | undefined) => {
  if (!content) {
    return [""];
  }
  const lineBreak = "<br />";
  // content= JSON.stringify(content);
  let textReplace = content.replace(/\n/g, lineBreak);
  let result = textReplace.split(lineBreak);
  return result;
};

export const checkIfOrderHasShipmentCod = (
  OrderDetail: OrderResponse | null,
) => {
  const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);
  return sortedFulfillments[0]?.shipment?.cod;
};

export const checkIfOrderCancelled = (
  OrderDetail: OrderResponse | null,
) => {
  const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);
  if(!sortedFulfillments[0]?.status) {
    return false
  }
  return FulfillmentCancelStatus.includes(sortedFulfillments[0]?.status);
};

export const isDeliveryOrder = (fulfillment?: FulFillmentResponse[] | null) => {
  if (!fulfillment) return false;
  let success = false;
  if (// tạo giao hàng
    !fulfillment.some(
    (p) =>
      p.status !== FulFillmentStatus.CANCELLED &&
      p.return_status !== FulFillmentStatus.RETURNED &&
      p?.shipment?.delivery_service_provider_type
    )
  )
    success = true;
  
  if (//không tạo giao hàng nếu đã bàn giao sang hvc
    fulfillment.some(
    (p) => p.status_before_cancellation === FulFillmentStatus.SHIPPING
    )
  ){
    success = false;
  }
  
  return success;
}

export const isFulfillmentActive = (
  fulfillments?: FulFillmentResponse[] | null
) => {
  if (!fulfillments) return undefined; //không tìm thấy ffm

  let fulfillmentsExitsShipment = fulfillments.filter((p) => p.shipment);

  const sortedFulfillments = sortFulfillments(fulfillmentsExitsShipment);
  return sortedFulfillments[0];
};

/*
kiểm tra đơn đã hoàn true:false
*/
export const isDeliveryOrderReturned = (
  fulfillments?: FulFillmentResponse | FulFillmentResponse[] | null
) => {
  if (!fulfillments) return false; //không tìm thấy ffm
  let fulfillment: FulFillmentResponse | null | undefined=null;
  if(Array.isArray(fulfillments))
  {
    fulfillment = isFulfillmentActive(fulfillments);
  }
  else{
    fulfillment=fulfillments;
  }

  if (
    fulfillment &&
    fulfillment?.status === FulFillmentStatus.CANCELLED &&
    fulfillment?.return_status === FulFillmentStatus.RETURNED &&
    fulfillment?.status_before_cancellation === FulFillmentStatus.SHIPPING
  )
    //nếu có đơn đã hoàn
    return true;
  return false; //default
};

export const getLink = (providerCode: string, trackingCode: string) => {
  switch (providerCode) {
    case DELIVERY_SERVICE_PROVIDER_CODE.ghn:
      return `https://donhang.ghn.vn/?order_code=${trackingCode}`
    case DELIVERY_SERVICE_PROVIDER_CODE.ghtk:
      return `https://i.ghtk.vn/${trackingCode}`
    case DELIVERY_SERVICE_PROVIDER_CODE.vtp:
      return `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/`
    default:
      break;
  }
};

export const getReturnMoneyStatusText=(paymentStatus:string)=>{
  let textResult = "";
  switch (paymentStatus) {
    // case "unpaid":
    case ORDER_PAYMENT_STATUS.unpaid:
      // processIcon = "icon-blank";
      textResult = "Chưa hoàn tiền"
      break;
    // case "paid":
    case ORDER_PAYMENT_STATUS.paid:
      // processIcon = "icon-full";
      textResult = "Đã hoàn tiền"
      break;
    // case "partial_paid":
    case ORDER_PAYMENT_STATUS.partial_paid:
      // processIcon = "icon-full";
      textResult = "Hoàn tiền một phần"
      break;
    default:
      textResult="";
      break;
  }

  return textResult;
}

export const getReturnMoneyStatusColor=(paymentStatus:string)=>{
  let textResult = "";
  switch (paymentStatus) {
    // case "unpaid":
    case ORDER_PAYMENT_STATUS.unpaid:
      // processIcon = "icon-blank";
      textResult = "rgb(226, 67, 67)"
      break;
    // case "paid":
    case ORDER_PAYMENT_STATUS.paid:
      // processIcon = "icon-full";
      textResult = "rgb(16, 98, 39)"
      break;
    // case "partial_paid":
    case ORDER_PAYMENT_STATUS.partial_paid:
      // processIcon = "icon-full";
      textResult = "rgb(252, 175, 23)"
      break;
    default:
      textResult="";
      break;
  }

  return textResult;
}
