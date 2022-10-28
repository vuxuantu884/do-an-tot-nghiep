import { rest } from "msw";

const orderDetailNotPayment = {
  id: 21903707,
  code: "SO021903707",
  version: 1,
  created_by: "YD99999",
  created_name: "Quản trị viên",
  created_date: "2022-10-08T15:41:00Z",
  updated_by: "YD99999",
  updated_name: "Quản trị viên",
  updated_date: "2022-10-08T15:42:24Z",
  reference_code: "10779444",
  company_id: 1,
  company: "Công ty cổ phần thời trang YODY",
  store_id: 160,
  store_code: "YDVNHDG18",
  store: "Hub Online",
  store_phone_number: "02499966668",
  store_full_address: "Hub Online",
  status: "finalized",
  price_type: "retail_price",
  tax_treatment: "inclusive",
  source_id: 143,
  source_code: "SC000086",
  source: "Mobile App",
  note: "(Đơn hàng COD)",
  tags: "",
  payment_method_id: null,
  payment_method_code: null,
  payment_method: null,
  expected_payment_method_id: null,
  expected_delivery_provider_id: null,
  expected_delivery_type: null,
  customer_note: "",
  sale_note: null,
  account_code: "YD99999",
  account: "Quản trị viên",
  marketer_code: null,
  marketer: null,
  coordinator_code: null,
  coordinator: null,
  assignee_code: "YD0WEB",
  assignee: "Web App Ladipage",
  channel_id: 13,
  channel_code: "ADMIN",
  channel: "Admin",
  customer_id: 7422689,
  customer: "TUY****",
  customer_phone_number: "0365987377",
  customer_email: "",
  fulfillment_status: "unshipped",
  packed_status: null,
  received_status: null,
  payment_status: "unpaid",
  return_status: "unreturned",
  total_line_amount_after_line_discount: 549000,
  total: 571200,
  order_discount_rate: null,
  order_discount_value: null,
  discount_reason: null,
  total_discount: 0,
  total_tax: null,
  finalized_account_code: "YD99999",
  cancel_account_code: null,
  finish_account_code: null,
  finalized_on: "2022-10-08T15:41:00.000+00:00",
  cancelled_on: null,
  finished_on: null,
  items: [
    {
      id: 229036,
      code: "3ac34d1c-49ec-4799-8f7a-aa4dbc779ff3",
      version: 1,
      created_by: "YD99999",
      created_name: "Quản trị viên",
      created_date: "2022-10-08T15:41:00Z",
      updated_by: "YD99999",
      updated_name: "Quản trị viên",
      updated_date: "2022-10-08T15:41:00Z",
      order_line_item_id: null,
      sku: "AKM4027-XAH-XL",
      variant_id: 2338,
      variant: "Áo khoác nam phối lưng - Xanh - XL",
      product_id: 164,
      product: "Áo khoác nam phối lưng",
      product_code: "AKM4027",
      variant_barcode: "2000174723116",
      product_type: "normal",
      quantity: 1,
      price: 549000,
      amount: 549000,
      discount_items: [],
      note: null,
      variant_image: "",
      unit: "piece",
      warranty: null,
      tax_rate: null,
      tax_include: null,
      is_composite: null,
      line_amount_after_line_discount: 549000,
      discount_rate: 0,
      discount_value: 0,
      discount_amount: 0,
      position: null,
      weight: 180,
      weight_unit: "g",
      type: "normal",
    },
  ],
  discounts: [],
  pre_payments: null,
  payments: [],
  fulfillments: [
    {
      id: 149267,
      code: "FM000149267",
      version: 1,
      created_by: "YD99999",
      created_name: "Quản trị viên",
      created_date: "2022-10-08T15:41:00Z",
      updated_by: "YD99999",
      updated_name: "Quản trị viên",
      updated_date: "2022-10-08T15:42:24Z",
      order_id: 21903707,
      account_code: "YD99999",
      assignee_code: "YD0WEB",
      delivery_type: "",
      status: "unshipped",
      partner_status: null,
      shipment: null,
      billing_address_id: null,
      items: [
        {
          id: 185426,
          code: "5ec7ba16-f591-4d94-b141-0d458e1e3799",
          version: 1,
          created_by: "YD99999",
          created_name: "Quản trị viên",
          created_date: "2022-10-08T15:41:00Z",
          updated_by: "YD99999",
          updated_name: "Quản trị viên",
          updated_date: "2022-10-08T15:42:24Z",
          order_line_item_id: 229036,
          product_id: 164,
          product: "Áo khoác nam phối lưng",
          product_code: "AKM4027",
          variant_id: 2338,
          variant: "Áo khoác nam phối lưng - Xanh - XL",
          order_line_item_note: null,
          quantity: 1,
          base_price: null,
          discount_rate: 0,
          discount_value: 0,
          tax_type_id: null,
          tax_rate: null,
          line_amount: null,
          line_discount_amount: null,
          line_amount_after_line_discount: 549000,
          weight: 180,
          weight_unit: "g",
          sku: "AKM4027-XAH-XL",
          variant_barcode: "2000174723116",
          unit: "piece",
        },
      ],
      stock_location_id: 160,
      returned_store_id: 160,
      payment_status: "",
      total: 571200,
      total_tax: null,
      total_discount: 0,
      total_quantity: 1,
      stock_out_account_code: null,
      receive_account_code: null,
      cancel_account_code: null,
      receive_cancellation_account_code: null,
      payments: null,
      picked_on: null,
      packed_on: null,
      shipped_on: null,
      export_on: null,
      received_on: null,
      cancel_date: null,
      return_status: "unreturned",
      receive_cancellation_on: null,
      status_before_cancellation: null,
      discount_rate: null,
      discount_value: null,
      discount_amount: null,
      total_line_amount_after_line_discount: 549000,
      returning_on: null,
      sub_reason_name: null,
      sub_reason_id: null,
      reason_id: null,
      sub_reason_detail_id: null,
      reason_name: null,
      sub_reason_detail_name: null,
    },
  ],
  currency: "VND",
  billing_address: null,
  shipping_address: {
    id: 51772,
    code: "f717893f-c03d-4e69-b8d6-21930cbc0e9a",
    version: 2,
    created_by: "YD99999",
    created_name: "Quản trị viên",
    created_date: "2022-10-08T15:41:00Z",
    updated_by: "YD99999",
    updated_name: "Quản trị viên",
    updated_date: "2022-10-08T15:42:24Z",
    name: "TUY****",
    email: "",
    phone: "0365987377",
    second_phone: "",
    country: null,
    city_id: 47,
    city: "Tỉnh Bắc Giang",
    district_id: 562,
    district: "Huyện Việt Yên",
    ward_id: 9234,
    ward: "Xã Quảng Minh",
    zip_code: null,
    full_address: "Quảng minh, việt yên , bắc giang ",
    channel: null,
  },
  shipping_fee_informed_to_customer: 22200,
  url: "",
  sub_status_id: 2,
  sub_status_code: "awaiting_coordinator_confirmation",
  sub_status: "Mới",
  order_returns: [],
  accumulate_point: null,
  linked_order_code: null,
  ecommerce_shop_id: null,
  ecommerce_shop_name: null,
  order_migration_id: null,
  created_on: "2022-10-08T15:41:00.000+00:00",
  campaign_id: null,
  utm_tracking: null,
  export_bill: false,
  migration_note: null,
  atomic_migration: false,
  actual_quantity: 1,
  sub_reason_name: null,
  sub_reason_id: null,
  reason_id: null,
  automatic_discount: false,
  reason_name: null,
};

export const handlers = [
  // Handles a POST /login request
  rest.get("https://dev.api.yody.io/unicorn/order-service/orders/21903707", (req, res, ctx) => {
    return rest(ctx.json(orderDetailNotPayment));
  }),
  rest.get("http://dev.api.yody.io/unicorn/core-service/stores/public", (req, res, ctx) => {
    return rest(ctx.json([]));
  }),
  // Handles a GET /user request
  rest.get("/user", null),
];