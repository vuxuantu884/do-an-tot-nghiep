//#region Import
import { Button, Card, Input, Row, Col, Tooltip, Select, Form } from "antd";
import documentIcon from "../../assets/img/document.svg";
import warningCircleIcon from "assets/img/warning-circle.svg";
import ProductCard from "../../component/order-online/productCard";
import CustomerCard from "../../component/order-online/customerCard";
import PaymentCard from "../../component/order-online/paymentCard";
import ShipmentCard from "../../component/order-online/shipmentCard";
import { useState, useCallback, useLayoutEffect } from "react";
import { useDispatch } from "react-redux";
import { StoreModel } from "model/other/Core/store-model";
import { OrderItemModel } from "model/other/Order/order-item-model";
import { OrderRequest } from "model/request/order.request";
import { OrderLineItemRequest } from "model/request/order-line-item.request";
import { OrderItemDiscountRequest } from "model/request/order-item-discount.request";
import { OrderItemDiscountModel } from "model/other/Order/order-item-discount-model";
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";
import {
  BillingAddress,
  CustomerModel,
  ShippingAddress,
} from "model/other/Customer/customer-model";
import { useHistory } from "react-router";
import AccountAction from "domain/actions/account/account.action";
import { PageResponse } from "model/response/base-metadata.response";
import Item from "antd/lib/list/Item";
//#endregion

const CreateBill = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [source, setSource] = useState<number>(0);
  const [items, setItems] = useState<Array<OrderItemModel>>([]);
  const [objCustomer, setObjCustomer] = useState<CustomerModel | null>(null);
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
  const [store, setStore] = useState<StoreModel | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountDetailResponse>>([]);

  const initRequest: OrderRequest = {
    company_id: null,
    store_id: null,
    store: "",
    status: "",
    price_type: "",
    tax_treatment: "",
    source_id: null,
    note: "",
    tags: "",
    customer_note: "",
    sale_note: "",
    account_code: "",
    account: "",
    source: "",
    assignee_code: "",
    assignee: "",
    channel_id: null,
    channel: "",
    customer_id: null,
    billing_address_id: null,
    shipping_address_id: null,
    fulfillment_status: "",
    packed_status: "",
    received_Status: "",
    payment_status: "",
    return_status: "",
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
    currency: "",
    items: [],
    discounts: [],
    payments: [],
  };

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

  const onStoreSelect = (storeId: number) => {
    setStoreId(storeId);
  };

  const onPriceTypeSelect = (priceType: string) => {
    setPriceType(priceType);
  };

  const onSourceSelect = (source: number) => {
    setSource(source);
  };

  const onChangeInfo = useCallback(
    (
      _items: Array<OrderItemModel>,
      amount: number,
      discount_rate: number,
      discount_value: number
    ) => {
      setItems(items);
      setDiscountRate(discount_rate);
      setDiscountValue(discount_value);
      setAmount(amount);
    },
    []
  );

  const onChangeInfoCustomer = useCallback((objCustomer: CustomerModel) => {
    setObjCustomer(objCustomer);
  }, []);

  const onChangeShippingAddress = useCallback(
    (objShippingAddress: ShippingAddress) => {
      setObjShippingAddress(objShippingAddress);
    },
    [dispatch]
  );

  const onChangeBillingAddress = useCallback(
    (objBillingAddress: BillingAddress) => {
      setObjBillingAddress(objBillingAddress);
    },
    [dispatch]
  );

  const createOrderRequest = () => {
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

    initRequest.items = orderLineItemsRequest;
    initRequest.shipping_address_id = objShippingAddress?.id;
    initRequest.billing_address_id = objBillingAddress?.id;
    initRequest.store_id = storeId;
    initRequest.source_id = source;
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

  const onCreateSuccess = useCallback(() => {
    history.push("/orders");
  }, [history]);

  const onFinish = useCallback(
    (values: OrderRequest) => {
      //call api
    },
    [dispatch, onCreateSuccess]
  );

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountDetailResponse>) => {
      setAccounts(data.items);
    },
    []
  );

  useLayoutEffect(() => {
    dispatch(AccountAction.SearchAccount({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  return (
    <div>
      <Form onFinish={onFinish}>
        <Row gutter={24}>
          <Col xs={24} lg={17}>
            {/*--- customer ---*/}
            <CustomerCard
              changeInfoCustomer={onChangeInfoCustomer}
              selectSource={onSourceSelect}
              changeShippingAddress={onChangeShippingAddress}
              changeBillingAddress={onChangeBillingAddress}
            />
            {/*--- end customer ---*/}

            {/*--- product ---*/}
            <ProductCard
              changeInfo={onChangeInfo}
              selectStore={onStoreSelect}
              selectPriceType={onPriceTypeSelect}
            />
            {/*--- end product ---*/}

            {/*--- shipment ---*/}
            <ShipmentCard />
            {/*--- end shipment ---*/}

            {/*--- payment ---*/}
            <PaymentCard />
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
              <div className="form-group form-group-with-search">
                <label htmlFor="" className="required-label">
                  Nhân viên bán hàng
                </label>

                <Form.Item name="assignee_code">
                  <Select
                    className="select-with-search"
                    showSearch
                    placeholder=""
                    defaultValue=""
                  >
                    <Select.Option value="">
                      Chọn nhân viên bán hàng
                    </Select.Option>
                    {accounts.map((item, index) => (
                      <Select.Option
                        style={{ width: "100%" }}
                        key={index}
                        value={item.id}
                      >
                        {item.full_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="form-group form-group-with-search">
                <div className="form-group form-group-with-search mb-0">
                  <div>
                    <label htmlFor="" className="">
                      Tham chiếu
                    </label>
                    <Tooltip
                      title="Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng"
                      className="tooltip-icon"
                    >
                      <span>
                        <img src={warningCircleIcon} alt="" />
                      </span>
                    </Tooltip>
                  </div>
                  <Form.Item name="">
                    <Input placeholder="Điền tham chiếu" />
                  </Form.Item>
                </div>
              </div>

              <div className="form-group form-group-with-search">
                <div className="form-group form-group-with-search mb-0">
                  <div>
                    <label htmlFor="" className="">
                      Đường dẫn
                    </label>
                    <Tooltip
                      title="Thêm đường dẫn đơn hàng gốc trên kênh bán hàng"
                      className="tooltip-icon"
                    >
                      <span>
                        <img src={warningCircleIcon} alt="" />
                      </span>
                    </Tooltip>
                  </div>
                  <Input placeholder="Điền đường dẫn" />
                </div>
              </div>
            </Card>

            <Card
              className="card-block card-block-normal"
              title={
                <div className="d-flex">
                  <img src={documentIcon} alt="" /> Thông tin bổ sung
                </div>
              }
            >
              <div className="form-group form-group-with-search">
                <div>
                  <label htmlFor="" className="">
                    Ghi chú
                  </label>
                  <Tooltip
                    title="Thêm thông tin ghi chú chăm sóc khách hàng"
                    className="tooltip-icon"
                  >
                    <span>
                      <img src={warningCircleIcon} alt="" />
                    </span>
                  </Tooltip>
                </div>
                <Input.TextArea placeholder="Điền ghi chú" />
              </div>
              <div className="form-group form-group-with-search mb-0">
                <div>
                  <label htmlFor="" className="">
                    Tag
                  </label>
                  <Tooltip
                    title="Thêm từ khóa để tiện lọc đơn hàng"
                    className="tooltip-icon"
                  >
                    <span>
                      <img src={warningCircleIcon} alt="" />
                    </span>
                  </Tooltip>
                </div>
                <Input placeholder="Thêm tag" />
              </div>
            </Card>
          </Col>
        </Row>

        <Row className="footer-row-btn" justify="end">
          <Button type="default" className="btn-style btn-cancel">
            Hủy
          </Button>
          <Button type="default" className="btn-style btn-save">
            Lưu
          </Button>
        </Row>
      </Form>
    </div>
  );
};

export default CreateBill;
