// @ts-ignore
import {
  Button,
  Card,
  Row,
  Col,
  Radio,
  InputNumber,
  Form,
  Space,
  Collapse,
  Divider,
  Input,
} from "antd";

import { BugOutlined } from "@ant-design/icons";
import Cash from "component/icon/Cash";
import YdCoin from "component/icon/YdCoin";
import CreditCardOutlined from "component/icon/CreditCardOutlined";
import QrcodeOutlined from "component/icon/QrcodeOutlined";
import Caculate from "assets/icon/caculate.svg";

// @ts-ignore
import { PaymentMethodGetList } from "domain/actions/order/order.action";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  PaymentMethodCode,
  PaymentMethodOption,
  PointConfig,
  ShipmentMethodOption,
} from "utils/Constants";
import {
  formatCurrency,
  formatSuffixPoint,
  replaceFormat,
} from "utils/AppUtils";
import { OrderPaymentRequest } from "model/request/order.request";
const { Panel } = Collapse;

type PaymentCardProps = {
  setSelectedPaymentMethod: (paymentType: number) => void;
  setPayments: (value: Array<OrderPaymentRequest>) => void;
  paymentMethod: number;
  amount: number;
  shipmentMethod: number;
};

const PaymentCard: React.FC<PaymentCardProps> = (props: PaymentCardProps) => {
  const changePaymentMethod = (value: number) => {
    props.setSelectedPaymentMethod(value);
    if (value === 2) {
      handlePickPaymentMethod(PaymentMethodCode.CASH);
    }
  };

  const dispatch = useDispatch();
  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);

  const [paymentData, setPaymentData] = useState<Array<OrderPaymentRequest>>(
    []
  );

  const ListPaymentMethods = useMemo(() => {
    return listPaymentMethod.filter(
      (item) => item.code !== PaymentMethodCode.CARD
    );
  }, [listPaymentMethod]);

  const handleInputPoint = (index: number, point: number) => {
    paymentData[index].point = point;
    paymentData[index].amount = point * PointConfig.VALUE;
    paymentData[index].paid_amount = point * PointConfig.VALUE;
    setPaymentData([...paymentData]);
    props.setPayments([...paymentData]);
  };

  const totalAmountPaid = useMemo(() => {
    let total = 0;
    paymentData.forEach((p) => (total = total + p.amount));
    return total;
  }, [paymentData]);

  const moneyReturn = useMemo(() => {
    return props.amount - totalAmountPaid;
  }, [props.amount, totalAmountPaid]);

  const handlePickPaymentMethod = (code?: string) => {
    let paymentMaster = ListPaymentMethods.find((p) => code === p.code);
    if (!paymentMaster) return;
    let indexPayment = paymentData.findIndex((p) => p.code === code);
    if (indexPayment === -1) {
      paymentData.push({
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
      paymentData.splice(indexPayment, 1);
    }
    setPaymentData([...paymentData]);
  };

  const handleInputMoney = (index: number, amount: number) => {
    if (paymentData[index].code === PaymentMethodCode.POINT) {
      paymentData[index].point = amount;
      paymentData[index].amount = amount * PointConfig.VALUE;
      paymentData[index].paid_amount = amount * PointConfig.VALUE;
    } else {
      paymentData[index].amount = amount;
      paymentData[index].paid_amount = amount;
    }
    setPaymentData([...paymentData]);
    props.setPayments([...paymentData]);
  };

  const caculateMax = (totalAmount: number, index: number) => {
    let total = totalAmount;
    for (let i = 0; i < index; i++) {
      if (paymentData[i].code === PaymentMethodCode.POINT) {
        total = total - paymentData[i].point! * 1000;
      } else {
        total = total - paymentData[i].amount;
      }
    }
    return total;
  };

  const handleTransferReference = (index: number, value: string) => {
    const _paymentData = [...paymentData];
    _paymentData[index].reference = value;
    setPaymentData(_paymentData);
  };

  useEffect(() => {
    dispatch(PaymentMethodGetList(setListPaymentMethod));
  }, [dispatch]);

  return (
    <Card
      className="margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">THANH TOÁN</span>
        </div>
      }
    >
      <div className="padding-20 create-order-payment">
        <Form.Item
          // label={<i>Lựa chọn 1 hoặc nhiều hình thức thanh toán</i>}
          // required
        >
          <Radio.Group
            value={props.paymentMethod}
            onChange={(e) => changePaymentMethod(e.target.value)}
            style={{ margin: "18px 0" }}
          >
            <Space size={20}>
              <Radio value={PaymentMethodOption.COD}>COD</Radio>
              <Radio value={PaymentMethodOption.PREPAYMENT}>
                Thanh toán trước
              </Radio>
              <Radio value={PaymentMethodOption.POSTPAYMENT}>
                Chưa xác định
              </Radio>
            </Space>
          </Radio.Group>
          {props.paymentMethod === PaymentMethodOption.COD &&
            props.shipmentMethod === ShipmentMethodOption.SELFDELIVER && (
              <div className="order-cod-payment-footer">
                <span>
                  Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span> để
                  có thể nhập giá trị Tiền thu hộ
                </span>
              </div>
            )}
            {props.paymentMethod === PaymentMethodOption.COD &&
            props.shipmentMethod === ShipmentMethodOption.DELIVERLATER && (
              <div className="order-cod-payment-footer">
                <span>
                  Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span> để
                  có thể nhập giá trị Tiền thu hộ
                </span>
              </div>
            )}
          {props.paymentMethod === PaymentMethodOption.COD &&
            props.shipmentMethod === ShipmentMethodOption.PICKATSTORE && (
              <div className="order-cod-payment-footer" style={{ height: 83 }}>
                <div>
                  <div>
                    <div>
                      <img src={Caculate}></img>
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
          hidden={props.paymentMethod !== PaymentMethodOption.PREPAYMENT}
        >
          <div style={{ padding: "0 24px" }}>
            <Collapse
              className="orders-timeline"
              defaultActiveKey={["1"]}
              ghost
            >
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
              >
                <Row gutter={24}>
                  <Col lg={10} xxl={7} className="margin-top-bottom-10">
                    <div>
                      <span style={{ paddingRight: "20px" }}>
                        Tiền khách phải trả:{" "}
                      </span>
                      <strong>{formatCurrency(props.amount)}</strong>
                    </div>
                  </Col>
                  <Col lg={10} xxl={7} className="margin-top-bottom-10">
                    <div>
                      <span style={{ paddingRight: "20px" }}>
                        Còn phải trả:{" "}
                      </span>
                      <strong>{formatCurrency(Math.abs(moneyReturn))}</strong>
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
                        let icon = null;
                        switch (method.code) {
                          case PaymentMethodCode.CASH:
                            icon = (
                              <Cash paymentData={paymentData} method={method} />
                            );
                            break;
                          case PaymentMethodCode.CARD:
                          case PaymentMethodCode.BANK_TRANSFER:
                            icon = (
                              <CreditCardOutlined
                                paymentData={paymentData}
                                method={method}
                              />
                            );
                            break;
                          case PaymentMethodCode.QR_CODE:
                            icon = (
                              <QrcodeOutlined
                                paymentData={paymentData}
                                method={method}
                              />
                            );
                            break;
                          case PaymentMethodCode.POINT:
                            icon = (
                              <YdCoin
                                paymentData={paymentData}
                                method={method}
                              />
                            );
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
                                paymentData.some((p) => p.code === method.code)
                                  ? "primary"
                                  : "default"
                              }
                              value={method.id}
                              icon={icon}
                              onClick={() => {
                                handlePickPaymentMethod(method.code);
                              }}
                              className=""
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
                        lg={14}
                        xxl={9}
                        className="row-large-title"
                        style={{ padding: "8px 0", marginLeft: 2 }}
                      >
                        <b>Khách cần trả:</b>
                      </Col>
                      <Col
                        className="lbl-money"
                        lg={9}
                        xxl={6}
                        style={{
                          textAlign: "right",
                          fontWeight: 500,
                          fontSize: "20px",
                        }}
                      >
                        <span className="t-result-blue">
                          {formatCurrency(props.amount)}
                        </span>
                      </Col>
                    </Row>
                    {paymentData.map((method, index) => {
                      return (
                        <Row
                          gutter={20}
                          className="row-price"
                          key={index}
                          style={{ margin: "10px 0" }}
                        >
                          <Col lg={14} xxl={9} style={{ padding: "0" }}>
                            <Row align="middle">
                              <b style={{ padding: "8px 0" }}>{method.name}:</b>
                              {method.code === PaymentMethodCode.POINT ? (
                                <Col className="point-spending">
                                  <span
                                    style={{
                                      fontSize: 14,
                                      marginLeft: 5,
                                    }}
                                  >
                                    {" "}
                                    (1 điểm = 1,000₫)
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
                                      caculateMax(props.amount, index) / 1000
                                    }
                                    onChange={(value) => {
                                      handleInputPoint(index, value);
                                    }}
                                  />
                                </Col>
                              ) : null}

                              {method.code ===
                              PaymentMethodCode.BANK_TRANSFER ? (
                                <Col
                                  className="point-spending"
                                  style={{ marginLeft: 12 }}
                                  lg={14}
                                  xxl={14}
                                >
                                  <Input
                                    placeholder="Tham chiếu"
                                    onChange={(e: any) =>
                                      handleTransferReference(
                                        index,
                                        e.target.value
                                      )
                                    }
                                  />
                                </Col>
                              ) : null}
                            </Row>
                          </Col>
                          {method.code !== PaymentMethodCode.POINT ? (
                            <Col
                              className="lbl-money"
                              lg={9}
                              xxl={6}
                              style={{ marginLeft: 10 }}
                            >
                              <InputNumber
                                size="middle"
                                min={0}
                                max={caculateMax(props.amount, index)}
                                value={method.amount}
                                disabled={
                                  method.code === PaymentMethodCode.POINT
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
                                onChange={(value) =>
                                  handleInputMoney(index, value)
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            </Col>
                          ) : (
                            <Col
                              className="lbl-money"
                              lg={9}
                              xxl={6}
                              style={{
                                padding: 8,
                                textAlign: "right",
                                marginLeft: 10,
                              }}
                            >
                              <span
                                style={{ padding: "14px 14px", lineHeight: 1 }}
                              >
                                {formatCurrency(method.amount)}
                              </span>
                            </Col>
                          )}
                        </Row>
                      );
                    })}

                    {/* <Row
                      gutter={20}
                      className="row-price total-customer-pay"
                      style={{ height: 38, margin: "10px 0" }}
                    >
                      <Col
                        lg={14}
                        xxl={9}
                        className="row-large-title"
                        style={{ padding: "8px 0" }}
                      >
                        <b>Tổng số tiền khách trả:</b>
                      </Col>
                      <Col
                        className="lbl-money"
                        lg={9}
                        xxl={6}
                        style={{
                          textAlign: "right",
                          fontWeight: 500,
                          fontSize: "20px",
                        }}
                      >
                        <span>{formatCurrency(totalAmountPaid)}</span>
                      </Col>
                    </Row> */}
                    <Row
                      gutter={20}
                      className="row-price"
                      style={{ height: 38, margin: "10px 0 0 0" }}
                    >
                      <Col lg={14} xxl={9} style={{ padding: "8px 0" }}>
                        <b>
                          {true ? "Còn phải trả:" : "Tiền thừa:"}
                        </b>
                      </Col>
                      <Col
                        className="lbl-money"
                        lg={9}
                        xxl={6}
                        style={{
                          textAlign: "right",
                          fontWeight: 500,
                          fontSize: "20px",
                        }}
                      >
                        <span
                          style={{ color: false ? "blue" : "red" }}
                        >
                          {formatCurrency(Math.abs(moneyReturn))}
                        </span>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Panel>
            </Collapse>
          </div>
        </Row>
      </div>
    </Card>
  );
};

export default PaymentCard;
