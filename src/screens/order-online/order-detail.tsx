import { Button, Card, Col, Collapse, Divider, Row, Space, Tag } from "antd";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { OrderDetailAction } from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderSettingsModel } from "model/other/order/order-model";
import { OrderPaymentRequest } from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  checkPaymentAll,
  checkPaymentStatusToShow,
  formatCurrency,
  getAmountPayment,
  SumCOD,
} from "utils/AppUtils";
import { FulFillmentStatus, OrderStatus } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import ActionHistory from "./component/order-detail/ActionHistory";
import OrderDetailBottomBar from "./component/order-detail/BottomBar";
import UpdateCustomerCard from "./component/update-customer-card";
import UpdatePaymentCard from "./component/update-payment-card";
import UpdateProductCard from "./component/update-product-card";
import UpdateShipmentCard from "./component/update-shipment-card";
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
  if (!id && props.id && isCloneOrder) {
    id = props.id;
  }
  let OrderId = parseInt(id);
  const isFirstLoad = useRef(true);

  const dispatch = useDispatch();
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);

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
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [officeTime, setOfficeTime] = useState<boolean>(false);

  const onPaymentSelect = (paymentType: number) => {
    if (paymentType === 1) {
      setVisibleShipping(true);
    }
    setPaymentType(paymentType);
  };

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
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

  let stepsStatusValue = stepsStatus();

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
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
    }
  }, []);

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
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
    };
  }, [scroll]);

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
        <CreateBillStep status={stepsStatusValue} orderDetail={OrderDetail} />
      }
    >
      <div className="orders">
        <Row gutter={24} style={{ marginBottom: "70px" }}>
          <Col md={18}>
            {/*--- customer ---*/}
            <UpdateCustomerCard
              OrderDetail={OrderDetail}
              customerDetail={customerDetail}
            />
            {/*--- end customer ---*/}

            {/*--- product ---*/}
            <UpdateProductCard
              OrderDetail={OrderDetail}
              shippingFeeInformedCustomer={shippingFeeInformedCustomer}
              customerNeedToPayValue={customerNeedToPayValue}
            />
            {/*--- end product ---*/}

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
            {OrderDetail !== null && (
              <Card
                className="margin-top-20"
                title={
                  <Space>
                    <div className="d-flex">
                      <span className="title-card">THANH TOÁN</span>
                    </div>
                    {checkPaymentStatusToShow(OrderDetail) === -1 && (
                      <Tag className="orders-tag orders-tag-default">
                        Chưa thanh toán
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
                          OrderDetail?.fulfillments[0].status === "shipped" &&
                          formatCurrency(customerNeedToPayValue)) ||
                          formatCurrency(
                            getAmountPayment(OrderDetail.payments)
                          )}
                      </b>
                    </Col>
                    <Col span={12}>
                      <span className="text-field margin-right-40">
                        Còn phải trả:
                      </span>
                      <b style={{ color: "red" }}>
                        {OrderDetail?.fulfillments &&
                        OrderDetail?.fulfillments.length > 0 &&
                        OrderDetail?.fulfillments[0].shipment?.cod
                          ? 0
                          : formatCurrency(
                              customerNeedToPayValue -
                                (OrderDetail?.total_paid
                                  ? OrderDetail?.total_paid
                                  : 0)
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
                              .filter(
                                (payment) =>
                                  payment.payment_method !== "cod" &&
                                  payment.amount
                              )
                              .map((payment: any, index: number) => (
                                <Panel
                                  showArrow={false}
                                  className="orders-timeline-custom success-collapse"
                                  header={
                                    <div className="orderPaymentItem">
                                      <div className="orderPaymentItem__left">
                                        <div>
                                          <b>{payment.payment_method}</b>
                                          <span>{payment.reference}</span>
                                          {payment.payment_method_id === 5 && (
                                            <span style={{ marginLeft: 10 }}>
                                              {payment.amount / 1000} điểm
                                            </span>
                                          )}
                                        </div>
                                        <span className="amount">
                                          {formatCurrency(payment.amount)}
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
                        {isShowPaymentPartialPayment && OrderDetail !== null && (
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
                                Lựa chọn 1 hoặc nhiều phương thức thanh toán
                              </b>
                            }
                            key="100"
                          >
                            {isShowPaymentPartialPayment &&
                              OrderDetail !== null && (
                                <UpdatePaymentCard
                                  setSelectedPaymentMethod={onPaymentSelect}
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
                                    getAmountPayment(OrderDetail.payments) -
                                    (OrderDetail?.discounts &&
                                    OrderDetail?.discounts.length > 0 &&
                                    OrderDetail?.discounts[0].amount
                                      ? OrderDetail?.discounts[0].amount
                                      : 0)
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
                                        {OrderDetail.fulfillments[0].status !==
                                        "shipped" ? (
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
                                      {OrderDetail?.fulfillments[0].status ===
                                        "shipped" && (
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
                        <span className="title-card">THANH TOÁN</span>
                      </div>
                      {/* {checkPaymentStatusToShow(OrderDetail) === -1 && (
                        <Tag className="orders-tag orders-tag-default">
                          Chưa thanh toán
                        </Tag>
                      )}
                      {checkPaymentStatusToShow(OrderDetail) === 0 && (
                        <Tag className="orders-tag orders-tag-warning">
                          Thanh toán 1 phần
                        </Tag>
                      )} */}
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
                        <b style={{ color: "red" }}>
                          0
                          {/* {OrderDetail && OrderDetail?.fulfillments && OrderDetail.fulfillments[0].shipment?.cod !== 0
                            ? formatCurrency(
                                OrderDetail.fulfillments[0].shipment?.cod
                              )
                            : 0} */}
                        </b>
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
                              style={{ marginLeft: "200px", color: "#222222" }}
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
                />
              )}

            {/*--- end payment ---*/}
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
                {/* <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Thời gian:</Col>
                  <Col span={15}>
                    <span style={{ fontWeight: 500, color: "#222222" }}>
                      {moment(OrderDetail?.created_date).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </span>
                  </Col>
                </Row> */}
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
              subStatus={OrderDetail?.sub_status}
              status={OrderDetail?.status}
              orderId={OrderId}
              fulfillments={OrderDetail?.fulfillments}
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
            <ActionHistory orderId={id} />
          </Col>
        </Row>
        <OrderDetailBottomBar
          isVisibleGroupButtons={false}
          stepsStatusValue={stepsStatusValue}
        />
      </div>
    </ContentContainer>
  );
};

export default OrderDetail;
