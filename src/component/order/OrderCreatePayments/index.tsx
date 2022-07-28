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
import { yellowColor } from "utils/global-styles/variables";
import { StyledComponent } from "./styles";

const {Panel} = Collapse;

type PropTypes = {
  payments: OrderPaymentRequest[];
  paymentMethod: number;
  totalAmountOrder: number;
  shipmentMethod: number;
  levelOrder?: number;
  updateOrder?: boolean;
  isOrderReturnFromPOS?: boolean;
  loyaltyRate?: LoyaltyRateResponse | null;
  isDisablePostPayment?: boolean;
  listPaymentMethod: PaymentMethodResponse[];
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
 * totalAmountOrder: tiền đơn hàng
 *
 * shipmentMethod: phương thức đóng gói giao hàng để hiển thị thông báo
 * 
 * listPaymentMethod: danh sách payment method
 *
 */
function OrderCreatePayments(props: PropTypes): JSX.Element {
  const {
    totalAmountOrder,
    levelOrder = 0,
    paymentMethod,
    payments,
    shipmentMethod,
    loyaltyRate,
    isDisablePostPayment = false,
    listPaymentMethod,
    setPayments,
    setPaymentMethod,
    orderDetail,
    isOrderReturnFromPOS,
  } = props;

  const changePaymentMethod = (value: number) => {
    setPaymentMethod(value);
    if (value === 2) {
    } else {
      setPayments([]);
    }
  };

  /**
   * tổng số tiền đã trả
   */
  const totalAmountPayment = getAmountPayment(payments);

  const totalAmountCustomerNeedToPay = useMemo(() => {
    return totalAmountOrder - totalAmountPayment;
  }, [totalAmountOrder, totalAmountPayment]);

  console.log('totalAmountCustomerNeedToPay', totalAmountCustomerNeedToPay)
  console.log('totalAmountPayment', totalAmountPayment)
  console.log('totalAmountOrder', totalAmountOrder)

  return (
    <StyledComponent>
      <div className="create-order-payment ">
        <Form.Item
          // label={<i>Lựa chọn 1 hoặc nhiều hình thức thanh toán</i>}
          // required
          style={{marginBottom: 0}}
        >
          <Radio.Group
            value={paymentMethod}
            onChange={(e) => changePaymentMethod(e.target.value)}
            disabled={levelOrder > 2 || isOrderFinishedOrCancel(orderDetail)}
          >
            <Space size={20}>
              <Radio value={PaymentMethodOption.COD} disabled={isOrderReturnFromPOS}>COD</Radio>
              <Radio value={PaymentMethodOption.PREPAYMENT}>Thanh toán trước</Radio>
              <Radio
                value={PaymentMethodOption.POSTPAYMENT}
                disabled={isDisablePostPayment || isOrderReturnFromPOS}
              >
                Chưa xác định
              </Radio>
            </Space>
          </Radio.Group>
          {paymentMethod === PaymentMethodOption.COD &&
            shipmentMethod === ShipmentMethodOption.SELF_DELIVER && (
              <div className="order-cod-payment-footer">
                <span>
                  Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span> để có thể
                  nhập giá trị Tiền thu hộ
                </span>
              </div>
            )}
          {paymentMethod === PaymentMethodOption.COD &&
            shipmentMethod === ShipmentMethodOption.DELIVER_LATER && (
              <div className="order-cod-payment-footer">
                <span>
                  Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span> để có thể
                  nhập giá trị Tiền thu hộ
                </span>
              </div>
            )}
          {paymentMethod === PaymentMethodOption.COD &&
            shipmentMethod === ShipmentMethodOption.PICK_AT_STORE && (
              <div className="order-cod-payment-footer" style={{height: 83}}>
                <div>
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
            )}
        </Form.Item>

        <Row
          gutter={24}
          hidden={paymentMethod !== PaymentMethodOption.PREPAYMENT}
          style={{marginTop: 18}}
        >
          <div style={{padding: "0 24px", maxWidth: "100%"}}>
            <Collapse className="orders-timeline 3" defaultActiveKey={["1"]} ghost>
              <Panel
                className="orders-timeline-custom orders-dot-status"
                header={
                  <span
                    style={{
                      textTransform: "uppercase",
                      fontWeight: 500,
                      color: "#222222",
                      padding: "6px",
                    }}
                  >
                    Lựa chọn 1 hoặc nhiều phương thức thanh toán
                  </span>
                }
                key="1"
                showArrow={false}
                // disabled={levelOrder > 2}
              >
                <div style={{width: "1200px", maxWidth: "100%"}}>
                  <Row gutter={24}>
                    <Col lg={10} xxl={7} className="margin-top-bottom-10">
                      <div>
                        <span style={{paddingRight: "20px"}}>Tiền khách phải trả: </span>
                        <strong>{formatCurrency(totalAmountOrder)}</strong>
                      </div>
                    </Col>
                    <Col lg={10} xxl={7} className="margin-top-bottom-10 55">
                      <div>
                        <span style={{paddingRight: "20px"}}>Còn phải trả: </span>
                        <strong>
                          {formatCurrency(
                            totalAmountCustomerNeedToPay > 0
                              ? totalAmountCustomerNeedToPay
                              : 0
                          )}
                        </strong>
                      </div>
                    </Col>
                    {totalAmountCustomerNeedToPay < 0 ? (
                      <Col lg={10} xxl={7} className="margin-top-bottom-10 55">
                      <div>
                        <span style={{paddingRight: "20px" }}>Tiền thừa: </span>
                        <strong style={{color: yellowColor}}>
                          {formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
                        </strong>
                      </div>
                    </Col>
                    ): null}
                    <Divider style={{margin: "10px 0"}} />
                    <OrderPayments
                      payments={payments}
                      setPayments={setPayments}
                      totalAmountOrder={totalAmountOrder}
                      levelOrder={levelOrder}
                      loyaltyRate={loyaltyRate}
                      listPaymentMethod={listPaymentMethod}
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
