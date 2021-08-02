//#region Import
import React, { createRef, useCallback, useEffect, useState } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Input,
  FormInstance,
  Select,
} from "antd";
import { InfoCircleOutlined, SearchOutlined } from "@ant-design/icons";
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
import ShipmentCard from "./component/shipment-card";
import ProductCard from "./component/product-card";
import PaymentCard from "./component/payment-card";
import CustomerCard from "./component/customer-card";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import { OrderResponse, StoreCustomResponse } from "model/response/order/order.response";
import {
  OrderStatus,
  ShipmentMethodOption,
  TaxTreatment,
} from "utils/Constants";
import UrlConfig from "config/UrlConfig";
import moment from "moment";
import SaveAndConfirmOrder from "./modal/save-confirm.modal";
import {
  getAmountPaymentRequest,
  getTotalAmountAfferDiscount,
} from "utils/AppUtils";
import ConfirmPaymentModal from "./modal/confirm-payment.modal";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
import { StoreDetailAction, StoreDetailCustomAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { request } from "https";
//#endregion

var typeButton = "";
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
  const [shippingFeeCustomer, setShippingFeeCustomer] = useState<number | null>(
    null
  );
  const [shippingFeeCustomerHVC, setShippingFeeCustomerHVC] = useState<number | null>(
    null
  );
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [tags, setTag] = useState<string>("");
  const formRef = createRef<FormInstance>();
  const [isvibleSaveAndConfirm, setIsvibleSaveAndConfirm] =
    useState<boolean>(false);
  const [takeMoneyHelper, setTakeMoneyHelper] = useState<number | null>(null);
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
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

  const ChangeShippingFeeCustomer = (value: number | null) => {
    setShippingFeeCustomer(value);
  };

  const ChangeShippingFeeCustomerHVC = (value: number | null) => {
    setShippingFeeCustomerHVC(value);
  };
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
    shipper_code: null,
    shipper_name: "",
    delivery_fee: null,
    shipping_fee_informed_to_customer: null,
    shipping_fee_paid_to_three_pls: null,
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
  let textValue = "";
  const [isibleConfirmPayment, setVisibleConfirmPayment] = useState(false);

  const onOkConfirmPayment = () => {};

  const onCancleConfirmPayment = useCallback(() => {
    setVisibleConfirmPayment(false);
  }, []);

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
    if (paymentMethod !== 3 || shipmentMethod === 2 || shipmentMethod==3) {
      listFullfillmentRequest.push(request);
    }

    if(shipmentMethod === 3){
      request.delivery_type = "pick_at_store"
    }

    if (
      paymentMethod === 3 &&
      ((shipmentMethod === 4)) &&
      typeButton === OrderStatus.FINALIZED
    ) {
      request.shipment = null;
      listFullfillmentRequest.push(request);
    }
    return listFullfillmentRequest;
  };

  const createShipmentRequest = (value: OrderRequest) => {
    let objShipment: ShipmentRequest = {
      delivery_service_provider_id: null, //id người shipper
      delivery_service_provider_type: "", //shipper
      shipper_code: "",
      shipper_name: "",
      handover_id: null,
      service: null,
      fee_type: "",
      fee_base_on: "",
      delivery_fee: null,
      shipping_fee_paid_to_three_pls: null,
      expected_received_date: value.dating_ship?.utc().format(),
      reference_status: "",
      shipping_fee_informed_to_customer: null,
      reference_status_explanation: "",
      cod: null,
      cancel_reason: "",
      tracking_code: "",
      tracking_url: "",
      received_date: "",
      sender_address_id: null,
      note_to_shipper: "",
      requirements: value.requirements,
      sender_address: null,
    };

    if (shipmentMethod === ShipmentMethodOption.DELIVERPARNER) {
      objShipment.delivery_service_provider_id = 1;
      objShipment.delivery_service_provider_type = "external_service";
      objShipment.sender_address_id = storeId;
      return objShipment;
    }

    if (shipmentMethod === ShipmentMethodOption.SELFDELIVER) {
      objShipment.delivery_service_provider_type = "Shipper";
      objShipment.shipper_code = value.shipper_code;
      objShipment.shipping_fee_informed_to_customer =
        value.shipping_fee_informed_to_customer;
      objShipment.shipping_fee_paid_to_three_pls =
        value.shipping_fee_paid_to_three_pls;

      if (takeMoneyHelper !== null) {
        objShipment.cod = takeMoneyHelper;
      } else {
        objShipment.cod =
          orderAmount +
          (shippingFeeCustomer ? shippingFeeCustomer : 0) -
          getAmountPaymentRequest(payments) -
          discountValue;
      }
      return objShipment;
    }
    if (shipmentMethod === 3) {
      objShipment.delivery_service_provider_type = "pick_at_store";

      if (takeMoneyHelper !== null) {
        objShipment.cod = takeMoneyHelper;
      } else {
        if (shippingFeeCustomer !== null) {
          if (
            orderAmount +
              shippingFeeCustomer -
              getAmountPaymentRequest(payments) >
            0
          ) {
            objShipment.cod =
              orderAmount +
              shippingFeeCustomer -
              getAmountPaymentRequest(payments);
          }
        } else {
          if (orderAmount - getAmountPaymentRequest(payments) > 0) {
            objShipment.cod = orderAmount - getAmountPaymentRequest(payments);
          }
        }
      }
      return objShipment;
    }
    if (shipmentMethod === 4) {
      return null;
    }
  };

  const createDiscountRequest = () => {
    let objDiscount: OrderDiscountRequest = {
      rate: discountRate,
      value: discountValue,
      amount: discountValue,
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

  const createOrderCallback = useCallback(
    (value: OrderResponse) => {
      showSuccess("Thêm đơn hàng thành công");
      history.push(`${UrlConfig.ORDER}/${value.id}`);
    },
    [history]
  );

  //show modal save and confirm order ?
  const onCancelSaveAndConfirm = () => {
    setIsvibleSaveAndConfirm(false);
  };

  const onOkSaveAndConfirm = () => {
    typeButton = OrderStatus.DRAFT;
    formRef.current?.submit();
    setIsvibleSaveAndConfirm(false);
  };

  console.log(payments)
  const showSaveAndConfirmModal = () => {
    if (shipmentMethod !== 4 || paymentMethod !== 3) {
      setIsvibleSaveAndConfirm(true);
    } else {
      typeButton = OrderStatus.DRAFT;
      formRef.current?.submit();
    }
  };
  const onFinish = (values: OrderRequest) => {
    const element2: any = document.getElementById("save-and-confirm");
    element2.disable = true;
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount =
      getTotalAmountAfferDiscount(items);

    //Nếu là lưu nháp Fulfillment = [], payment = []
    if (typeButton === OrderStatus.DRAFT) {
      values.fulfillments = [];
      values.payments = [];
      values.shipping_fee_informed_to_customer = 0;
      values.action = OrderStatus.DRAFT;
      values.total = orderAmount;
      values.shipping_fee_informed_to_customer = 0;
    } else {
      //Nếu là đơn lưu và duyệt
      values.fulfillments = lstFulFillment;
      values.action = OrderStatus.FINALIZED;
      values.payments = payments.filter((payment)=> payment.amount > 0)
      values.total = orderAmount;
      if (
        values?.fulfillments &&
        values.fulfillments.length > 0 &&
        values.fulfillments[0].shipment
      ) {
        values.fulfillments[0].shipment.cod =
          orderAmount +
          (shippingFeeCustomer ? shippingFeeCustomer : 0) -
          getAmountPaymentRequest(payments) -
          discountValue;
      }
    }
    values.tags = tags;
    values.items = items;
    values.discounts = lstDiscount;
    values.shipping_address = shippingAddress;
    values.billing_address = billingAddress;
    values.customer_id = customer?.id;
    values.total_line_amount_after_line_discount =
      total_line_amount_after_line_discount;
    if (values.customer_id === undefined || values.customer_id === null) {
      showError("Vui lòng chọn khách hàng và nhập địa chỉ giao hàng");
      const element: any = document.getElementById("search_customer");
      element?.focus();
    } else {
      if (items.length === 0) {
        showError("Vui lòng chọn ít nhất 1 sản phẩm");
        const element: any = document.getElementById("search_product");
        element?.focus();
      } else {
        if (shipmentMethod === ShipmentMethodOption.SELFDELIVER) {
          if (values.delivery_service_provider_id === null) {
            showError("Vui lòng chọn đối tác giao hàng");
          } else {
            dispatch(orderCreateAction(values, createOrderCallback));
          }
        } else {
          dispatch(orderCreateAction(values, createOrderCallback));
        }
      }
    }
  };
  //#endregion

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse>|false) => {
    if(!data) {
      return;
    }
    setAccounts(data.items);
  }, []);
  const scroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  }, []);

  useEffect(() => {
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, setStoreDetail));
    }
  }, [dispatch, storeId]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);
  //windows offset
  useEffect(() => {
    window.addEventListener("scroll", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
    };
  }, [scroll]);
  return (
    <ContentContainer
      title="Tạo mới đơn hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: "/",
        },
        {
          name: "Đơn hàng",
        },
        {
          name: "Tạo mới đơn hàng",
        },
      ]}
      extra={<CreateBillStep status="draff" orderDetail={null} />}
    >
      <div className="orders">
        <Form
          layout="vertical"
          initialValues={initialForm}
          ref={formRef}
          onFinishFailed={({ errorFields }: any) => {
            const element: any = document.getElementById(
              errorFields[0].name.join("")
            );
            element?.focus();
            const y =
              element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
            window.scrollTo({ top: y, behavior: "smooth" });
          }}
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
          <Row gutter={20} style={{ marginBottom: "70px" }}>
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
                storeDetail={storeDetail}
                setShippingFeeInformedCustomer={ChangeShippingFeeCustomer}
                setShippingFeeInformedCustomerHVC={ChangeShippingFeeCustomerHVC}
                amount={orderAmount}
                setPaymentMethod={setPaymentMethod}
                paymentMethod={paymentMethod}
                shippingFeeCustomer={shippingFeeCustomer}
                shippingFeeCustomerHVC={shippingFeeCustomerHVC}
                cusomerInfo={customer}
                items={items}
                discountValue={discountValue}
              />
              <PaymentCard
                setSelectedPaymentMethod={changePaymentMethod}
                setPayments={onPayments}
                paymentMethod={paymentMethod}
                amount={
                  orderAmount +
                  (shippingFeeCustomer ? shippingFeeCustomer : 0) -
                  discountValue
                }
              />
            </Col>
            {/* Right Side */}
            <Col md={6}>
              <Card
                title={
                  <div className="d-flex">
                    <span className="title-card">THÔNG TIN ĐƠN HÀNG</span>
                  </div>
                }
              >
                <div className="padding-24">
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
                      notFoundContent="Không tìm thấy kết quả"
                      showSearch
                      placeholder={
                        <React.Fragment>
                          <SearchOutlined />
                          <span> Tìm, chọn nhân viên</span>
                        </React.Fragment>
                      }
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
                  <div className="d-flex">
                    <span className="title-card">THÔNG TIN BỔ SUNG</span>
                  </div>
                }
              >
                <div className="padding-24">
                  <Form.Item
                    name="note"
                    label="Ghi chú nội bộ"
                    tooltip={{
                      title: "Thêm thông tin ghi chú chăm sóc khách hàng",
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <Input.TextArea
                      placeholder="Điền ghi chú"
                      maxLength={500}
                      style={{ minHeight: "130px" }}
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
          <Row
            gutter={24}
            className="margin-top-10 "
            style={{
              position: "fixed",
              textAlign: "right",
              width: "100%",
              height: "55px",
              bottom: "0%",
              backgroundColor: "#FFFFFF",
              marginLeft: "-30px",
              display: `${isShowBillStep ? "" : "none"}`,
            }}
          >
            <Col
              md={10}
              style={{ marginLeft: "-20px", marginTop: "3px", padding: "3px" }}
            >
              <CreateBillStep status="draff" orderDetail={null} />
            </Col>

            <Col md={9} style={{ marginTop: "8px" }}>
              <Button
                className="ant-btn-outline fixed-button cancle-button"
                onClick={() => window.location.reload()}
              >
                Huỷ
              </Button>
              <Button
                className="create-button-custom ant-btn-outline fixed-button"
                type="primary"
                onClick={showSaveAndConfirmModal}
              >
                Lưu nháp
              </Button>
              <Button
                type="primary"
                className="create-button-custom"
                id="save-and-confirm"
                onClick={() => {
                  typeButton = OrderStatus.FINALIZED;
                  formRef.current?.submit();
                }}
              >
                Lưu và duyệt
              </Button>
            </Col>
          </Row>
          <SaveAndConfirmOrder
            onCancel={onCancelSaveAndConfirm}
            onOk={onOkSaveAndConfirm}
            visible={isvibleSaveAndConfirm}
            title="Bạn có chắc chắn lưu nháp đơn hàng này không?"
            text="Đơn hàng này sẽ bị xóa thông tin giao hàng hoặc thanh toán nếu có"
            icon={WarningIcon}
          />

          <ConfirmPaymentModal
            onCancel={onCancleConfirmPayment}
            onOk={onOkConfirmPayment}
            visible={isibleConfirmPayment}
            text={textValue}
          />
        </Form>
      </div>
    </ContentContainer>
  );
}


