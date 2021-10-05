import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Modal,
  Row,
  Space,
  Tag,
} from "antd";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import {
  getLoyaltyPoint,
  getLoyaltyUsage,
} from "domain/actions/loyalty/loyalty.action";
import { actionSetIsReceivedOrderReturn } from "domain/actions/order/order-return.action";
import {
  cancelOrderRequest,
  OrderDetailAction,
  PaymentMethodGetList,
  UpdatePaymentAction,
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderSettingsModel } from "model/other/order/order-model";
import {
  OrderPaymentRequest,
  UpdateOrderPaymentRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import {
  checkPaymentAll,
  checkPaymentStatusToShow,
  formatCurrency,
  getAmountPayment,
  SumCOD,
} from "utils/AppUtils";
import {
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
} from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import ActionHistory from "./component/order-detail/ActionHistory";
import OrderDetailBottomBar from "./component/order-detail/BottomBar";
import CardReturnMoney from "./component/order-detail/CardReturnMoney";
import UpdateCustomerCard from "./component/update-customer-card";
import UpdatePaymentCard from "./component/update-payment-card";
import UpdateProductCard from "./component/update-product-card";
import UpdateShipmentCard from "./component/update-shipment-card";
import CardReturnReceiveProducts from "./order-return/components/CardReturnReceiveProducts";
import CardShowReturnProducts from "./order-return/components/CardShowReturnProducts";
const { Panel } = Collapse;

type PropType = {
  id?: string;
  isCloneOrder?: boolean;
};
type OrderParam = {
  id: string;
};

const OrderDetail = (props: PropType) => {
  const { isCloneOrder } = props;
  let { id } = useParams<OrderParam>();
  const history = useHistory();
  if (!id && props.id && isCloneOrder) {
    id = props.id;
  }
  let OrderId = parseInt(id);
  const isFirstLoad = useRef(true);

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  // const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  // const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);

  const [paymentType, setPaymentType] = useState<number>(3);
  const [isVisibleUpdatePayment, setVisibleUpdatePayment] = useState(false);

  const [shipmentMethod, setShipmentMethod] = useState<number>(4);
  const [isVisibleShipping, setVisibleShipping] = useState(false);

  const [isError, setError] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [OrderDetailAllFullfilment, setOrderDetailAllFullfilment] =
    useState<OrderResponse | null>(null);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(
    null
  );
  const [shippingFeeInformedCustomer, setShippingFeeInformedCustomer] =
    useState<number>(0);
  // const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [listPaymentMethods, setListPaymentMethods] = useState<
    Array<PaymentMethodResponse>
  >([]);

  // đổi hàng
  const [totalAmountReturnProducts, setTotalAmountReturnProducts] =
    useState<number>(0);
  console.log("totalAmountReturnProducts", totalAmountReturnProducts);
  const [isReceivedReturnProducts, setIsReceivedReturnProducts] =
    useState(false);

  //loyalty
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<
    Array<LoyaltyUsageResponse>
  >([]);

  const onPaymentSelect = (paymentType: number) => {
    if (paymentType === 1) {
      setVisibleShipping(true);
    }
    setPaymentType(paymentType);
  };

  // const CreateFulFillmentRequest = () => {
  //   let request: UpdateFulFillmentRequest = {
  //     id: null,
  //     order_id: null,
  //     store_id: OrderDetail?.store_id,
  //     account_code: OrderDetail?.account_code,
  //     assignee_code: OrderDetail?.assignee_code,
  //     delivery_type: "",
  //     stock_location_id: null,
  //     payment_status: "",
  //     total: null,
  //     total_tax: null,
  //     total_discount: null,
  //     total_quantity: null,
  //     discount_rate: null,
  //     discount_value: null,
  //     discount_amount: null,
  //     total_line_amount_after_line_discount: null,
  //     shipment: null,
  //     items: OrderDetail?.items,
  //     shipping_fee_informed_to_customer: null,
  //   };
  //   let listFullfillmentRequest = [];
  //   listFullfillmentRequest.push(request);
  //   return listFullfillmentRequest;
  // };

  const onUpdateSuccess = useCallback((value: OrderResponse) => {
    showSuccess("Thanh toán thành công!");
    window.location.reload();
  }, []);

  const handleReturnMoney = () => {
    form.validateFields().then(() => {
      let fulfillment = OrderDetail?.fulfillments;
      let formValue = form.getFieldsValue();
      let payments: UpdateOrderPaymentRequest[] = [];
      const formReturnMoney = formValue.returnMoneyField[0];
      let returnMoneyMethod = listPaymentMethods.find((single) => {
        return single.id === formReturnMoney.returnMoneyMethod;
      });
      if (returnMoneyMethod) {
        payments = [
          {
            payment_method_id: returnMoneyMethod.id,
            payment_method: returnMoneyMethod.name,
            amount: -Math.abs(
              customerNeedToPayValue -
                (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
            ),
            reference: "",
            source: "",
            paid_amount: -Math.abs(
              customerNeedToPayValue -
                (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
            ),
            return_amount: 0.0,
            status: "paid",
            type: "",
            note: formReturnMoney.returnMoneyNote || "",
            code: "",
            order_id: OrderDetail?.id ? OrderDetail?.id : null,
            customer_id: customerDetail?.id || null,
          },
        ];
      }

      let request = {
        payments: payments,
        fulfillments: fulfillment,
      };
      console.log("request", request);
      if (OrderDetail?.id) {
        dispatch(
          UpdatePaymentAction(request, OrderDetail?.id, onUpdateSuccess)
        );
      }
    });
  };

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    // setPayments(value);
  };
  const changeShippingFeeInformedCustomer = (value: number | null) => {
    if (value !== null) {
      setShippingFeeInformedCustomer(value);
    }
  };
  const [isShowPaymentPartialPayment, setShowPaymentPartialPayment] =
    useState(false);

  const stepsStatus = () => {
    if (OrderDetail?.status === OrderStatus.DRAFT) {
      return OrderStatus.DRAFT;
    }

    if (OrderDetail?.status === OrderStatus.CANCELLED) {
      return OrderStatus.CANCELLED;
    }
    if (OrderDetail?.status === OrderStatus.FINISHED) {
      return FulFillmentStatus.SHIPPED;
    }
    if (OrderDetail?.status === OrderStatus.FINALIZED) {
      if (
        OrderDetail.fulfillments === undefined ||
        OrderDetail.fulfillments === null
      ) {
        return OrderStatus.FINALIZED;
      } else {
        if (
          OrderDetail.fulfillments !== undefined &&
          OrderDetail.fulfillments !== null &&
          OrderDetail.fulfillments.length > 0
        ) {
          if (
            OrderDetail?.fulfillments[0].status === FulFillmentStatus.UNSHIPPED
          ) {
            return OrderStatus.FINALIZED;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.PICKED) {
            return FulFillmentStatus.PICKED;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.PACKED) {
            return FulFillmentStatus.PACKED;
          }
          if (
            OrderDetail.fulfillments[0].status === FulFillmentStatus.SHIPPING
          ) {
            return FulFillmentStatus.SHIPPING;
          }
          if (
            OrderDetail.fulfillments[0].status === FulFillmentStatus.SHIPPED
          ) {
            return FulFillmentStatus.SHIPPED;
          }
        }
      }
    } else if (OrderDetail?.status === OrderStatus.FINISHED) {
      return FulFillmentStatus.SHIPPED;
    }
    return "";
  };

  const [orderSettings, setOrderSettings] = useState<OrderSettingsModel>({
    chonCuaHangTruocMoiChonSanPham: false,
    cauHinhInNhieuLienHoaDon: 1,
  });

  const handleReceivedReturnProducts = () => {
    setIsReceivedReturnProducts(true);
    if (OrderDetail?.order_return_origin?.id) {
      dispatch(
        actionSetIsReceivedOrderReturn(
          OrderDetail?.order_return_origin?.id,
          () => {
            dispatch(OrderDetailAction(OrderId, onGetDetailSuccess));
          }
        )
      );
    }
  };

  let stepsStatusValue = stepsStatus();

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      // setAccounts(data.items);
    },
    []
  );
  const onGetDetailSuccess = useCallback((data: false | OrderResponse) => {
    setLoadingData(false);
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
      setOrderDetailAllFullfilment(data);
      setIsReceivedReturnProducts(
        _data.order_return_origin?.received ? true : false
      );
    }
  }, []);

  const handleChangeSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };

  const handleCancelOrder = useCallback(
    (id: any) => {
      dispatch(cancelOrderRequest(id));
    },
    [dispatch]
  );

  const cancelModal = useCallback(
    (type) => {
      console.log("OrderDetail", OrderDetail);
      switch (type) {
        case 1:
          Modal.confirm({
            title: `Xác nhận huỷ đơn hàng`,
            content: (
              <div>
                <p>
                  Bạn chắc chắn muốn huỷ đơn hàng <b>{OrderDetail?.code}</b>?
                  Thao tác này không thể khôi phục và tác động:
                </p>
                <p>- Thay đổi thông số kho các sản phẩm trong đơn hàng</p>
                <p>
                  - Huỷ các chứng từ liên quan: vận đơn, phiếu thu thanh toán
                  đơn hàng, phiếu thu đặt cọc shipper
                </p>
                <p>- Cập nhật công nợ khách hàng, công nợ đối tác vận chuyển</p>
                <p>- Cập nhật lịch sử khuyến mãi, lịch sử tích điểm</p>
              </div>
            ),
            maskClosable: true,
            width: "600px",
            onOk: () => handleCancelOrder(OrderDetail?.id),
            onCancel: () => console.log("cancel"),
            okText: "Xác nhận",
            cancelText: "Huỷ",
          });
          break;
        case 2:
          Modal.confirm({
            title: `Xác nhận huỷ đơn hàng`,
            content: (
              <div>
                <p>
                  Bạn chắc chắn muốn huỷ đơn hàng <b>{OrderDetail?.code}</b>?
                </p>
              </div>
            ),
            maskClosable: true,
            width: "600px",
            onOk: () => handleCancelOrder(OrderDetail?.id),
            onCancel: () => console.log("cancel"),
            okText: "Xác nhận",
            cancelText: "Huỷ",
          });
          break;
        default:
          break;
      }
      // setTimeout(() => {
      //   window.location.reload();
      // }, 500);
    },
    [OrderDetail, handleCancelOrder]
  );

  const orderActionsClick = useCallback(
    (type) => {
      switch (type) {
        case "cancel":
          if (
            OrderDetail?.fulfillments &&
            OrderDetail?.fulfillments[0]?.export_on
          ) {
            cancelModal(1);
          } else {
            cancelModal(2);
          }

          break;
        case "update":
          history.push(`${UrlConfig.ORDER}/${id}/update`);
          break;
        case "clone":
          history.push(`${UrlConfig.ORDER}/create?action=clone&cloneId=${id}`);
          break;
        default:
          break;
      }
    },
    [OrderDetail?.fulfillments, cancelModal, history, id]
  );

  useEffect(() => {
    if (isFirstLoad.current) {
      if (!Number.isNaN(OrderId)) {
        dispatch(OrderDetailAction(OrderId, onGetDetailSuccess));
      } else {
        setError(true);
      }
    }
    isFirstLoad.current = false;
  }, [dispatch, OrderId, onGetDetailSuccess]);

  useLayoutEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(CustomerDetail(OrderDetail?.customer_id, setCustomerDetail));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    if (customerDetail != null) {
      dispatch(getLoyaltyPoint(customerDetail.id, setLoyaltyPoint));
    } else {
      setLoyaltyPoint(null);
    }
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch, customerDetail]);

  useEffect(() => {
    if (OrderDetail?.store_id != null) {
      dispatch(StoreDetailAction(OrderDetail?.store_id, setStoreDetail));
    }
  }, [dispatch, OrderDetail?.store_id]);

  useEffect(() => {
    setOrderSettings({
      chonCuaHangTruocMoiChonSanPham: true,
      cauHinhInNhieuLienHoaDon: 3,
    });
  }, []);

  // khách cần trả
  const customerNeedToPay: any = () => {
    if (
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer
    ) {
      return (
        OrderDetail?.fulfillments[0].shipment
          .shipping_fee_informed_to_customer +
        OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (OrderDetail?.discounts &&
        OrderDetail?.discounts.length > 0 &&
        OrderDetail?.discounts[0].amount
          ? OrderDetail?.discounts[0].amount
          : 0)
      );
    } else if (OrderDetail?.total_line_amount_after_line_discount) {
      return (
        OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (OrderDetail?.discounts &&
        OrderDetail?.discounts.length > 0 &&
        OrderDetail?.discounts[0].amount
          ? OrderDetail?.discounts[0].amount
          : 0)
      );
    }
  };

  const customerNeedToPayValue = customerNeedToPay();
  // end
  const scroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      // setIsShowBillStep(true);
    } else {
      // setIsShowBillStep(false);
    }
  }, []);

  const initialFormValue = {
    returnMoneyField: [
      { returnMoneyMethod: undefined, returnMoneyNote: undefined },
    ],
  };

  useEffect(() => {
    window.addEventListener("scroll", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
    };
  }, [scroll]);

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

  return (
    <ContentContainer
      isLoading={loadingData}
      isError={isError}
      title="Đơn hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: `${UrlConfig.HOME}`,
        },
        {
          name: "Đơn hàng",
        },
        {
          name: !isCloneOrder ? `Đơn hàng ${id}` : `Sao chép Đơn hàng ${id}`,
        },
      ]}
      extra={
        <CreateBillStep
          status={stepsStatusValue}
          orderDetail={OrderDetailAllFullfilment}
        />
      }
    >
      <div className="orders">
        <Form layout="vertical" initialValues={initialFormValue} form={form}>
          <Row gutter={24} style={{ marginBottom: "70px" }}>
            <Col md={18}>
              {/*--- customer ---*/}
              <UpdateCustomerCard
                OrderDetail={OrderDetail}
                customerDetail={customerDetail}
                loyaltyPoint={loyaltyPoint}
                loyaltyUsageRules={loyaltyUsageRules}
              />
              {/*--- end customer ---*/}

              {OrderDetail?.order_return_origin?.items && (
                <CardShowReturnProducts
                  listReturnProducts={OrderDetail?.order_return_origin?.items}
                  setTotalAmountReturnProducts={setTotalAmountReturnProducts}
                  pointUsing={OrderDetail.order_return_origin.point_refund}
                />
              )}

              {/*--- product ---*/}
              <UpdateProductCard
                OrderDetail={OrderDetail}
                shippingFeeInformedCustomer={shippingFeeInformedCustomer}
                customerNeedToPayValue={customerNeedToPayValue}
                totalAmountReturnProducts={totalAmountReturnProducts}
              />
              {/*--- end product ---*/}

              {OrderDetail?.order_return_origin?.items &&
                customerNeedToPayValue -
                  (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) <
                  0 && (
                  <CardReturnMoney
                    listPaymentMethods={listPaymentMethods}
                    payments={[]}
                    returnMoneyAmount={Math.abs(
                      customerNeedToPayValue -
                        (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
                    )}
                    isShowPaymentMethod={true}
                    setIsShowPaymentMethod={() => {}}
                    handleReturnMoney={handleReturnMoney}
                  />
                )}

              {/*--- shipment ---*/}
              <UpdateShipmentCard
                shippingFeeInformedCustomer={changeShippingFeeInformedCustomer}
                setVisibleUpdatePayment={setVisibleUpdatePayment}
                setShipmentMethod={setShipmentMethod}
                setPaymentType={setPaymentType}
                setOfficeTime={setOfficeTime}
                setVisibleShipping={setVisibleShipping}
                OrderDetail={OrderDetail}
                customerDetail={customerDetail}
                storeDetail={storeDetail}
                stepsStatusValue={stepsStatusValue}
                totalPaid={totalPaid}
                officeTime={officeTime}
                shipmentMethod={shipmentMethod}
                isVisibleShipping={isVisibleShipping}
                paymentType={paymentType}
                OrderDetailAllFullfilment={OrderDetailAllFullfilment}
                orderSettings={orderSettings}
              />
              {/*--- end shipment ---*/}

              {/*--- payment ---*/}
              {OrderDetail !== null &&
                OrderDetail?.payments &&
                OrderDetail?.payments?.length > 0 && (
                  <Card
                    className="margin-top-20"
                    title={
                      <Space>
                        <div className="d-flex">
                          <span className="title-card">THANH TOÁN</span>
                        </div>
                        {checkPaymentStatusToShow(OrderDetail) === -1 && (
                          <Tag className="orders-tag orders-tag-default">
                            Chưa thanh toán 2
                          </Tag>
                        )}
                        {checkPaymentStatusToShow(OrderDetail) === 0 && (
                          <Tag className="orders-tag orders-tag-warning">
                            Thanh toán 1 phần
                          </Tag>
                        )}
                        {checkPaymentStatusToShow(OrderDetail) === 1 && (
                          <Tag
                            className="orders-tag orders-tag-success"
                            style={{
                              backgroundColor: "rgba(39, 174, 96, 0.1)",
                              color: "#27AE60",
                            }}
                          >
                            Đã thanh toán
                          </Tag>
                        )}
                      </Space>
                    }
                  >
                    <div className="padding-24">
                      <Row>
                        <Col span={12}>
                          <span className="text-field margin-right-40">
                            Đã thanh toán:
                          </span>
                          <b>
                            {(OrderDetail?.fulfillments &&
                              OrderDetail?.fulfillments.length > 0 &&
                              OrderDetail?.fulfillments[0].status ===
                                "shipped" &&
                              formatCurrency(customerNeedToPayValue)) ||
                              formatCurrency(
                                getAmountPayment(OrderDetail.payments)
                              )}
                          </b>
                        </Col>
                        <Col span={12}>
                          <span className="text-field margin-right-40">
                            {customerNeedToPayValue -
                              (OrderDetail?.total_paid
                                ? OrderDetail?.total_paid
                                : 0) >
                            0
                              ? `Còn phải trả:`
                              : `Hoàn tiền cho khách:`}
                          </span>
                          <b style={{ color: "red" }}>
                            {OrderDetail?.fulfillments &&
                            OrderDetail?.fulfillments.length > 0 &&
                            OrderDetail?.fulfillments[0].shipment?.cod
                              ? 0
                              : formatCurrency(
                                  Math.abs(
                                    customerNeedToPayValue -
                                      (OrderDetail?.total_paid
                                        ? OrderDetail?.total_paid
                                        : 0)
                                  )
                                )}
                          </b>
                        </Col>
                      </Row>
                    </div>

                    {OrderDetail?.payments && (
                      <div>
                        <div style={{ padding: "0 24px 24px 24px" }}>
                          <Collapse
                            className="orders-timeline"
                            defaultActiveKey={["100"]}
                            ghost
                          >
                            {OrderDetail.total === SumCOD(OrderDetail) &&
                            OrderDetail.total === OrderDetail.total_paid ? (
                              ""
                            ) : (
                              <>
                                {OrderDetail?.payments
                                  .filter((payment) => {
                                    // nếu là đơn trả thì tính cả cod
                                    if (OrderDetail.order_return_origin) {
                                      return true;
                                    }
                                    return (
                                      payment.payment_method !== "cod" &&
                                      payment.amount
                                    );
                                  })
                                  .map((payment: any, index: number) => (
                                    <Panel
                                      showArrow={false}
                                      className="orders-timeline-custom success-collapse"
                                      header={
                                        <div className="orderPaymentItem">
                                          <div className="orderPaymentItem__left">
                                            <div>
                                              {/* <b>{payment.payment_method}</b> */}
                                              {/* trường hợp số tiền âm là hoàn lại tiền */}
                                              <b>
                                                {payment.paid_amount < 0
                                                  ? "Hoàn tiền cho khách"
                                                  : payment.payment_method}
                                              </b>
                                              <span>{payment.reference}</span>
                                              {payment.payment_method_id ===
                                                5 && (
                                                <span
                                                  style={{ marginLeft: 10 }}
                                                >
                                                  {payment.amount / 1000} điểm
                                                </span>
                                              )}
                                            </div>
                                            <span className="amount">
                                              {formatCurrency(
                                                Math.abs(payment.paid_amount)
                                              )}
                                            </span>
                                          </div>
                                          <div className="orderPaymentItem__right">
                                            <span className="date">
                                              {ConvertUtcToLocalDate(
                                                payment.created_date,
                                                "DD/MM/YYYY HH:mm"
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      }
                                      key={index}
                                    ></Panel>
                                  ))}
                              </>
                            )}
                            {isShowPaymentPartialPayment &&
                              OrderDetail !== null && (
                                <Panel
                                  className="orders-timeline-custom orders-dot-status"
                                  showArrow={false}
                                  header={
                                    <b
                                      style={{
                                        paddingLeft: "14px",
                                        color: "#222222",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      Lựa chọn 1 hoặc nhiều phương thức thanh
                                      toán
                                    </b>
                                  }
                                  key="100"
                                >
                                  {isShowPaymentPartialPayment &&
                                    OrderDetail !== null && (
                                      <UpdatePaymentCard
                                        setSelectedPaymentMethod={
                                          onPaymentSelect
                                        }
                                        setVisibleUpdatePayment={
                                          setVisibleUpdatePayment
                                        }
                                        setPayments={onPayments}
                                        setTotalPaid={setTotalPaid}
                                        orderDetail={OrderDetail}
                                        paymentMethod={paymentType}
                                        shipmentMethod={shipmentMethod}
                                        order_id={OrderDetail.id}
                                        showPartialPayment={true}
                                        isVisibleUpdatePayment={
                                          isVisibleUpdatePayment
                                        }
                                        amount={
                                          OrderDetail.total_line_amount_after_line_discount -
                                          getAmountPayment(
                                            OrderDetail.payments
                                          ) -
                                          (OrderDetail?.discounts &&
                                          OrderDetail?.discounts.length > 0 &&
                                          OrderDetail?.discounts[0].amount
                                            ? OrderDetail?.discounts[0].amount
                                            : 0)
                                        }
                                        disabled={
                                          stepsStatusValue ===
                                            OrderStatus.CANCELLED ||
                                          stepsStatusValue ===
                                            FulFillmentStatus.SHIPPED
                                        }
                                      />
                                    )}
                                </Panel>
                              )}
                            {OrderDetail?.fulfillments &&
                              OrderDetail?.fulfillments.length > 0 &&
                              OrderDetail?.fulfillments[0].shipment &&
                              OrderDetail?.fulfillments[0].shipment.cod && (
                                <Panel
                                  className={
                                    OrderDetail?.fulfillments[0].status !==
                                    "shipped"
                                      ? "orders-timeline-custom orders-dot-status"
                                      : "orders-timeline-custom "
                                  }
                                  showArrow={false}
                                  header={
                                    <>
                                      <div className="orderPaymentItem">
                                        <div className="orderPaymentItem__left">
                                          <b>
                                            COD
                                            {OrderDetail.fulfillments[0]
                                              .status !== "shipped" ? (
                                              <Tag
                                                className="orders-tag orders-tag-warning"
                                                style={{ marginLeft: 10 }}
                                              >
                                                Đang chờ thu
                                              </Tag>
                                            ) : (
                                              <Tag
                                                className="orders-tag orders-tag-success"
                                                style={{
                                                  backgroundColor:
                                                    "rgba(39, 174, 96, 0.1)",
                                                  color: "#27AE60",
                                                  marginLeft: 10,
                                                }}
                                              >
                                                Đã thu COD
                                              </Tag>
                                            )}
                                          </b>
                                          <span className="amount">
                                            {OrderDetail !== null &&
                                            OrderDetail?.fulfillments
                                              ? formatCurrency(
                                                  OrderDetail.fulfillments[0]
                                                    .shipment?.cod
                                                )
                                              : 0}
                                          </span>
                                        </div>
                                        <div className="orderPaymentItem__right">
                                          {OrderDetail?.fulfillments[0]
                                            .status === "shipped" && (
                                            <div>
                                              <span className="date">
                                                {ConvertUtcToLocalDate(
                                                  OrderDetail?.updated_date,
                                                  "DD/MM/YYYY HH:mm"
                                                )}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  }
                                  key="100"
                                ></Panel>
                              )}
                          </Collapse>
                        </div>{" "}
                      </div>
                    )}

                    {(OrderDetail?.fulfillments &&
                      OrderDetail?.fulfillments.length > 0 &&
                      OrderDetail?.fulfillments[0].shipment &&
                      OrderDetail?.fulfillments[0].shipment.cod !== null) ||
                      (checkPaymentAll(OrderDetail) !== 1 &&
                        isShowPaymentPartialPayment === false &&
                        checkPaymentStatusToShow(OrderDetail) !== 1 && (
                          <div
                            className="padding-24 text-right"
                            style={{ paddingTop: 0 }}
                          >
                            <Divider style={{ margin: "10px 0" }} />
                            <Button
                              type="primary"
                              className="ant-btn-outline fixed-button"
                              onClick={() => setShowPaymentPartialPayment(true)}
                              style={{ marginTop: 10 }}
                              disabled={
                                stepsStatusValue === OrderStatus.CANCELLED ||
                                stepsStatusValue === FulFillmentStatus.SHIPPED
                              }
                            >
                              Thanh toán
                            </Button>
                          </div>
                        ))}
                  </Card>
                )}

              {/* COD toàn phần */}
              {OrderDetail &&
                OrderDetail.fulfillments &&
                OrderDetail.fulfillments.length > 0 &&
                OrderDetail.fulfillments[0].shipment &&
                OrderDetail.fulfillments[0].shipment?.cod ===
                  (OrderDetail?.fulfillments[0].shipment
                    .shipping_fee_informed_to_customer
                    ? OrderDetail?.fulfillments[0].shipment
                        .shipping_fee_informed_to_customer
                    : 0) +
                    OrderDetail?.total_line_amount_after_line_discount -
                    (OrderDetail?.discounts &&
                    OrderDetail?.discounts.length > 0 &&
                    OrderDetail?.discounts[0].amount
                      ? OrderDetail?.discounts[0].amount
                      : 0) &&
                checkPaymentStatusToShow(OrderDetail) !== 1 && (
                  <Card
                    className="margin-top-20"
                    title={
                      <Space>
                        <div className="d-flex">
                          <span className="title-card">THANH TOÁN 2</span>
                        </div>
                        {checkPaymentStatusToShow(OrderDetail) === 1 && (
                          <Tag
                            className="orders-tag orders-tag-success"
                            style={{
                              backgroundColor: "rgba(39, 174, 96, 0.1)",
                              color: "#27AE60",
                            }}
                          >
                            Đã thanh toán
                          </Tag>
                        )}
                      </Space>
                    }
                  >
                    <div className="padding-24">
                      <Row>
                        <Col span={12}>
                          <span className="text-field margin-right-40">
                            Đã thanh toán:
                          </span>
                          <b>0</b>
                        </Col>
                        <Col span={12}>
                          <span className="text-field margin-right-40">
                            Còn phải trả:
                          </span>
                          <b style={{ color: "red" }}>0</b>
                        </Col>
                      </Row>
                    </div>
                    <Divider style={{ margin: "0px" }} />
                    <div className="padding-24">
                      <Collapse
                        className="orders-timeline"
                        defaultActiveKey={["1"]}
                        ghost
                      >
                        <Panel
                          className={
                            OrderDetail?.fulfillments[0].status !== "shipped"
                              ? "orders-timeline-custom orders-dot-status orders-dot-fullCod-status"
                              : "orders-timeline-custom orders-dot-fullCod-status"
                          }
                          showArrow={false}
                          header={
                            <div
                              style={{
                                color: "#222222",
                                paddingTop: 4,
                                fontWeight: 500,
                              }}
                            >
                              COD
                              <Tag
                                className="orders-tag orders-tag-warning"
                                style={{ marginLeft: 10 }}
                              >
                                Đang chờ thu
                              </Tag>
                              <b
                                style={{
                                  marginLeft: "200px",
                                  color: "#222222",
                                }}
                              >
                                {OrderDetail.fulfillments
                                  ? formatCurrency(
                                      OrderDetail.fulfillments[0].shipment?.cod
                                    )
                                  : 0}
                              </b>
                            </div>
                          }
                          key="1"
                        >
                          <Row gutter={24}>
                            {OrderDetail?.payments &&
                              OrderDetail?.payments.map((item, index) => (
                                <Col span={12} key={item.id}>
                                  <p className="text-field">
                                    {item.payment_method}
                                  </p>
                                  <p>{formatCurrency(item.paid_amount)}</p>
                                </Col>
                              ))}
                          </Row>
                        </Panel>
                      </Collapse>
                    </div>

                    <div className="padding-24 text-right">
                      {OrderDetail?.payments !== null
                        ? OrderDetail?.payments.map(
                            (item, index) =>
                              OrderDetail.total !== null &&
                              OrderDetail.total - item.paid_amount !== 0 && (
                                <Button
                                  key={index}
                                  type="primary"
                                  className="ant-btn-outline fixed-button"
                                >
                                  Thanh toán
                                </Button>
                              )
                          )
                        : "Chưa thanh toán"}
                    </div>
                  </Card>
                )}

              {/* Chưa thanh toán đơn nháp*/}
              {OrderDetail &&
                OrderDetail.payments?.length === 0 &&
                (OrderDetail.fulfillments?.length === 0 ||
                  (OrderDetail?.fulfillments &&
                    OrderDetail.fulfillments[0].shipment === null)) && (
                  <UpdatePaymentCard
                    setSelectedPaymentMethod={onPaymentSelect}
                    setPayments={onPayments}
                    paymentMethod={paymentType}
                    shipmentMethod={shipmentMethod}
                    amount={OrderDetail.total + shippingFeeInformedCustomer}
                    order_id={OrderDetail.id}
                    orderDetail={OrderDetail}
                    showPartialPayment={false}
                    setTotalPaid={setTotalPaid}
                    isVisibleUpdatePayment={isVisibleUpdatePayment}
                    setVisibleUpdatePayment={setVisibleUpdatePayment}
                    disabled={
                      stepsStatusValue === OrderStatus.CANCELLED ||
                      stepsStatusValue === FulFillmentStatus.SHIPPED
                    }
                  />
                )}

              {/*--- end payment ---*/}

              {OrderDetail?.order_return_origin?.items && (
                <CardReturnReceiveProducts
                  handleReceivedReturnProducts={handleReceivedReturnProducts}
                  isReceivedReturnProducts={isReceivedReturnProducts}
                  isDetailPage
                />
              )}
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
                    <Col span={11}>Cửa hàng:</Col>
                    <Col span={13}>
                      <span
                        style={{ fontWeight: 500, color: "#2A2A86" }}
                        className="text-focus"
                      >
                        {OrderDetail?.store}
                      </span>
                    </Col>
                  </Row>
                  <Row className="margin-top-10" gutter={5}>
                    <Col span={11}>Điện thoại:</Col>
                    <Col span={13}>
                      <span style={{ fontWeight: 500, color: "#222222" }}>
                        {OrderDetail?.customer_phone_number}
                      </span>
                    </Col>
                  </Row>
                  <Row className="margin-top-10" gutter={5}>
                    <Col span={11}>Địa chỉ:</Col>
                    <Col span={13}>
                      <span style={{ fontWeight: 500, color: "#222222" }}>
                        {OrderDetail?.shipping_address?.full_address}
                      </span>
                    </Col>
                  </Row>
                  <Row className="margin-top-10" gutter={5}>
                    <Col span={11}>Nhân viên bán hàng:</Col>
                    <Col span={13}>
                      <span
                        style={{ fontWeight: 500, color: "#222222" }}
                        className="text-focus"
                      >
                        {OrderDetail?.assignee}
                      </span>
                    </Col>
                  </Row>
                  <Row className="margin-top-10" gutter={5}>
                    <Col span={11}>Nhân viên marketing:</Col>
                    <Col span={13}>
                      <span
                        style={{ fontWeight: 500, color: "#222222" }}
                        className="text-focus"
                      >
                        {OrderDetail?.marketer}
                      </span>
                    </Col>
                  </Row>
                  <Row className="margin-top-10" gutter={5}>
                    <Col span={11}>Nhân viên điều phối:</Col>
                    <Col span={13}>
                      <span
                        style={{ fontWeight: 500, color: "#222222" }}
                        className="text-focus"
                      >
                        {OrderDetail?.coordinator}
                      </span>
                    </Col>
                  </Row>
                  <Row className="margin-top-10" gutter={5}>
                    <Col span={11}>Người tạo:</Col>
                    <Col span={13}>
                      <span
                        style={{ fontWeight: 500, color: "#222222" }}
                        className="text-focus"
                      >
                        {OrderDetail?.account}
                      </span>
                    </Col>
                  </Row>
                  <Row className="margin-top-10" gutter={5}>
                    <Col span={11}>Đường dẫn:</Col>
                    <Col span={13} style={{ wordWrap: "break-word" }}>
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
                orderId={OrderId}
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
                          ? OrderDetail?.tags.split(",").map((item, index) => (
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
              <ActionHistory
                orderId={id}
                countChangeSubStatus={countChangeSubStatus}
              />
            </Col>
          </Row>
          <OrderDetailBottomBar
            isVisibleGroupButtons={false}
            isVisibleActionsButtons={true}
            stepsStatusValue={stepsStatusValue}
            orderActionsClick={orderActionsClick}
            orderDetail={OrderDetailAllFullfilment}
          />
        </Form>
      </div>
    </ContentContainer>
  );
};

export default OrderDetail;
