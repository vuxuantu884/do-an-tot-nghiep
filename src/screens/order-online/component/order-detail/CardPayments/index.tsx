import { BugOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Space,
} from "antd";
import Calculate from "assets/icon/caculate.svg";
import Cash from "component/icon/Cash";
import CreditCardOutlined from "component/icon/CreditCardOutlined";
import QrcodeOutlined from "component/icon/QrcodeOutlined";
import YdCoin from "component/icon/YdCoin";
import { PaymentMethodGetList } from "domain/actions/order/order.action";
import { OrderPaymentRequest } from "model/request/order.request";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { formatCurrency, formatSuffixPoint, replaceFormat } from "utils/AppUtils";
import {
  PaymentMethodCode,
  PaymentMethodOption,
  ShipmentMethodOption,
} from "utils/Constants";
import { StyledComponent } from "./styles";

const { Panel } = Collapse;

type CardPaymentsProps = {
  payments: OrderPaymentRequest[];
  paymentMethod: number;
  totalAmountCustomerNeedToPay: number;
  shipmentMethod: number;
  levelOrder?: number;
  updateOrder?: boolean;
  loyaltyRate?: LoyaltyRateResponse | null;
  isDisablePostPayment?: boolean;
  setPaymentMethod: (paymentType: number) => void;
  setPayments: (value: Array<OrderPaymentRequest>) => void;
};

/**
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
 * totalAmountCustomerNeedToPay: tiền khách phải trả
 *
 * shipmentMethod: phương thức đóng gói giao hàng để hiển thị thông báo
 */
function CardPayments(props: CardPaymentsProps): JSX.Element {
  const {
    totalAmountCustomerNeedToPay,
    levelOrder = 0,
    paymentMethod,
    payments,
    shipmentMethod,
    loyaltyRate,
    isDisablePostPayment = false,
    setPayments,
    setPaymentMethod,
  } = props;

  console.log("payments", payments);

  const changePaymentMethod = (value: number) => {
    setPaymentMethod(value);
    if (value === 2) {
      handlePickPaymentMethod(value);
    } else {
      setPayments([]);
    }
  };

  const dispatch = useDispatch();
  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);

  const ListPaymentMethods = useMemo(() => {
    return listPaymentMethod.filter((item) => item.code !== PaymentMethodCode.CARD);
  }, [listPaymentMethod]);

  const usageRate = useMemo(() => {
    let usageRate =
      loyaltyRate === null || loyaltyRate === undefined ? 0 : loyaltyRate.usage_rate;
    return usageRate;
  }, [loyaltyRate]);

  const handleInputPoint = (index: number, point: number) => {
    payments[index].point = point;
    payments[index].amount = point * usageRate;
    payments[index].paid_amount = point * usageRate;
    payments[index].payment_method_code = PaymentMethodCode.POINT;
    setPayments([...payments]);
  };

  const handlePickPaymentMethod = (payment_method_id?: number) => {
    let paymentMaster = ListPaymentMethods.find((p) => payment_method_id === p.id);
    console.log("payment_method_id", payment_method_id);
    console.log("paymentMaster", paymentMaster);
    if (!paymentMaster) return;
    let indexPayment = payments.findIndex(
      (p) => p.payment_method_id === payment_method_id
    );
    if (indexPayment === -1) {
      payments.push({
        payment_method_id: paymentMaster.id,
        amount: 0,
        paid_amount: 0,
        return_amount: 0,
        status: "paid",
        name: paymentMaster.name,
        code: paymentMaster.code,
        payment_method: paymentMaster.name,
        reference: "",
        source: "",
        customer_id: 1,
        note: "",
        type: "",
      });
    } else {
      payments.splice(indexPayment, 1);
    }
    setPayments([...payments]);
  };

  const handleInputMoney = (index: number, amount: number) => {
    if (payments[index].code === PaymentMethodCode.POINT) {
      payments[index].point = amount;
      payments[index].amount = amount * usageRate;
      payments[index].paid_amount = amount * usageRate;
    } else {
      payments[index].amount = amount;
      payments[index].paid_amount = amount;
    }
    setPayments([...payments]);
  };

  const calculateMax = (totalAmount: number, index: number) => {
    let total = totalAmount;
    for (let i = 0; i < index; i++) {
      if (payments[i].code === PaymentMethodCode.POINT) {
        total = total - payments[i].point! * 1000;
      } else {
        total = total - payments[i].amount;
      }
    }
    return total;
  };

  const handleTransferReference = (index: number, value: string) => {
    const _paymentData = [...payments];
    _paymentData[index].reference = value;
    setPayments(_paymentData);
  };

  useEffect(() => {
    dispatch(PaymentMethodGetList(setListPaymentMethod));
  }, [dispatch]);

  console.log("levelOrder", levelOrder);

  return (
    <StyledComponent>
      <Card title="THANH TOÁN 3">
        <div className="create-order-payment ">
          <Form.Item
            // label={<i>Lựa chọn 1 hoặc nhiều hình thức thanh toán</i>}
            // required
            style={{ marginBottom: 0 }}
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
                <div className="order-cod-payment-footer" style={{ height: 83 }}>
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
            style={{ marginTop: 18 }}
          >
            <div style={{ padding: "0 24px", maxWidth: "100%" }}>
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
                  <div style={{ width: "1200px", maxWidth: "100%" }}>
                    <Row gutter={24}>
                      <Col lg={10} xxl={7} className="margin-top-bottom-10">
                        <div>
                          <span style={{ paddingRight: "20px" }}>
                            Tiền khách phải trả:{" "}
                          </span>
                          <strong>{formatCurrency(totalAmountCustomerNeedToPay)}</strong>
                        </div>
                      </Col>
                      <Col lg={10} xxl={7} className="margin-top-bottom-10">
                        <div>
                          <span style={{ paddingRight: "20px" }}>Còn phải trả: </span>
                          <strong>
                            {formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
                          </strong>
                        </div>
                      </Col>
                      <Divider style={{ margin: "10px 0" }} />
                      <Col xs={24} lg={24}>
                        <Row
                          className="btn-list-method"
                          gutter={5}
                          align="middle"
                          style={{ marginLeft: 0, marginRight: 0 }}
                        >
                          {ListPaymentMethods.map((method, index) => {
                            // console.log("method", method);
                            // console.log("paymentData", paymentData);
                            let icon = null;
                            switch (method.code) {
                              case PaymentMethodCode.CASH:
                                icon = <Cash paymentData={payments} method={method} />;
                                break;
                              case PaymentMethodCode.CARD:
                              case PaymentMethodCode.BANK_TRANSFER:
                                icon = (
                                  <CreditCardOutlined
                                    paymentData={payments}
                                    method={method}
                                  />
                                );
                                break;
                              case PaymentMethodCode.QR_CODE:
                                icon = (
                                  <QrcodeOutlined
                                    paymentData={payments}
                                    method={method}
                                  />
                                );
                                break;
                              case PaymentMethodCode.POINT:
                                icon = <YdCoin paymentData={payments} method={method} />;
                                break;
                              default:
                                icon = <BugOutlined />;
                                break;
                            }
                            return (
                              <Col key={method.code} className="btn-payment-method">
                                <Button
                                  style={{ display: "flex", padding: 10 }}
                                  type={
                                    payments.some(
                                      (p) =>
                                        p.code === method.code ||
                                        p.payment_method.toLowerCase() ===
                                          method.code.toLowerCase() ||
                                        p.payment_method_id === method.id
                                    )
                                      ? "primary"
                                      : "default"
                                  }
                                  value={method.id}
                                  icon={icon}
                                  onClick={() => {
                                    handlePickPaymentMethod(method.id);
                                  }}
                                  className=""
                                  disabled={levelOrder > 2}
                                >
                                  {method.name}
                                </Button>
                              </Col>
                            );
                          })}
                        </Row>
                      </Col>

                      <Col span={20} xs={20}>
                        <Row
                          gutter={24}
                          className="row-price"
                          style={{ height: 38, margin: "10px 0" }}
                        >
                          <Col
                            lg={15}
                            xxl={9}
                            className="row-large-title"
                            style={{ padding: "8px 0", marginLeft: 2 }}
                          >
                            <b>Khách cần trả:</b>
                          </Col>
                          <Col
                            className="lbl-money"
                            lg={6}
                            xxl={6}
                            style={{
                              textAlign: "right",
                              fontWeight: 500,
                              fontSize: "20px",
                            }}
                          >
                            <span className="t-result-blue">
                              {formatCurrency(totalAmountCustomerNeedToPay)}
                            </span>
                          </Col>
                        </Row>
                        {payments.map((method, index) => {
                          // console.log("paymentData", paymentData);
                          console.log("method", method);
                          return (
                            <Row
                              gutter={20}
                              className="row-price"
                              key={method.code}
                              style={{ margin: "10px 0" }}
                            >
                              <Col lg={15} xxl={9} style={{ padding: "0" }}>
                                <Row align="middle">
                                  <b style={{ padding: "8px 0" }}>
                                    {method.payment_method}:
                                  </b>
                                  {method.payment_method_code ===
                                  PaymentMethodCode.POINT ? (
                                    <Col className="point-spending">
                                      <span
                                        style={{
                                          marginLeft: 5,
                                        }}
                                      >
                                        {" "}
                                        (1 điểm = {formatCurrency(usageRate)}₫)
                                      </span>
                                      <InputNumber
                                        value={method.point}
                                        style={{
                                          width: 110,
                                          marginLeft: 12,
                                          borderRadius: 5,
                                        }}
                                        className="hide-number-handle"
                                        onFocus={(e) => e.target.select()}
                                        formatter={(value) =>
                                          formatSuffixPoint(value ? value : "0")
                                        }
                                        parser={(value) =>
                                          replaceFormat(value ? value : "0")
                                        }
                                        min={0}
                                        max={
                                          calculateMax(
                                            props.totalAmountCustomerNeedToPay,
                                            index
                                          ) / usageRate
                                        }
                                        onChange={(value) => {
                                          handleInputPoint(index, value);
                                        }}
                                        disabled={levelOrder > 2}
                                      />
                                    </Col>
                                  ) : null}

                                  {method.code === PaymentMethodCode.BANK_TRANSFER ? (
                                    <Col
                                      className="point-spending"
                                      style={{ marginLeft: 12 }}
                                      lg={14}
                                      xxl={14}
                                    >
                                      <Input
                                        placeholder="Tham chiếu"
                                        onChange={(e: any) =>
                                          handleTransferReference(index, e.target.value)
                                        }
                                        disabled={levelOrder > 2}
                                      />
                                    </Col>
                                  ) : null}
                                </Row>
                              </Col>
                              {method.code !== PaymentMethodCode.POINT ? (
                                <Col
                                  className="lbl-money"
                                  lg={6}
                                  xxl={6}
                                  style={{ marginLeft: 10 }}
                                >
                                  <InputNumber
                                    size="middle"
                                    min={0}
                                    max={calculateMax(
                                      props.totalAmountCustomerNeedToPay,
                                      index
                                    )}
                                    value={method.amount}
                                    disabled={
                                      method.code === PaymentMethodCode.POINT ||
                                      levelOrder > 2
                                    }
                                    className="yody-payment-input hide-number-handle"
                                    formatter={(value) =>
                                      formatCurrency(value ? value : "0")
                                    }
                                    placeholder="Nhập tiền mặt"
                                    style={{
                                      textAlign: "right",
                                      width: "100%",
                                      borderRadius: 5,
                                    }}
                                    onChange={(value) => handleInputMoney(index, value)}
                                    onFocus={(e) => e.target.select()}
                                  />
                                </Col>
                              ) : (
                                <Col
                                  className="lbl-money"
                                  lg={6}
                                  xxl={6}
                                  style={{
                                    padding: 8,
                                    textAlign: "right",
                                    marginLeft: 10,
                                  }}
                                >
                                  <span style={{ padding: "14px", lineHeight: 1 }}>
                                    {formatCurrency(method.amount)}
                                  </span>
                                </Col>
                              )}
                            </Row>
                          );
                        })}
                        <Row
                          gutter={20}
                          className="row-price"
                          style={{ height: 38, margin: "10px 0 0 0" }}
                        >
                          <Col lg={15} xxl={9} style={{ padding: "8px 0" }}>
                            <b>{true ? "Còn phải trả:" : "Tiền thừa:"}</b>
                          </Col>
                          <Col
                            className="lbl-money"
                            lg={6}
                            xxl={6}
                            style={{
                              textAlign: "right",
                              fontWeight: 500,
                              fontSize: "20px",
                            }}
                          >
                            <span style={{ color: false ? "blue" : "red" }}>
                              {formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
                            </span>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                </Panel>
              </Collapse>
            </div>
          </Row>
        </div>
      </Card>
    </StyledComponent>
  );
}

export default CardPayments;
