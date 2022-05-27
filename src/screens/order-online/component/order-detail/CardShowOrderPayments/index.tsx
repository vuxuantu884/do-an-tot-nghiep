import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  FormInstance,
  Row,
  Space,
  Tag
} from "antd";
import {
  OrderPaymentResponse,
  OrderResponse
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useMemo } from "react";
import {
  formatCurrency,
  getAmountPayment,
  sortFulfillments
} from "utils/AppUtils";
import {
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
  POS
} from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { yellowColor } from "utils/global-styles/variables";
import {
  checkIfOrderHasNoPayment
} from "utils/OrderUtils";
import UpdatePaymentCard from "../../update-payment-card";
import PaymentStatusTag from "../PaymentStatusTag";
import { StyledComponent } from "./styles";

const { Panel } = Collapse;

type PropTypes = {
  OrderDetail: OrderResponse | null;
  isShowPaymentPartialPayment: boolean;
  onPaymentSelect: (paymentMethod: number) => void;
  setVisibleUpdatePayment: (value: boolean) => void;
  setShowPaymentPartialPayment: (value: boolean) => void;
  stepsStatusValue: string;
  paymentMethod: number;
  shipmentMethod: number;
  isVisibleUpdatePayment: boolean;
  disabledActions: (type: string) => void;
  setReload: (value: boolean) => void;
  paymentMethods: PaymentMethodResponse[];
  disabledBottomActions: boolean;
  form: FormInstance<any>;
  isDisablePostPayment: boolean;
};

function CardShowOrderPayments(props: PropTypes) {
  const {
    OrderDetail,
    isShowPaymentPartialPayment,
    onPaymentSelect,
    setVisibleUpdatePayment,
    setShowPaymentPartialPayment,
    stepsStatusValue,
    paymentMethod,
    shipmentMethod,
    isVisibleUpdatePayment,
    disabledActions,
    setReload,
    paymentMethods,
    disabledBottomActions,
    form,
    isDisablePostPayment,
  } = props;

  const paymentClassName = {
    wrapper: "orderPaymentItem",
    left: "orderPaymentItem__left",
    right: "orderPaymentItem__right",
  };

  const dateFormat = DATE_FORMAT.DDMMYY_HHmm;

  const totalPaid = OrderDetail?.payments
    ? getAmountPayment(OrderDetail.payments)
    : 0;

  // khách cần trả thêm
  const customerNeedToPayValueMore = useMemo(() => {
    return (OrderDetail?.total || 0) - totalPaid;
  }, [OrderDetail?.total, totalPaid]);

  const renderBankAccount = (payment: any) => {
    let arr = [payment.bank_account_number, payment.bank_account_holder];
    let arrResult = arr.filter((single) => single);
    if (arrResult.length > 0) {
      return ` (${arrResult.join(" - ")})`;
    }
  };

  const sortedFulfillments = useMemo(() => {
    return OrderDetail?.fulfillments
      ? sortFulfillments(OrderDetail?.fulfillments)
      : [];
  }, [OrderDetail?.fulfillments]);

  /**
   * ko show chi tiết payment
   */
  const checkIfNotShowPaymentDetail = () => {
    let result = true;
    if (!OrderDetail) {
      return false;
    }
    if (
      checkIfOrderHasNoPayment(OrderDetail) &&
      !sortedFulfillments[0]?.shipment?.cod
    ) {
      result = true;
    } else {
      result = false;
    }
    return result;
  };

  const renderCodWaiting = () => {
    if (
      sortedFulfillments &&
      sortedFulfillments[0]?.shipment?.cod &&
      sortedFulfillments[0]?.status !== FulFillmentStatus.SHIPPED
    ) {
      return (
        <Panel
          className={
            sortedFulfillments[0]?.status !== FulFillmentStatus.SHIPPED
              ? "orders-timeline-custom orders-dot-status"
              : "orders-timeline-custom "
          }
          showArrow={false}
          header={
            <div className={paymentClassName.wrapper}>
              <div className={paymentClassName.left}>
                <b>
                  COD
                  <Tag className="orders-tag orders-tag-warning">
                    Đang chờ thu
                  </Tag>
                </b>
                <span className="amount">
                  {OrderDetail !== null && OrderDetail?.fulfillments
                    ? formatCurrency(sortedFulfillments[0]?.shipment?.cod)
                    : 0}
                </span>
              </div>
              <div className={paymentClassName.right}>
                {sortedFulfillments[0]?.status === FulFillmentStatus.SHIPPED && (
                  <div>
                    <span className="date">
                      {ConvertUtcToLocalDate(
                        OrderDetail?.updated_date,
                        dateFormat,
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          }
          key="cod-waiting"
        ></Panel>
      );
    }
  };

  const renderPaymentDetailTop = (OrderDetail: OrderResponse) => {
    return (
      <div style={{ marginBottom: 20 }}>
        <Row>
          <Col span={8}>
            <span className="text-field margin-right-40">Đã thanh toán:</span>
            <b>{formatCurrency(getAmountPayment(OrderDetail.payments))}</b>
          </Col>
          <Col span={8}>
            <span className="text-field margin-right-40">Còn phải trả:</span>
            <b style={{ color: "red" }}>
              {formatCurrency(
                customerNeedToPayValueMore > 0 ? customerNeedToPayValueMore : 0,
              )}
            </b>
          </Col>
          {customerNeedToPayValueMore < 0 && (
            <Col span={8}>
              <span className="text-field margin-right-40">
                Đã hoàn tiền cho khách:
              </span>
              <b style={{ color: yellowColor }}>
                {formatCurrency(Math.abs(customerNeedToPayValueMore))}
              </b>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  const renderPaymentDetailMain = (OrderDetail: OrderResponse) => {
    if (!OrderDetail?.payments) {
      return null;
    }
    return (
      <div style={{ padding: "0 24px" }}>
        <Collapse
          className="orders-timeline"
          defaultActiveKey={["paymentDetailMain"]}
          ghost
        >
          {OrderDetail?.payments
            .filter((payment) => {
              // nếu là đơn trả thì tính cả cod
              // if (OrderDetail.order_return_origin) {
              //   return true;
              // }
              return (
                // payment.payment_method_code !== PaymentMethodCode.COD
                payment.payment_method_code // hiển thị những payment có code
                // && payment.amount
              );
            })
            .map((payment: OrderPaymentResponse, index: number) => (
              <Panel
                showArrow={false}
                className="orders-timeline-custom success-collapse"
                header={
                  <div className={paymentClassName.wrapper}>
                    <div className={paymentClassName.left}>
                      <div>
                        {/* <b>{payment.payment_method}</b> */}
                        {/* trường hợp số tiền âm là hoàn lại tiền */}
                        <b>
                          {payment.paid_amount < 0
                            ? "Hoàn tiền cho khách"
                            : payment.payment_method}
                        </b>
                        {payment.reference && (
                          <span style={{ marginLeft: 12 }}>
                            {payment.reference}
                          </span>
                        )}
                        {payment.bank_account_number
                          ? renderBankAccount(payment)
                          : null}
                        {payment.payment_method_code ===
                          PaymentMethodCode.POINT && (
                          <span style={{ marginLeft: 10 }}>
                            {payment.point} điểm
                          </span>
                        )}
                        {payment.payment_method_code ===
                          PaymentMethodCode.COD && (
                          <Tag
                            className="orders-tag orders-tag-success"
                            style={{
                              backgroundColor: "rgba(39, 174, 96, 0.1)",
                              color: "#27AE60",
                            }}
                          >
                            Đã thu COD
                          </Tag>
                        )}
                      </div>
                      <span className="amount">
                        {formatCurrency(Math.abs(payment.paid_amount))}
                      </span>
                    </div>
                    <div className={paymentClassName.right}>
                      <span className="date">
                        {ConvertUtcToLocalDate(
                          payment.created_date,
                          dateFormat,
                        )}
                      </span>
                    </div>
                  </div>
                }
                key={index}
              ></Panel>
            ))}
          {/* cod đang chờ thu */}
          {renderCodWaiting()}
          {isShowPaymentPartialPayment && (
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
              key="paymentDetailMain"
            >
              {isShowPaymentPartialPayment && (
                <UpdatePaymentCard
                  setPaymentMethod={onPaymentSelect}
                  setVisibleUpdatePayment={setVisibleUpdatePayment}
                  setShowPaymentPartialPayment={setShowPaymentPartialPayment}
                  // setPayments={onPayments}
                  setPayments={() => {}}
                  // setTotalPaid={setTotalPaid}
                  orderDetail={OrderDetail}
                  paymentMethod={paymentMethod}
                  shipmentMethod={shipmentMethod}
                  order_id={OrderDetail.id}
                  showPartialPayment={true}
                  isVisibleUpdatePayment={isVisibleUpdatePayment}
                  amount={customerNeedToPayValueMore}
                  disabled={
                    stepsStatusValue === OrderStatus.CANCELLED ||
                    stepsStatusValue === FulFillmentStatus.SHIPPED
                  }
                  reload={() => {
                    setReload(true);
                  }}
                  disabledActions={disabledActions}
                  listPaymentMethods={paymentMethods}
                  form={form}
                  isDisablePostPayment={isDisablePostPayment}
                />
              )}
            </Panel>
          )}
        </Collapse>
      </div>
    );
  };

  const checkIfOrderHasPaidAllMoneyAmountIncludeCod = (
    OrderDetail: OrderResponse,
  ) => {
    const codAmount = sortedFulfillments[0]?.shipment?.cod || 0;
    return codAmount + totalPaid >= OrderDetail.total;
  };

  const renderPaymentDetailAddPayment = (OrderDetail: OrderResponse) => {
    const checkIfDisabled = () => {
      return (
        OrderDetail.source_code !== POS.source_code &&
        (stepsStatusValue === OrderStatus.CANCELLED ||
          stepsStatusValue === FulFillmentStatus.SHIPPED ||
          disabledBottomActions)
      );
    };
    if (!checkIfOrderHasPaidAllMoneyAmountIncludeCod(OrderDetail)) {
      return (
        <div className="text-right">
          <Divider style={{ margin: "10px 0" }} />
          <Button
            type="primary"
            className="ant-btn-outline fixed-button"
            onClick={() => setShowPaymentPartialPayment(true)}
            style={{ marginTop: 10 }}
            // đơn hàng nhận ở cửa hàng là hoàn thành nhưng vẫn cho thanh toán tiếp
            disabled={checkIfDisabled()}
          >
            Thanh toán
          </Button>
        </div>
      );
    }
  };

  const renderShowPaymentDetail = () => {
    if (!OrderDetail) {
      return null;
    }
    return (
      <Card
        title={
          <Space>
            <div className="d-flex">
              <span className="title-card">THANH TOÁN</span>
            </div>
            <PaymentStatusTag orderDetail={OrderDetail} />
          </Space>
        }
      >
        {/* trạng thái thanh toán */}
        {renderPaymentDetailTop(OrderDetail)}

        {/* thanh toán */}
        {renderPaymentDetailMain(OrderDetail)}

        {/* trả thêm */}
        {renderPaymentDetailAddPayment(OrderDetail)}
      </Card>
    );
  };

  const renderUpdatePayment = (OrderDetail: OrderResponse) => {
    return (
      <UpdatePaymentCard
        setPaymentMethod={onPaymentSelect}
        // setPayments={onPayments}
        setPayments={() => {}}
        paymentMethod={paymentMethod}
        shipmentMethod={shipmentMethod}
        amount={OrderDetail.total}
        order_id={OrderDetail.id}
        orderDetail={OrderDetail}
        showPartialPayment={false}
        // setTotalPaid={setTotalPaid}
        isVisibleUpdatePayment={isVisibleUpdatePayment}
        setVisibleUpdatePayment={setVisibleUpdatePayment}
        // đơn POS vẫn cho thanh toán tiếp khi chưa thanh toán đủ
        disabled={
          OrderDetail.source_code !== "POS" &&
          (stepsStatusValue === OrderStatus.CANCELLED ||
            stepsStatusValue === FulFillmentStatus.SHIPPED ||
            disabledBottomActions)
        }
        reload={() => {
          setReload(true);
        }}
        disabledActions={disabledActions}
        listPaymentMethods={paymentMethods}
        form={form}
      />
    );
  };

  if (!OrderDetail) {
    return null;
  }

  return (
    <StyledComponent>
      {checkIfNotShowPaymentDetail()
        ? renderUpdatePayment(OrderDetail)
        : OrderDetail && OrderDetail?.total > 0
        ? renderShowPaymentDetail()
        : null}
    </StyledComponent>
  );
}

export default CardShowOrderPayments;
