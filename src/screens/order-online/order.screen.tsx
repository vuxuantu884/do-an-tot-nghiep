//#region Import
import React, { createRef, useCallback, useEffect, useState } from "react";
import { Card, Button, Form, Row, Col, Input, Space, FormInstance } from "antd";
import { InfoCircleOutlined, ProfileOutlined } from "@ant-design/icons";
import { Select } from "component/common/select";
import { useHistory } from "react-router-dom";
import "assets/css/v2/_sale-order.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  CustomerResponse,
} from "model/response/customer/customer.response";

import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderItemModel } from "model/other/Order/order-model";
import { PageResponse } from "model/base/base-metadata.response";
import { showSuccess } from "utils/ToastUtils";
import { AccountResponse } from "model/account/account.model";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import {
  BillingAddress,
  FulFillmentRequest,
  OrderDiscountRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
  OrderRequest,
  ShipmentRequest,
  ShippingAddress,
} from "model/request/order.request";
import {
  orderCreateAction,
  PaymentMethodGetList,
} from "domain/actions/order/order.action";
import ShipmentCard from "./shipment-card";
import ProductCard from "./product-card";
import PaymentCard from "./payment-card";
import CustomerCard from "./customer-card";
//#endregion

export default function Order() {
  //#region State
  const dispatch = useDispatch();
  const history = useHistory();
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(
    null
  );
  const [items, setItems] = useState<Array<OrderLineItemRequest>>([]);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [shipmentMethod, setShipmentMethod] = useState<number>(4);
  const [paymentMethod, setPaymentMethod] = useState<number>(3);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);
  //#endregion

  //#region Customer
  const onChangeInfoCustomer = (_objCustomer: CustomerResponse | null) => {
    setCustomer(_objCustomer);
  };

  const onChangeShippingAddress = (
    _objShippingAddress: ShippingAddress | null
  ) => {
    setShippingAddress(_objShippingAddress);
  };

  const onChangeBillingAddress = (
    _objBillingAddress: BillingAddress | null
  ) => {
    setBillingAddress(_objBillingAddress);
  };
  //#endregion

  //#region Product
  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  const onChangeInfoProduct = (
    _items: Array<OrderItemModel>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => {
    setItems(_items);
    setDiscountRate(discount_rate);
    setDiscountValue(discount_value);
    setOrderAmount(amount);
  };

  const onStoreSelect = (storeId: number) => {
    setStoreId(storeId);
  };

  //#endregion

  //#region Payment
  const changePaymentMethod = (value: number) => {
    setPaymentMethod(value);
  };

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
  };

  //#endregion
  const formRef = createRef<FormInstance>();

  const onShipmentSelect = (value: number) => {
    setShipmentMethod(value);
  };

  let initialRequest: OrderRequest = {
    action: "", //finalized
    store_id: null,
    price_type: "retail_price", //giá bán lẻ giá bán buôn
    tax_treatment: "test",
    delivery_service_provider_id: null,
    delivery_fee: null,
    shipping_fee_informed_to_customer: null,
    shipping_fee_paid_to_3pls: null,
    requirements: "",
    source_id: null,
    note: "",
    tags: "",
    customer_note: "",
    account_code: userReducer.account?.code,
    assignee_code: "",
    customer_id: null,
    reference: "",
    url: "",
    total_line_amount_after_line_discount: null,
    total: null,
    total_tax: "",
    total_discount: null,
    currency: "VNĐ",
    items: [],
    discounts: [],
    fulfillment: [],
    shipping_address: null,
    billing_address: null,
    pre_payments: null,
  };

  //#region Order
  const setDataAccounts = useCallback((data: PageResponse<AccountResponse>) => {
    setAccounts(data.items);
  }, []);

  const initialForm: OrderRequest = {
    ...initialRequest,
    shipping_address: shippingAddress,
    billing_address: billingAddress,
  };

  const onCreateSuccess = useCallback(() => {
    showSuccess("Thêm đơn hàng thành công");
    history.push("/list-orders");
  }, [history]);

  //Fulfillment Request
  const createFulFillmentRequest = (value: OrderRequest) => {
    let shipmentRequest = createShipmentRequest(value);
    let request: FulFillmentRequest = {
      store_id: value.store_id,
      account_code: userReducer.account?.code,
      assignee_code: value.assignee_code,
      delivery_type: "",
      stockLocation_id: null,
      payment_status: "",
      total: orderAmount,
      total_tax: null,
      total_discount: null,
      total_quantity: null,
      discount_rate: discountRate,
      discount_value: discountValue,
      discount_amount: null,
      total_line_amount_after_line_discount: null,
      shipment: shipmentRequest,
      items: items,
    };

    let listFullfillmentRequest = [];
    listFullfillmentRequest.push(request);
    return listFullfillmentRequest;
  };

  const createShipmentRequest = (value: OrderRequest) => {
    let objShipment: ShipmentRequest = {
      delivery_service_provider_id: null, //id người shipper
      delivery_service_provider_type: "", //shipper
      handover_id: null,
      service: null,
      fee_type: "",
      fee_base_on: "",
      delivery_fee: null,
      shipping_fee_paid_to_3pls: null,
      expected_received_date: value.dating_ship?.utc().format(),
      reference_status: "",
      shipping_fee_informed_to_customer: null,
      reference_status_explanation: "",
      cancel_reason: "",
      tracking_code: "",
      tracking_url: "",
      received_date: "",
      sender_address_id: null,
      note_to_shipper: "",
      requirements: value.requirements,
    };

    if (shipmentMethod === 2) {
      objShipment.delivery_service_provider_type = "Shipper";
      objShipment.delivery_service_provider_id =
        value.delivery_service_provider_id;
      objShipment.shipping_fee_informed_to_customer =
        value.shipping_fee_informed_to_customer;
      objShipment.shipping_fee_paid_to_3pls = value.shipping_fee_paid_to_3pls;
      return objShipment;
    }
    if (shipmentMethod === 3) {
      return null;
    }
    if (shipmentMethod === 4) {
      return null;
    }
  };

  const createDiscountRequest = () => {
    let objDiscount: OrderDiscountRequest = {
      rate: discountRate,
      value: discountValue,
      amount: discountValue + discountRate,
      promotion_id: null,
      reason: "",
      source: "",
    };
    let listDiscountRequest = [];
    if (discountRate === 0 && discountValue === 0) {
      return null;
    } else {
      listDiscountRequest.push(objDiscount);
    }
    return listDiscountRequest;
  };

  const onFinish = (values: OrderRequest) => {
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    values.fulfillment = lstFulFillment;
    values.items = items;
    values.discounts = lstDiscount;
    values.shipping_address = shippingAddress;
    values.billing_address = billingAddress;
    values.pre_payments = payments;
    values.customer_id = customer?.id;
    dispatch(orderCreateAction(values, onCreateSuccess));
  };
  //#endregion

  useEffect(() => {
    dispatch(PaymentMethodGetList(setListPaymentMethod));
  }, [dispatch, setListPaymentMethod]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  return (
    <div className="orders">
      <Form
        layout="vertical"
        initialValues={initialForm}
        ref={formRef}
        onFinish={onFinish}
      >
        <Form.Item noStyle hidden name="currency">
          <Input></Input>
        </Form.Item>
        <Form.Item noStyle hidden name="account_code">
          <Input></Input>
        </Form.Item>
        <Form.Item noStyle hidden name="tax_treatment">
          <Input></Input>
        </Form.Item>
        <Row gutter={20}>
          {/* Left Side */}
          <Col md={18}>
            {/*--- customer ---*/}
            <CustomerCard
              InfoCustomerSet={onChangeInfoCustomer}
              ShippingAddressChange={onChangeShippingAddress}
              BillingAddressChange={onChangeBillingAddress}
            />
            {/*--- product ---*/}
            <ProductCard
              changeInfo={onChangeInfoProduct}
              selectStore={onStoreSelect}
              storeId={storeId}
            />
            {/*--- end product ---*/}
            {/*--- shipment ---*/}
            <ShipmentCard
              setShipmentMethodProps={onShipmentSelect}
              shipmentMethod={shipmentMethod}
              storeId={storeId}
            />
            <PaymentCard
              setSelectedPaymentMethod={changePaymentMethod}
              setPayments={onPayments}
              paymentMethod={paymentMethod}
              amount={orderAmount}
            />
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <Card
              title={
                <Space>
                  <ProfileOutlined />
                  Thông tin đơn hàng
                </Space>
              }
            >
              <div className="padding-20">
                <Form.Item
                  label="Nhân viên bán hàng"
                  name="assignee_code"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn nhân viên bán hàng",
                    },
                  ]}
                >
                  <Select
                    className="select-with-search"
                    showSearch
                    showArrow
                    placeholder="Chọn nhân viên bán hàng"
                    filterOption={(input, option) => {
                      if (option) {
                        return (
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        );
                      }
                      return false;
                    }}
                  >
                    {accounts.map((item, index) => (
                      <Select.Option
                        style={{ width: "100%" }}
                        key={index.toString()}
                        value={item.code}
                      >
                        {item.full_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Tham chiếu"
                  name="reference"
                  tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                >
                  <Input placeholder="Điền tham chiếu" />
                </Form.Item>
                <Form.Item
                  label="Đường dẫn"
                  name="url"
                  tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                >
                  <Input placeholder="Điền đường dẫn" />
                </Form.Item>
              </div>
            </Card>
            <Card
              className="margin-top-20"
              title={
                <Space>
                  <ProfileOutlined />
                  Thông tin bổ sung
                </Space>
              }
            >
              <div className="padding-20">
                <Form.Item
                  name="note"
                  label="Ghi chú"
                  tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                >
                  <Input.TextArea placeholder="Điền Ghi chú" />
                </Form.Item>
                <Form.Item
                  label="Tag"
                  name="tags"
                  tooltip={{ title: "Tooltip", icon: <InfoCircleOutlined /> }}
                >
                  <Select
                    mode="tags"
                    placeholder="Nhập tags"
                    tokenSeparators={[","]}
                  ></Select>
                </Form.Item>
              </div>
            </Card>
          </Col>
        </Row>
        <div className="margin-top-10" style={{ textAlign: "right" }}>
          <Space size={12}>
            <Button>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}
