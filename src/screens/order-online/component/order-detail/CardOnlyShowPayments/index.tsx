import { Button, Card, Col, Collapse, Divider, Row, Space, Tag } from "antd";
import { OrderPaymentRequest } from "model/request/order.request";
import { OrderResponse } from "model/response/order/order.response";
import {
  checkPaymentAll,
  checkPaymentStatusToShow,
  formatCurrency,
  getAmountPayment,
  SumCOD,
} from "utils/AppUtils";
import { FulFillmentStatus, OrderStatus } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import UpdatePaymentCard from "../../update-payment-card";
import { StyledComponent } from "./styles";

type CardOnlyShowPaymentsProps = {
  OrderDetail: OrderResponse | null;
  customerNeedToPayValue: number;
  shipmentMethod: number;
  paymentType: number;
  isShowPaymentPartialPayment: boolean;
  isVisibleUpdatePayment: boolean;
  stepsStatusValue: string;
  shippingFeeInformedCustomer: number;
  onPaymentSelect: (paymentType: number) => void;
  setVisibleUpdatePayment: (value: boolean) => void;
  setShowPaymentPartialPayment: (value: boolean) => void;
  setReload: (value: boolean) => void;
  setTotalPaid: (value: number) => void;
  onPayments: (value: Array<OrderPaymentRequest>) => void;
};

function CardOnlyShowPayments(props: CardOnlyShowPaymentsProps) {
  const { Panel } = Collapse;
  const {
    OrderDetail,
    customerNeedToPayValue,
    isShowPaymentPartialPayment,
    shippingFeeInformedCustomer,
    shipmentMethod,
    isVisibleUpdatePayment,
    stepsStatusValue,
    paymentType,
    onPaymentSelect,
    setVisibleUpdatePayment,
    setTotalPaid,
    setShowPaymentPartialPayment,
    setReload,
    onPayments,
  } = props;
  return (
    <StyledComponent>
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
                  <Tag className="orders-tag orders-tag-default">Chưa thanh toán 2</Tag>
                )}
                {checkPaymentStatusToShow(OrderDetail) === 0 && (
                  <Tag className="orders-tag orders-tag-warning">Thanh toán 1 phần</Tag>
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
                  <span className="text-field margin-right-40">Đã thanh toán:</span>
                  <b>
                    {(OrderDetail?.fulfillments &&
                      OrderDetail?.fulfillments.length > 0 &&
                      OrderDetail?.fulfillments[0].status === "shipped" &&
                      formatCurrency(customerNeedToPayValue)) ||
                      formatCurrency(getAmountPayment(OrderDetail.payments))}
                  </b>
                </Col>
                <Col span={12}>
                  <span className="text-field margin-right-40">
                    {customerNeedToPayValue -
                      (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) >=
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
                              (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
                          )
                        )}
                  </b>
                </Col>
              </Row>
            </div>

            {OrderDetail?.payments && (
              <div>
                <div style={{ padding: "0 24px 24px 24px" }}>
                  <Collapse className="orders-timeline" defaultActiveKey={["100"]} ghost>
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
                            return payment.payment_method !== "cod" && payment.amount;
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
                                      {payment.payment_method_id === 5 && (
                                        <span style={{ marginLeft: 10 }}>
                                          {payment.amount / 1000} điểm
                                        </span>
                                      )}
                                    </div>
                                    <span className="amount">
                                      {formatCurrency(Math.abs(payment.paid_amount))}
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
                        {/* {isShowPaymentPartialPayment && OrderDetail !== null && (
                          <UpdatePaymentCard
                            setSelectedPaymentMethod={onPaymentSelect}
                            setVisibleUpdatePayment={setVisibleUpdatePayment}
                            setPayments={onPayments}
                            setTotalPaid={setTotalPaid}
                            orderDetail={OrderDetail}
                            paymentMethod={paymentType}
                            shipmentMethod={shipmentMethod}
                            order_id={OrderDetail.id}
                            showPartialPayment={true}
                            isVisibleUpdatePayment={isVisibleUpdatePayment}
                            amount={
                              OrderDetail.total_line_amount_after_line_discount -
                              getAmountPayment(OrderDetail.payments) -
                              (OrderDetail?.discounts &&
                              OrderDetail?.discounts.length > 0 &&
                              OrderDetail?.discounts[0].amount
                                ? OrderDetail?.discounts[0].amount
                                : 0)
                            }
                            disabled={
                              stepsStatusValue === OrderStatus.CANCELLED ||
                              stepsStatusValue === FulFillmentStatus.SHIPPED
                            }
                            reload={() => {
                              setReload(true);
                            }}
                          />
                        )} */}
                      </Panel>
                    )}
                    {OrderDetail?.fulfillments &&
                      OrderDetail?.fulfillments.length > 0 &&
                      OrderDetail?.fulfillments[0].shipment &&
                      OrderDetail?.fulfillments[0].shipment.cod && (
                        <Panel
                          className={
                            OrderDetail?.fulfillments[0].status !== "shipped"
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
                                    {OrderDetail.fulfillments[0].status !== "shipped" ? (
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
                                          backgroundColor: "rgba(39, 174, 96, 0.1)",
                                          color: "#27AE60",
                                          marginLeft: 10,
                                        }}
                                      >
                                        Đã thu COD
                                      </Tag>
                                    )}
                                  </b>
                                  <span className="amount">
                                    {OrderDetail !== null && OrderDetail?.fulfillments
                                      ? formatCurrency(
                                          OrderDetail.fulfillments[0].shipment?.cod
                                        )
                                      : 0}
                                  </span>
                                </div>
                                <div className="orderPaymentItem__right">
                                  {OrderDetail?.fulfillments[0].status === "shipped" && (
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
                  <div className="padding-24 text-right" style={{ paddingTop: 0 }}>
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
          (OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer
            ? OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer
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
                  <span className="text-field margin-right-40">Đã thanh toán:</span>
                  <b>0</b>
                </Col>
                <Col span={12}>
                  <span className="text-field margin-right-40">Còn phải trả:</span>
                  <b style={{ color: "red" }}>0</b>
                </Col>
              </Row>
            </div>
            <Divider style={{ margin: "0px" }} />
            <div className="padding-24">
              <Collapse className="orders-timeline" defaultActiveKey={["1"]} ghost>
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
                          ? formatCurrency(OrderDetail.fulfillments[0].shipment?.cod)
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
                          <p className="text-field">{item.payment_method}</p>
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
      {/* {OrderDetail &&
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
            reload={() => {
              setReload(true);
            }}
          />
        )} */}

      {/*--- end payment ---*/}
    </StyledComponent>
  );
}

export default CardOnlyShowPayments;
