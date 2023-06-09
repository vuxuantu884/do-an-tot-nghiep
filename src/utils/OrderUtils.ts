import { Type } from "config/type.config";
import _ from "lodash";
import { AccountStoreResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import {
  OrderModel,
  OrderPageTypeModel,
  OrderType,
  SpecialOrderValue,
} from "model/order/order.model";
import { DiscountValueType } from "model/promotion/price-rules.model";
import {
  OrderItemDiscountRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
} from "model/request/order.request";
import {
  FulFillmentResponse,
  OrderCorrelativeVariantResponse,
  OrderLineItemResponse,
  OrderPaymentResponse,
  OrderResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import moment, { Moment } from "moment";
import { ORDER_PERMISSIONS } from "../config/permissions/order.permission";
import { select_type_especially_order } from "../screens/order-online/common/fields.export";
import {
  flattenArray,
  formatCurrency,
  getLineAmountAfterLineDiscount,
  getLineItemDiscountAmount,
  getLineItemDiscountRate,
  getLineItemDiscountValue,
  mathRoundAmount,
  mathRoundPercentage,
} from "./AppUtils";
import {
  DELIVERY_SERVICE_PROVIDER_CODE,
  DISCOUNT_TYPE,
  ECOMMERCE_CHANNEL_CODES,
  ECOMMERCE_CHANNEL_CODES_UPDATE_ORDER,
  EnumOrderType,
  FulFillmentStatus,
  PaymentMethodCode,
  PaymentMethodType,
  PRODUCT_TYPE,
  ShipmentMethod,
  WEB_APP_CHANNEL_CODES,
  WEIGHT_UNIT,
} from "./Constants";
import {
  getFulfillmentActive,
  isFulfillmentReturned,
  isFulfillmentReturning,
  sortFulfillments,
} from "./fulfillmentUtils";
import {
  DISCOUNT_VALUE_TYPE,
  FulfillmentCancelStatus,
  OrderStatus,
  ORDER_PAYMENT_STATUS,
  ORDER_SUB_STATUS,
  BAGS_CONFIG,
} from "./Order.constants";
import { fullTextSearch } from "./StringUtils";
import { EnumGiftType } from "config/enum.config";

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
    isFulfillmentReturning(fulfillment) ||
    isFulfillmentReturned(fulfillment)
  );
};

export const checkIfFulfillmentIsAtStore = (fulfillment: FulFillmentResponse) => {
  return fulfillment.shipment?.delivery_service_provider_type === ShipmentMethod.PICK_AT_STORE;
};

export const calculateSumWeightResponse = (items?: OrderLineItemResponse[]) => {
  let totalWeight = 0;
  if (items) {
    items.forEach((item) => {
      let itemWeightByUnit = item.weight;
      if (item.weight_unit === WEIGHT_UNIT.kilogram.value) {
        itemWeightByUnit = item.weight * 1000;
      }
      totalWeight = totalWeight + itemWeightByUnit * item.quantity;
    });
  }
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

  return isFulfillmentReturned(fulfillment);
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

export const checkActiveCancelPackOrder = (
  orderDetail: OrderResponse | null | undefined,
  permissions: Array<string>,
) => {
  if (!permissions.includes(ORDER_PERMISSIONS.CANCEL_PACKED)) {
    return (
      orderDetail?.sub_status_code === ORDER_SUB_STATUS.merchandise_packed ||
      orderDetail?.sub_status_code === ORDER_SUB_STATUS.awaiting_shipper
    );
  }
  return false;
};
export const checkActiveCancelConfirmOrder = (
  orderDetail: OrderResponse | null | undefined,
  permissions: Array<string>,
) => {
  if (!permissions.includes(ORDER_PERMISSIONS.CANCEL_CONFIRMED)) {
    return (
      orderDetail?.fulfillment_status === FulFillmentStatus.PICKED ||
      orderDetail?.fulfillment_status === FulFillmentStatus.UNSHIPPED
    );
  }
  return false;
};

export const checkIfExpiredPayment = (payment: OrderPaymentResponse | OrderPaymentRequest) => {
  return (
    payment.status === ORDER_PAYMENT_STATUS.expired ||
    payment.status === ORDER_PAYMENT_STATUS.failure
  );
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

export const checkIfECommerceByOrderChannelCode = (orderChannelCode?: string | null) => {
  if (!orderChannelCode) {
    return false;
  }
  return ECOMMERCE_CHANNEL_CODES.map((code) => code.toLowerCase()).includes(
    orderChannelCode.toLowerCase(),
  );
};

// export const checkIfWebAppByOrderChannelCode = (orderChannelCode?: string | null) => {
//   if (!orderChannelCode) {
//     return false;
//   }
//   return WEB_APP_CHANNEL_CODES.map((code) => code.toLowerCase()).includes(
//     orderChannelCode.toLowerCase(),
//   );
// };

export const checkIfECommerceByOrderChannelCodeUpdateOrder = (orderChannelCode?: string | null) => {
  if (!orderChannelCode) {
    return false;
  }
  return ECOMMERCE_CHANNEL_CODES_UPDATE_ORDER.filter(
    (p) =>
      !WEB_APP_CHANNEL_CODES.map((p) => p.toLowerCase()).includes(p.channel_code.toLowerCase()),
  )
    .map((p) => p.channel_code.toLowerCase())
    .includes(orderChannelCode.toLowerCase());
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

export const getArrayFromObject = <Type>(obj: { [name: string]: Type }): Array<Type> => {
  return Object.entries(obj).map((single) => {
    const [, value] = single;
    return value;
  });
};

export const renderFormatCurrency = (value?: number | string) => {
  return typeof value === "number" ? formatCurrency(value) : "-";
};

export const getDefaultReceiveReturnStoreIdFormValue = (
  currentStores: AccountStoreResponse[] | undefined,
  OrderDetail: OrderResponse | null,
) => {
  return currentStores?.length === 1
    ? currentStores[0].store_id
    : currentStores && currentStores?.length > 1 && OrderDetail?.store_id
    ? currentStores?.find((single) => single.store_id === OrderDetail?.store_id)?.store_id ||
      undefined
    : undefined;
};

export const checkIfMomoTypePayment = (payment: OrderPaymentResponse | OrderPaymentRequest) => {
  return (
    payment?.type?.toLowerCase() === "momo" &&
    payment.payment_method_code === PaymentMethodCode.QR_CODE
  );
};

export const checkIfVnPayTypePayment = (payment: OrderPaymentResponse | OrderPaymentRequest) => {
  return (
    payment?.type?.toLowerCase() === "vn_pay" &&
    payment.payment_method_code === PaymentMethodCode.QR_CODE
  );
};

export const checkIfVcbTypePayment = (payment: OrderPaymentResponse | OrderPaymentRequest) => {
  return (
    payment?.type?.toLowerCase() === "vcb_qr" &&
    payment.payment_method_code === PaymentMethodCode.QR_CODE
  );
};

export const getReturnStoreFromOrderActiveFulfillment = (
  fulfillments: FulFillmentResponse[] | null | undefined,
  currentStores: StoreResponse[],
) => {
  if (currentStores?.length === 1) {
    return currentStores[0];
  }
  const getStoreFromOrderActiveFulfillment = () => {
    let result = undefined;
    const activeFulfillment = getFulfillmentActive(fulfillments);
    if (activeFulfillment) {
      const activeFulfillmentStoreId = activeFulfillment.returned_store_id;
      if (activeFulfillmentStoreId) {
        result = currentStores?.find((single) => single.id === activeFulfillmentStoreId);
      }
    }
    return result;
  };
  return getStoreFromOrderActiveFulfillment();
};

export const changeTypeQrCode = (
  payments: OrderPaymentRequest[],
  paymentMethods: PaymentMethodResponse[],
) => {
  const qrPaymentMethod = paymentMethods.find(
    (payment) => payment.code === PaymentMethodCode.QR_CODE,
  );

  const qrPaymentMethodTypes = [
    PaymentMethodType.VN_PAY,
    PaymentMethodType.MOMO,
    PaymentMethodType.VCB_QR,
  ];

  qrPaymentMethodTypes.forEach((qrCode) => {
    console.log("qrCode", qrCode);
    const paymentIndex = payments.findIndex((payment) => payment.payment_method_code === qrCode);

    if (paymentIndex > -1) {
      if (!qrPaymentMethod) {
        return payments;
      }
      payments[paymentIndex].payment_method_id = qrPaymentMethod.id;
      payments[paymentIndex].payment_method = qrPaymentMethod.name;
      payments[paymentIndex].payment_method_code = qrPaymentMethod.code;
      payments[paymentIndex].code = qrPaymentMethod.code;
      payments[paymentIndex].name = qrPaymentMethod.name;
      payments[paymentIndex].type = qrCode;
      if (qrCode === PaymentMethodCode.VN_PAY) {
        payments[paymentIndex].type = "vnpay";
      }
    }
  });

  return payments;
};

export const formatTags = (values: SpecialOrderValue, oldTags: string) => {
  if (values.type) {
    let newTags = `special_order+${values.type}`;
    const listItemSpecialType: OrderType = {
      "orders-exchange": ["order_return"],
      "orders-recall": ["order_care", "order_original", "product"],
      "orders-partial": ["order_care", "product", "amount"],
      "cod-exchange": ["order_care", "amount", "reason"],
      transfer: ["line_transfer"],
      "collect-support": ["order_care", "amount"],
      "orders-split": ["order_care", "order_original"],
      "orders-embroider": ["amount"],
      "orders-continue-deliver": ["order_care", "order_return"],
      "orders-cancel": ["order_care", "reason"],
    };

    listItemSpecialType[values.type].forEach((val: string) => {
      if (val === "product" || val === "order_return" || val === "order_original") {
        // @ts-ignore
        values[val] = values[val].join(";");
      }
      newTags = newTags + `+${values[val]}`;
    });

    if (oldTags) {
      let isSpecialTags: boolean = false;
      let arrOldTags = oldTags.split(",");
      arrOldTags = arrOldTags.map((tag) => {
        if (tag.trim().startsWith("special_order")) {
          isSpecialTags = true;
          return newTags;
        } else return tag.trim();
      });
      if (!isSpecialTags) {
        arrOldTags = arrOldTags.concat(newTags);
      }

      return arrOldTags.join(",");
    }
    return newTags;
  } else return oldTags;
};

export const convertTagToArrayField = (tag: string) => {
  if (!tag) return false;
  let splitTag = tag.split(",").filter((tag) => tag.trim().startsWith("special_order"));
  if (splitTag.length === 0) return false;
  const listItemSpecialType = {
    "orders-exchange": ["order_return"],
    "orders-recall": ["order_care", "order_original", "product"],
    "orders-partial": ["order_care", "product", "amount"],
    "cod-exchange": ["order_care", "amount", "reason"],
    transfer: ["line_transfer"],
    "collect-support": ["order_care", "amount"],
    "orders-split": ["order_care", "order_original"],
    "orders-embroider": ["amount"],
    "orders-continue-deliver": ["order_care", "order_return"],
    "orders-cancel": ["order_care", "reason"],
  };
  let splitTagSpecial = splitTag[0].split("+");
  splitTagSpecial.shift();
  let typeName = select_type_especially_order.find((type) => type.value === splitTagSpecial[0]);
  let tagFieldObject: { field: string; value: string | string[] }[] = [];
  // @ts-ignore
  if (!Boolean(listItemSpecialType[splitTagSpecial[0]])) return false;
  if (typeName) {
    tagFieldObject = [{ field: "type", value: typeName.label }];
  }
  // @ts-ignore
  listItemSpecialType[splitTagSpecial[0]].every((field, index) => {
    if (field === "order_original" || field === "product" || field === "order_return") {
      let fieldTag = { field, value: splitTagSpecial[index + 1].split(";") };
      tagFieldObject = [...tagFieldObject, fieldTag];
      return true;
    } else {
      let fieldTag = { field, value: splitTagSpecial[index + 1] };
      tagFieldObject = [...tagFieldObject, fieldTag];
      return true;
    }
  });
  return tagFieldObject;
};
export const convertTagToObject = (tag: string) => {
  if (!tag) return false;
  let splitTag = tag.split(",").filter((tag) => tag.trim().startsWith("special_order"));
  if (splitTag.length === 0) return false;
  const listItemSpecialType = {
    "orders-exchange": ["order_return"],
    "orders-recall": ["order_care", "order_original", "product"],
    "orders-partial": ["order_care", "product", "amount"],
    "cod-exchange": ["order_care", "amount", "reason"],
    transfer: ["line_transfer"],
    "collect-support": ["order_care", "amount"],
    "orders-split": ["order_care", "order_original"],
    "orders-embroider": ["amount"],
    "orders-continue-deliver": ["order_care", "order_return"],
    "orders-cancel": ["order_care", "reason"],
  };
  let splitTagSpecial = splitTag[0].split("+");
  splitTagSpecial.shift();
  let typeName = select_type_especially_order.find((type) => type.value === splitTagSpecial[0]);
  let tagFieldObject: { [key: string]: string | string[] } = {};
  // @ts-ignore
  if (!Boolean(listItemSpecialType[splitTagSpecial[0]])) return false;
  if (typeName) {
    tagFieldObject = { type: typeName.label };
  }
  // @ts-ignore
  listItemSpecialType[splitTagSpecial[0]].every((field, index) => {
    if (field === "order_original" || field === "product" || field === "order_return") {
      let fieldTag = { [field]: splitTagSpecial[index + 1].split(";") };
      tagFieldObject = { ...tagFieldObject, ...fieldTag };
      return true;
    } else {
      let fieldTag = { [field]: splitTagSpecial[index + 1] };
      tagFieldObject = { ...tagFieldObject, ...fieldTag };
      return true;
    }
  });
  return tagFieldObject;
};
export const lineItemsConvertInSearchPromotion = (
  _item: OrderLineItemRequest,
  keyword: string,
  type?: string,
) => {
  let _itemChange: any = {
    original_unit_price: _item.price,
    product_id: _item.product_id,
    quantity: _item.quantity,
    sku: _item.sku,
    variant_id: _item.variant_id,
  };
  if (
    _item.discount_items[0]?.discount_code &&
    _item.discount_items[0]?.discount_code.length !== 0
  ) {
    _itemChange.applied_discount = {
      code: _item.discount_items[0].discount_code,
    };
  } else if (type === DISCOUNT_TYPE.MONEY) {
    _itemChange.keyword = keyword;
    _itemChange.search_type = DiscountValueType.FIXED_PRICE;
  } else if (type === DISCOUNT_TYPE.PERCENT) {
    _itemChange.keyword = keyword;
    _itemChange.search_type = DiscountValueType.PERCENTAGE;
  } else if (type === DISCOUNT_TYPE.COUPON) {
    _itemChange.applied_discount = {
      code: keyword,
    };
  }

  return _itemChange;
};
export const getLineItemCalculationMoney = (_item: OrderLineItemRequest) => {
  let newItem = { ..._item };
  newItem.discount_value = getLineItemDiscountValue(newItem);
  newItem.discount_amount = getLineItemDiscountAmount(newItem);
  newItem.discount_rate = getLineItemDiscountRate(newItem);
  newItem.line_amount_after_line_discount = getLineAmountAfterLineDiscount(newItem);

  return newItem;
};

export const removeDiscountLineItem = (_item: OrderLineItemRequest) => {
  _item.isLineItemSemiAutomatic = false;
  _item.discount_amount = 0;
  _item.discount_items = [];
  _item.discount_rate = 0;
  _item.discount_value = 0;
  _item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(_item);
};

export const removeAllDiscountLineItems = (_items: OrderLineItemRequest[]) => {
  let newItems = _.cloneDeep(_items);
  newItems.map((item) => {
    return removeDiscountLineItem(item);
  });

  return newItems;
};

/**
 *
 * @param itemsDefault so sánh sự thay đổi trước và sau,
 * @param newItems
 * @returns true or false
 */
export const compareProducts = (
  itemsDefault: OrderLineItemRequest[],
  newItems?: OrderLineItemRequest[],
) => {
  if (!newItems) return false;
  if (itemsDefault.length !== newItems.length) return false;

  let check = true;
  itemsDefault.forEach((item, index) => {
    if (newItems[index].sku !== item.sku) {
      check = false;
      return;
    } else if (newItems[index].quantity !== item.quantity) {
      check = false;
      return;
    } else if (newItems[index].price !== item.price) {
      check = false;
      return;
    } else if (
      (item.discount_items[0]?.promotion_id || null) !==
      (newItems[index].discount_items[0]?.promotion_id || null)
    ) {
      check = false;
      return;
    }
  });

  return check;
};

export const checkIfOrderSplit = (OrderDetail?: OrderResponse | null) => {
  return (
    OrderDetail?.status === OrderStatus.DRAFT ||
    (OrderDetail?.status === OrderStatus.FINALIZED &&
      OrderDetail.fulfillment_status === FulFillmentStatus.UNSHIPPED) ||
    (OrderDetail?.status === OrderStatus.FINALIZED &&
      OrderDetail.fulfillment_status === FulFillmentStatus.PICKED) ||
    (OrderDetail?.status === OrderStatus.FINALIZED &&
      OrderDetail.fulfillment_status === FulFillmentStatus.PACKED)
  );
};

export const convertReverseDiscountType = (type: string) => {
  let customType = "";
  switch (type) {
    case DiscountValueType.FIXED_AMOUNT:
      customType = DISCOUNT_TYPE.MONEY;
      break;
    case DiscountValueType.FIXED_PRICE:
      customType = DISCOUNT_TYPE.MONEY;
      break;
    case DiscountValueType.PERCENTAGE:
      customType = DISCOUNT_TYPE.PERCENT;
      break;
    default:
      customType = DISCOUNT_TYPE.MONEY;
      break;
  }

  return customType;
};

export const convertReverseTypeInDiscountItem = (discounts: OrderItemDiscountRequest[]) => {
  const _discounts = _.cloneDeep(discounts);
  if (_discounts && _discounts[0]) {
    const _type = _discounts[0].type || DiscountValueType.FIXED_AMOUNT;
    _discounts[0].sub_type = _type;
    _discounts[0].type = convertReverseDiscountType(_type);
  }

  return _discounts;
};

export const convertStandardizeTypeInDiscountItem = (discounts: OrderItemDiscountRequest[]) => {
  const _discounts = _.cloneDeep(discounts);
  if (_discounts && _discounts[0]) {
    _discounts[0].type = _discounts[0].sub_type || DiscountValueType.FIXED_AMOUNT;
    _discounts[0].sub_type = undefined;
  }

  return _discounts;
};

/**
 * chuyển đổi ngược type trong discount
 * @param item
 * @returns OrderLineItemRequest
 */
// export const convertOrderLineItemRequest = (item: OrderLineItemRequest) => {
//   const _discountItem = _.cloneDeep(item.discount_items);
//   if (_discountItem && _discountItem[0]) {
//     const _type = _discountItem[0].type || DiscountValueType.FIXED_AMOUNT;
//     _discountItem[0].sub_type = _type;
//     _discountItem[0].type = convertDiscountType(_type);
//   }

//   return {
//     ...item,
//     isLineItemSemiAutomatic: true,
//     discount_items: _discountItem,
//   };
// };

export const getPositionLineItem = (items: OrderLineItemRequest[]) => {
  const _position = items.map((p) => p.position || 0);
  if (!_position || (_position && _position.length === 0)) {
    return items.length + 1;
  } else {
    const maxPosition = _position.reduce((a, b) => (a > b ? a : b));
    return maxPosition + 1;
  }
};

/**
 * fix vị trí item quà tặng order
 */
export const fixOrderPositionItem = (OrderDetail: OrderResponse) => {
  const gifts = OrderDetail.items.filter((item) => isGiftLineItem(item.type)) || [];
  // thêm leftPositionQuantity để biết xem quà tặng đã add vào sản phẩm chưa
  const resultGifts = gifts.map((gift) => {
    return {
      ...gift,
      leftPositionQuantity: 1,
    };
  });
  OrderDetail.items.forEach((item) => {
    if (item.type !== Type.SERVICE) {
      let giftItems = resultGifts.filter((itemGift) => itemGift.position === item.position);
      let itemGifts: OrderLineItemResponse[] = [];
      giftItems.forEach((gift) => {
        if (gift.leftPositionQuantity) {
          itemGifts.push(gift);
          gift.leftPositionQuantity = 0;
        }
      });
      item.gifts = itemGifts;
    }
  });
  return OrderDetail;
};

/**
 * Kiểm tra đơn hàng Có từ "Facebook" trong tên nguồn
 * và ít nhất 1 trong những từ trong chuỗi sau ['Moon', 'Sun', 'SunShine', 'Light']"
 */

export const isSourceNameFacebook = (sourceName: string) => {
  const keyword = "Facebook";
  const subKeyword = ["Moon", "Sun", "SunShine", "Light"];
  return (
    fullTextSearch(keyword, sourceName) && subKeyword.some((p) => fullTextSearch(p, sourceName))
  );
};

export const isOrderWholesale = (order: OrderResponse | OrderModel | null | undefined) => {
  return order?.type === EnumOrderType.b2b;
};

export const handleReCalculateReturnProductDiscountAmount = (item: OrderLineItemResponse) => {
  item.amount = item.quantity * item.price;
  item.discount_items.forEach((discount) => {
    discount.rate = mathRoundPercentage(discount.rate);
    if (discount.type === DISCOUNT_VALUE_TYPE.percentage) {
      discount.amount = mathRoundAmount(item.quantity * ((discount.rate / 100) * item.price));
    } else {
      discount.amount = mathRoundAmount(item.quantity * discount.value);
    }
  });
  item.discount_value = getLineItemDiscountValue(item);
  item.discount_rate = getLineItemDiscountRate(item);
  item.discount_amount = getLineItemDiscountAmount(item);
  item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(item);
  // item.single_distributed_order_discount = item.quantity
  //   ? (item.distributed_order_discount ?? 0) / item.quantity
  //   : item.quantity;
};

export const isGiftLineItem = (type: string) => {
  const types = [EnumGiftType.BY_ORDER.toString(), EnumGiftType.BY_ITEM.toString(), Type.GIFT];

  return types.includes(type);
};

export const checkOrderGiftWithSplitOrder = (
  _v: OrderCorrelativeVariantResponse,
  _items: OrderLineItemResponse[],
) => {
  if (!_v.split) return false;
  const newItem = [..._items, ..._v.items];
  if (
    newItem.some(
      (p) =>
        p.type === EnumGiftType.BY_ORDER ||
        (p.gifts && p.gifts.length !== 0 && p.gifts.some((p) => p.type === EnumGiftType.BY_ORDER)),
    )
  ) {
    return true;
  }

  return false;
};

export const getFlattenLineItem = (_items: OrderLineItemRequest[]) => {
  const itemsTypeNormal = _items.filter((item) => !isGiftLineItem(item.type));
  const itemsTypeGiftFlatten = flattenArray(
    itemsTypeNormal.filter((p) => p.gifts && p.gifts.length !== 0).map((p) => p.gifts),
  );
  const itemTypeGift = _items.filter((item) => isGiftLineItem(item.type));
  return [...itemsTypeNormal, ...itemsTypeGiftFlatten, ...itemTypeGift];
};

export const checkBag = (item: OrderLineItemRequest) => {
  const _bags = [
    BAGS_CONFIG.ztm0002.variant_id,
    BAGS_CONFIG.ztm0002.variant_id,
    BAGS_CONFIG.ztm4.variant_id,
    BAGS_CONFIG.ztm1.variant_id,
    BAGS_CONFIG.ztm2.variant_id,
  ];

  if (_bags.includes(item.variant_id)) {
    return true;
  }
  return false;
};
