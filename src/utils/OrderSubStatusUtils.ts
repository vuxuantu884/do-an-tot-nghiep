export const ORDER_SUB_STATUS = {
  first_call_attempt: "first_call_attempt",
  second_call_attempt: "second_call_attempt",
  third_call_attempt: "third_call_attempt",
  awaiting_coordinator_confirmation: "awaiting_coordinator_confirmation",
  awaiting_saler_confirmation: "awaiting_saler_confirmation",
  coordinator_confirmed: "coordinator_confirmed",
  merchandise_picking: "merchandise_picking",
  require_warehouse_change: "require_warehouse_change",
  merchandise_packed: "merchandise_packed",
  awaiting_shipper: "awaiting_shipper",
  shipping: "shipping",
  shipped: "shipped",
  canceled: "canceled",
  fourHour_delivery: "4h_delivery",
  order_return: "order_return",
};
export const ORDER_RETURN_SUB_STATUS = {
  returning: {
    code: "returning",
  },
  returned: {
    code: "returned",
  },
};