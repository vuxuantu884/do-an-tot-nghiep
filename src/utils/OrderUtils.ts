import { OrderPaymentRequest } from "model/request/order.request";
import { FulFillmentResponse, OrderPaymentResponse, OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { sortFulfillments } from "./AppUtils";
import { FulFillmentStatus, PaymentMethodCode } from "./Constants";
import { FulfillmentCancelStatus } from "./Order.constants";

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
  )
    success = false;
  console.log("fulfillment", fulfillment);
  
  return success;
}

