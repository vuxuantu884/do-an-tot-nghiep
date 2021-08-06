//#region Import
import { Button, Card, Row, Col, Space, Divider, Tag, Collapse } from "antd";
import UpdatePaymentCard from "./component/update-payment-card";
import React, {
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
  useEffect,
} from "react";
import { useDispatch } from "react-redux";
import { OrderPaymentRequest } from "model/request/order.request";
import { AccountResponse } from "model/account/account.model";
import {
  AccountSearchAction,
} from "domain/actions/account/account.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderDetailAction } from "domain/actions/order/order.action";
import doubleArrow from "assets/icon/double_arrow.svg";
import { useParams } from "react-router-dom";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import {
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { CustomerResponse } from "model/response/customer/customer.response";
import moment from "moment";
import {
  checkPaymentAll,
  checkPaymentStatusToShow,
  formatCurrency,
  getAmountPayment,
  getDateLastPayment,
  SumCOD,
} from "utils/AppUtils";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { FulFillmentStatus, OrderStatus } from "utils/Constants";
import UrlConfig from "config/UrlConfig";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import UpdateProductCard from "./component/update-product-card";
import UpdateCustomerCard from "./component/update-customer-card";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UpdateShipmentCard from "./component/update-shipment-card";
const { Panel } = Collapse;
//#endregion

type OrderParam = {
  id: string;
};

const OrderDetail = () => {
  const { id } = useParams<OrderParam>();
  let OrderId = parseInt(id);
  const isFirstLoad = useRef(true);

  //#region state
  const dispatch = useDispatch();
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [paymentType, setPaymentType] = useState<number>(3);
  const [isVisibleShipping, setVisibleShipping] = useState(false);
  const [isError, setError] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(
    null
  );
  const [shippingFeeInformedCustomer, setShippingFeeInformedCustomer] =
    useState<number>(0);
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [isVisibleUpdatePayment, setVisibleUpdatePayment] = useState(false);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  //#endregion
  //#region Orther
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
    if (value) {
      setShippingFeeInformedCustomer(value);
    }
  };

  const [isShowPaymentPartialPayment, setShowPaymentPartialPayment] =
    useState(false);

  //#endregion
  //#region Master
  const stepsStatus = () => {
    if (OrderDetail?.status === OrderStatus.DRAFT) {
      return OrderStatus.DRAFT;
    }
    if(OrderDetail?.status === OrderStatus.FINISHED){
      return FulFillmentStatus.SHIPPED;;
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
          OrderDetail.fulfillments !== null
        ) {
          if (
            OrderDetail.fulfillments[0].status === FulFillmentStatus.UNSHIPPED
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
    }
  };

  // tag status
  let stepsStatusValue = stepsStatus();
  //#region Product
  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );

  //#endregion
  const onGetDetailSuccess = useCallback((data: false | OrderResponse) => {
    setLoadingData(false);
    if (!data) {
      setError(true);
    } else {
      setOrderDetail(data);
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

  //#endregion

  //#region Update Fulfillment Status
  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(CustomerDetail(OrderDetail.customer_id, setCustomerDetail));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    if (OrderDetail?.store_id != null) {
      dispatch(StoreDetailAction(OrderDetail?.store_id, setStoreDetail));
    }
  }, [dispatch, OrderDetail?.store_id]);
  //#endregion

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
          name: "Đơn hàng " + id,
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
              OrderDetail={OrderDetail}
              stepsStatusValue={stepsStatusValue}
              storeDetail={storeDetail}
              shippingFeeInformedCustomer={changeShippingFeeInformedCustomer}
              totalPaid={totalPaid}
              isVisibleUpdatePayment={setVisibleUpdatePayment}
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
                      <div className="d-flex" style={{ marginTop: "5px" }}>
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
                          OrderDetail?.fulfillments[0].status !== "shipped"
                            ? formatCurrency(
                                customerNeedToPayValue -
                                  (OrderDetail?.total_paid
                                    ? OrderDetail?.total_paid
                                    : 0)
                              )
                            : 0}
                        </b>
                      </Col>
                    </Row>
                  </div>

                  {OrderDetail?.payments && (
                    <div>
                      <div style={{ padding: "0 24px 24px 24px" }}>
                        <Collapse
                          className="orders-timeline"
                          expandIcon={({ isActive }) => (
                            <img
                              src={doubleArrow}
                              alt=""
                              style={{
                                transform: isActive
                                  ? "rotate(0deg)"
                                  : "rotate(270deg)",
                                float: "right",
                              }}
                            />
                          )}
                          ghost
                        >
                          {OrderDetail.total === SumCOD(OrderDetail) &&
                          OrderDetail.total === OrderDetail.total_paid ? (
                            ""
                          ) : (
                            <Panel
                              className="orders-timeline-custom success-collapse"
                              header={
                                <span style={{ color: "#222222" }}>
                                  <b>
                                    {OrderDetail?.payments &&
                                      OrderDetail?.payments
                                        .filter(
                                          (payment, index) =>
                                            payment.payment_method !== "cod" &&
                                            payment.amount
                                        )
                                        .map(
                                          (item, index) =>
                                            item.payment_method +
                                            (index ===
                                            (OrderDetail?.payments &&
                                            OrderDetail?.payments.length > 0
                                              ? OrderDetail?.payments.length
                                              : 0) -
                                              1
                                              ? ""
                                              : ", ")
                                        )}
                                  </b>
                                </span>
                              }
                              key="1"
                              extra={
                                <>
                                  {OrderDetail?.payments && (
                                    <div>
                                      <span
                                        className="fixed-time text-field"
                                        style={{ color: "#737373" }}
                                      >
                                        {ConvertUtcToLocalDate(
                                          getDateLastPayment(OrderDetail),
                                          "DD/MM/YYYY HH:mm"
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </>
                              }
                            >
                              <Row gutter={24}>
                                {OrderDetail?.payments &&
                                  OrderDetail?.payments
                                    .filter(
                                      (payment) =>
                                        payment.payment_method !== "cod" &&
                                        payment.amount
                                    )
                                    .map((item, index) => (
                                      <Col span={6} key={item.code}>
                                        <>
                                          <p
                                            style={{
                                              color: "#737373",
                                              marginBottom: 10,
                                            }}
                                          >
                                            {item.payment_method}
                                          </p>
                                          <b>
                                            {formatCurrency(item.paid_amount)}
                                          </b>
                                        </>
                                        {item.payment_method_id === 3 && (
                                          <p>{item.reference}</p>
                                        )}
                                        {item.payment_method_id === 5 && (
                                          <p>
                                            {Math.round(item.amount / 1000)}{" "}
                                            điểm
                                          </p>
                                        )}
                                      </Col>
                                    ))}
                              </Row>
                            </Panel>
                          )}

                          {OrderDetail &&
                            OrderDetail.fulfillments &&
                            OrderDetail.fulfillments.length > 0 &&
                            OrderDetail.fulfillments[0].shipment &&
                            OrderDetail.fulfillments[0].shipment.cod && (
                              <Panel
                                className={
                                  OrderDetail?.fulfillments[0].status !==
                                  "shipped"
                                    ? "orders-timeline-custom orders-dot-status"
                                    : "orders-timeline-custom"
                                }
                                showArrow={false}
                                header={
                                  <>
                                    <b
                                      style={{
                                        paddingLeft: "4px",
                                        color: "#222222",
                                      }}
                                    >
                                      COD
                                    </b>
                                    <b
                                      style={{
                                        marginLeft: "200px",
                                        color: "#222222",
                                      }}
                                    >
                                      {OrderDetail !== null &&
                                      OrderDetail.fulfillments
                                        ? formatCurrency(
                                            OrderDetail.fulfillments[0].shipment
                                              ?.cod
                                          )
                                        : 0}
                                    </b>
                                  </>
                                }
                                extra={
                                  <>
                                    {OrderDetail?.fulfillments[0].status ===
                                      "shipped" && (
                                      <div>
                                        <span
                                          className="fixed-time text-field"
                                          style={{ color: "#737373" }}
                                        >
                                          {ConvertUtcToLocalDate(
                                            getDateLastPayment(OrderDetail),
                                            "DD/MM/YYYY HH:mm"
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                }
                                key="2"
                              ></Panel>
                            )}
                        </Collapse>
                      </div>{" "}
                    </div>
                  )}
                  {isShowPaymentPartialPayment && OrderDetail !== null && (
                    <UpdatePaymentCard
                      setSelectedPaymentMethod={onPaymentSelect}
                      setPayments={onPayments}
                      paymentMethod={paymentType}
                      showPartialPayment={true}
                      amount={
                        OrderDetail.total_line_amount_after_line_discount -
                        getAmountPayment(OrderDetail.payments) -
                        (OrderDetail?.discounts &&
                        OrderDetail?.discounts.length > 0 &&
                        OrderDetail?.discounts[0].amount
                          ? OrderDetail?.discounts[0].amount
                          : 0)
                      }
                      order_id={OrderDetail.id}
                      orderDetail={OrderDetail}
                      setTotalPaid={setTotalPaid}
                      isVisibleUpdatePayment={isVisibleUpdatePayment}
                      setVisibleUpdatePayment={setVisibleUpdatePayment}
                    />
                  )}
                  {(OrderDetail?.fulfillments &&
                    OrderDetail?.fulfillments.length > 0 &&
                    OrderDetail?.fulfillments[0].shipment &&
                    OrderDetail?.fulfillments[0].shipment.cod !== null) ||
                    (checkPaymentAll(OrderDetail) !== 1 &&
                      isShowPaymentPartialPayment === false &&
                      checkPaymentStatusToShow(OrderDetail) !== 1 && (
                        <div className="padding-24 text-right">
                          <Divider style={{ margin: "10px 0" }} />
                          <Button
                            type="primary"
                            className="ant-btn-outline fixed-button"
                            onClick={() => setShowPaymentPartialPayment(true)}
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
                      <div className="d-flex" style={{ marginTop: "5px" }}>
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
                        <span>0</span>
                      </Col>
                      <Col span={12}>
                        <span className="text-field margin-right-40">
                          Còn phải trả:
                        </span>
                        <b style={{ color: "red" }}>
                          {OrderDetail && OrderDetail?.fulfillments
                            ? formatCurrency(
                                OrderDetail.fulfillments[0].shipment?.cod
                              )
                            : 0}
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
                          <b style={{ color: "#222222" }}>
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
                          </b>
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
                    <span>{OrderDetail?.customer_phone_number}</span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Địa chỉ:</Col>
                  <Col span={15}>
                    <span>{OrderDetail?.shipping_address?.full_address}</span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>NVBH:</Col>
                  <Col span={15}>
                    <span className="text-focus">{OrderDetail?.assignee}</span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Người tạo:</Col>
                  <Col span={15}>
                    <span className="text-focus">{OrderDetail?.account}</span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Thời gian:</Col>
                  <Col span={15}>
                    <span>
                      {moment(OrderDetail?.created_date).format(
                        "DD/MM/YYYY HH:mm a"
                      )}
                    </span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Đường dẫn:</Col>
                  <Col span={15} style={{wordWrap: "break-word"}}>
                    {OrderDetail?.url ? (
                      <a href={OrderDetail?.url}>{OrderDetail?.url}</a>
                    ) : (
                      <span className="text-focus">Không</span>
                    )}
                  </Col>
                </Row>
              </div>
            </Card>
            <SubStatusOrder status={OrderDetail?.status} />
            <Card
              className="margin-top-20"
              title={
                <div className="d-flex">
                  <span className="title-card">THÔNG TIN BỔ SUNG</span>
                </div>
              }
            >
              <div className="padding-24">
                <Row className="" gutter={5}>
                  <Col span={9}>Ghi chú:</Col>
                  <Col span={15}>
                    <span className="text-focus" style={{wordWrap: "break-word"}}>
                      {OrderDetail?.note !== ""
                        ? OrderDetail?.note
                        : "Không có ghi chú"}
                    </span>
                  </Col>
                </Row>

                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Tags:</Col>
                  <Col span={15}>
                    <span className="text-focus">
                      {OrderDetail?.tags !== ""
                        ? OrderDetail?.tags
                        : "Không có tags"}
                    </span>
                  </Col>
                </Row>
              </div>
            </Card>
            <Card className="margin-top-20">
              <div className="padding-24">
                <span className="text-focus">Lịch sử thao tác đơn hàng</span>
              </div>
            </Card>
          </Col>
        </Row>
        <Row
          gutter={24}
          className="margin-top-10"
          style={{
            position: "fixed",
            textAlign: "right",
            width: "100%",
            height: "55px",
            bottom: "0%",
            backgroundColor: "#FFFFFF",
            marginLeft: "-31px",
            display: `${isShowBillStep ? "" : "none"}`,
          }}
        >
          <Col
            md={10}
            style={{ marginLeft: "-20px", marginTop: "3px", padding: "3px" }}
          >
            <CreateBillStep status={stepsStatusValue} orderDetail={null} />
          </Col>
        </Row>
      </div>
    </ContentContainer>
  );
};

export default OrderDetail;
