import { Button, Card, Col, FormInstance, Row } from "antd";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
import OrderCreatePayments from "component/order/OrderCreatePayments";
import OrderPayments from "component/order/OrderPayments";
import UrlConfig from "config/url.config";
import { getLoyaltyRate } from "domain/actions/loyalty/loyalty.action";
import { UpdatePaymentAction } from "domain/actions/order/order.action";
import { OrderPaymentRequest, UpdateFulFillmentRequest } from "model/request/order.request";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { getAmountPayment, reCalculatePaymentReturn } from "utils/AppUtils";
import { OrderStatus } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import SaveAndConfirmOrder from "../../modal/save-confirm.modal";
import { StyledComponent } from "./styles";

type PropTypes = {
  paymentMethods: PaymentMethodResponse[];
  orderDetail: OrderResponse;
  paymentMethod: number;
  shipmentMethod: number;
  order_id: number | null;
  showPartialPayment?: boolean;
  isVisibleUpdatePayment: boolean;
  amount: any;
  disabled?: boolean;
  isDisablePostPayment?: boolean;
  form: FormInstance<any>;
  setPaymentMethod: (paymentType: number) => void;
  setVisibleUpdatePayment: (value: boolean) => void;
  setShowPaymentPartialPayment?: (value: boolean) => void;
  setPayments: (value: Array<OrderPaymentRequest>) => void;
  reload?: () => void;
  disabledActions?: (type: string) => void;
  createPaymentCallback?: () => void;
  isPageOrderUpdate?: boolean;
};

function UpdatePaymentCard(props: PropTypes) {
  const {
    disabledActions,
    paymentMethods,
    amount,
    setShowPaymentPartialPayment,
    setPaymentMethod,
    paymentMethod,
    shipmentMethod,
    isDisablePostPayment,
    createPaymentCallback,
    setPayments,
    isPageOrderUpdate,
  } = props;
  const dispatch = useDispatch();
  const [visibleConfirmPayment, setVisibleConfirmPayment] = useState(false);
  const [textValue, setTextValue] = useState<string>("");
  const [paymentData, setPaymentData] = useState<Array<OrderPaymentRequest>>([]);

  console.log("paymentData", paymentData);
  const [loyaltyRate, setLoyaltyRate] = useState<LoyaltyRateResponse>();

  const history = useHistory();

  const ShowPayment = () => {
    props.setVisibleUpdatePayment(true);
  };

  const onUpdateSuccess = useCallback(
    (value: OrderResponse) => {
      showSuccess("Thanh toán thành công");
      setCreatePayment(false);
      // window.location.reload();
      setVisibleConfirmPayment(false);
      setPaymentData([]);
      props.setVisibleUpdatePayment(false);
      props.reload && props.reload();
      history.push(`${UrlConfig.ORDER}/${props.orderDetail.id}`);
      createPaymentCallback && createPaymentCallback();
    },
    [createPaymentCallback, history, props],
  );

  const onError = (error: boolean) => {
    if (error) {
      setVisibleConfirmPayment(false);
      setCreatePayment(false);
    }
  };

  const ShowConfirmPayment = () => {
    if (props.orderDetail.status === OrderStatus.FINALIZED) {
      setTextValue("Bạn không thay đổi được thông tin thanh toán của đơn sau khi xác nhận?");
    } else {
      if (props.orderDetail.status === OrderStatus.DRAFT) {
        setTextValue(
          "Đơn hàng sẽ được duyệt khi xác nhận thanh toán. Bạn không thay đổi được thông tin thanh toán của đơn sau khi xác nhận?",
        );
      }
    }
    setVisibleConfirmPayment(true);
  };
  const CreateFulFillmentRequest = () => {
    let request: UpdateFulFillmentRequest = {
      id: null,
      order_id: null,
      store_id: props.orderDetail?.store_id,
      account_code: props.orderDetail?.account_code,
      assignee_code: props.orderDetail?.assignee_code,
      delivery_type: "",
      stock_location_id: null,
      payment_status: "",
      total: null,
      total_tax: null,
      total_discount: null,
      total_quantity: null,
      discount_rate: null,
      discount_value: null,
      discount_amount: null,
      total_line_amount_after_line_discount: null,
      shipment: null,
      items: props.orderDetail?.items,
      shipping_fee_informed_to_customer: null,
    };
    let listFulfillmentRequest = [];
    listFulfillmentRequest.push(request);
    return listFulfillmentRequest;
  };
  const [createPayment, setCreatePayment] = useState(false);

  const onOkConfirm = () => {
    let fulfillment = CreateFulFillmentRequest();
    (async () => {
      setCreatePayment(true);
      let request: any = {
        payments: paymentData.filter((payment) => payment.amount > 0),
        fulfillments: fulfillment,
      };
      let totalAmountCustomerNeedToPay = amount - getAmountPayment(request.payments);

      let valuesCalculateReturnAmount = {
        ...request,
        payments: reCalculatePaymentReturn(
          request.payments,
          totalAmountCustomerNeedToPay,
          paymentMethods,
        ).filter((payment) => payment.amount !== 0 || payment.paid_amount !== 0),
      };
      try {
        await dispatch(
          UpdatePaymentAction(
            valuesCalculateReturnAmount,
            props.order_id,
            onUpdateSuccess,
            onError,
          ),
        );
      } catch {
        onError(true);
      }
    })();
  };

  const onCancelConfirm = useCallback(() => {
    setVisibleConfirmPayment(false);
  }, []);

  const cancelPayment = () => {
    props.setVisibleUpdatePayment(false);
    setPaymentData([]);
    setShowPaymentPartialPayment && setShowPaymentPartialPayment(false);
  };

  const renderFullPaymentMethod = () => {
    return (
      <div className="create-order-payment 222">
        <OrderCreatePayments
          setPaymentMethod={setPaymentMethod}
          payments={paymentData}
          setPayments={setPaymentData}
          paymentMethod={paymentMethod}
          shipmentMethod={shipmentMethod}
          totalOrderAmount={Math.round(amount)}
          loyaltyRate={loyaltyRate}
          paymentMethods={paymentMethods}
          isDisablePostPayment={isDisablePostPayment}
          orderDetail={props.orderDetail}
        />
        {renderButtons()}
      </div>
    );
  };

  const renderButtons = () => {
    // note
    // if (paymentMethod === PaymentMethodOption.PRE_PAYMENT || true) {
    return (
      <Row className="createPaymentButtons" gutter={24}>
        <Col xs={24} lg={24}>
          <div>
            <Button
              type="primary"
              className="ant-btn-outline fixed-button text-right 66"
              onClick={ShowConfirmPayment}
              loading={createPayment}
            >
              Tạo thanh toán
            </Button>
            <Button
              type="default"
              className={`ant-btn-outline fixed-button text-right ${
                createPayment ? "disabled-cancel" : ""
              }`}
              onClick={cancelPayment}
              disabled={createPayment}
            >
              Hủy
            </Button>
          </div>
        </Col>
      </Row>
    );
  };

  const renderOnlyPaymentMethod = () => {
    return (
      <div className="create-order-payment 221">
        <OrderPayments
          payments={paymentData}
          setPayments={isPageOrderUpdate ? setPayments : setPaymentData}
          totalOrderAmount={amount}
          loyaltyRate={loyaltyRate}
          paymentMethods={paymentMethods}
          orderDetail={props.orderDetail}
        />
        {!isPageOrderUpdate && renderButtons()}
      </div>
    );
  };

  const renderPartialPayment = () => {
    const renderUpdatePayment = () => {
      if (props.isVisibleUpdatePayment) {
        return renderFullPaymentMethod();
      }
      return (
        <div className="showCreatePaymentButton">
          <label className="text-left showCreatePaymentButton__label"></label>
          <Button
            type="primary"
            className="ant-btn-outline fixed-button text-right 3 showCreatePaymentButton__button"
            onClick={ShowPayment}
            disabled={props.disabled}
          >
            Thanh toán
          </Button>
        </div>
      );
    };
    if (props.showPartialPayment) {
      return renderOnlyPaymentMethod();
    }
    return (
      <Card
        className="margin-top-20 orders-update-payment"
        title={
          <div className="d-flex updatePayment__title">
            <span className="title-card">THANH TOÁN</span>
          </div>
        }
      >
        {renderUpdatePayment()}
      </Card>
    );
  };

  useEffect(() => {
    if (createPayment) {
      disabledActions && disabledActions("payment");
    } else {
      disabledActions && disabledActions("none");
    }
  }, [createPayment, disabledActions]);

  useEffect(() => {
    dispatch(getLoyaltyRate(setLoyaltyRate));
  }, [dispatch]);

  return (
    <StyledComponent>
      <SaveAndConfirmOrder
        onCancel={onCancelConfirm}
        onOk={onOkConfirm}
        visible={visibleConfirmPayment}
        updateShipment={createPayment}
        icon={WarningIcon}
        okText="Đồng ý"
        cancelText="Hủy"
        title="Bạn muốn xác nhận thanh toán cho đơn hàng này?"
        text={textValue}
      />
      {renderPartialPayment()}
    </StyledComponent>
  );
}

export default UpdatePaymentCard;
