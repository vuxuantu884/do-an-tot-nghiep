import { Card, Col, Row, Tag, Form } from "antd";
import ContentContainer from "component/container/content.container";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UrlConfig from "config/url.config";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { actionCreateOrderReturn } from "domain/actions/order/order-return.action";
import {
  orderCreateAction,
  OrderDetailAction,
  PaymentMethodGetList,
} from "domain/actions/order/order.action";
import {
  BillingAddress,
  ExchangeRequest,
  FulFillmentRequest,
  OrderDiscountRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
  OrderRequest,
  ReturnRequest,
  ShipmentRequest,
  ShippingAddress,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  FulFillmentResponse,
  OrderLineItemResponse,
  OrderResponse,
  ReturnProductModel,
  StoreCustomResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import {
  FulFillmentStatus,
  MoneyPayThreePls,
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  ShipmentMethodOption,
  TaxTreatment,
} from "utils/Constants";
import { useQuery } from "utils/useQuery";
import UpdateCustomerCard from "../../component/update-customer-card";
import CardReturnMoney from "../components/CardReturnMoney";
import CardReturnOrder from "../components/CardReturnOrder";
import CardReturnProducts from "../components/CardReturnProducts";
import CardExchangeProducts from "../components/CardExchangeProducts";
import CardReturnReceiveProducts from "../components/CardReturnReceiveProducts";
import ReturnBottomBar from "../components/ReturnBottomBar";
import CardReturnShipment from "../components/CardReturnShipment";
import { showError, showSuccess } from "utils/ToastUtils";
import {
  getAmountPaymentRequest,
  getTotalAmountAfferDiscount,
} from "utils/AppUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { StoreDetailCustomAction } from "domain/actions/core/store.action";
import moment from "moment";

type PropType = {
  id?: string;
};

let typeButton = "";
let order_return_id: number = 0;

const ScreenReturnDetail = (props: PropType) => {
  const [form] = Form.useForm();
  const [isError, setError] = useState<boolean>(false);
  const [isCanReturnOrExchange, setIsCanReturnOrExchange] =
    useState<boolean>(false);
  const [isExchange, setIsExchange] = useState<boolean>(false);
  const [isCanReturn, setIsCanReturn] = useState<boolean>(false);
  const [isCanExchange, setIsCanExchange] = useState<boolean>(false);
  const [isStepExchange, setIsStepExchange] = useState<boolean>(false);
  const [isReceiveReturnProducts, setIsReceiveReturnProducts] =
    useState<boolean>(false);
  const history = useHistory();
  const query = useQuery();
  let queryOrderID = query.get("orderID");

  let orderId = queryOrderID ? parseInt(queryOrderID) : undefined;
  const [shippingFeeCustomer, setShippingFeeCustomer] = useState<number | null>(
    null
  );

  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  const [storeId, setStoreId] = useState<number | null>(null);
  const [orderAmount] = useState<number>(0);
  const [discountRate] = useState<number>(0);
  const [loyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [tags, setTag] = useState<string>("");
  const [shippingAddress] = useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(
    null
  );
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);

  const dispatch = useDispatch();

  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [listReturnProducts, setListReturnProducts] = useState<
    ReturnProductModel[]
  >([]);
  const [listOrderProducts, setListOrderProducts] = useState<
    OrderLineItemResponse[]
  >([]);

  const [listPaymentMethods, setListPaymentMethods] = useState<
    Array<PaymentMethodResponse>
  >([]);
  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);
  const [amountReturn] = useState<number>(0);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);

  const [listExchangeProducts, setListExchangeProducts] = useState<
    OrderLineItemRequest[]
  >([]);

  const [shipmentMethod, setShipmentMethod] = useState<number>(
    ShipmentMethodOption.DELIVER_LATER
  );
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [shippingFeeCustomerHVC, setShippingFeeCustomerHVC] = useState<
    number | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState<number>(
    PaymentMethodOption.PREPAYMENT
  );
  const [discountValue] = useState<number>(0);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [serviceType, setServiceType] = useState<string>();
  const [hvc, setHvc] = useState<number | null>(null);
  const [fee, setFee] = useState<number | null>(null);
  const [fulfillments] = useState<Array<FulFillmentResponse>>([]);

  const initialForm: OrderRequest = {
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
    reference_code: "",
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

  const getTotalPrice = (listProducts: OrderLineItemRequest[]) => {
    let total = 0;
    listProducts.forEach((a) => {
      let discountAmount = a.discount_items[0].value;
      total = total + a.quantity * (a.price - discountAmount);
    });
    return total;
  };

  let totalAmountNeedToPay =
    getTotalPrice(listExchangeProducts) +
    (shippingFeeCustomer ? shippingFeeCustomer : 0) -
    getTotalPrice(listReturnProducts);

  const onGetDetailSuccess = useCallback((data: false | OrderResponse) => {
    if (!data) {
      setError(true);
    } else {
      let _data = { ...data };
      _data.fulfillments = _data.fulfillments?.filter(
        (f) =>
          f.status !== FulFillmentStatus.CANCELLED &&
          f.status !== FulFillmentStatus.RETURNED &&
          f.status !== FulFillmentStatus.RETURNING
      );
      setOrderDetail(_data);
      let returnFulfillment = data.fulfillments?.find((singleFulfillment) => {
        return singleFulfillment.status === FulFillmentStatus.SHIPPED;
      });
      if (returnFulfillment) {
        setIsCanReturnOrExchange(true);
      }
      let returnProduct: ReturnProductModel[] = _data.items.map((single) => {
        return {
          ...single,
          maxQuantity: single.quantity,
          quantity: 0,
        };
      });
      setListReturnProducts(returnProduct);
      setListOrderProducts(_data.items);
      setStoreId(_data.store_id);
      setBillingAddress(_data.billing_address);
      if (_data.tags) {
        setTag(_data.tags);
      }
    }
  }, []);

  const handleChangeSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };
  const handleListExchangeProducts = (
    listExchangeProducts: OrderLineItemRequest[]
  ) => {
    setListExchangeProducts(listExchangeProducts);
  };

  const onReturn = () => {
    if (OrderDetail && listReturnProducts) {
      let orderDetailFormatted: ReturnRequest = {
        ...OrderDetail,
        action: "",
        delivery_service_provider_id: null,
        delivery_fee: null,
        shipper_code: "",
        shipper_name: "",
        shipping_fee_paid_to_three_pls: null,
        requirements: null,
        items: listReturnProducts,
        fulfillments: [],
        payments: payments,
        reason_id: 1,
        received: isReceiveReturnProducts,
      };

      dispatch(
        actionCreateOrderReturn(orderDetailFormatted, (response) => {
          console.log("response", response);
        })
      );
    }
  };

  const onReturnAndExchange = async () => {
    if (OrderDetail && listReturnProducts) {
      let orderDetailFormatted: ReturnRequest = {
        ...OrderDetail,
        action: "",
        delivery_service_provider_id: null,
        delivery_fee: null,
        shipper_code: "",
        shipper_name: "",
        shipping_fee_paid_to_three_pls: null,
        requirements: null,
        items: listReturnProducts,
        fulfillments: [],
        payments: payments,
        reason_id: 1,
        received: isReceiveReturnProducts,
      };

      dispatch(
        actionCreateOrderReturn(orderDetailFormatted, (response) => {
          order_return_id = response.id;
          form.submit();
        })
      );
    }
  };

  const onFinish = (values: ExchangeRequest) => {
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount =
      getTotalAmountAfferDiscount(listExchangeProducts);

    let checkPointFocus = payments.find((p) => p.code === "point");
    if (checkPointFocus) {
      let currentPoint = 0;
      if (loyaltyPoint)
        currentPoint = loyaltyPoint.point === null ? 0 : loyaltyPoint.point;
      let point =
        checkPointFocus.point === undefined ? 0 : checkPointFocus.point;

      if (point > currentPoint) {
        showError("Số điểm tiêu vượt quá số điểm hiện có");
        return;
      }
    }
    values.fulfillments = lstFulFillment;
    values.action = OrderStatus.FINALIZED;
    values.payments = payments.filter((payment) => payment.amount > 0);
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
    values.tags = tags;
    values.items = listExchangeProducts;
    values.discounts = lstDiscount;
    values.shipping_address = shippingAddress;
    values.billing_address = billingAddress;
    values.customer_id = customer?.id;
    values.total_line_amount_after_line_discount =
      total_line_amount_after_line_discount;
    values.assignee_code = OrderDetail ? OrderDetail.assignee_code : null;
    values.currency = OrderDetail ? OrderDetail.currency : null;
    values.account_code = OrderDetail ? OrderDetail.account_code : null;
    values.store_id = OrderDetail ? OrderDetail.store_id : null;
    values.source_id = OrderDetail ? OrderDetail.source_id : null;
    values.order_return_id = order_return_id;
    if (!values.customer_id) {
      showError("Vui lòng chọn khách hàng và nhập địa chỉ giao hàng");
      const element: any = document.getElementById("search_customer");
      element?.focus();
    } else {
      if (listExchangeProducts.length === 0) {
        showError("Vui lòng chọn ít nhất 1 sản phẩm");
        const element: any = document.getElementById("search_product");
        element?.focus();
      } else {
        if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER) {
          if (values.delivery_service_provider_id === null) {
            showError("Vui lòng chọn đối tác giao hàng");
          } else {
            dispatch(orderCreateAction(values, createOrderCallback));
          }
        } else {
          if (
            shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER &&
            !serviceType
          ) {
            showError("Vui lòng chọn đơn vị vận chuyển");
          } else {
            console.log("values", values);
            dispatch(orderCreateAction(values, createOrderCallback));
          }
        }
      }
    }
  };

  const createOrderCallback = useCallback(
    (value: OrderResponse) => {
      if (value.fulfillments && value.fulfillments.length > 0) {
        showSuccess("Đơn được lưu và duyệt thành công");
        history.push(`${UrlConfig.ORDER}/${value.id}`);
      } else {
        showSuccess("Đơn được lưu nháp thành công");
        history.push(`${UrlConfig.ORDER}/${value.id}`);
      }
    },
    [history]
  );

  const createShipmentRequest = (value: OrderRequest) => {
    let objShipment: ShipmentRequest = {
      delivery_service_provider_id: null, //id đối tác vận chuyển
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
      office_time: officeTime,
    };

    switch (shipmentMethod) {
      case ShipmentMethodOption.DELIVER_PARTNER:
        return {
          ...objShipment,
          delivery_service_provider_id: hvc,
          delivery_service_provider_type: "external_service",
          sender_address_id: storeId,
          shipping_fee_informed_to_customer:
            value.shipping_fee_informed_to_customer,
          service: serviceType!,
          shipping_fee_paid_to_three_pls:
            hvc === 1 ? fee : MoneyPayThreePls.VALUE,
        };

      case ShipmentMethodOption.SELF_DELIVER:
        return {
          ...objShipment,
          delivery_service_provider_type: "Shipper",
          shipper_code: value.shipper_code,
          shipping_fee_informed_to_customer:
            value.shipping_fee_informed_to_customer,
          shipping_fee_paid_to_three_pls: value.shipping_fee_paid_to_three_pls,
          cod:
            orderAmount +
            (shippingFeeCustomer ? shippingFeeCustomer : 0) -
            getAmountPaymentRequest(payments) -
            discountValue,
        };

      case ShipmentMethodOption.PICK_AT_STORE:
        objShipment.delivery_service_provider_type = "pick_at_store";
        let newCod = orderAmount;
        if (shippingFeeCustomer !== null) {
          if (
            orderAmount +
              shippingFeeCustomer -
              getAmountPaymentRequest(payments) >
            0
          ) {
            newCod =
              orderAmount +
              shippingFeeCustomer -
              getAmountPaymentRequest(payments);
          }
        } else {
          if (orderAmount - getAmountPaymentRequest(payments) > 0) {
            newCod = orderAmount - getAmountPaymentRequest(payments);
          }
        }
        return {
          ...objShipment,
          delivery_service_provider_type: "pick_at_store",
          cod: newCod,
        };

      case ShipmentMethodOption.DELIVER_LATER:
        return null;

      default:
        break;
    }
  };

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
      items: listExchangeProducts,
    };

    let listFulfillmentRequest = [];
    if (
      paymentMethod !== PaymentMethodOption.POSTPAYMENT ||
      shipmentMethod === ShipmentMethodOption.SELF_DELIVER ||
      shipmentMethod === ShipmentMethodOption.PICK_AT_STORE
    ) {
      listFulfillmentRequest.push(request);
    }

    if (shipmentMethod === ShipmentMethodOption.PICK_AT_STORE) {
      request.delivery_type = "pick_at_store";
    }

    if (
      paymentMethod === PaymentMethodOption.POSTPAYMENT &&
      shipmentMethod === ShipmentMethodOption.DELIVER_LATER &&
      typeButton === OrderStatus.FINALIZED
    ) {
      request.shipment = null;
      listFulfillmentRequest.push(request);
    }
    return listFulfillmentRequest;
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

  const onShipmentSelect = (value: number) => {
    setShipmentMethod(value);
  };

  const ChangeShippingFeeCustomer = (value: number | null) => {
    setShippingFeeCustomer(value);
  };
  const ChangeShippingFeeCustomerHVC = (value: number | null) => {
    setShippingFeeCustomerHVC(value);
  };

  const handleCancel = () => {
    history.push("/");
  };

  const renderIfCannotReturn = () => {
    return <div>Đơn hàng không thể đổi trả!</div>;
  };

  const renderIfCanReturn = () => {
    return (
      <React.Fragment>
        <div className="orders">
          <Form
            layout="vertical"
            initialValues={initialForm}
            form={form}
            onFinishFailed={({ errorFields }: any) => {
              const element: any = document.getElementById(
                errorFields[0].name.join("")
              );
              element?.focus();
              const y =
                element?.getBoundingClientRect()?.top +
                window.pageYOffset +
                -250;
              window.scrollTo({ top: y, behavior: "smooth" });
            }}
            onFinish={onFinish}
          >
            <Row gutter={24} style={{ marginBottom: "70px" }}>
              <Col md={18}>
                {/*--- customer ---*/}
                <UpdateCustomerCard
                  OrderDetail={OrderDetail}
                  customerDetail={customer}
                />
                {/*--- end customer ---*/}
                <CardReturnOrder
                  isDetailPage={false}
                  isExchange={isExchange}
                  handleIsExchange={setIsExchange}
                />
                <CardReturnProducts
                  listReturnProducts={listReturnProducts}
                  handleReturnProducts={(
                    listReturnProducts: ReturnProductModel[]
                  ) => setListReturnProducts(listReturnProducts)}
                  listOrderProducts={listOrderProducts}
                  handleCanReturn={setIsCanReturn}
                  isDetailPage={false}
                  isExchange={isExchange}
                  isStepExchange={isStepExchange}
                />
                {isExchange && isStepExchange && (
                  <CardExchangeProducts
                    items={listExchangeProducts}
                    handleCardItems={handleListExchangeProducts}
                    shippingFeeCustomer={shippingFeeCustomer}
                    amountReturn={getTotalPrice(listReturnProducts)}
                    totalAmountNeedToPay={totalAmountNeedToPay}
                  />
                )}
                <CardReturnMoney
                  listPaymentMethods={listPaymentMethods}
                  amountReturn={amountReturn}
                  payments={payments}
                  handlePayments={setPayments}
                  isDetailPage={false}
                  totalAmountNeedToPay={totalAmountNeedToPay}
                  isExchange={isExchange}
                  isStepExchange={isStepExchange}
                />
                {isExchange && isStepExchange && (
                  <CardReturnShipment
                    setShipmentMethodProps={onShipmentSelect}
                    shipmentMethod={shipmentMethod}
                    storeDetail={storeDetail}
                    setShippingFeeInformedCustomer={ChangeShippingFeeCustomer}
                    setShippingFeeInformedCustomerHVC={
                      ChangeShippingFeeCustomerHVC
                    }
                    amount={getTotalPrice(listReturnProducts)}
                    setPaymentMethod={setPaymentMethod}
                    paymentMethod={paymentMethod}
                    shippingFeeCustomer={shippingFeeCustomer}
                    shippingFeeCustomerHVC={shippingFeeCustomerHVC}
                    customerInfo={customer}
                    items={listExchangeProducts}
                    discountValue={discountValue}
                    setOfficeTime={setOfficeTime}
                    officeTime={officeTime}
                    setServiceType={setServiceType}
                    setHVC={setHvc}
                    setFee={setFee}
                    payments={payments}
                    onPayments={setPayments}
                    fulfillments={fulfillments}
                    isCloneOrder={false}
                  />
                )}
                <CardReturnReceiveProducts
                  isDetailPage={false}
                  isReceiveReturnProducts={isReceiveReturnProducts}
                  handleReceiveReturnProducts={setIsReceiveReturnProducts}
                />
              </Col>

              <Col md={6}>
                <Card
                  className="card-block card-block-normal"
                  title={
                    <div className="d-flex">
                      <span className="title-card">THÔNG TIN ĐƠN HÀNG</span>
                    </div>
                  }
                >
                  <div className="padding-24">
                    <Row className="" gutter={5}>
                      <Col span={9}>Cửa hàng:</Col>
                      <Col span={15}>
                        <span
                          style={{ fontWeight: 500, color: "#2A2A86" }}
                          className="text-focus"
                        >
                          {OrderDetail?.store}
                        </span>
                      </Col>
                    </Row>
                    <Row className="margin-top-10" gutter={5}>
                      <Col span={9}>Điện thoại:</Col>
                      <Col span={15}>
                        <span style={{ fontWeight: 500, color: "#222222" }}>
                          {OrderDetail?.customer_phone_number}
                        </span>
                      </Col>
                    </Row>
                    <Row className="margin-top-10" gutter={5}>
                      <Col span={9}>Địa chỉ:</Col>
                      <Col span={15}>
                        <span style={{ fontWeight: 500, color: "#222222" }}>
                          {OrderDetail?.shipping_address?.full_address}
                        </span>
                      </Col>
                    </Row>
                    <Row className="margin-top-10" gutter={5}>
                      <Col span={9}>NVBH:</Col>
                      <Col span={15}>
                        <span
                          style={{ fontWeight: 500, color: "#222222" }}
                          className="text-focus"
                        >
                          {OrderDetail?.assignee}
                        </span>
                      </Col>
                    </Row>
                    <Row className="margin-top-10" gutter={5}>
                      <Col span={9}>Người tạo:</Col>
                      <Col span={15}>
                        <span
                          style={{ fontWeight: 500, color: "#222222" }}
                          className="text-focus"
                        >
                          {OrderDetail?.account}
                        </span>
                      </Col>
                    </Row>
                    <Row className="margin-top-10" gutter={5}>
                      <Col span={9}>Đường dẫn:</Col>
                      <Col span={15} style={{ wordWrap: "break-word" }}>
                        {OrderDetail?.url ? (
                          <a href={OrderDetail?.url}>{OrderDetail?.url}</a>
                        ) : (
                          <span className="text-focus">Không</span>
                        )}
                      </Col>
                    </Row>
                  </div>
                </Card>
                <SubStatusOrder
                  subStatusId={OrderDetail?.sub_status_id}
                  status={OrderDetail?.status}
                  orderId={orderId}
                  fulfillments={OrderDetail?.fulfillments}
                  handleChangeSubStatus={handleChangeSubStatus}
                />
                <Card
                  className="margin-top-20"
                  title={
                    <div className="d-flex">
                      <span className="title-card">THÔNG TIN BỔ SUNG</span>
                    </div>
                  }
                >
                  <div className="padding-24">
                    <Row
                      className=""
                      gutter={5}
                      style={{ flexDirection: "column" }}
                    >
                      <Col span={24} style={{ marginBottom: 6 }}>
                        <b>Ghi chú nội bộ:</b>
                      </Col>
                      <Col span={24}>
                        <span
                          className="text-focus"
                          style={{ wordWrap: "break-word" }}
                        >
                          {OrderDetail?.note !== ""
                            ? OrderDetail?.note
                            : "Không có ghi chú"}
                        </span>
                      </Col>
                    </Row>

                    <Row
                      className="margin-top-10"
                      gutter={5}
                      style={{ flexDirection: "column" }}
                    >
                      <Col span={24} style={{ marginBottom: 6 }}>
                        <b>Tags:</b>
                      </Col>
                      <Col span={24}>
                        <span className="text-focus">
                          {OrderDetail?.tags
                            ? OrderDetail?.tags
                                .split(",")
                                .map((item, index) => (
                                  <Tag
                                    key={index}
                                    className="orders-tag"
                                    style={{
                                      backgroundColor: "#F5F5F5",
                                      color: "#737373",
                                      padding: "5px 10px",
                                    }}
                                  >
                                    {item}
                                  </Tag>
                                ))
                            : "Không có tags"}
                        </span>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
        <ReturnBottomBar
          onReturn={() => onReturn()}
          onReturnAndExchange={() => onReturnAndExchange()}
          onCancel={() => handleCancel()}
          isCanReturn={isCanReturn}
          isCanExchange={isCanExchange}
          isExchange={isExchange}
          isStepExchange={isStepExchange}
          handleIsStepExchange={setIsStepExchange}
        />
      </React.Fragment>
    );
  };

  useEffect(() => {
    console.log("storeId", storeId);
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, setStoreDetail));
    }
  }, [dispatch, storeId]);

  useEffect(() => {
    setShippingFeeCustomer(0);
    if (orderId) {
      dispatch(OrderDetailAction(orderId, onGetDetailSuccess));
    } else {
      setError(true);
    }
  }, [dispatch, orderId, onGetDetailSuccess]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(CustomerDetail(OrderDetail?.customer_id, setCustomer));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        let result = response.filter(
          (single) => single.code !== PaymentMethodCode.CARD
        );
        setListPaymentMethods(result);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (isStepExchange && listExchangeProducts.length > 0) {
      setIsCanExchange(true);
    }
  }, [isStepExchange, listExchangeProducts.length]);

  return (
    <ContentContainer
      isError={isError}
      title="Trả hàng cho đơn hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: `${UrlConfig.HOME}`,
        },
        {
          name: "Đơn hàng",
        },
        {
          name: "Trả hàng",
        },
        {
          name: `Tạo đơn trả hàng cho đơn hàng ${orderId}`,
        },
      ]}
    >
      {isCanReturnOrExchange ? renderIfCanReturn() : renderIfCannotReturn()}
    </ContentContainer>
  );
};

export default ScreenReturnDetail;
