import { Type } from "config/type.config";
import _ from "lodash";
import { DiscountValueType } from "model/promotion/price-rules.model";
import {
  OrderItemDiscountRequest,
  OrderLineItemRequest,
  OrderRequest,
} from "model/request/order.request";
import { OrderLineItemResponse } from "model/response/order/order.response";
import {
  getLineAmountAfterLineDiscount,
  getLineItemDiscountAmount,
  getLineItemDiscountRate,
  getLineItemDiscountValue,
  getTotalAmount,
  getTotalAmountAfterDiscount,
  totalAmount,
} from "utils/AppUtils";
import { ADMIN_ORDER, DEFAULT_COMPANY, OrderStatus } from "utils/Constants";
import { OrderSplitModel } from "./_model";

export const createRequest = (initialRequest: OrderRequest, response: OrderSplitModel) => {
  const responseItems = createItem(response.items);
  let total_line_amount_after_line_discount = getTotalAmountAfterDiscount(responseItems);
  const discountOrder = customerOrderDiscountRequest(response, responseItems);
  let _initialRequest = {
    ...initialRequest,
    store_id: response.store_id,
    customer_note: response.customer_note,
    source_id: response.source_id,
    assignee_code: response?.assignee_code || null,
    marketer_code: response?.marketer_code || undefined,
    coordinator_code: undefined,
    url: response.url,
    note: response.note,
    uniform: response.uniform,
    channel_id: ADMIN_ORDER.channel_id,
    company_id: DEFAULT_COMPANY.company_id,
    tags: response.tags,
    items: responseItems,
    discounts: discountOrder,
    shipping_address: { ...response.shipping_address, id: null },
    billing_address: response.billing_address,
    customer_id: response.customer_id,
    customer_ward: response.customer_ward,
    customer_district: response.customer_district,
    customer_city: response.customer_city,
    total_line_amount_after_line_discount: total_line_amount_after_line_discount,
    export_bill: response.export_bill,
    shipping_fee_informed_to_customer: 0,
    fulfillments: [],
    payments: [],
    action: OrderStatus.FINALIZED,
    total: getTotalAmount(responseItems),
  };

  return _initialRequest;
};
const createItem = (responseItem: OrderLineItemResponse[]) => {
  let requestItems: OrderLineItemRequest[] = _.cloneDeep(responseItem);
  let getGiftResponse = (itemNormal: OrderLineItemResponse) => {
    return responseItem.filter((item) => {
      return item.type === Type.GIFT && item.position === itemNormal.position;
    });
  };
  requestItems = responseItem
    .filter((item) => {
      return item.type !== Type.GIFT;
    })
    .map((item) => {
      customerOrderLineItemRequest(item);
      return {
        ...item,
        taxable: item.taxable,
        discount_items: item.discount_items.filter((single) => single.amount && single.value),
        gifts: getGiftResponse(item),
      };
    });
  return requestItems;
};

const customerOrderLineItemRequest = (item: OrderLineItemRequest) => {
  item.amount = item.quantity * item.price;

  if (item.discount_items && item.discount_items[0]) {
    const discount = item.discount_items[0];
    let discountItems: OrderItemDiscountRequest = {
      amount: discount.value * item.quantity,
      value: discount.value,
      rate: discount.rate,
      discount_code: discount.discount_code,
      promotion_id: discount.promotion_id,
      type: discount.type,
      promotion_title: discount.promotion_title,
      taxable: discount.taxable,
      reason: discount.reason,
    };
    item.discount_items = [discountItems];
  }

  item.discount_value = getLineItemDiscountValue(item);
  item.discount_amount = getLineItemDiscountAmount(item);
  item.discount_rate = getLineItemDiscountRate(item);
  item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(item);
};

const customerOrderDiscountRequest = (
  response: OrderSplitModel,
  responseItems: OrderLineItemRequest[],
) => {
  if (!response.discounts || (response.discounts && !response.discounts[0]?.value)) return [];

  const promotion = _.cloneDeep(response.discounts[0]);

  let _value = promotion?.value || 0;
  let _rate = promotion?.rate || 0;
  let totalOrderAmount = totalAmount(responseItems);
  // const distributedOrderDiscountCustom = response.items
  //   .map((item) => (item.single_distributed_order_discount ?? 0) * item.quantity)
  //   .reduce((prev, next) => prev + next);
  if (
    promotion.type === DiscountValueType.FIXED_AMOUNT ||
    promotion.type === DiscountValueType.FIXED_PRICE
  ) {
    _value = getProductDiscountPerOrder(response);
    _rate = _.round((_value / totalOrderAmount) * 100);
  } else if (promotion.type === DiscountValueType.PERCENTAGE) {
    _rate = promotion?.rate || 0;
    if (_rate > 100) {
      _rate = 100;
    }
    _value = (_rate * totalOrderAmount) / 100;
  }

  let _promotion = {
    order_id: promotion.order_id,
    source: promotion.source,
    promotion_id: promotion.promotion_id,
    promotion_title: promotion.promotion_title,
    type: promotion.type,
    amount: _value,
    discount_code: promotion.discount_code,
    taxable: promotion.taxable,
    rate: _rate,
    reason: promotion.promotion_title,
    value: _value,
  };

  return [_promotion];
};

export const totalQuantitySplit = (data: any, indexItems?: number) => {
  let _data = indexItems ? data.filter((p: any) => p.index === indexItems) : data;

  const totalQuantitySplit = _data
    .map((item: any) => item.quantity)
    .reduce((prev: number, next: number) => prev + next);

  return totalQuantitySplit;
};

export const getProductDiscountPerOrder = (OrderDetail: OrderSplitModel) => {
  const distributedOrderDiscountCustom = OrderDetail.items
    .map((item) => {
      let discountPerOrder = 0;
      if (OrderDetail?.discounts?.length && OrderDetail.discounts[0].amount > 0) {
        let taxValue = 1;
        if (OrderDetail.discounts[0].taxable && item.tax_lines && item.tax_lines[0].rate) {
          let taxRate = item.tax_lines[0].rate;
          taxValue = 1 + taxRate;
        }
        discountPerOrder +=
          (item.single_distributed_order_discount || 0) * item.quantity * taxValue;
      }
      return _.round(discountPerOrder);
    })
    .reduce((prev, next) => prev + next);

  return distributedOrderDiscountCustom;
};
