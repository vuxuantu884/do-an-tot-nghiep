import {Col, Collapse, Divider, Form, Radio, Row, Space} from "antd";
import OrderPayments from "../OrderPayments";
import {OrderPaymentRequest} from "model/request/order.request";
import {LoyaltyRateResponse} from "model/response/loyalty/loyalty-rate.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import {useMemo} from "react";
import {formatCurrency} from "utils/AppUtils";
import {PaymentMethodOption} from "utils/Constants";
import {StyledComponent} from "./styles";

const {Panel} = Collapse;
type PropType = {
  payments: OrderPaymentRequest[];
  paymentMethod: number;
  totalAmountOrder: number;
  shipmentMethod: number;
  levelOrder?: number;
  updateOrder?: boolean;
  loyaltyRate?: LoyaltyRateResponse | null;
  isDisablePostPayment?: boolean;
  listPaymentMethod: PaymentMethodResponse[];
  setPaymentMethod: (paymentType: number) => void;
  setPayments: (value: Array<OrderPaymentRequest>) => void;
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
function OrderCreatePayments(props: PropType): JSX.Element {
  const {
    totalAmountOrder,
    levelOrder = 0,
    paymentMethod,
    payments,
    loyaltyRate,
    isDisablePostPayment = false,
    listPaymentMethod,
    setPayments,
    setPaymentMethod,
  } = props;


  const changePaymentMethod = (value: number) => {
    setPaymentMethod(value);
    if (value === 2) {
    } else {
      setPayments([]);
    }
  };

  // khách cần trả
  const getAmountPayment = (items: Array<OrderPaymentRequest> | null) => {
    let value = 0;
    if (items !== null) {
      if (items.length > 0) {
        items.forEach((a) => (value = value + a.paid_amount));
      }
    }
    return value;
  };

  /**
   * tổng số tiền đã trả
   */
  const totalAmountPayment = getAmountPayment(payments);

  const totalAmountCustomerNeedToPay = useMemo(() => {
    return totalAmountOrder - totalAmountPayment;
  }, [totalAmountOrder, totalAmountPayment]);

  return (
    <StyledComponent>
      <div className="create-order-payment padding-12">
        <Form.Item
          // label={<i>Lựa chọn 1 hoặc nhiều hình thức thanh toán</i>}
          // required
          style={{marginBottom: 0}}
        >
          <Radio.Group
            value={paymentMethod}
            onChange={(e) => changePaymentMethod(e.target.value)}
            disabled={levelOrder > 2}
          >
            <Space size={20}>
              <Radio value={PaymentMethodOption.COD}>COD</Radio>
              <Radio value={PaymentMethodOption.PREPAYMENT}>Thanh toán trước</Radio>
              <Radio
                value={PaymentMethodOption.POSTPAYMENT}
                disabled={isDisablePostPayment}
              >
                Chưa xác định
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Row
          gutter={24}
          hidden={paymentMethod !== PaymentMethodOption.PREPAYMENT}
          style={{marginTop: 18}}
        >
          <div style={{padding: "0 12px", maxWidth: "100%"}}>
            <Collapse className="orders-timeline" defaultActiveKey={["1"]} ghost>
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
                    <Col lg={10} xxl={7} className="margin-top-bottom-10">
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
                    <Divider style={{margin: "10px 0"}} />
                    <OrderPayments
                      payments={payments}
                      setPayments={setPayments}
                      totalAmountOrder={totalAmountOrder}
                      levelOrder={levelOrder}
                      loyaltyRate={loyaltyRate}
                      listPaymentMethod={listPaymentMethod}
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
