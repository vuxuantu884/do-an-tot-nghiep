// @ts-ignore
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
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  formatCurrency,
  formatSuffixPoint,
  replaceFormat,
} from "utils/AppUtils";
import {
  PaymentMethodCode,
  PaymentMethodOption,
  PointConfig,
  ShipmentMethodOption,
} from "utils/Constants";
import { StyledComponent } from "./styles";

const { Panel } = Collapse;

type CardPaymentProps = {
  setSelectedPaymentMethod: (paymentType: number) => void;
  payments: OrderPaymentRequest[];
  setPayments: (value: Array<OrderPaymentRequest>) => void;
  paymentMethod: number;
  amount: number;
  shipmentMethod: number;
};

const CardPayment: React.FC<CardPaymentProps> = (props: CardPaymentProps) => {
  const {
    paymentMethod,
    payments,
    setSelectedPaymentMethod,
    amount,
    setPayments,
    shipmentMethod,
  } = props;
  console.log("propsCardPayment", props);
  const [paymentData, setPaymentData] = useState<Array<OrderPaymentRequest>>(
    []
  );
  const changePaymentMethod = (value: number) => {
    setSelectedPaymentMethod(value);
    if (value === 2) {
      handlePickPaymentMethod(PaymentMethodCode.CASH);
    } else {
      setPaymentData([]);
      setPayments([]);
    }
  };

  const dispatch = useDispatch();
  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);

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
    setPayments([...paymentData]);
  };

  const totalAmountPaid = useMemo(() => {
    let total = 0;
    paymentData.forEach((p) => (total = total + p.amount));
    return total;
  }, [paymentData]);

  const moneyReturn = useMemo(() => {
    return amount - totalAmountPaid;
  }, [amount, totalAmountPaid]);

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
    setPayments([...paymentData]);
  };

  const calculateMax = (totalAmount: number, index: number) => {
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

  const renderListMethods = () => {
    console.log("ListPaymentMethods", ListPaymentMethods);
    return (
      <Row className="btn-list-method" gutter={5} align="middle">
        {ListPaymentMethods.map((method, index) => {
          let icon = null;
          switch (method.code) {
            case PaymentMethodCode.CASH:
              icon = <Cash paymentData={paymentData} method={method} />;
              break;
            case PaymentMethodCode.CARD:
            case PaymentMethodCode.BANK_TRANSFER:
              icon = (
                <CreditCardOutlined paymentData={paymentData} method={method} />
              );
              break;
            case PaymentMethodCode.QR_CODE:
              icon = (
                <QrcodeOutlined paymentData={paymentData} method={method} />
              );
              break;
            case PaymentMethodCode.POINT:
              icon = <YdCoin paymentData={paymentData} method={method} />;
              break;
            default:
              icon = <BugOutlined />;
              break;
          }
          return (
            <Col key={method.code} className="btn-payment-method">
              <Button
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
    );
  };

  const renderPayment = () => {
    return (
      <React.Fragment>
        {paymentData.map((method, index) => {
          return (
            <Row gutter={20} className="row-price" key={index}>
              <Col lg={14} xxl={9}>
                <Row align="middle">
                  <b>{method.name}:</b>
                  {method.code === PaymentMethodCode.POINT ? (
                    <Col className="point-spending">
                      <span>(1 điểm = 1,000₫)</span>
                      <InputNumber
                        value={method.point}
                        className="hide-number-handle"
                        onFocus={(e) => e.target.select()}
                        formatter={(value) =>
                          formatSuffixPoint(value ? value : "0")
                        }
                        parser={(value) => replaceFormat(value ? value : "0")}
                        min={0}
                        max={calculateMax(amount, index) / 1000}
                        onChange={(value) => {
                          handleInputPoint(index, value);
                        }}
                      />
                    </Col>
                  ) : null}

                  {method.code === PaymentMethodCode.BANK_TRANSFER ? (
                    <Col className="point-spending" lg={14} xxl={14}>
                      <Input
                        placeholder="Tham chiếu"
                        onChange={(e: any) =>
                          handleTransferReference(index, e.target.value)
                        }
                      />
                    </Col>
                  ) : null}
                </Row>
              </Col>
              {method.code !== PaymentMethodCode.POINT ? (
                <Col className="lbl-money" lg={9} xxl={6}>
                  <InputNumber
                    size="middle"
                    min={0}
                    max={calculateMax(amount, index)}
                    value={method.amount}
                    disabled={method.code === PaymentMethodCode.POINT}
                    className="yody-payment-input hide-number-handle"
                    formatter={(value) => formatCurrency(value ? value : "0")}
                    placeholder="Nhập tiền mặt"
                    onChange={(value) => handleInputMoney(index, value)}
                    onFocus={(e) => e.target.select()}
                  />
                </Col>
              ) : (
                <Col className="lbl-money" lg={9} xxl={6}>
                  <span>{formatCurrency(method.amount)}</span>
                </Col>
              )}
            </Row>
          );
        })}
      </React.Fragment>
    );
  };

  useEffect(() => {
    dispatch(PaymentMethodGetList(setListPaymentMethod));
  }, [dispatch]);

  useEffect(() => {
    if (paymentMethod === 2) {
      handlePickPaymentMethod(PaymentMethodCode.CASH);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  useEffect(() => {
    if (payments) {
      setPaymentData(payments);
    }
  }, [payments]);

  return (
    <StyledComponent>
      <Card
        className="margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THANH TOÁN</span>
          </div>
        }
      >
        <div className="padding-20 create-order-payment">
          <Form.Item>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => changePaymentMethod(e.target.value)}
            >
              <Space size={20} className="selectPaymentMethod">
                <Radio value={PaymentMethodOption.COD}>COD</Radio>
                <Radio value={PaymentMethodOption.PREPAYMENT}>
                  Thanh toán trước 3
                </Radio>
                <Radio value={PaymentMethodOption.POSTPAYMENT}>
                  Chưa xác định
                </Radio>
              </Space>
            </Radio.Group>
            {paymentMethod === PaymentMethodOption.COD &&
              shipmentMethod === ShipmentMethodOption.SELF_DELIVER && (
                <div className="order-cod-payment-footer">
                  <span>
                    Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span>{" "}
                    để có thể nhập giá trị Tiền thu hộ
                  </span>
                </div>
              )}
            {paymentMethod === PaymentMethodOption.COD &&
              shipmentMethod === ShipmentMethodOption.DELIVER_LATER && (
                <div className="order-cod-payment-footer">
                  <span>
                    Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span>{" "}
                    để có thể nhập giá trị Tiền thu hộ
                  </span>
                </div>
              )}
            {paymentMethod === PaymentMethodOption.COD &&
              shipmentMethod === ShipmentMethodOption.PICK_AT_STORE && (
                <div className="order-cod-payment-footer">
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
          >
            <div>
              <Collapse
                className="orders-timeline"
                defaultActiveKey={["1"]}
                ghost
              >
                <Panel
                  className="orders-timeline-custom orders-dot-status"
                  header="Lựa chọn 1 hoặc nhiều phương thức thanh toán 3"
                  key="1"
                  showArrow={false}
                >
                  <Row gutter={24}>
                    <Col lg={10} xxl={7} className="margin-top-bottom-10">
                      <div>
                        <span>Tiền khách phải trả: </span>
                        <strong>{formatCurrency(amount)}</strong>
                      </div>
                    </Col>
                    <Col lg={10} xxl={7} className="margin-top-bottom-10">
                      <div>
                        <span>Còn phải trả: </span>
                        <strong>{formatCurrency(Math.abs(moneyReturn))}</strong>
                      </div>
                    </Col>
                    <Divider />
                    <Col xs={24} lg={24}>
                      {renderListMethods()}
                    </Col>

                    <Col span={20} xs={20}>
                      <Row gutter={24} className="row-price">
                        <Col lg={14} xxl={9} className="row-large-title">
                          <b>Khách cần trả: 2</b>
                        </Col>
                        <Col className="lbl-money" lg={9} xxl={6}>
                          <span className="t-result-blue">
                            {formatCurrency(amount)}
                          </span>
                        </Col>
                      </Row>
                      {renderPayment()}
                      <Row gutter={20} className="row-price">
                        <Col lg={14} xxl={9}>
                          <b>{true ? "Còn phải trả:" : "Tiền thừa:"}</b>
                        </Col>
                        <Col className="lbl-money" lg={9} xxl={6}>
                          <span style={{ color: false ? "blue" : "red" }}>
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
    </StyledComponent>
  );
};

export default CardPayment;
