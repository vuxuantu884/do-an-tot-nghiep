//#region Import
import { Button, Card, Input, Row, Col, Select, Form } from "antd";
import documentIcon from "../../assets/img/document.svg";
import ProductCard from "./product-card";
import CustomerCard from "./customer-card";
import PaymentCard from "./payment-card";
import ShipmentCard from "./shipment-card";
import { useState, useCallback, useLayoutEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { OrderRequest } from "model/request/order.request";
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
import { StoreResponse } from "model/core/store.model";
import { InfoCircleOutlined } from "@ant-design/icons";
import "assets/css/v2/_sale-order.scss";
//#endregion

const CreateBill = () => {
  //#region state
  const dispatch = useDispatch();
  const history = useHistory();
  const [source, setSource] = useState<number | null>(null);
  const [email, setEmail] = useState<string>("");
  const [CustomerNote, setCustomerNote] = useState<string>("");
  const [items, setItems] = useState<Array<OrderItemModel>>([]);
  const [objCustomer, setObjCustomer] = useState<CustomerResponse | null>(null);
  const [objShippingAddress, setObjShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [objBillingAddress, setObjBillingAddress] =
    useState<BillingAddress | null>(null);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [priceType, setPriceType] = useState<string>("retail_price");
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [isVisibleBilling, setVisibleBilling] = useState(true);
  const [isVerify, setVerify] = useState(false);
  const [selectedShipMethod, setSelectedShipMethod] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(1);
  const [store, setStore] = useState<StoreResponse | null>(null);
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
  //#endregion

  //#region modal
  //Address modal
  const showAddressModal = () => {
    setVisibleAddress(true);
  };
  const onCancleConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);
  const onOkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  //Customer modal
  const showCustomerModal = () => {
    setVisibleCustomer(true);
  };
  const onCancleConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);
  const onOkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  //Bill Addresss
  const showBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };
  const changeShipMethod = (value: number) => {
    setSelectedShipMethod(value);
  };
  const changePaymentMethod = (value: number) => {
    setSelectedPaymentMethod(value);
  };

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

  const onChangeInfo = (
    _items: Array<OrderItemModel>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => {
    setItems(_items);
    setDiscountRate(discount_rate);
    setDiscountValue(discount_value);
    setAmount(amount);
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

  const finishOrder = () => {
    let orderLineItemsRequest = createOrderLineItemsRequest();
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
      discounts: [],
      payments: [],
      fulfillment: [],
      shipping_address: objShippingAddress,
      billing_address: objBillingAddress,
    };

    if (objCustomer != null) {
      orderRequest.customer_id = objCustomer.id;
    }

    const emailValid = validateEmail(email);
    if (emailValid === false) {
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

  const total = useMemo(() => {
    return 0;
  }, []);

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
              setSelectedShipmentType={onShipmentSelect}
              shipmentMethod={shipmentType}
              storeId = {storeId}
            />
            {/*--- end shipment ---*/}

            {/*--- payment ---*/}
            <PaymentCard
              setSelectedPaymentMethod={onPaymentSelect}
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
          >
            Lưu
          </Button>
        </Row>
      </Form>
    </div>
  );
};

export default CreateBill;
