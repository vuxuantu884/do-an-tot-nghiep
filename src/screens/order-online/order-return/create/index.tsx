import { Col, Form, Row } from "antd";
import ContentContainer from "component/container/content.container";
import ModalConfirm from "component/modal/ModalConfirm";
import UrlConfig from "config/url.config";
import { StoreDetailCustomAction } from "domain/actions/core/store.action";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import {
  actionCreateOrderReturn,
  actionGetOrderReturnReasons,
} from "domain/actions/order/order-return.action";
import {
  orderCreateAction,
  OrderDetailAction,
  PaymentMethodGetList,
} from "domain/actions/order/order.action";
import { RootReducerType } from "model/reducers/RootReducerType";
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
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import {
  FulFillmentResponse,
  OrderLineItemResponse,
  OrderResponse,
  OrderReturnReasonModel,
  ReturnProductModel,
  StoreCustomResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import {
  getAmountPaymentRequest,
  getTotalAmountAfferDiscount,
} from "utils/AppUtils";
import {
  FulFillmentStatus,
  MoneyPayThreePls,
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  ShipmentMethodOption,
  TaxTreatment,
} from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
import UpdateCustomerCard from "../../component/update-customer-card";
import CardExchangeProducts from "../components/CardExchangeProducts";
import CardReturnMoney from "../components/CardReturnMoney";
import CardReturnOrder from "../components/CardReturnOrder";
import CardReturnProducts from "../components/CardReturnProducts";
import CardReturnReceiveProducts from "../components/CardReturnReceiveProducts";
import CardReturnShipment from "../components/CardReturnShipment";
import ReturnBottomBar from "../components/ReturnBottomBar";
import OrderMoreDetails from "../components/Sidebar/OrderMoreDetails";
import OrderReturnReason from "../components/Sidebar/OrderReturnReason";
import OrderShortDetails from "../components/Sidebar/OrderShortDetails";

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
  const [isReceivedReturnProducts, setIsReceivedReturnProducts] =
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
  const [listOrderReturnReason, setListOrderReturnReason] = useState<
    OrderReturnReasonModel[]
  >([]);
  const [discountValue, setDisCountValue] = useState<number>(0);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [isVisibleModalWarning, setIsVisibleModalWarning] =
    useState<boolean>(false);
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
      if (_data.discounts) {
        let totalDiscount = 0;
        _data.discounts.forEach((single) => {
          if (single.amount) {
            totalDiscount += single.amount;
          }
        });
        setDisCountValue(totalDiscount);
      }
    }
  }, []);

  const handleListExchangeProducts = (
    listExchangeProducts: OrderLineItemRequest[]
  ) => {
    setListExchangeProducts(listExchangeProducts);
  };

  const onReturn = () => {
    form.validateFields().then(() => {
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
          reason_id: form.getFieldValue("reason_id"),
          received: isReceivedReturnProducts,
        };
        dispatch(
          actionCreateOrderReturn(orderDetailFormatted, (response) => {
            console.log("response", response);
          })
        );
      }
    });
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
        received: isReceivedReturnProducts,
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
                  discountValue={discountValue}
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
                    setShipmentMethod={setShipmentMethod}
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
                  isReceivedReturnProducts={isReceivedReturnProducts}
                  handleReceivedReturnProducts={() =>
                    setIsReceivedReturnProducts(true)
                  }
                />
              </Col>

              <Col md={6}>
                <OrderShortDetails OrderDetail={OrderDetail} />
                <OrderReturnReason
                  listOrderReturnReason={listOrderReturnReason}
                />
                <OrderMoreDetails OrderDetail={OrderDetail} />
              </Col>
            </Row>
          </Form>
        </div>
        <ReturnBottomBar
          onReturn={() => {
            form.validateFields().then(() => {
              if (isReceivedReturnProducts) {
                onReturn();
              } else {
                setIsVisibleModalWarning(true);
              }
            });
          }}
          onReturnAndExchange={() => onReturnAndExchange()}
          onCancel={() => handleCancel()}
          isCanReturn={isCanReturn}
          isCanExchange={isCanExchange}
          isExchange={isExchange}
          isStepExchange={isStepExchange}
          handleIsStepExchange={setIsStepExchange}
        />
        <ModalConfirm
          onCancel={() => {
            setIsVisibleModalWarning(false);
          }}
          onOk={() => {
            onReturn();
            setIsVisibleModalWarning(false);
          }}
          okText="Đồng ý"
          cancelText="Hủy"
          title={`Đơn trả hàng chưa nhận hàng trả lại, bạn có muốn tiếp tục đổi hàng không?`}
          subTitle=""
          visible={isVisibleModalWarning}
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

  useEffect(() => {
    dispatch(
      actionGetOrderReturnReasons((response) => {
        setListOrderReturnReason(response);
      })
    );
  }, [dispatch]);

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
