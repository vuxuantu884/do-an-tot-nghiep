//#region Import
import React, { createRef, useCallback, useEffect, useState } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Input,
  Space,
  FormInstance,
  Select,
} from "antd";
import { InfoCircleOutlined, ProfileOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CustomerResponse } from "model/response/customer/customer.response";
import { RootReducerType } from "model/reducers/RootReducerType";
import { PageResponse } from "model/base/base-metadata.response";
import { showError, showSuccess } from "utils/ToastUtils";
import { AccountResponse } from "model/account/account.model";
import { AccountSearchAction } from "domain/actions/account/account.action";
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
import { orderCreateAction } from "domain/actions/order/order.action";
import ShipmentCard from "./shipment-card";
import ProductCard from "./product-card";
import PaymentCard from "./payment-card";
import CustomerCard from "./customer-card";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import { OrderResponse } from "model/response/order/order.response";
import { OrderStatus, TaxTreatment } from "utils/Constants";
import UrlConfig from "config/UrlConfig";
import moment from "moment";
import SaveAndConfirmOrder from "./modal/SaveAndConfirmOrder";
//#endregion

var typeButton = -1;
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
  const [shippingFeeCustomer, setShippingFeeCustomer] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [tags, setTag] = useState<string>("");
  const formRef = createRef<FormInstance>();
  const [isvibleSaveAndConfirm, setIsvibleSaveAndConfirm] = useState<boolean>(false)
  //#endregion

  //show modal save and confirm order ?
  const onCancelSaveAndConfirm = () => {
    setIsvibleSaveAndConfirm(false)
  }
  const onOkSaveAndConfirm = () => {
    typeButton = 1;
    formRef.current?.submit();
    setIsvibleSaveAndConfirm(false)
  }
  const showSaveAndConfirmModal = () => {
    if(shipmentMethod === 2 || paymentMethod === 1){
      setIsvibleSaveAndConfirm(true)
    }else{
      typeButton = 0;
      formRef.current?.submit();
    }
  }
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

  const ChangeShippingFeeCustomer =  (value:number | null) =>{
    setShippingFeeCustomer(value);
  }
  //#endregion

  //#region Product
  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  const onChangeInfoProduct = (
    _items: Array<OrderLineItemRequest>,
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
  

  const onShipmentSelect = (value: number) => {
    setShipmentMethod(value);
  };

  let initialRequest: OrderRequest = {
    action: "", //finalized
    store_id: null,
    price_type: "retail_price", //giá bán lẻ giá bán buôn
    tax_treatment: TaxTreatment.INCLUSIVE,
    delivery_service_provider_id: null,
    delivery_fee: null,
    shipping_fee_informed_to_customer: null,
    shipping_fee_paid_to_3pls: null,
    dating_ship: moment(),
    requirements: null,
    source_id: null,
    note: "",
    tags: "",
    customer_note: "",
    account_code: userReducer.account?.code,
    assignee_code: null,
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
    fulfillments: [],
    shipping_address: null,
    billing_address: null,
    payments: [],
  };

  //#region Order

  const initialForm: OrderRequest = {
    ...initialRequest,
    shipping_address: shippingAddress,
    billing_address: billingAddress,
  };

  const onChangeTag = (value: []) => {
    let strTag = "";
    value.forEach((element, i) => {
      if (i < 1) {
        strTag = strTag + element;
      } else {
        strTag = strTag + "," + element;
      }
    });

    setTag(strTag);
  };

  //Fulfillment Request
  const createFulFillmentRequest = (value: OrderRequest) => {
    let shipmentRequest = createShipmentRequest(value);
    let request: FulFillmentRequest = {
      store_id: value.store_id,
      account_code: userReducer.account?.code,
      assignee_code: value.assignee_code,
      delivery_type: "",
      stock_location_id: null,
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
    if (paymentMethod !== 3 || shipmentMethod === 2) {
      listFullfillmentRequest.push(request);
    }

    if (paymentMethod === 3 && shipmentMethod === 4 && typeButton === 1) {
      request.shipment = null;
      listFullfillmentRequest.push(request);
    }
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

  const onCreateSuccess = useCallback(
    (value: OrderResponse) => {
      showSuccess("Thêm đơn hàng thành công");
      history.push(`${UrlConfig.ORDER}/${value.id}`);
    },
    [history]
  );

  const onFinish = (values: OrderRequest) => {
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    if (typeButton === 0) {
      values.fulfillments = [];
      values.payments = [];
      values.action = OrderStatus.DRAFT;
    } else {
      if (lstFulFillment != null) {
      }
      values.fulfillments = lstFulFillment;
      values.action = OrderStatus.FINALIZED;
      values.payments = payments;
    }
    values.tags = tags;
    values.items = items;
    values.discounts = lstDiscount;
    values.shipping_address = shippingAddress;
    values.billing_address = billingAddress;
    values.customer_id = customer?.id;

    if (values.customer_id === undefined || values.customer_id === null) {
      showError("Vui lòng chọn khách hàng và nhập địa chỉ giao hàng");
    } else {
      if (items.length === 0) {
        showError("Vui lòng chọn ít nhất 1 sản phẩm");
      } else {
        dispatch(orderCreateAction(values, onCreateSuccess));
      }
    }
  };
  //#endregion

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse>) => {
    setAccounts(data.items);
  }, []);
  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  return (
    <ContentContainer
      title="Thêm mới đơn hàng online"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: "/",
        },
        {
          name: "Đơn hàng",
        },
        {
          name: "Thêm đơn hàng online",
        },
      ]}
      extra={<CreateBillStep status="draff" orderDetail={null} />}
    >
      <div className="orders">
        <Form
          layout="vertical"
          scrollToFirstError
          initialValues={initialForm}
          ref={formRef}
          onFinish={onFinish}
        >
          <Form.Item noStyle hidden name="action">
            <Input></Input>
          </Form.Item>
          <Form.Item noStyle hidden name="currency">
            <Input></Input>
          </Form.Item>
          <Form.Item noStyle hidden name="account_code">
            <Input></Input>
          </Form.Item>
          <Form.Item noStyle hidden name="tax_treatment">
            <Input></Input>
          </Form.Item>
          <Form.Item noStyle hidden name="tags">
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
                shippingFeeCustomer={shippingFeeCustomer}
              />
              {/*--- end product ---*/}
              {/*--- shipment ---*/}
              <ShipmentCard
                setShipmentMethodProps={onShipmentSelect}
                shipmentMethod={shipmentMethod}
                storeId={storeId}
                setShippingFeeInformedCustomer={ChangeShippingFeeCustomer}
              />
              <PaymentCard
                setSelectedPaymentMethod={changePaymentMethod}
                setPayments={onPayments}
                paymentMethod={paymentMethod}
                amount={shippingFeeCustomer? orderAmount + shippingFeeCustomer : orderAmount}
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
                      notFoundContent="Không tìm thấy kết quả"
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
                          {`${item.full_name} - ${item.code}`}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="Tham chiếu"
                    name="reference"
                    tooltip={{
                      title:
                        "Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng",
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <Input placeholder="Điền tham chiếu" maxLength={255} />
                  </Form.Item>
                  <Form.Item
                    label="Đường dẫn"
                    name="url"
                    tooltip={{
                      title: "Thêm đường dẫn đơn hàng gốc trên kênh bán hàng",
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <Input placeholder="Điền đường dẫn" maxLength={255} />
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
                    tooltip={{
                      title: "Thêm thông tin ghi chú chăm sóc khách hàng",
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <Input.TextArea
                      placeholder="Điền ghi chú"
                      maxLength={500}
                      style={{ minHeight: "76px" }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Tag"
                    tooltip={{
                      title: "Thêm từ khóa để tiện lọc đơn hàng",
                      icon: <InfoCircleOutlined />,
                    }}
                    // name="tags"
                  >
                    <Select
                      className="ant-select-hashtag"
                      dropdownClassName="ant-select-dropdown-hashtag"
                      mode="tags"
                      placeholder="Thêm tag"
                      onChange={onChangeTag}
                    />
                  </Form.Item>
                </div>
              </Card>
            </Col>
          </Row>
          <div className="margin-top-10" style={{ textAlign: "right" }}>
            <Space size={12}>
              <Button onClick={() => history.push(`${UrlConfig.ORDER}/list`)}>Huỷ</Button>
              <Button
                onClick={showSaveAndConfirmModal}
              >
                Lưu nháp
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  typeButton = 1;
                  formRef.current?.submit();
                }}
              >
                Lưu và duyệt
              </Button>
            </Space>
          </div>
        </Form>
      </div>
      <SaveAndConfirmOrder 
       onCancel={onCancelSaveAndConfirm}
       onOk={onOkSaveAndConfirm}
       visible={isvibleSaveAndConfirm}
       title="Xác nhận đơn hàng"
       text="Đơn hàng này có Giao hàng và Thanh toán, vì vậy đơn sẽ được duyệt tự động. Bạn có chắc Lưu và Duyệt đơn này không?"
     />
    </ContentContainer>
  );
}
