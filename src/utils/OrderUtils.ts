import { OrderPageTypeModel } from "model/order/order.model";
import { OrderLineItemRequest, OrderPaymentRequest } from "model/request/order.request";
import {
  FulFillmentResponse,
  OrderLineItemResponse,
  OrderPaymentResponse,
  OrderResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import moment, { Moment } from "moment";
import { sortFulfillments } from "./AppUtils";
import {
  DELIVERY_SERVICE_PROVIDER_CODE,
  ECOMMERCE_CHANNEL_CODES,
  FulFillmentReturnStatus,
  FulFillmentStatus,
  PaymentMethodCode,
  PRODUCT_TYPE,
  ShipmentMethod,
  WEIGHT_UNIT,
} from "./Constants";
import { FulfillmentStatus } from "./FulfillmentStatus.constant";
import {
  FulfillmentCancelStatus,
  OrderStatus,
  ORDER_PAYMENT_STATUS,
  ORDER_SUB_STATUS,
} from "./Order.constants";

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

export const findPaymentMethodByCode = (paymentMethods: PaymentMethodResponse[], code: string) => {
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

export const checkIfOrderHasPaidAllMoneyAmount = (OrderDetail: OrderResponse | null) => {
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

export const checkIfOrderHasShipmentCod = (OrderDetail: OrderResponse | null) => {
  const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);
  return sortedFulfillments[0]?.shipment?.cod;
};

export const checkIfOrderCancelled = (OrderDetail: OrderResponse | null) => {
  return OrderDetail?.status === OrderStatus.CANCELLED;
};

export const checkIfFulfillmentCancelled = (fulfillment: FulFillmentResponse) => {
  if (!fulfillment?.status) {
    return false;
  }
  return (
    FulfillmentCancelStatus.includes(fulfillment.status) ||
    checkIfFulfillmentReturned(fulfillment) ||
    checkIfFulfillmentReturning(fulfillment)
  );
};

export const checkIfFulfillmentIsAtStore = (fulfillment: FulFillmentResponse) => {
  return fulfillment.shipment?.delivery_service_provider_type === ShipmentMethod.PICK_AT_STORE;
};

export const calculateSumWeightResponse = (items?: OrderLineItemResponse[]) => {
  let totalWeight = 0;
  console.log("items", items);
  if (items) {
    items.forEach((item) => {
      let itemWeightByUnit = item.weight;
      if (item.weight_unit === WEIGHT_UNIT.kilogram.value) {
        itemWeightByUnit = item.weight * 1000;
      }
      totalWeight = totalWeight + itemWeightByUnit * item.quantity;
    });
  }
  console.log("totalWeight", totalWeight);
  return totalWeight;
};

export const getQuantityWithTwoCharacter = (quantity: number) => {
  if (quantity < 10) {
    return "0" + quantity;
  }
  return quantity;
};

export const getTrackingCodeFulfillment = (fulfillment: FulFillmentResponse | undefined | null) => {
  if (fulfillment) {
    return fulfillment.shipment?.tracking_code;
  }
};

export const checkIfFulfillmentReturning = (
  fulfillment: FulFillmentResponse | undefined | null,
) => {
  if (!fulfillment) {
    return false;
  }
  return (
    fulfillment.return_status === FulFillmentReturnStatus.RETURNING &&
    fulfillment.status === FulFillmentStatus.SHIPPING
  );
};

export const checkIfFulfillmentReturned = (fulfillment: FulFillmentResponse | undefined | null) => {
  if (!fulfillment) {
    return false;
  }
  return (
    fulfillment.return_status === FulFillmentReturnStatus.RETURNED &&
    fulfillment.status === FulFillmentStatus.CANCELLED
  );
};

export const canCreateShipment = (fulfillments?: FulFillmentResponse[] | null) => {
  if (!fulfillments) return false;
  let createShipment = false;
  if (
    !fulfillments.some(
      (p) =>
        p.status !== FulFillmentStatus.CANCELLED &&
        p.status !== FulFillmentStatus.RETURNING &&
        p.status !== FulFillmentStatus.RETURNED &&
        p?.shipment?.delivery_service_provider_type,
    )
  )
    createShipment = true;
  return createShipment;
};

export const getFulfillmentSingle = (
  ffmCode: string,
  fulfillments?: FulFillmentResponse[] | null | any,
) => {
  if (!fulfillments) return undefined; //không tìm thấy ffm

  return fulfillments.find((p: any) => p.code === ffmCode);
};

export const getFulfillmentActive = (fulfillments?: FulFillmentResponse[] | null | any) => {
  if (!fulfillments) return undefined; //không tìm thấy ffm

  let fulfillmentsExitsShipment = fulfillments.filter((p: any) => p.shipment);

  const sortedFulfillments = sortFulfillments(fulfillmentsExitsShipment);
  return sortedFulfillments[0];
};

export const checkIfOrderFinished = (orderDetail: OrderResponse | null | undefined) => {
  return (
    orderDetail?.status === OrderStatus.FINISHED || orderDetail?.status === OrderStatus.COMPLETED
  );
};

/*
kiểm tra đơn đã hoàn true:false
*/
export const isDeliveryOrderReturned = (
  fulfillments?: FulFillmentResponse | FulFillmentResponse[] | null,
) => {
  if (!fulfillments) return false; //không tìm thấy ffm
  let fulfillment: FulFillmentResponse | null | undefined = null;
  if (Array.isArray(fulfillments)) {
    fulfillment = getFulfillmentActive(fulfillments);
  } else {
    fulfillment = fulfillments;
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

export const checkIfOrderReturned = (orderDetail: OrderResponse | null | undefined) => {
  return orderDetail?.sub_status_code === ORDER_SUB_STATUS.returned;
};

export const checkIfOrderIsCancelledBy3PL = (orderDetail: OrderResponse | null | undefined) => {
  return orderDetail?.sub_status_code === ORDER_SUB_STATUS.delivery_service_cancelled;
};
export const getLink = (providerCode: string, trackingCode: string) => {
  switch (providerCode) {
    case DELIVERY_SERVICE_PROVIDER_CODE.ghn:
      return `https://donhang.ghn.vn/?order_code=${trackingCode}`;
    case DELIVERY_SERVICE_PROVIDER_CODE.ghtk:
      return `https://i.ghtk.vn/${trackingCode}`;
    case DELIVERY_SERVICE_PROVIDER_CODE.vtp:
      return `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/`;
    default:
      break;
  }
};

export const getReturnMoneyStatusText = (paymentStatus: string) => {
  let textResult = "";
  switch (paymentStatus) {
    // case "unpaid":
    case ORDER_PAYMENT_STATUS.unpaid:
      // processIcon = "icon-blank";
      textResult = "Chưa hoàn tiền";
      break;
    // case "paid":
    case ORDER_PAYMENT_STATUS.paid:
      // processIcon = "icon-full";
      textResult = "Đã hoàn tiền";
      break;
    // case "partial_paid":
    case ORDER_PAYMENT_STATUS.partial_paid:
      // processIcon = "icon-full";
      textResult = "Hoàn tiền một phần";
      break;
    default:
      textResult = "";
      break;
  }

  return textResult;
};

export const getReturnMoneyStatusColor = (paymentStatus: string) => {
  let textResult = "";
  switch (paymentStatus) {
    // case "unpaid":
    case ORDER_PAYMENT_STATUS.unpaid:
      // processIcon = "icon-blank";
      textResult = "rgb(226, 67, 67)";
      break;
    // case "paid":
    case ORDER_PAYMENT_STATUS.paid:
      // processIcon = "icon-full";
      textResult = "rgb(16, 98, 39)";
      break;
    // case "partial_paid":
    case ORDER_PAYMENT_STATUS.partial_paid:
      // processIcon = "icon-full";
      textResult = "rgb(252, 175, 23)";
      break;
    default:
      textResult = "";
      break;
  }

  return textResult;
};

export const getTimeFormatOrderFilterTag = (
  date: Date | string | number | Moment,
  dateFormat: string = "",
) => {
  return moment(date).format(dateFormat);
};

export const formatDateTimeOrderFilter = (
  date: Date | string | number | Moment | undefined,
  format: string = "",
) => {
  if (!date) return;
  return format !== "" ? moment(date, format).utc(true) : moment(date).utc(true);
};

export const getTimeFormatOrderFilter = (values: string, dateFormat: string = "") => {
  return values ? moment(values).utc(false) : null;
};

/**
 * kiểm tra là đơn hvc đã hoàn
 * @param fulfillment
 * @returns
 */
export const isFulfillmentReturned = (fulfillment: FulFillmentResponse | any) => {
  return (
    fulfillment?.status === FulFillmentStatus.CANCELLED &&
    fulfillment?.return_status === FulFillmentStatus.RETURNED &&
    fulfillment?.status_before_cancellation === FulFillmentStatus.SHIPPING
  );
};

/**
 * kiểm tra là đơn hvc đang hoàn
 * @param fulfillment
 * @returns
 */
export const isFulfillmentReturning = (fulfillment: FulFillmentResponse | any) => {
  return (
    fulfillment.status === FulfillmentStatus.SHIPPING &&
    fulfillment.return_status === FulfillmentStatus.RETURNING
  );
};

export const checkIfMomoPayment = (payment: OrderPaymentRequest | OrderPaymentResponse) => {
  return payment.payment_method_code === PaymentMethodCode.MOMO;
};

export const checkIfPointPayment = (payment: OrderPaymentRequest | OrderPaymentResponse) => {
  return payment.payment_method_code === PaymentMethodCode.POINT;
};

export const checkIfBankPayment = (payment: OrderPaymentRequest | OrderPaymentResponse) => {
  return payment.payment_method_code === PaymentMethodCode.BANK_TRANSFER;
};

export const checkIfFinishedPayment = (payment: OrderPaymentRequest | OrderPaymentResponse) => {
  return payment.status === ORDER_PAYMENT_STATUS.paid;
};

export const checkIfOrderHasNotFinishPaymentMomo = (
  orderDetail: OrderResponse | null | undefined,
) => {
  if (!orderDetail?.payments || orderDetail.payments.length === 0) {
    return false;
  }
  return orderDetail?.payments.some(
    (payment) =>
      checkIfMomoPayment(payment) &&
      !checkIfFinishedPayment(payment) &&
      !checkIfExpiredOrCancelledPayment(payment),
  );
};

export const checkIfExpiredPayment = (payment: OrderPaymentResponse | OrderPaymentRequest) => {
  if (!payment.expired_at) {
    return false;
  }
  return moment(payment.expired_at).isBefore(moment());
};

export const checkIfNotFinishedAndExpiredPaymentMomo = (payment: OrderPaymentResponse) => {
  return (
    checkIfMomoPayment(payment) &&
    !checkIfFinishedPayment(payment) &&
    checkIfExpiredPayment(payment)
  );
};

export const checkIfNotFinishedAndNotExpiredPaymentMomo = (payment: OrderPaymentResponse) => {
  return (
    checkIfMomoPayment(payment) &&
    !checkIfFinishedPayment(payment) &&
    !checkIfExpiredPayment(payment)
  );
};

export const checkIfOrderHasNotFinishedAndExpiredPaymentMomo = (
  orderDetail: OrderResponse | null | undefined,
) => {
  if (!orderDetail?.payments || orderDetail.payments.length === 0) {
    return false;
  }
  return orderDetail?.payments.some((payment) => checkIfNotFinishedAndExpiredPaymentMomo(payment));
};

export const checkIfOrderHasNotFinishedPaymentMomo = (
  orderDetail: OrderResponse | null | undefined,
) => {
  if (!orderDetail?.payments || orderDetail.payments.length === 0) {
    return false;
  }
  return orderDetail?.payments.some(
    (payment) =>
      checkIfMomoPayment(payment) &&
      !checkIfFinishedPayment(payment) &&
      !checkIfExpiredOrCancelledPayment(payment),
  );
};

export const checkIfCancelledPayment = (payment: OrderPaymentResponse | OrderPaymentRequest) => {
  return payment.status === ORDER_PAYMENT_STATUS.cancelled;
};

export const checkIfExpiredOrCancelledPayment = (
  payment: OrderPaymentResponse | OrderPaymentRequest,
) => {
  return (
    checkIfCancelledPayment(payment) ||
    (checkIfExpiredPayment(payment) && !checkIfFinishedPayment(payment))
  );
};

export const checkIfEcommerceByOrderChannelCode = (orderChannelCode?: string | null) => {
  if (!orderChannelCode) {
    return false;
  }
  return ECOMMERCE_CHANNEL_CODES.map((code) => code.toLowerCase()).includes(
    orderChannelCode.toLowerCase(),
  );
};
export const getTotalAmountBeforeDiscount = (items: Array<OrderLineItemRequest>) => {
  let total = 0;
  items.forEach((a) => {
    if (a.product_type === PRODUCT_TYPE.normal || PRODUCT_TYPE.combo) {
      total = total + a.quantity * a.price;
    }
  });
  return total;
};

export const checkIfOrderPageType = {
  isOrderCreatePage: (orderPageType: string) => orderPageType === OrderPageTypeModel.orderCreate,
  isOrderDetailPage: (orderPageType: string) => orderPageType === OrderPageTypeModel.orderDetail,
  isOrderUpdatePage: (orderPageType: string) => orderPageType === OrderPageTypeModel.orderUpdate,
  isOrderReturnCreatePage: (orderPageType: string) =>
    orderPageType === OrderPageTypeModel.orderReturnCreate,
  isOtherPage: (orderPageType: string) => orderPageType === OrderPageTypeModel.other,
};
