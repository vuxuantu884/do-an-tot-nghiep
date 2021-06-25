//#region Import
import { Button, Card, Input, Row, Col, Select, Form } from "antd";
import documentIcon from "../../assets/img/document.svg";
import ProductCard from "./product-card";
import CustomerCard from "./customer-card";
import PaymentCard from "./payment-card";
import ShipmentCard from "./shipment-card";
import { useState, useCallback, useLayoutEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  FulFillmentRequest,
  OrderRequest,
  ShipmentRequest,
} from "model/request/order.request";
import { OrderLineItemRequest } from "model/request/order-line-item.request";
import { OrderItemDiscountRequest } from "model/request/order-item-discount.request";
import { AccountResponse } from "model/account/account.model";
import {
  BillingAddress,
  CustomerResponse,
  ShippingAddress,
} from "model/response/customer/customer.response";
import { useHistory } from "react-router";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  OrderItemDiscountModel,
  OrderItemModel,
} from "model/other/Order/order-model";
import { orderCreateAction } from "domain/actions/order/order.action";
import { showSuccess } from "utils/ToastUtils";
import { Email } from "utils/RegUtils";
import { InfoCircleOutlined } from "@ant-design/icons";
import "assets/css/v2/_sale-order.scss";
import { OrderDiscountRequest } from "model/request/order-discount.request";
import { Moment } from "moment";
import { OrderPaymentRequest } from "model/request/order-payment.request";
//#endregion

const OrderDetail = () => {
  //#region state
  const dispatch = useDispatch();
  const history = useHistory();
  const [source, setSource] = useState<number | null>(null);
  const [email, setEmail] = useState<string>("");
  const [CustomerNote, setCustomerNote] = useState<string>("");
  const [items, setItems] = useState<Array<OrderItemModel>>([]);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [objCustomer, setObjCustomer] = useState<CustomerResponse | null>(null);
  const [objShippingAddress, setObjShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [objBillingAddress, setObjBillingAddress] =
    useState<BillingAddress | null>(null);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [priceType, setPriceType] = useState<string>("retail_price");
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [assignCode, setAssignCode] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [shipmentType, setShipmentType] = useState<number>(4);
  const [paymentType, setPaymentType] = useState<number>(3);
  const [isVisibleAssignCode, setVisibleAssignCode] = useState<boolean>(false);
  const [isVisibleSource, setVisibleSource] = useState<boolean>(false);
  const [isVisibleStore, setVisibleStore] = useState<boolean>(false);
  const [orderDiscountRate, setOrderDiscountRate] = useState<number>(0);
  const [orderDiscountValue, setOrderDiscountValue] = useState<number>(0);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [ShipFeeCustomer, setShipFeeCustomer] = useState<number>(0);
  const [ShipDeliveryFee, setShipDeliveryFee] = useState<number>(0);
  const [ShipDeliveryPartner, setShipDeliveryPartner] =
    useState<number | null>(null);
  const [RequirementShip, setRequirementShip] = useState<string>("");
  const [shipment, setShipment] = useState<ShipmentRequest | null>(null);
  const [CODMoney, setCODMoney] = useState<number>(0);
  //#endregion

  const onStoreSelect = (storeId: number) => {
    setStoreId(storeId);
    setVisibleStore(false);
  };

  const onPriceTypeSelect = (priceType: string) => {
    setPriceType(priceType);
  };

  const onShipmentSelect = (shipmentType: number) => {
    setShipmentType(shipmentType);
  };

  const ChangeShipFeeCustomer = (item: number) => {
    setShipFeeCustomer(item);
  };

  const ChangeShipDeliveryFee = (item: number) => {
    setShipDeliveryFee(item);
  };

  const ChangeShipDeliveryPartner = (item: number) => {
    setShipDeliveryPartner(item);
  };
  const ChangeRequirementShip = (item: string) => {
    setRequirementShip(item);
  };

  const onPaymentSelect = (paymentType: number) => {
    setPaymentType(paymentType);
  };

  const onSourceSelect = (source: number) => {
    setSource(source);
    setVisibleSource(false);
  };

  const onCustomerNote = (item: string) => {
    setCustomerNote(item);
  };

  const onEmailChange = (email: string) => {
    setEmail(email);
  };

  const CodMoneyChange = (value: number) => {
    setCODMoney(value);
  };

  const onChangeInfo = (
    _items: Array<OrderItemModel>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => {
    setItems(_items);
    setOrderDiscountRate(discount_rate);
    setOrderDiscountValue(discount_value);
    setOrderAmount(amount);
  };

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
  };

  const onChangeInfoCustomer = (_objCustomer: CustomerResponse | null) => {
    setObjCustomer(_objCustomer);
  };

  const onChangeShippingAddress = (
    _objShippingAddress: ShippingAddress | null
  ) => {
    setObjShippingAddress(_objShippingAddress);
  };

  const onChangeBillingAddress = (
    _objBillingAddress: BillingAddress | null
  ) => {
    setObjBillingAddress(_objBillingAddress);
  };

  const onChangeAssignCode = (value: string) => {
    setAssignCode(value);
    setVisibleAssignCode(false);
  };

  const onChangeReference = (value: string) => {
    setReference(value);
  };

  const onChangeUrl = (value: string) => {
    setUrl(value);
  };

  const onChangeNoteOrder = (value: string) => {
    setOrderNote(value);
  };

  const onChangeTag = (value: []) => {
    let strTag = "";
    value.forEach((element) => {
      strTag = strTag + element + ",";
    });

    setTag(strTag);
  };

  const onCreateSuccess = useCallback(() => {
    showSuccess("Thêm đơn hàng thành công");
    history.push("/list-orders");
  }, [history]);

  const validateEmail = (email: string) => {
    const re = Email;
    return re.test(email);
  };

  //Create Order
  const finishOrder = () => {
    let orderLineItemsRequest = createOrderLineItemsRequest();
    let fulfillmentRequest = createFulFillmentRequest();
    let discountRequest = createOrderDiscountRequest();
    let orderRequest: OrderRequest = {
      company_id: null,
      store_id: storeId,
      status: "",
      price_type: priceType,
      tax_treatment: "",
      source_id: source,
      note: orderNote,
      tags: tag,
      customer_note: CustomerNote,
      sale_note: "",
      account_code: "",
      account: "",
      assignee_code: assignCode,
      channel_id: null,
      customer_id: null,
      fulfillment_status: "",
      packed_status: "",
      received_Status: "",
      payment_status: "",
      return_status: "",
      reference: reference,
      url: url,
      total_line_amount_after_line_discount: null,
      total: null,
      order_discount_rate: null,
      order_discount_value: null,
      discount_reason: "",
      total_discount: null,
      total_tax: "",
      finalized_account_code: "",
      cancel_account_code: "",
      finish_account_code: "",
      finalized_on: "",
      cancelled_on: "",
      finished_on: "",
      currency: "VNĐ",
      items: orderLineItemsRequest,
      discounts: discountRequest,
      payments: null,
      fulfillment: fulfillmentRequest,
      shipping_address: objShippingAddress,
      billing_address: objBillingAddress,
      pre_payments: null,
    };

    if (objCustomer != null) {
      orderRequest.customer_id = objCustomer.id;
    }

    if (payments !== null) {
      if (paymentType !== 3) {
        orderRequest.payments = payments;
      } else {
        orderRequest.payments = null;
      }

      //Thanh toán trước
      if (paymentType === 2) {
        orderRequest.pre_payments = payments;
      }
    }

    if (assignCode === "") {
      setVisibleAssignCode(true);
    }

    if (storeId === null) {
      setVisibleStore(true);
    }

    if (source === null) {
      setVisibleSource(true);
    }

    if (assignCode !== "" && storeId !== null && storeId !== null) {
      dispatch(orderCreateAction(orderRequest, onCreateSuccess));
    }
  };

  //#region Product Component
  const createOrderLineItemsRequest = () => {
    let orderLineItemsRequest: Array<OrderLineItemRequest> = [];
    items.forEach((item, index) => {
      orderLineItemsRequest.push(
        createOrderLineItemRequest(item, "normal", index)
      );
      item.gifts.forEach((gif) => {
        orderLineItemsRequest.push(
          createOrderLineItemRequest(gif, "gif", index)
        );
      });
    });

    return orderLineItemsRequest;
  };

  const createOrderLineItemRequest = (
    model: OrderItemModel,
    type: string,
    position: number
  ) => {
    let orderItemDiscountRequest: OrderItemDiscountRequest =
      createOrderItemDiscountRequest(model.discount_items[0]);
    const request: OrderLineItemRequest = {
      sku: model.sku,
      variant_id: model.variant_id,
      variant: model.variant,
      product_id: model.product_id,
      product: model.product,
      variant_barcode: model.variant_barcode,
      product_type: model.product_type,
      quantity: model.quantity,
      price: model.price,
      amount: model.amount,
      note: model.note,
      type: type,
      variant_image: model.variant_image,
      unit: model.unit,
      warranty: model.warranty,
      tax_rate: model.tax_rate,
      tax_include: model.tax_include,
      line_amount_after_line_discount: model.line_amount_after_line_discount,
      discount_items: [orderItemDiscountRequest],
      discount_rate: model.discount_items[0].rate,
      discount_value: model.discount_items[0].value,
      discount_amount: model.discount_items[0].amount,
      position: position,
    };

    return request;
  };

  //Discount line item Request
  const createOrderItemDiscountRequest = (model: OrderItemDiscountModel) => {
    const request: OrderItemDiscountRequest = {
      rate: model.rate,
      value: model.value,
      amount: model.amount,
      promotion_id: model.promotion_id,
      reason: model.reason,
    };
    return request;
  };

  //Discount order
  const createOrderDiscountRequest = () => {
    const request: OrderDiscountRequest = {
      rate: orderDiscountRate,
      value: orderDiscountValue,
      amount: null,
      promotion_id: null,
      reason: "",
      source: "",
    };

    let listOrderDiscount = [];
    listOrderDiscount.push(request);
    return listOrderDiscount;
  };

  //#endregion

  //Fulfillment Request
  const createFulFillmentRequest = () => {
    let orderLineItemsRequest = createOrderLineItemsRequest();
    let shipmentRequest = CreateShipmentRequest();
    let request: FulFillmentRequest = {
      store_id: storeId,
      account_code: "",
      assignee_code: assignCode,
      delivery_type: "",
      status: "",
      partner_status: "",
      stockLocation_id: null,
      payment_status: "",
      total: null,
      total_tax: null,
      total_discount: null,
      total_quantity: null,
      stock_out_account_code: "",
      receive_account_code: "",
      cancel_account_code: "",
      receive_cancellation_account_code: "",
      packed_on: "",
      shipped_on: "",
      received_on: "",
      cancel: "",
      receive_cancellation_on: "",
      status_before_cancellation: "",
      discount_rate: orderDiscountRate,
      discount_value: orderDiscountValue,
      discount_amount: null,
      total_line_amount_after_line_discount: null,
      shipment: shipmentRequest,
      billing_address: objBillingAddress,
      items: orderLineItemsRequest,
      payments: payments,
    };
    
    let listFullfillmentRequest = [];
    listFullfillmentRequest.push(request);
    return listFullfillmentRequest;
  };

  const CreateShipmentRequest = () => {
    let objShipment: ShipmentRequest = {
      delivery_service_provider_id: null, //id người shipper
      delivery_service_provider_type: "", //shipper
      handover_id: null,
      service: null,
      who_paid: "",
      fee_type: "",
      fee_base_on: "",
      delivery_fee: null,
      shipping_fee_paid_to_3pls: null,
      reference_status: "",
      shipping_fee_informed_to_customer: null,
      reference_status_explanation: "",
      cancel_reason: "",
      tracking_code: "",
      tracking_url: "",
      received_date: "",
      sender_address_id: null,
      note_to_shipper: "",
      requirements: RequirementShip,
      shipping_address: objShippingAddress,
    };

    if (shipmentType === 2) {
      objShipment.delivery_service_provider_type = "Shipper";
      objShipment.delivery_service_provider_id = ShipDeliveryPartner;
      objShipment.delivery_fee = ShipDeliveryFee;
      objShipment.shipping_fee_informed_to_customer = ShipFeeCustomer;

      return objShipment;
    }

    if (shipmentType === 3) {
      objShipment.delivery_service_provider_type = "";
    }

    if (shipmentType === 4) {
      return null;
    }
  };

  const total = useMemo(() => {
    return orderAmount;
  }, [orderAmount]);

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse>) => {
    setAccounts(data.items);
  }, []);

  useLayoutEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  return (
    <div>
      <Form layout="vertical">
        <Row gutter={24}>
          <Col xs={24} lg={17}>
            {/*--- customer ---*/}
            <CustomerCard
              InfoCustomerSet={onChangeInfoCustomer}
              SelectSource={onSourceSelect}
              SelectCustomerNote={onCustomerNote}
              sourceSelect={isVisibleSource}
              ChangeEmail={onEmailChange}
              ShippingAddressChange={onChangeShippingAddress}
              BillingAddressChange={onChangeBillingAddress}
            />
            {/*--- end customer ---*/}

            {/*--- product ---*/}
            <ProductCard
              changeInfo={onChangeInfo}
              selectStore={onStoreSelect}
              selectPriceType={onPriceTypeSelect}
              storeId={storeId}
              isVisibleStore={isVisibleStore}
            />
            {/*--- end product ---*/}

            {/*--- shipment ---*/}
            <ShipmentCard
              SelectedShipmentType={onShipmentSelect}
              ShipFeeCustomer={ChangeShipFeeCustomer}
              ShipDeliveryFee={ChangeShipDeliveryFee}
              RequirementShip={ChangeRequirementShip}
              ShipDeliveryPartner={ChangeShipDeliveryPartner}
              shipmentMethod={shipmentType}
              storeId={storeId}
            />
            {/*--- end shipment ---*/}

            {/*--- payment ---*/}
            <PaymentCard
              setSelectedPaymentMethod={onPaymentSelect}
              setCodeMonay={CodMoneyChange}
              setPayments={onPayments}
              paymentMethod={paymentType}
              amount={total}
            />
            {/*--- end payment ---*/}
          </Col>

          <Col xs={24} lg={7}>
            <Card
              className="card-block card-block-normal"
              title={
                <div className="d-flex">
                  <img src={documentIcon} alt="" /> Thông tin đơn hàng
                </div>
              }
            >
              <div className="padding-20">
                <Form.Item
                  label="Nhân viên bán hàng"
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
                    placeholder="Chọn nhân viên bán hàng"
                    onChange={onChangeAssignCode}
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

                  {isVisibleAssignCode === true && (
                    <div>
                      <div
                        className="ant-form-item-explain ant-form-item-explain-error"
                        style={{ padding: "5px" }}
                      >
                        <div role="alert">Vui lòng chọn nhân viên bán hàng</div>
                      </div>
                    </div>
                  )}
                </Form.Item>
                <Form.Item
                  label="Tham chiếu"
                  tooltip={{
                    title:
                      "Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Input
                    onChange={(e) => onChangeReference(e.target.value)}
                    placeholder="Điền tham chiếu"
                  />
                </Form.Item>
                <Form.Item
                  label="Đường dẫn"
                  style={{ marginBottom: "0px" }}
                  tooltip={{
                    title: "Thêm đường dẫn đơn hàng gốc trên kênh bán hàng",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Input
                    onChange={(e) => onChangeUrl(e.target.value)}
                    placeholder="Điền đường dẫn"
                  />
                </Form.Item>
              </div>
            </Card>

            <Card
              className="margin-top-20"
              title={
                <div className="d-flex">
                  <img src={documentIcon} alt="" /> Thông tin bổ sung
                </div>
              }
            >
              <div className="padding-20">
                <Form.Item
                  label="Nhập ghi chú"
                  tooltip={{
                    title: "Thêm thông tin ghi chú chăm sóc khách hàng",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Input.TextArea
                    onChange={(e) => onChangeNoteOrder(e.target.value)}
                    placeholder="Nhập ghi chú"
                  />
                </Form.Item>

                <Form.Item
                  label="Tags"
                  style={{ marginBottom: "0px" }}
                  tooltip={{
                    title: "Thêm từ khóa để tiện lọc đơn hàng",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Select
                    mode="tags"
                    placeholder="Nhập tags"
                    onChange={onChangeTag}
                    tokenSeparators={[","]}
                  ></Select>
                </Form.Item>
              </div>
            </Card>
          </Col>
        </Row>

        <Row className="margin-top-10" justify="end">
          <Button
            type="default"
            className="btn-style btn-cancel"
            style={{ marginRight: "10px" }}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={finishOrder}
            className="btn-style btn-save"
            style={{ color: "white" }}
          >
            Lưu
          </Button>
        </Row>
      </Form>
    </div>
  );
};

export default OrderDetail;
