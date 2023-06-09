import { render, waitFor } from "@testing-library/react";
import { FulFillmentResponse, OrderResponse } from "model/response/order/order.response";
import { handleFixWindowMatchMediaTest, testOrderArr } from "screens/order-online/utils/test.utils";
import UpdateProductCard from ".";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { formatCurrency, getTotalQuantity } from "utils/AppUtils";
import { checkIfFinishedPayment } from "utils/OrderUtils";
import OrderFulfillmentHeader from ".";

handleFixWindowMatchMediaTest();

const orderDetailDataTest: any = {
  id: 21903525,
  code: "SO021903525",
  version: 1,
  created_by: "YD10893",
  created_name: "LÊ VĂN LONG",
  created_date: "2022-10-05T08:48:19Z",
  updated_by: "YD10893",
  updated_name: "LÊ VĂN LONG",
  updated_date: "2022-10-08T02:58:07Z",
  reference_code: "",
  company_id: 1,
  company: "Công ty cổ phần thời trang YODY",
  store_id: 2,
  store_code: "YDVNHTH01",
  store: "YODY Đức Thọ",
  store_phone_number: "18002086",
  store_full_address: "58 Trần Phú-phường Bắc Hồng- thị xã Hồng Lĩnh- tỉnh Hà Tĩnh",
  status: "finished",
  price_type: "retail_price",
  tax_treatment: "inclusive",
  source_id: 256,
  source_code: "SC000323",
  source: "Đơn test 14",
  note: "(N.a)",
  tags: "",
  payment_method_id: null,
  payment_method_code: null,
  payment_method: null,
  expected_payment_method_id: null,
  expected_delivery_provider_id: null,
  expected_delivery_type: null,
  customer_note: "",
  sale_note: null,
  account_code: "YD10893",
  account: "LÊ VĂN LONG",
  marketer_code: null,
  marketer: null,
  coordinator_code: "YD99999",
  coordinator: "Quản trị viên",
  assignee_code: "YD10893",
  assignee: "LÊ VĂN LONG",
  channel_id: 13,
  channel_code: "ADMIN",
  channel: "Admin",
  customer_id: 7422471,
  customer: "LÊ VĂN LƯƠN",
  customer_phone_number: "0987363524",
  customer_email: "",
  fulfillment_status: "shipped",
  packed_status: null,
  received_status: null,
  payment_status: "paid",
  return_status: "returned",
  total_line_amount_after_line_discount: 229000,
  total: 231200,
  order_discount_rate: null,
  order_discount_value: null,
  discount_reason: null,
  total_discount: 20000,
  total_tax: null,
  finalized_account_code: "YD10893",
  cancel_account_code: null,
  finish_account_code: null,
  finalized_on: "2022-10-05T08:48:20.000+00:00",
  cancelled_on: null,
  finished_on: "2022-10-08T02:57:36.000+00:00",
  items: [
    {
      id: 228658,
      code: "7b6a1315-c6ab-4410-ae68-9abefdde55e1",
      version: 1,
      created_by: "YD10893",
      created_name: "LÊ VĂN LONG",
      created_date: "2022-10-05T08:48:20Z",
      updated_by: "YD10893",
      updated_name: "LÊ VĂN LONG",
      updated_date: "2022-10-05T08:48:20Z",
      order_line_item_id: null,
      sku: "APK5169-VAG-2",
      variant_id: 27816,
      variant: "Polo nam kid phối bo - Vàng - 2",
      product_id: 4637,
      product: "Polo nam kid phối bo",
      product_code: "APK5169",
      variant_barcode: "2000190943161",
      product_type: "normal",
      quantity: 1,
      price: 229000,
      amount: 229000,
      discount_items: [],
      note: "",
      variant_image: "",
      unit: "piece",
      warranty: "",
      tax_rate: 0,
      tax_include: null,
      is_composite: null,
      line_amount_after_line_discount: 229000,
      discount_rate: 0,
      discount_value: 0,
      discount_amount: 0,
      position: 1,
      weight: 150,
      weight_unit: "g",
      type: "normal",
    },
  ],
  discounts: [
    {
      id: 83725,
      code: "4d21af74-2197-4d61-8af6-441c77eeb3f8",
      version: 1,
      created_by: "YD10893",
      created_name: "LÊ VĂN LONG",
      created_date: "2022-10-05T09:11:05Z",
      updated_by: "YD10893",
      updated_name: "LÊ VĂN LONG",
      updated_date: "2022-10-05T09:11:05Z",
      rate: 8.73,
      value: 20000,
      amount: 20000,
      promotion_id: 1512,
      discount_code: null,
      source: "",
      reason: "N.a",
      order_id: 21903525,
    },
  ],
  pre_payments: null,
  payments: [
    {
      id: 125295,
      code: "a11b243a-df32-442d-8f2f-3f3b39a01ee3",
      version: 1,
      created_by: "YD10893",
      created_name: "LÊ VĂN LONG",
      created_date: "2022-10-08T02:57:36Z",
      updated_by: "YD10893",
      updated_name: "LÊ VĂN LONG",
      updated_date: "2022-10-08T02:57:36Z",
      fulfillment_id: null,
      payment_method_id: 0,
      payment_method_code: "cod",
      payment_method: "COD",
      amount: 231200,
      reference: null,
      source: "cod",
      paid_amount: 231200,
      return_amount: 0,
      status: "paid",
      customer_id: null,
      type: "cod",
      invoice_id: null,
      note: null,
      point: null,
      bank_account_id: null,
      bank_account_number: null,
      bank_account_holder: null,
      bank_code: null,
      bank_name: null,
      ref_transaction_code: null,
      pay_url: null,
      short_link: null,
      expired_at: null,
    },
  ],
  fulfillments: [
    {
      id: 149101,
      code: "FM000149101",
      version: 1,
      created_by: "YD10893",
      created_name: "LÊ VĂN LONG",
      created_date: "2022-10-05T08:48:20Z",
      updated_by: "YD10893",
      updated_name: "LÊ VĂN LONG",
      updated_date: "2022-10-08T02:57:36Z",
      order_id: 21903525,
      account_code: "YD10893",
      assignee_code: "YD10893",
      delivery_type: "",
      status: "shipped",
      partner_status: null,
      shipment: {
        id: 73720,
        code: "b6234c94-2926-4ec9-8517-adaa65bf4b96",
        version: 1,
        created_by: "YD10893",
        created_name: "LÊ VĂN LONG",
        created_date: "2022-10-08T02:57:28Z",
        updated_by: "YD10893",
        updated_name: "LÊ VĂN LONG",
        updated_date: "2022-10-08T02:57:28Z",
        delivery_service_provider_id: null,
        delivery_service_provider_code: null,
        delivery_service_provider_name: null,
        delivery_service_provider_type: "pick_at_store",
        delivery_transport_type: null,
        delivery_service_note: null,
        handover_id: null,
        service: null,
        who_paid: null,
        fee_type: null,
        fee_base_on: null,
        delivery_fee: null,
        reference_status: null,
        reference_status_explanation: null,
        cancel_reason: null,
        tracking_code: null,
        tracking_url: null,
        received_date: null,
        expected_received_date: null,
        shipping_fee_paid_to_three_pls: null,
        sender_address_id: null,
        sender_address: null,
        requirements: "open_try",
        requirements_name: null,
        note_to_shipper: null,
        fulfillment_id: 149101,
        cod: 231200,
        shipper_code: null,
        shipper_name: null,
        pushing_note: null,
        pushing_status: null,
        shipping_address: null,
        office_time: null,
        shipper_phone: null,
        recipient_sort_code: null,
        info_shipper: null,
        type_shipment: null,
      },
      billing_address_id: null,
      items: [
        {
          id: 185129,
          code: "33af543f-a258-4086-b8b7-1d15d15b108e",
          version: 1,
          created_by: "YD10893",
          created_name: "LÊ VĂN LONG",
          created_date: "2022-10-05T08:48:20Z",
          updated_by: "YD10893",
          updated_name: "LÊ VĂN LONG",
          updated_date: "2022-10-05T08:52:00Z",
          order_line_item_id: 228658,
          product_id: 4637,
          product: "Polo nam kid phối bo",
          product_code: "APK5169",
          variant_id: 27816,
          variant: "Polo nam kid phối bo - Vàng - 2",
          order_line_item_note: null,
          quantity: 1,
          base_price: null,
          discount_rate: 0,
          discount_value: 0,
          tax_type_id: null,
          tax_rate: 0,
          line_amount: null,
          line_discount_amount: null,
          line_amount_after_line_discount: 229000,
          weight: 150,
          weight_unit: "g",
          sku: "APK5169-VAG-2",
          variant_barcode: "2000190943161",
          unit: "piece",
        },
      ],
      stock_location_id: 2,
      returned_store_id: 2,
      payment_status: "",
      total: 251200,
      total_tax: null,
      total_discount: 0,
      total_quantity: 1,
      stock_out_account_code: null,
      receive_account_code: null,
      cancel_account_code: null,
      receive_cancellation_account_code: null,
      payments: null,
      picked_on: "2022-10-08T02:57:29.000+00:00",
      packed_on: "2022-10-08T02:57:29.000+00:00",
      shipped_on: "2022-10-08T02:57:36.000+00:00",
      export_on: "2022-10-08T02:57:36.000+00:00",
      received_on: null,
      cancel_date: null,
      return_status: "unreturned",
      receive_cancellation_on: null,
      status_before_cancellation: null,
      discount_rate: 8.73,
      discount_value: 20000,
      discount_amount: null,
      total_line_amount_after_line_discount: 229000,
      returning_on: null,
      sub_reason_id: null,
      reason_id: null,
      reason_name: null,
      sub_reason_detail_id: null,
      sub_reason_name: null,
      sub_reason_detail_name: null,
    },
  ],
  currency: "VND",
  billing_address: {
    id: 29229,
    code: "8d65305c-18dc-4401-bd38-b2bbf1459b48",
    version: 10,
    created_by: "YD10893",
    created_name: "LÊ VĂN LONG",
    created_date: "2022-10-05T08:48:20Z",
    updated_by: "YD10893",
    updated_name: "LÊ VĂN LONG",
    updated_date: "2022-10-08T02:58:07Z",
    name: "LÊ VĂN LƯƠN",
    email: "lvlong96k@gmail.com",
    phone: null,
    country: null,
    city: null,
    district: null,
    ward: null,
    zip_code: null,
    full_address: "tân lập -yên my",
    buyer: "yody",
    tax_code: "343543534",
    note: null,
    order_id: 21903525,
    contract: false,
  },
  shipping_address: {
    id: 85862,
    code: "8fab6b5c-b807-4d0d-9b98-800a389661a2",
    version: 13,
    created_by: "YD10893",
    created_name: "LÊ VĂN LONG",
    created_date: "2022-10-05T08:48:20Z",
    updated_by: "YD10893",
    updated_name: "LÊ VĂN LONG",
    updated_date: "2022-10-08T02:58:07Z",
    name: "LÊ VĂN LƯƠN",
    email: null,
    phone: "0987363524",
    second_phone: "",
    country: null,
    city_id: 1,
    city: "TP. Hà Nội",
    district_id: 3,
    district: "Quận Hoàng Mai",
    ward_id: 22,
    ward: "Phường Giáp Bát",
    zip_code: null,
    full_address: "liêu hạ",
    channel: null,
  },
  shipping_fee_informed_to_customer: 22200,
  url: "",
  sub_status_id: 8,
  sub_status_code: "shipped",
  sub_status: "Thành công",
  order_returns: [
    {
      id: 12508,
      code: "SRN000012508",
      version: 1,
      created_by: "YD10893",
      created_name: "LÊ VĂN LONG",
      created_date: "2022-10-08T02:58:07Z",
      updated_by: "YD10893",
      updated_name: "LÊ VĂN LONG",
      updated_date: "2022-10-08T02:58:07Z",
      order_id: 21903525,
      order_code: "SO021903525",
      order_exchange_id: null,
      reference_code: "",
      company_id: 1,
      company: "Công ty cổ phần thời trang YODY",
      store_id: 110,
      store: "YODY Phố Nối",
      store_phone_number: "0911168258",
      store_full_address: "Đường 196- Ngã Tư Chợ Bao Bì , Thị trấn Bần Yên Nhân",
      returned_store_id: 110,
      status: "finished",
      price_type: "retail_price",
      tax_treatment: "inclusive",
      source_id: 256,
      source: "Đơn test 14",
      note: "",
      tags: "",
      customer_id: 7422471,
      customer: "LÊ VĂN LƯƠN",
      customer_email: "",
      customer_phone_number: "0987363524",
      payment_method_id: null,
      payment_method: null,
      expected_payment_method_id: null,
      expected_delivery_provider_id: null,
      expected_delivery_type: null,
      customer_note: "",
      sale_note: null,
      account_code: "YD10893",
      account: "LÊ VĂN LONG",
      assignee_code: "YD10893",
      assignee: "LÊ VĂN LONG",
      channel_id: 1,
      channel: "POS",
      payment_status: "paid",
      total_line_amount_after_line_discount: 229000,
      total: 209000,
      total_quantities: 1,
      currency: "VND",
      order_discount_rate: null,
      order_discount_value: null,
      discount_reason: null,
      total_discount: 20000,
      total_tax: null,
      finalized_account_code: "YD10893",
      cancel_account_code: null,
      finish_account_code: null,
      finalized_on: "2022-10-05T08:48:20.000+00:00",
      cancelled_on: null,
      finished_on: "2022-10-08T02:57:36.000+00:00",
      referent: null,
      url: "",
      total_amount: null,
      return_date: "2022-10-08T02:58:07.000+00:00",
      receive_date: "2022-10-08T02:58:07.000+00:00",
      point_refund: 0,
      money_refund: 209000,
      marketer_code: null,
      marketer: null,
      other_reason: null,
      reason: {
        id: 7,
        code: "order_return",
        name: "Đổi trả hàng",
      },
      sub_reason: {
        id: 58,
        code: "error_product",
        name: "Sản phẩm lỗi",
      },
      billing_address: {
        id: 29229,
        code: "8d65305c-18dc-4401-bd38-b2bbf1459b48",
        version: 10,
        created_by: "YD10893",
        created_name: "LÊ VĂN LONG",
        created_date: "2022-10-05T08:48:20Z",
        updated_by: "YD10893",
        updated_name: "LÊ VĂN LONG",
        updated_date: "2022-10-08T02:58:07Z",
        name: "LÊ VĂN LƯƠN",
        email: "lvlong96k@gmail.com",
        phone: null,
        country: null,
        city: null,
        district: null,
        ward: null,
        zip_code: null,
        full_address: "tân lập -yên my",
        buyer: "yody",
        tax_code: "343543534",
        note: null,
        order_id: 21903525,
        contract: false,
      },
      shipping_address: {
        id: 85862,
        code: "8fab6b5c-b807-4d0d-9b98-800a389661a2",
        version: 13,
        created_by: "YD10893",
        created_name: "LÊ VĂN LONG",
        created_date: "2022-10-05T08:48:20Z",
        updated_by: "YD10893",
        updated_name: "LÊ VĂN LONG",
        updated_date: "2022-10-08T02:58:07Z",
        name: "LÊ VĂN LƯƠN",
        email: null,
        phone: "0987363524",
        second_phone: "",
        country: null,
        city_id: 1,
        city: "TP. Hà Nội",
        district_id: 3,
        district: "Quận Hoàng Mai",
        ward_id: 22,
        ward: "Phường Giáp Bát",
        zip_code: null,
        full_address: "liêu hạ",
        channel: null,
      },
      items: [
        {
          id: 229005,
          code: "ceafa97a-6ffb-48cf-8559-b7d0b7c9d5d5",
          version: 1,
          created_by: "YD10893",
          created_name: "LÊ VĂN LONG",
          created_date: "2022-10-08T02:58:07Z",
          updated_by: "YD10893",
          updated_name: "LÊ VĂN LONG",
          updated_date: "2022-10-08T02:58:07Z",
          order_line_item_id: 228658,
          sku: "APK5169-VAG-2",
          variant_id: 27816,
          variant: "Polo nam kid phối bo - Vàng - 2",
          product_id: 4637,
          product: "Polo nam kid phối bo",
          product_code: "APK5169",
          variant_barcode: "2000190943161",
          product_type: "normal",
          quantity: 1,
          price: 229000,
          amount: 229000,
          discount_items: [],
          note: "",
          variant_image: "",
          unit: "piece",
          warranty: "",
          tax_rate: 0,
          tax_include: null,
          is_composite: null,
          line_amount_after_line_discount: 229000,
          discount_rate: 0,
          discount_value: 0,
          discount_amount: 0,
          position: 1,
          weight: 150,
          weight_unit: "g",
          type: "normal",
        },
      ],
      payments: [
        {
          id: 125296,
          code: "0fc23608-70f2-43e7-98ca-e59ab2b84ffc",
          version: 1,
          created_by: "YD10893",
          created_name: "LÊ VĂN LONG",
          created_date: "2022-10-08T02:58:07Z",
          updated_by: "YD10893",
          updated_name: "LÊ VĂN LONG",
          updated_date: "2022-10-08T02:58:07Z",
          fulfillment_id: null,
          payment_method_id: 2,
          payment_method_code: "cash",
          payment_method: "Tiền mặt",
          amount: 209000,
          reference: "",
          source: "",
          paid_amount: 209000,
          return_amount: 0,
          status: "paid",
          customer_id: null,
          type: "",
          invoice_id: null,
          note: null,
          point: null,
          bank_account_id: null,
          bank_account_number: null,
          bank_account_holder: null,
          bank_code: null,
          bank_name: null,
          ref_transaction_code: null,
          pay_url: null,
          short_link: null,
          expired_at: null,
        },
      ],
      discounts: [
        {
          id: 83817,
          code: "e29a7414-610f-404d-8a61-4974c1bb6e9a",
          version: 1,
          created_by: "YD10893",
          created_name: "LÊ VĂN LONG",
          created_date: "2022-10-08T02:58:07Z",
          updated_by: "YD10893",
          updated_name: "LÊ VĂN LONG",
          updated_date: "2022-10-08T02:58:07Z",
          rate: 8.73,
          value: 20000,
          amount: 20000,
          promotion_id: null,
          discount_code: null,
          source: null,
          reason: null,
          order_id: -1,
        },
      ],
      received: true,
      sub_reason_id: 58,
      reason_id: 7,
      reason_name: "Đổi trả hàng",
      money_amount: 209000,
      sub_reason_name: "Sản phẩm lỗi",
    },
  ],
  accumulate_point: null,
  linked_order_code: null,
  ecommerce_shop_id: null,
  ecommerce_shop_name: null,
  order_migration_id: null,
  created_on: "2022-10-05T08:48:19.000+00:00",
  campaign_id: null,
  utm_tracking: null,
  export_bill: true,
  migration_note: null,
  atomic_migration: false,
  actual_quantity: 1,
  uniform: false,
  sub_reason_id: null,
  reason_id: null,
  reason_name: null,
  automatic_discount: false,
  sub_reason_name: null,
};
const fulfillmentDataTest: any = {
  id: 149101,
  code: "FM000149101",
  version: 1,
  created_by: "YD10893",
  created_name: "LÊ VĂN LONG",
  created_date: "2022-10-05T08:48:20Z",
  updated_by: "YD10893",
  updated_name: "LÊ VĂN LONG",
  updated_date: "2022-10-08T02:57:36Z",
  order_id: 21903525,
  account_code: "YD10893",
  assignee_code: "YD10893",
  delivery_type: "",
  status: "shipped",
  partner_status: null,
  shipment: {
    id: 73720,
    code: "b6234c94-2926-4ec9-8517-adaa65bf4b96",
    version: 1,
    created_by: "YD10893",
    created_name: "LÊ VĂN LONG",
    created_date: "2022-10-08T02:57:28Z",
    updated_by: "YD10893",
    updated_name: "LÊ VĂN LONG",
    updated_date: "2022-10-08T02:57:28Z",
    delivery_service_provider_id: null,
    delivery_service_provider_code: null,
    delivery_service_provider_name: null,
    delivery_service_provider_type: "pick_at_store",
    delivery_transport_type: null,
    delivery_service_note: null,
    handover_id: null,
    service: null,
    who_paid: null,
    fee_type: null,
    fee_base_on: null,
    delivery_fee: null,
    reference_status: null,
    reference_status_explanation: null,
    cancel_reason: null,
    tracking_code: null,
    tracking_url: null,
    received_date: null,
    expected_received_date: null,
    shipping_fee_paid_to_three_pls: null,
    sender_address_id: null,
    sender_address: null,
    requirements: "open_try",
    requirements_name: null,
    note_to_shipper: null,
    fulfillment_id: 149101,
    cod: 231200,
    shipper_code: null,
    shipper_name: null,
    pushing_note: null,
    pushing_status: null,
    shipping_address: null,
    office_time: null,
    shipper_phone: null,
    recipient_sort_code: null,
    info_shipper: null,
    type_shipment: null,
  },
  billing_address_id: null,
  items: [
    {
      id: 185129,
      code: "33af543f-a258-4086-b8b7-1d15d15b108e",
      version: 1,
      created_by: "YD10893",
      created_name: "LÊ VĂN LONG",
      created_date: "2022-10-05T08:48:20Z",
      updated_by: "YD10893",
      updated_name: "LÊ VĂN LONG",
      updated_date: "2022-10-05T08:52:00Z",
      order_line_item_id: 228658,
      product_id: 4637,
      product: "Polo nam kid phối bo",
      product_code: "APK5169",
      variant_id: 27816,
      variant: "Polo nam kid phối bo - Vàng - 2",
      order_line_item_note: null,
      quantity: 1,
      base_price: null,
      discount_rate: 0,
      discount_value: 0,
      tax_type_id: null,
      tax_rate: 0,
      line_amount: null,
      line_discount_amount: null,
      line_amount_after_line_discount: 229000,
      weight: 150,
      weight_unit: "g",
      sku: "APK5169-VAG-2",
      variant_barcode: "2000190943161",
      unit: "piece",
    },
  ],
  stock_location_id: 2,
  returned_store_id: 2,
  payment_status: "",
  total: 251200,
  total_tax: null,
  total_discount: 0,
  total_quantity: 1,
  stock_out_account_code: null,
  receive_account_code: null,
  cancel_account_code: null,
  receive_cancellation_account_code: null,
  payments: null,
  picked_on: "2022-10-08T02:57:29.000+00:00",
  packed_on: "2022-10-08T02:57:29.000+00:00",
  shipped_on: "2022-10-08T02:57:36.000+00:00",
  export_on: "2022-10-08T02:57:36.000+00:00",
  received_on: null,
  cancel_date: null,
  return_status: "unreturned",
  receive_cancellation_on: null,
  status_before_cancellation: null,
  discount_rate: 8.73,
  discount_value: 20000,
  discount_amount: null,
  total_line_amount_after_line_discount: 229000,
  returning_on: null,
  sub_reason_id: null,
  reason_id: null,
  reason_name: null,
  sub_reason_detail_id: null,
  sub_reason_name: null,
  sub_reason_detail_name: null,
  tracking_log: [],
};
const onPrint = jest.fn;

const setup = () => {
  render(
    <OrderFulfillmentHeader
      fulfillment={fulfillmentDataTest}
      onPrint={onPrint}
      orderDetail={orderDetailDataTest}
    />,
  );
};

describe("Đóng gói và giao hàng", () => {
  it("fulfillment code", async () => {
    setup();
    await waitFor(() => {
      const element = document.querySelector(
        "#order_fulfillment_header > div.saleorder-header-content__info > span",
      );
      expect(element?.innerHTML).toEqual(fulfillmentDataTest.code);
    });
  });
});
