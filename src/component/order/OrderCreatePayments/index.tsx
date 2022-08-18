import { Col, Collapse, Divider, Form, Radio, Row, Space } from "antd";
import Calculate from "assets/icon/caculate.svg";
import OrderPayments from "component/order/OrderPayments";
import { OrderPaymentRequest } from "model/request/order.request";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useMemo } from "react";
import { formatCurrency, getAmountPayment, isOrderFinishedOrCancel } from "utils/AppUtils";
import { PaymentMethodOption, ShipmentMethodOption } from "utils/Constants";
import { StyledComponent } from "./styles";

const { Panel } = Collapse;

type PropTypes = {
  payments: OrderPaymentRequest[];
  paymentMethod: number;
  totalOrderAmount: number;
  shipmentMethod: number;
  levelOrder?: number;
  isOrderReturnFromPOS?: boolean;
  loyaltyRate?: LoyaltyRateResponse | null;
  isDisablePostPayment?: boolean;
  paymentMethods: PaymentMethodResponse[];
  setPaymentMethod: (paymentType: number) => void;
  setPayments: (value: Array<OrderPaymentRequest>) => void;
  orderDetail?: OrderResponse | null;
};

/**
 * component dùng trong trang tạo đơn, chi tiết đơn hàng (đơn nháp), update đơn hàng, đổi trả đơn hàng
 *
 * isDisablePostPayment: disable thanh toán chưa xác định (trường hợp chọn thanh toán qua hvc)
 *
 * payments: payment mặc định (vd trường hợp clone đơn hàng)
 *
 * setPayments: xử lý khi điền payment
 *
 * loyaltyRate: điểm loyalty
 *
 * setPaymentMethod: xử lý khi chọn phương thức thanh toán
 *
 * paymentMethod: phương thức thanh toán mặc định (vd trường hợp clone đơn hàng)
 *
 * totalOrderAmount: tiền đơn hàng
 *
 * shipmentMethod: phương thức đóng gói giao hàng để hiển thị thông báo
 *
 * paymentMethods: danh sách payment method
 *
 */
function OrderCreatePayments(props: PropTypes): JSX.Element {
  const {
    totalOrderAmount,
    levelOrder = 0,
    paymentMethod,
    payments,
    shipmentMethod,
    loyaltyRate,
    isDisablePostPayment = false,
    paymentMethods,
    setPayments,
    setPaymentMethod,
    orderDetail,
    isOrderReturnFromPOS,
  } = props;

  const changePaymentMethod = (value: number) => {
    setPaymentMethod(value);
    if (value !== PaymentMethodOption.PRE_PAYMENT) {
      setPayments([]);
    }
  };

  /**
   * tổng số tiền đã trả
   */
  const totalAmountPayment = getAmountPayment(payments);

  const totalAmountCustomerNeedToPay = useMemo(() => {
    return totalOrderAmount - totalAmountPayment;
  }, [totalOrderAmount, totalAmountPayment]);

  console.log("totalAmountCustomerNeedToPay", totalAmountCustomerNeedToPay);
  console.log("totalAmountPayment", totalAmountPayment);
  console.log("totalOrderAmount", totalOrderAmount);

  const renderPaymentCodFooter = () => {
    if (paymentMethod === PaymentMethodOption.COD) {
      const content = {
        [ShipmentMethodOption.SELF_DELIVER]: (
          <span className="selfDeliverContent">
            Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span> để có thể nhập giá trị Tiền
            thu hộ
          </span>
        ),
        [ShipmentMethodOption.DELIVER_LATER]: (
          <span className="deliverLaterContent">
            Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span> để có thể nhập giá trị Tiền
            thu hộ
          </span>
        ),
        [ShipmentMethodOption.PICK_AT_STORE]: (
          <div className="pickAtStoreContent">
            <div className="pickAtStoreContent__icon">
              <div>
                <div>
                  <img src={Calculate} alt=""></img>
                </div>
              </div>
            </div>
            <span>
              <span>Khách hàng sẽ thanh toán tại quầy!</span>
            </span>
          </div>
        ),
      };
      let result = content[shipmentMethod];
      if (result) {
        return <div className="order-cod-payment-footer">{result}</div>;
      }
    }
  };

  return (
    <StyledComponent>
      <div className="create-order-payment 66">
        <Form.Item className="formItemCreatePayment">
          <Radio.Group
            value={paymentMethod}
            onChange={(e) => changePaymentMethod(e.target.value)}
            disabled={levelOrder > 2 || isOrderFinishedOrCancel(orderDetail)}
          >
            <Space size={20}>
              <Radio value={PaymentMethodOption.COD} disabled={isOrderReturnFromPOS}>
                COD
              </Radio>
              <Radio value={PaymentMethodOption.PRE_PAYMENT}>Thanh toán trước</Radio>
              <Radio
                value={PaymentMethodOption.POST_PAYMENT}
                disabled={isDisablePostPayment || isOrderReturnFromPOS}
              >
                Chưa xác định
              </Radio>
            </Space>
          </Radio.Group>
          {renderPaymentCodFooter()}
        </Form.Item>

        <Row
          className="rowPrePayment"
          gutter={24}
          hidden={paymentMethod !== PaymentMethodOption.PRE_PAYMENT}
        >
          <div className="rowPrePayment__inner">
            <Collapse className="orders-timeline 3" defaultActiveKey={["1"]} ghost>
              <Panel
                className="orders-timeline-custom orders-dot-status"
                header={
                  <span className="rowPrePayment__header">
                    Lựa chọn 1 hoặc nhiều phương thức thanh toán
                  </span>
                }
                key="1"
                showArrow={false}
                // disabled={levelOrder > 2}
              >
                <div className="rowPrePayment__content">
                  <Row gutter={24}>
                    <Col lg={10} xxl={7} className="margin-top-bottom-10">
                      <div>
                        <span className="amountTitle">Tiền khách phải trả: </span>
                        <strong>{formatCurrency(totalOrderAmount)}</strong>
                      </div>
                    </Col>
                    <Col lg={10} xxl={7} className="margin-top-bottom-10 55">
                      <div>
                        <span className="amountTitle">Còn phải trả: </span>
                        <strong>
                          {formatCurrency(
                            totalAmountCustomerNeedToPay > 0 ? totalAmountCustomerNeedToPay : 0,
                          )}
                        </strong>
                      </div>
                    </Col>
                    {totalAmountCustomerNeedToPay < 0 ? (
                      <Col lg={10} xxl={7} className="margin-top-bottom-10 55">
                        <div>
                          <span className="amountTitle">Tiền thừa: </span>
                          <strong className="change">
                            {formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
                          </strong>
                        </div>
                      </Col>
                    ) : null}
                    <Divider className="divider" />
                    <OrderPayments
                      payments={payments}
                      setPayments={setPayments}
                      totalOrderAmount={totalOrderAmount}
                      levelOrder={levelOrder}
                      loyaltyRate={loyaltyRate}
                      paymentMethods={paymentMethods}
                      orderDetail={orderDetail}
                    />
                  </Row>
                </div>
              </Panel>
            </Collapse>
          </div>
        </Row>
      </div>
    </StyledComponent>
  );
}

export default OrderCreatePayments;
