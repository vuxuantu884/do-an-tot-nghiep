// @ts-ignore
import { Button, Card, Col, Row } from "antd";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
import OrderCreatePayments from "component/order/OrderCreatePayments";
import OrderPayments from "component/order/OrderPayments";
import { getLoyaltyRate } from "domain/actions/loyalty/loyalty.action";
// @ts-ignore
import {
  UpdatePaymentAction
} from "domain/actions/order/order.action";
import {
  OrderPaymentRequest,
  UpdateFulFillmentRequest
} from "model/request/order.request";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  OrderStatus
} from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import SaveAndConfirmOrder from "../modal/save-confirm.modal";
import { StyledComponent } from "./update-payment-card.styles";

type PaymentCardUpdateProps = {
  setSelectedPaymentMethod: (paymentType: number) => void;
  setVisibleUpdatePayment: (value: boolean) => void;
  setShowPaymentPartialPayment?: (value: boolean) => void;
  setPayments: (value: Array<OrderPaymentRequest>) => void;
  setTotalPaid: (value: number) => void;
  reload?: () => void;
  disabledActions?: (type: string) => void;
  listPaymentMethods: PaymentMethodResponse[];
  orderDetail: OrderResponse;
  paymentMethod: number;
  shipmentMethod: number;
  order_id: number | null;
  showPartialPayment?: boolean;
  isVisibleUpdatePayment: boolean;
  amount: any;
  disabled?: boolean;
  isDisablePostPayment?: boolean;
};

const UpdatePaymentCard: React.FC<PaymentCardUpdateProps> = (
  props: PaymentCardUpdateProps
) => {
  const {
    disabledActions,
    listPaymentMethods,
    amount,
    setShowPaymentPartialPayment
  } = props;
  const dispatch = useDispatch();
  const [visibleConfirmPayment, setVisibleConfirmPayment] = useState(false);
  const [textValue, settextValue] = useState<string>("");
  const [paymentData, setPaymentData] = useState<Array<OrderPaymentRequest>>([]);

  const [loyaltyRate, setLoyaltyRate] = useState<LoyaltyRateResponse>();


  const ShowPayment = () => {
    props.setVisibleUpdatePayment(true);
  };

  const totalAmountPaid = useMemo(() => {
    let total = 0;
    paymentData.forEach((p) => (total = total + p.amount));
    return total;
  }, [paymentData]);

  const onUpdateSuccess = useCallback(
    (value: OrderResponse) => {
      showSuccess("Thanh toán thành công");
      setCreatePayment(false);
      console.log("onUpdateSuccess payment");
      // window.location.reload();
      setVisibleConfirmPayment(false);
      setPaymentData([]);
      props.reload && props.reload();
    },
    [props]
  );

  const onError = (error: boolean) => {
    if (error) {
      setVisibleConfirmPayment(false);
      setCreatePayment(false);
    }
  };

  const ShowConfirmPayment = () => {
    if (props.orderDetail.status === OrderStatus.FINALIZED) {
      settextValue(
        "Bạn không thay đổi được thông tin thanh toán của đơn sau khi xác nhận?"
      );
    } else {
      if (props.orderDetail.status === OrderStatus.DRAFT) {
        settextValue(
          "Đơn hàng sẽ được duyệt khi xác nhận thanh toán. Bạn không thay đổi được thông tin thanh toán của đơn sau khi xác nhận?"
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
    let listFullfillmentRequest = [];
    listFullfillmentRequest.push(request);
    return listFullfillmentRequest;
  };
  const [createPayment, setCreatePayment] = useState(false);

  const onOkConfirm = () => {
    let fulfillment = CreateFulFillmentRequest();
    let request: any = {
      payments: paymentData.filter((payment) => payment.amount > 0),
      fulfillments: fulfillment,
    };
    (async () => {
      setCreatePayment(true);
      try {
        await dispatch(
          UpdatePaymentAction(request, props.order_id, onUpdateSuccess, onError)
        );
      } catch {
        onError(true);
      }
    })();
    // dispatch(UpdatePaymentAction(request, props.order_id, onUpdateSuccess));
  };

  const onCancleConfirm = useCallback(() => {
    setVisibleConfirmPayment(false);
  }, []);

  const cancelPayment = () => {
    console.log('333')
    props.setVisibleUpdatePayment(false);
    setShowPaymentPartialPayment && setShowPaymentPartialPayment(false);
  };

  const renderPaymentMethod = () => {
    return (
      <div className="create-order-payment">
        <OrderPayments
          payments={paymentData}
          setPayments={setPaymentData}
          totalAmountOrder={amount}
          listPaymentMethod={listPaymentMethods}
          loyaltyRate ={loyaltyRate}
        />
        <Row gutter={24} style={{marginTop: "20px"}}>
          <Col xs={24} lg={24}>
            <div>
              <Button
                type="primary"
                className="ant-btn-outline fixed-button text-right"
                style={{float: "right", padding: "0 25px"}}
                htmlType="submit"
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
                style={{
                  float: "right",
                  marginRight: "10px",
                  padding: "0 25px",
                }}
                onClick={cancelPayment}
                disabled={createPayment}
              >
                Hủy
              </Button>
            </div>
          </Col>
        </Row>
      </div>
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
    props.setTotalPaid(totalAmountPaid);
  }, [props, totalAmountPaid]);

  useEffect(() => {
    dispatch(getLoyaltyRate(setLoyaltyRate));
  }, [dispatch]);

  console.log('props.isVisibleUpdatePayment', props.isVisibleUpdatePayment)

  return (
    <StyledComponent>
      <SaveAndConfirmOrder
        onCancel={onCancleConfirm}
        onOk={onOkConfirm}
        visible={visibleConfirmPayment}
        updateShipment={createPayment}
        icon={WarningIcon}
        okText="Đồng ý"
        cancelText="Hủy"
        title="Bạn muốn xác nhận thanh toán cho đơn hàng này?"
        text={textValue}
      />
      {/* {props.showPartialPayment &&  (
        <OrderCreatePayments
        setPaymentMethod={()=>{}}
        payments={paymentData}
        setPayments={setPaymentData}
        paymentMethod={props.paymentMethod}
        shipmentMethod={props.shipmentMethod}
        totalAmountOrder={amount}
        loyaltyRate={loyaltyRate}
        isDisablePostPayment={false}
        listPaymentMethod={listPaymentMethods}
      /> */}
      {/* )} */}
      {props.showPartialPayment === false && (
        <Card
          className="margin-top-20 orders-update-payment"
          title={
            <div className="d-flex" style={{marginTop: "5px", border: "none"}}>
              <span className="title-card">THANH TOÁN</span>
            </div>
          }
        >
          {props.isVisibleUpdatePayment === true &&
            renderPaymentMethod()}

          {props.isVisibleUpdatePayment === false && (
            <div>
              <label
                className="text-left"
                style={{marginTop: "20px", lineHeight: "40px"}}
              ></label>
              <Button
                type="primary"
                className="ant-btn-outline fixed-button text-right"
                style={{float: "right", padding: "0 25px"}}
                onClick={ShowPayment}
                disabled={props.disabled}
              >
                Thanh toán 2
              </Button>
            </div>
          )}
        </Card>
      )}
    </StyledComponent>
  );
};

export default UpdatePaymentCard;
