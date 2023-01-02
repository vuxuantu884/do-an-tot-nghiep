import { Type } from "config/type.config";
import _ from "lodash";
import { DiscountValueType } from "model/promotion/price-rules.model";
import {
  FulFillmentRequest,
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
  getTotalQuantity,
  totalAmount,
} from "utils/AppUtils";
import { ADMIN_ORDER, DEFAULT_COMPANY, OrderStatus } from "utils/Constants";
import { OrderSplitModel } from "./_model";

export const createRequest = (initialRequest: OrderRequest, response: OrderSplitModel) => {
  const responseItems = createItem(response.items);
  const responseItemsGift = createItemGifts(response.items) || [];
  const discountOrder = customerOrderDiscountRequest(response, responseItems);
  const total_line_amount_after_line_discount = getTotalAmountAfterDiscount(responseItems);
  let _request: OrderRequest = {
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
    items: responseItems.concat(responseItemsGift),
    discounts: discountOrder,
    shipping_address: { ...response.shipping_address, id: null } as any,
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
  _request.fulfillments = createFulFillmentRequest(_request as OrderRequest);

  return _request;
};
const createItem = (responseItem: OrderLineItemResponse[]) => {
  let requestItems: OrderLineItemRequest[] = _.cloneDeep(responseItem);
  requestItems = responseItem.map((item) => {
    customerOrderLineItemRequest(item);
    return {
      ...item,
      taxable: item.taxable,
      discount_items: item.discount_items.filter((single) => single.amount && single.value),
    };
  });
  return requestItems;
};

const createItemGifts = (items: OrderLineItemRequest[]) => {
  let _itemGifts: OrderLineItemRequest[] = [];
  for (let i = 0; i < items.length; i++) {
    if (!items[i].gifts) {
      return;
    }
    _itemGifts = [..._itemGifts, ...items[i].gifts];
  }
  _itemGifts.forEach((item) => {
    item.discount_items = item.discount_items.filter(
      (single) => (single.amount && single.value) || single.promotion_id,
    );
  });

  return _itemGifts;
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
    _value = getProductDiscountPerOrderSplit(response);
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

const createFulFillmentRequest = (orderRequest: OrderRequest) => {
  const discountOrder = orderRequest?.discounts ? orderRequest?.discounts[0] : null;
  let _fulfillment: FulFillmentRequest = {
    store_id: orderRequest.store_id,
    account_code: orderRequest.account_code,
    assignee_code: orderRequest.assignee_code,
    delivery_type: "",
    stock_location_id: null,
    payment_status: "",
    total: orderRequest.total,
    total_tax: null,
    total_discount: discountOrder?.value || null,
    total_quantity: getTotalQuantity(orderRequest.items),
    discount_rate: discountOrder?.rate || null,
    discount_value: discountOrder?.value || null,
    discount_amount: null,
    total_line_amount_after_line_discount: orderRequest.total_line_amount_after_line_discount,
    shipment: null,
    items: orderRequest.items,
  };

  return [_fulfillment];
};

// export const totalQuantitySplit = (data: any, indexItems?: number) => {
//   let _data = indexItems ? data.filter((p: any) => p.index === indexItems) : data;

//   const _totalQuantitySplit = _data
//     .map((item: any) => item.quantity)
//     .reduce((prev: number, next: number) => prev + next);

//   return _totalQuantitySplit;
// };

export const getProductDiscountPerOrderSplit = (OrderDetail: OrderSplitModel) => {
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
