import { render, waitFor } from "@testing-library/react";
import { OrderResponse } from "model/response/order/order.response";
import { handleFixWindowMatchMediaTest, testOrderArr } from "screens/order-online/utils/test.utils";
import UpdateProductCard from ".";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { formatCurrency, getTotalQuantity } from "utils/AppUtils";
import { checkIfFinishedPayment } from "utils/OrderUtils";

handleFixWindowMatchMediaTest();

const initialState = {
  orderReducer: {
    orderDetail: {
      orderCustomer: {},
    },
  },
};
const mockStore = configureStore();
const store = mockStore(initialState);

const orderDetailData: OrderResponse | any = {
  id: 626602,
  code: "SO000626602",
  version: 1,
  created_by: "YD10893",
  created_name: "LÊ VĂN LONG",
  created_date: "2022-08-06T09:54:39Z",
  updated_by: "YD122333",
  updated_name: "Triệu thị ánh",
  updated_date: "2022-09-07T08:14:12Z",
  reference_code: "",
  company_id: 1,
  company: "Công ty cổ phần thời trang YODY",
  store_id: 110,
  store_code: "YDVNHYN03",
  store: "YODY Phố Nối",
  store_phone_number: "0911168258",
  store_full_address: "Đường 196- Ngã Tư Chợ Bao Bì , Thị trấn Bần Yên Nhân",
  status: "finalized",
  price_type: "retail_price",
  tax_treatment: "inclusive",
  source_id: 229,
  source_code: "SC000172",
  source: "Nguồn online zalo",
  note: "(Test.)",
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
  coordinator_code: null,
  coordinator: null,
  assignee_code: "YD10893",
  assignee: "LÊ VĂN LONG",
  channel_id: 13,
  channel_code: "ADMIN",
  channel: "Admin",
  customer_id: 3005646,
  customer: "Lê Văn Long",
  customer_phone_number: "0965143609",
  customer_email: "",
  fulfillment_status: "packed",
  packed_status: null,
  received_status: null,
  payment_status: "unpaid",
  return_status: "unreturned",
  total_line_amount_after_line_discount: 240000,
  total: 240000,
  order_discount_rate: null,
  order_discount_value: null,
  discount_reason: null,
  total_discount: 498000,
  total_tax: null,
  finalized_account_code: "YD10893",
  cancel_account_code: null,
  finish_account_code: null,
  finalized_on: "2022-08-06T09:54:39.000+00:00",
  cancelled_on: null,
  finished_on: null,
  items: [
    {
      id: 189947,
      code: "3555ba75-0afc-4dbc-9593-ab789b1a1e84",
      version: 1,
      created_by: "YD10893",
      created_name: "LÊ VĂN LONG",
      created_date: "2022-08-06T09:54:39Z",
      updated_by: "YD10893",
      updated_name: "LÊ VĂN LONG",
      updated_date: "2022-08-06T09:54:39Z",
      order_line_item_id: null,
      sku: "APM5375-NAV-L",
      variant_id: 96735,
      variant: "Polo Nam - Navy - L",
      product_id: 59489,
      product: "Polo Nam",
      product_code: "APM5375",
      variant_barcode: "2900000967359",
      product_type: "normal",
      quantity: 1,
      price: 369000,
      amount: 369000,
      discount_items: [
        {
          id: 101672,
          code: "45f82480-0e37-4d9f-965a-552f043d207b",
          version: 1,
          created_by: "YD10893",
          created_name: "LÊ VĂN LONG",
          created_date: "2022-08-06T09:54:39Z",
          updated_by: "YD10893",
          updated_name: "LÊ VĂN LONG",
          updated_date: "2022-08-06T09:54:39Z",
          rate: 67.48,
          value: 249000,
          amount: 249000,
          promotion_id: 157,
          reason: "Test",
          order_line_id: 189947,
        },
      ],
      note: "",
      variant_image: "",
      unit: "piece",
      warranty: "wash-50-mild;wash-60;wash-60-mild;",
      tax_rate: null,
      tax_include: null,
      is_composite: null,
      line_amount_after_line_discount: 120000,
      discount_rate: 67.48,
      discount_value: 249000,
      discount_amount: 249000,
      position: 2,
      weight: 150,
      weight_unit: "g",
      type: "normal",
    },
    {
      id: 189948,
      code: "e2c8c77d-13d9-44f1-9fd1-da934b046c40",
      version: 1,
      created_by: "YD10893",
      created_name: "LÊ VĂN LONG",
      created_date: "2022-08-06T09:54:39Z",
      updated_by: "YD10893",
      updated_name: "LÊ VĂN LONG",
      updated_date: "2022-08-06T09:54:39Z",
      order_line_item_id: null,
      sku: "APM5375-DDO-XL",
      variant_id: 96742,
      variant: "Polo Nam - Đỏ - XL",
      product_id: 59489,
      product: "Polo Nam",
      product_code: "APM5375",
      variant_barcode: "2900000967427",
      product_type: "normal",
      quantity: 1,
      price: 369000,
      amount: 369000,
      discount_items: [
        {
          id: 101673,
          code: "c5d3238f-3c20-4a86-be55-702e02293b40",
          version: 1,
          created_by: "YD10893",
          created_name: "LÊ VĂN LONG",
          created_date: "2022-08-06T09:54:39Z",
          updated_by: "YD10893",
          updated_name: "LÊ VĂN LONG",
          updated_date: "2022-08-06T09:54:39Z",
          rate: 67.48,
          value: 249000,
          amount: 249000,
          promotion_id: 157,
          reason: "Test",
          order_line_id: 189948,
        },
      ],
      note: "",
      variant_image: "",
      unit: "piece",
      warranty: "wash-50-mild;wash-60;wash-60-mild;",
      tax_rate: null,
      tax_include: null,
      is_composite: null,
      line_amount_after_line_discount: 120000,
      discount_rate: 67.48,
      discount_value: 249000,
      discount_amount: 249000,
      position: 1,
      weight: 150,
      weight_unit: "g",
      type: "normal",
    },
  ],
  discounts: [],
  pre_payments: null,
  payments: [],
  fulfillments: [
    {
      id: 126507,
      code: "FM000126507",
      version: 1,
      created_by: "YD10893",
      created_name: "LÊ VĂN LONG",
      created_date: "2022-08-06T09:54:39Z",
      updated_by: "YD10893",
      updated_name: "LÊ VĂN LONG",
      updated_date: "2022-08-06T09:54:48Z",
      order_id: 626602,
      account_code: "YD10893",
      assignee_code: "YD10893",
      delivery_type: "",
      status: "packed",
      partner_status: null,
      shipment: {
        id: 63587,
        code: "95e13999-e6e5-4d37-acf0-6663c4e1a6e9",
        version: 1,
        created_by: "YD10893",
        created_name: "LÊ VĂN LONG",
        created_date: "2022-08-06T09:54:39Z",
        updated_by: "YD10893",
        updated_name: "LÊ VĂN LONG",
        updated_date: "2022-08-06T09:54:39Z",
        delivery_service_provider_id: null,
        delivery_service_provider_code: null,
        delivery_service_provider_name: null,
        delivery_service_provider_type: "external_shipper",
        delivery_transport_type: "",
        delivery_service_note: null,
        handover_id: null,
        service: "",
        who_paid: null,
        fee_type: "",
        fee_base_on: "",
        delivery_fee: null,
        reference_status: "",
        reference_status_explanation: "",
        cancel_reason: "",
        tracking_code: "",
        tracking_url: "",
        received_date: null,
        expected_received_date: null,
        shipping_fee_paid_to_three_pls: null,
        sender_address_id: null,
        sender_address: null,
        requirements: "open_try",
        requirements_name: null,
        note_to_shipper: "",
        fulfillment_id: 126507,
        cod: 240000,
        shipper_code: "DP0003",
        shipper_name: "Minh Nhật",
        pushing_note: null,
        pushing_status: null,
        shipping_address: null,
        office_time: null,
        shipper_phone: "0374858355",
        recipient_sort_code: null,
        info_shipper: "Minh Nhật - 0374858355",
        type_shipment: null,
      },
      billing_address_id: null,
      items: [
        {
          id: 151772,
          code: "8bce0f89-093b-439b-90f8-f97d6d6ee044",
          version: 1,
          created_by: "YD10893",
          created_name: "LÊ VĂN LONG",
          created_date: "2022-08-06T09:54:39Z",
          updated_by: "YD10893",
          updated_name: "LÊ VĂN LONG",
          updated_date: "2022-08-06T09:54:39Z",
          order_line_item_id: 189947,
          product_id: 59489,
          product: "Polo Nam",
          product_code: "APM5375",
          variant_id: 96735,
          variant: "Polo Nam - Navy - L",
          order_line_item_note: null,
          quantity: 1,
          base_price: null,
          discount_rate: 67.48,
          discount_value: 249000,
          tax_type_id: null,
          tax_rate: null,
          line_amount: null,
          line_discount_amount: null,
          line_amount_after_line_discount: 120000,
          weight: 150,
          weight_unit: "g",
          sku: "APM5375-NAV-L",
          variant_barcode: "2900000967359",
          unit: "piece",
        },
        {
          id: 151773,
          code: "5e0a73c6-b9e8-49d2-aea6-2026ddc71aa5",
          version: 1,
          created_by: "YD10893",
          created_name: "LÊ VĂN LONG",
          created_date: "2022-08-06T09:54:39Z",
          updated_by: "YD10893",
          updated_name: "LÊ VĂN LONG",
          updated_date: "2022-08-06T09:54:39Z",
          order_line_item_id: 189948,
          product_id: 59489,
          product: "Polo Nam",
          product_code: "APM5375",
          variant_id: 96742,
          variant: "Polo Nam - Đỏ - XL",
          order_line_item_note: null,
          quantity: 1,
          base_price: null,
          discount_rate: 67.48,
          discount_value: 249000,
          tax_type_id: null,
          tax_rate: null,
          line_amount: null,
          line_discount_amount: null,
          line_amount_after_line_discount: 120000,
          weight: 150,
          weight_unit: "g",
          sku: "APM5375-DDO-XL",
          variant_barcode: "2900000967427",
          unit: "piece",
        },
      ],
      stock_location_id: 110,
      returned_store_id: 110,
      payment_status: "",
      total: 240000,
      total_tax: null,
      total_discount: 498000,
      total_quantity: 2,
      stock_out_account_code: null,
      receive_account_code: null,
      cancel_account_code: null,
      receive_cancellation_account_code: null,
      payments: null,
      picked_on: "2022-08-06T09:54:47.000+00:00",
      packed_on: "2022-08-06T09:54:48.000+00:00",
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
      total_line_amount_after_line_discount: 240000,
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
    id: 75699,
    code: "d9ee1a81-f867-473c-bb52-48c597b9183a",
    version: 135,
    created_by: "YD10893",
    created_name: "LÊ VĂN LONG",
    created_date: "2022-08-06T09:54:39Z",
    updated_by: "YD10893",
    updated_name: "LÊ VĂN LONG",
    updated_date: "2022-09-07T08:14:12Z",
    name: "LÊ VĂN LONG",
    email: null,
    phone: "0965143609",
    second_phone: null,
    country: "",
    city_id: 5,
    city: "Tỉnh Bình Dương",
    district_id: 80,
    district: "Huyện Bàu Bàng",
    ward_id: 1228,
    ward: "Xã Hưng Hòa",
    zip_code: null,
    full_address: "Phường 7, Thành phố Vũuung Tàuuu, Bà Rịa - Vũng Tàu u",
    channel: null,
  },
  shipping_fee_informed_to_customer: 0,
  url: "",
  sub_status_id: 5,
  sub_status_code: "awaiting_shipper",
  sub_status: "Chờ thu gom",
  order_returns: [],
  accumulate_point: null,
  linked_order_code: null,
  ecommerce_shop_id: null,
  ecommerce_shop_name: null,
  order_migration_id: null,
  created_on: "2022-08-06T09:54:39.000+00:00",
  campaign_id: null,
  utm_tracking: null,
  export_bill: false,
  migration_note: null,
  atomic_migration: false,
  actual_quantity: 2,
  sub_reason_name: null,
  sub_reason_id: null,
  reason_id: null,
  automatic_discount: true,
  reason_name: null,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const setup = async (orderDetail: OrderResponse) => {
  render(
    <Provider store={store}>
      <Router>
        <UpdateProductCard
          OrderDetail={orderDetail}
          shippingFeeInformedCustomer={null}
          totalAmountReturnProducts={orderDetail?.order_return_origin?.money_amount}
          paymentMethods={[]}
        />
      </Router>
    </Provider>,
  );
};

describe("chi tiết sản phẩm table", () => {
  it("Tiêu đề", () => {
    setup(orderDetailData);
    const productEmelent = document.querySelector(
      "#product_store_in_order > div.ant-card-head > div > div.ant-card-head-title > div > span",
    );
    expect(productEmelent?.innerHTML).toEqual("SẢN PHẨM");
  });
  it("cửa hàng", () => {
    setup(orderDetailData);

    const storeElement = document.querySelector(
      "#product_store_in_order > div.ant-card-head > div > div.ant-card-extra > div > div > div > div > button > div",
    )?.children;

    var boxes = Array.prototype.slice.call(storeElement);

    boxes.forEach((p, index) => {
      //console.log(index, p.textContent);
      if (p.textContent.length !== 0) {
        expect(p.textContent).toEqual(orderDetailData.store);
      }
    });
  });

  it("danh sách sản phẩm", async () => {
    setup(orderDetailData);
    await waitFor(() => {
      console.log("danh sách sản phẩm");
      const productElement = document.querySelector(
        "#product_store_in_order_table > div.ant-table-container > div > table > tbody",
      );
      var childElement = Array.prototype.slice.call(productElement?.children); // convert HTMLCollection to Array
      childElement.forEach((tr, index) => {
        expect(tr).toBeTruthy();
        const product = orderDetailData.items[index];

        const tds = Array.prototype.slice.call(tr.children);

        expect(tds.length).toBe(6);
        //Sản phẩm
        const tdProductSku = tds[0].getElementsByClassName("yody-pos-sku");
        const tdProductVariant = tds[0].getElementsByClassName("yody-pos-varian");

        expect(product.sku).toContain(tdProductSku[0].textContent);
        expect(product.variant).toContain(tdProductVariant[0].textContent);
        //Số lượng
        expect(product.quantity).toBe(Number(tds[1].textContent));
        //Đơn giá
        expect(formatCurrency(product.price)).toBe(tds[2].textContent);
        //Chiết khấu
        //Tích điểm
        //Tổng tiền
        expect(formatCurrency(product.line_amount_after_line_discount)).toBe(tds[5].textContent);
      });
    });
  });

  it("Tổng số lượng", async () => {
    setup(orderDetailData);
    await waitFor(() => {
      {
        const productQuantity = document.querySelector(
          "#product_store_in_order_table > div.ant-table-footer > div > div:nth-child(2)",
        );

        const quantity = getTotalQuantity(orderDetailData.items);
        expect(productQuantity?.textContent).toBe(quantity.toString());
      }
    });
  });

  it("Tổng Đơn giá", async () => {
    setup(orderDetailData);
    await waitFor(() => {
      const productPrice = document.querySelector(
        "#product_store_in_order_table > div.ant-table-footer > div > div:nth-child(3)",
      );

      const price = formatCurrency(
        orderDetailData?.items.reduce((a: any, b: any) => a + b.amount, 0),
      );
      expect(productPrice?.textContent).toBe(price);
    });
  });

  it("Tổng chiết khấu", async () => {
    setup(orderDetailData);
    await waitFor(() => {
      const productDiscount = document.querySelector(
        "#product_store_in_order_table > div.ant-table-footer > div > div:nth-child(4)",
      );
      const discount = formatCurrency(
        orderDetailData?.items.reduce(
          (a: any, b: any) => a + (b.amount - b.line_amount_after_line_discount),
          0,
        ),
      );
      expect(productDiscount?.textContent).toBe(discount);
    });
  });

  it("Tổng tiền", async () => {
    setup(orderDetailData);
    await waitFor(() => {
      const productTotalPrice = document.querySelector(
        "#product_store_in_order_table > div.ant-table-footer > div > div:nth-child(6)",
      );
      const totalPrice = formatCurrency(
        orderDetailData?.items.reduce((a: any, b: any) => a + b.line_amount_after_line_discount, 0),
      );
      expect(productTotalPrice?.textContent).toBe(totalPrice);
    });
  });
});

describe("Chi tiết sản phẩm Footer", () => {
  it("Footer", async () => {
    setup(orderDetailData);

    await waitFor(() => {
      const productFooter = document.querySelector(
        "#product_store_in_order > div.ant-card-body > div > div.ant-row.sale-product-box-payment > div:nth-child(2)",
      );
      expect(productFooter).toBeTruthy();
      const productFooterChildrenCount = Array.prototype.slice.call(productFooter?.children); // convert HTMLCollection to Array
      expect(productFooterChildrenCount.length).toBe(7);

      if (productFooterChildrenCount.length === 7) {
        //Tổng tiền
        const totalPriceElementArray = Array.prototype.slice.call(
          productFooterChildrenCount[0]?.children,
        );
        expect(totalPriceElementArray[0].innerHTML).toEqual("Tổng tiền:");

        //Tổng chiết khấu đơn:
        const totalOrderDiscountElementArray = Array.prototype.slice.call(
          productFooterChildrenCount[1]?.children,
        );
        expect(totalOrderDiscountElementArray[0].innerHTML).toEqual("Tổng chiết khấu đơn:");

        //Chiết khấu:
        const totalDiscountElementArray = Array.prototype.slice.call(
          productFooterChildrenCount[2]?.children,
        );
        expect(totalDiscountElementArray[0].textContent).toEqual("Chiết khấu:");

        //Mã giảm giá:
        const totalDiscountCodeElementArray = Array.prototype.slice.call(
          productFooterChildrenCount[3]?.children,
        );
        expect(totalDiscountCodeElementArray[0].textContent).toEqual("Mã giảm giá:");

        //Phí ship báo khách:
        const totalShipElementArray = Array.prototype.slice.call(
          productFooterChildrenCount[4]?.children,
        );
        expect(totalShipElementArray[0].innerHTML).toEqual("Phí ship báo khách:");

        //solid
        const solidElementArray = Array.prototype.slice.call(
          productFooterChildrenCount[5]?.children,
        );
        expect(solidElementArray).toBeTruthy();

        //Khách cần trả:
        const totalOrderElementArray = Array.prototype.slice.call(
          productFooterChildrenCount[6]?.children,
        );
        expect(totalOrderElementArray[0].innerHTML).toEqual("Khách phải trả:");
      }
    });
  });
});

//so sanh chuỗi toEqual
//so sanh giá trị trong mảng toConten
