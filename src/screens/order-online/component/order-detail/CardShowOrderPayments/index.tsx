import { Button, Card, Col, Collapse, Divider, FormInstance, Row, Space, Tag } from "antd";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { OrderPageTypeModel } from "model/order/order.model";
import { OrderPaymentRequest } from "model/request/order.request";
import { OrderPaymentResponse, OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useDispatch } from "react-redux";
import CopyIcon from "screens/order-online/component/CopyIcon";
import {
  cancelMomoTransactionService,
  getOrderDetail,
  retryMomoTransactionService,
  updateMomoTransactionStatusService,
} from "service/order/order.service";
import {
  formatCurrency,
  getAmountPayment,
  handleFetchApiError,
  isFetchApiSuccessful,
  sortFulfillments,
} from "utils/AppUtils";
import { FulFillmentStatus, OrderStatus, PaymentMethodCode, POS } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { ORDER_PAYMENT_STATUS, ORDER_SUB_STATUS } from "utils/Order.constants";
import {
  checkIfCancelledPayment,
  checkIfExpiredPayment,
  checkIfFinishedPayment,
  checkIfFulfillmentCancelled,
  checkIfMomoPayment,
  checkIfOrderHasNoPayment,
  checkIfOrderPageType,
} from "utils/OrderUtils";
import { showSuccess } from "utils/ToastUtils";
import UpdatePaymentCard from "../../UpdatePaymentCard";
import PaymentStatusTag from "../PaymentStatusTag";
import { StyledComponent } from "./styles";

const { Panel } = Collapse;

type PropTypes = {
  OrderDetail: OrderResponse | null;
  setOrderDetail: (value: OrderResponse | null) => void;
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
  createPaymentCallback?: () => void;
  totalAmountCustomerNeedToPay: number;
  payments: OrderPaymentRequest[] | null | undefined;
  setExtraPayments: (payments: OrderPaymentRequest[]) => void;
  orderPageType: OrderPageTypeModel;
};

function CardShowOrderPayments(props: PropTypes) {
  const {
    OrderDetail,
    setOrderDetail,
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
    createPaymentCallback,
    totalAmountCustomerNeedToPay,
    payments,
    setExtraPayments,
    orderPageType,
  } = props;

  const dispatch = useDispatch();

  const isOrderUpdatePage = checkIfOrderPageType.isOrderUpdatePage(orderPageType);

  // if(OrderDetail && OrderDetail?.payments) {
  //   OrderDetail?.payments.push({
  //     amount: 0,
  //     code: "momo",
  //     payment_method_code: "momo",
  //     payment_method_id: 0,
  //     payment_method: "Momo",
  //     reference: "momo reference",
  //     source: "",
  //     paid_amount: 20000,
  //     return_amount: 0,
  //     status: "",
  //     customer_id: 0,
  //     type: "",
  //     note: "",
  //     bank_account_holder: "",
  //     bank_account_id: 0,
  //     bank_account_number: "",
  //     id: 0
  //   })

  // }

  const paymentClassName = {
    wrapper: "orderPaymentItem",
    left: "orderPaymentItem__left",
    right: "orderPaymentItem__right",
  };

  const dateFormat = DATE_FORMAT.DDMMYY_HHmm;

  const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);

  /**
   * ko show chi tiết payment
   */
  const checkIfNotShowPaymentDetail = () => {
    if (isOrderUpdatePage) {
      return false;
    }
    let result = true;
    if (!OrderDetail) {
      return false;
    }
    if (checkIfOrderHasNoPayment(OrderDetail) && !sortedFulfillments[0]?.shipment?.cod) {
      result = true;
    } else {
      result = false;
    }
    return result;
  };
  console.log("sortedFulfillments", sortedFulfillments);
  const renderCodWaiting = () => {
    if (
      sortedFulfillments &&
      sortedFulfillments[0]?.shipment?.cod &&
      !checkIfFulfillmentCancelled(sortedFulfillments[0]) &&
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
                  <Tag className="orders-tag orders-tag-warning">Đang chờ thu</Tag>
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
                      {ConvertUtcToLocalDate(OrderDetail?.updated_date, dateFormat)}
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

  const renderPaymentDetailTop = () => {
    return (
      <div className="paymentDetailTop">
        <Row>
          <Col span={8}>
            <span className="text-field margin-right-40 33">Đã thanh toán:</span>
            <b>{formatCurrency(getAmountPayment(payments))}</b>
          </Col>
          <Col span={8}>
            <span className="text-field margin-right-40 55">Còn phải trả:</span>
            <b className="leftMoney">
              {formatCurrency(totalAmountCustomerNeedToPay > 0 ? totalAmountCustomerNeedToPay : 0)}
            </b>
          </Col>
          {totalAmountCustomerNeedToPay < 0 && (
            <Col span={8}>
              <span className="text-field margin-right-40">Đã hoàn tiền cho khách:</span>
              <b className="change">{formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}</b>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  // trường hợp số tiền âm là hoàn lại tiền
  // const renderPaymentTitle = (payment: OrderPaymentResponse) => {
  //   return (
  //     <b>
  //       {payment.paid_amount < 0
  //         ? "Hoàn tiền cho khách"
  //         : payment.payment_method}
  //     </b>
  //   )
  // };

  // trường hợp số tiền âm là hoàn lại tiền
  const renderPaymentTitle = {
    main(payment: OrderPaymentResponse) {
      return (
        <div className="paymentTitle 31">
          {payment.paid_amount < 0 ? "Hoàn tiền cho khách" : this.renderNotReturned(payment)}
          {renderPaymentPaidCodTag(payment)}
        </div>
      );
    },

    renderTitleMomo(payment: OrderPaymentResponse) {
      if (checkIfMomoPayment(payment)) {
        return (
          <div>
            <div>{`${payment.payment_method} ${this.renderMomoPaymentStatus(payment)}`}</div>
            {this.renderMomoPaymentShortLink(payment)}
            {this.renderMomoPaymentReference(payment)}
          </div>
        );
      }
    },

    renderTitleNotMomo(payment: OrderPaymentResponse) {
      if (!checkIfMomoPayment(payment)) {
        return payment.payment_method;
      }
    },

    renderNotReturned(payment: OrderPaymentResponse) {
      if (checkIfMomoPayment(payment)) {
        return this.renderTitleMomo(payment);
      }
      return this.renderTitleNotMomo(payment);
    },

    renderMomoPaymentStatus(payment: OrderPaymentResponse) {
      if (checkIfMomoPayment(payment)) {
        if (payment.status === ORDER_PAYMENT_STATUS.unpaid) {
          if (checkIfExpiredPayment(payment)) {
            return "(Đã hết hạn)";
          }
          return "(Chờ thanh toán)";
        }
        if (payment.status === ORDER_PAYMENT_STATUS.paid) {
          return "(Đã thanh toán)";
        }
        if (checkIfExpiredPayment(payment)) {
          return "(Đã hết hạn)";
        }
        return "(Hủy giao dịch)";
      }
    },

    renderMomoPaymentShortLink(payment: OrderPaymentResponse) {
      if (
        !payment.short_link ||
        checkIfFinishedPayment(payment) ||
        checkIfExpiredPayment(payment) ||
        checkIfCancelledPayment(payment)
      ) {
        return;
      }
      return (
        <div className="momoShortLink">
          <a href={payment.short_link} target="_blank" rel="noreferrer">
            {payment.short_link}
          </a>
          <CopyIcon
            copiedText={payment.short_link}
            informationText="Đã copy link Momo!"
            titleText="Copy link Momo"
          />
        </div>
      );
    },

    renderMomoPaymentReference(payment: OrderPaymentResponse) {
      if (!checkIfMomoPayment(payment)) {
        return;
      }
      if (checkIfFinishedPayment(payment) && payment.ref_transaction_code) {
        return <div className="momoReference">{payment.ref_transaction_code}</div>;
      }
    },
  };

  const renderPaymentReference = (payment: OrderPaymentResponse) => {
    if (payment.reference && !payment.ref_transaction_code) {
      return <span style={{ marginLeft: 0 }}>{payment.reference}</span>;
    }
    return null;
  };

  const renderPaymentBankAccount = (payment: OrderPaymentResponse) => {
    if (payment.bank_account_number) {
      let arr = [payment.bank_account_number, payment.bank_account_holder];
      let arrResult = arr.filter((single) => single);
      if (arrResult.length > 0) {
        return ` (${arrResult.join(" - ")})`;
      }
      return null;
    }
    return null;
  };

  const renderPaymentPointNumber = (payment: OrderPaymentResponse) => {
    if (payment.payment_method_code === PaymentMethodCode.POINT) {
      return <span className="paymentPointNumber">{payment.point} điểm</span>;
    }
    return null;
  };

  const renderPaymentPaidCodTag = (payment: OrderPaymentResponse) => {
    if (payment.payment_method_code === PaymentMethodCode.COD) {
      return <Tag className="orders-tag orders-tag-success paidTag">Đã thu COD</Tag>;
    }
    return null;
  };

  const handleFetchOrderDetail = () => {
    if (!OrderDetail?.id) {
      return;
    }
    getOrderDetail(OrderDetail?.id.toString()).then((response) => {
      if (isFetchApiSuccessful(response)) {
        setOrderDetail(response.data);
      } else {
        handleFetchApiError(response, "Hủy giao dịch Momo", dispatch);
      }
    });
  };

  const handleCancelMomoTransaction = (payment: OrderPaymentResponse) => {
    dispatch(showLoading());
    cancelMomoTransactionService(payment.id)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Hủy giao dịch Momo thành công !");
          handleFetchOrderDetail();
        } else {
          handleFetchApiError(response, "Hủy giao dịch Momo", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleUpdateMomoTransactionStatus = (payment: OrderPaymentResponse) => {
    dispatch(showLoading());
    updateMomoTransactionStatusService(payment.id)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Cập nhật trạng thái Momo thành công !");
          handleFetchOrderDetail();
        } else {
          handleFetchApiError(response, "Cập nhật trạng thái Momo", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleRetryMomoTransaction = (payment: OrderPaymentResponse) => {
    dispatch(showLoading());
    retryMomoTransactionService(payment.id)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Tạo link Momo thành công !");
          handleFetchOrderDetail();
        } else {
          handleFetchApiError(response, "Tạo link Momo Momo", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const renderMomoCancelTransactionButton = (payment: OrderPaymentResponse) => {
    if (
      checkIfMomoPayment(payment) &&
      !checkIfFinishedPayment(payment) &&
      !checkIfExpiredPayment(payment) &&
      !checkIfCancelledPayment(payment)
    ) {
      return (
        <Button
          type="primary"
          danger
          className="ant-btn-outline momoButton cancelMomoButton"
          onClick={() => {
            handleCancelMomoTransaction(payment);
          }}
        >
          Hủy giao dịch
        </Button>
      );
    }
    return null;
  };

  const renderMomoUpdateStatusButton = (payment: OrderPaymentResponse) => {
    if (
      checkIfMomoPayment(payment) &&
      !checkIfFinishedPayment(payment) &&
      !checkIfExpiredPayment(payment) &&
      !checkIfCancelledPayment(payment)
    ) {
      return (
        <Button
          type="primary"
          className="ant-btn-outline momoButton updateMomoButton"
          onClick={() => {
            handleUpdateMomoTransactionStatus(payment);
          }}
        >
          Cập nhật trạng thái
        </Button>
      );
    }
    return null;
  };

  const renderMomoRetryButton = (payment: OrderPaymentResponse) => {
    if (
      checkIfMomoPayment(payment) &&
      !checkIfFinishedPayment(payment) &&
      !checkIfExpiredPayment(payment) &&
      !checkIfCancelledPayment(payment) &&
      !payment.short_link
    ) {
      return (
        <Button
          type="primary"
          className="ant-btn-outline momoButton retryMomoButton"
          onClick={() => {
            console.log("cancel momo");
            handleRetryMomoTransaction(payment);
          }}
        >
          Tạo link Momo
        </Button>
      );
    }
    return null;
  };

  console.log("OrderDetail", OrderDetail);

  const renderPaymentDetailMain = (OrderDetail: OrderResponse) => {
    if (!OrderDetail?.payments) {
      return null;
    }
    return (
      <div className="paymentDetailMain">
        <Collapse className="orders-timeline" defaultActiveKey={["paymentDetailMain"]} ghost>
          {OrderDetail?.payments
            // hiển thị tất
            // .filter((payment) => {
            //   // nếu là đơn trả thì tính cả cod
            //   // if (OrderDetail.order_return_origin) {
            //   //   return true;
            //   // }
            //   return (
            //     // payment.payment_method_code !== PaymentMethodCode.COD
            //     payment.payment_method_code // hiển thị những payment có code
            //     // && payment.amount
            //   );
            // })
            .map((payment: OrderPaymentResponse, index: number) => (
              <Panel
                showArrow={false}
                className={`orders-timeline-custom ${
                  !checkIfFinishedPayment(payment)
                    ? checkIfExpiredPayment(payment) || checkIfCancelledPayment(payment)
                      ? "danger-collapse"
                      : "warning-collapse"
                    : "success-collapse"
                }`}
                header={
                  <div className={paymentClassName.wrapper}>
                    <div className={paymentClassName.left}>
                      <div className="paymentMethod">
                        {/* <b>{payment.payment_method}</b> */}
                        {renderPaymentTitle.main(payment)}
                        {renderPaymentReference(payment)}
                        {renderPaymentBankAccount(payment)}
                        {renderPaymentPointNumber(payment)}
                      </div>
                      <span className="amount">
                        {formatCurrency(Math.abs(payment.paid_amount))}
                      </span>
                    </div>
                    <div className={paymentClassName.right}>
                      <div>
                        <div className="date">
                          {ConvertUtcToLocalDate(payment.created_date, dateFormat)}
                        </div>
                        {renderMomoCancelTransactionButton(payment)}
                        {renderMomoUpdateStatusButton(payment)}
                        {renderMomoRetryButton(payment)}
                      </div>
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
              className="orders-timeline-custom orders-dot-status 5"
              showArrow={false}
              header={
                <b className="paymentPartial__header">
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
                  setExtraPayments={setExtraPayments}
                  orderDetail={OrderDetail}
                  paymentMethod={paymentMethod}
                  shipmentMethod={shipmentMethod}
                  order_id={OrderDetail.id}
                  showPartialPayment={true}
                  isVisibleUpdatePayment={isVisibleUpdatePayment}
                  amount={totalAmountCustomerNeedToPay}
                  disabled={
                    stepsStatusValue === OrderStatus.CANCELLED ||
                    stepsStatusValue === FulFillmentStatus.SHIPPED
                  }
                  reload={() => {
                    setReload(true);
                  }}
                  disabledActions={disabledActions}
                  paymentMethods={paymentMethods}
                  form={form}
                  isDisablePostPayment={isDisablePostPayment}
                  createPaymentCallback={createPaymentCallback}
                  orderPageType={orderPageType}
                />
              )}
            </Panel>
          )}
        </Collapse>
      </div>
    );
  };

  console.log("sortedFulfillments", sortedFulfillments);

  const checkIfOrderHasPaidAllMoneyAmountIncludeCod = (OrderDetail: OrderResponse) => {
    let codAmount = 0;
    if (!checkIfFulfillmentCancelled(sortedFulfillments[0])) {
      codAmount = sortedFulfillments[0]?.shipment?.cod || 0;
    }
    console.log("codAmount", codAmount);
    return codAmount >= totalAmountCustomerNeedToPay;
  };

  const renderPaymentDetailAddPayment = (OrderDetail: OrderResponse) => {
    const checkIfDisabled = () => {
      return (
        OrderDetail.source_code !== POS.source_code &&
        (stepsStatusValue === OrderStatus.CANCELLED ||
          stepsStatusValue === FulFillmentStatus.SHIPPED ||
          disabledBottomActions ||
          OrderDetail.sub_status_code === ORDER_SUB_STATUS.returning ||
          OrderDetail.sub_status_code === ORDER_SUB_STATUS.confirm_returned)
      );
    };
    if (!checkIfOrderHasPaidAllMoneyAmountIncludeCod(OrderDetail) && !isShowPaymentPartialPayment) {
      return (
        <div className="text-right">
          <Divider className="divider" />
          <Button
            type="primary"
            className="ant-btn-outline fixed-button 5 buttonShowPartialPayment"
            onClick={() => setShowPaymentPartialPayment(true)}
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
        {renderPaymentDetailTop()}

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
        setExtraPayments={setExtraPayments}
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
        paymentMethods={paymentMethods}
        form={form}
        orderPageType={orderPageType}
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
