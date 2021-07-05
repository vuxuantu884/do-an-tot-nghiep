// @ts-ignore
import { Button, Card, Row, Col, Radio, InputNumber, Form, Space } from "antd";

import {
  BugOutlined,
  CreditCardOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";

import Cash from "component/icon/Cash";
import YdCoin from "component/icon/YdCoin";
// @ts-ignore
import { PaymentMethodGetList } from "domain/actions/order/order.action";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { PaymentMethodCode } from "utils/Constants";
import deleteIcon from "assets/icon/delete.svg";
import {
  formatCurrency,
  formatSuffixPoint,
  replaceFormat,
} from "utils/AppUtils";
import { OrderPaymentRequest } from "model/request/order.request";

type PaymentCardProps = {
  setSelectedPaymentMethod: (paymentType: number) => void;
  setPayments: (value: Array<OrderPaymentRequest>) => void;
  paymentMethod: number;
  amount: number;
};

const PaymentCard: React.FC<PaymentCardProps> = (props: PaymentCardProps) => {
  const changePaymentMethod = (value: number) => {
    props.setSelectedPaymentMethod(value);
    if (value === 2) {
      handlePickPaymentMethod("cash");
    }
  };

  const dispatch = useDispatch();
  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);

  const [paymentData, setPaymentData] = useState<Array<OrderPaymentRequest>>(
    []
  );

  const ListMaymentMethods = useMemo(() => {
    return listPaymentMethod.filter((item) => item.code !== "card");
  }, [dispatch, listPaymentMethod]);

  const handleInputPoint = (index: number, point: number) => {
    paymentData[index].point = point;
    paymentData[index].amount = point * 1000;
    setPaymentData([...paymentData]);
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
    let paymentMaster = ListMaymentMethods.find((p) => code === p.code);
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
      paymentData[index].amount = amount * 1000;
      paymentData[index].paid_amount = amount * 1000;
    } else {
      paymentData[index].amount = amount;
      paymentData[index].paid_amount = amount;
    }
    setPaymentData([...paymentData]);
    props.setPayments([...paymentData]);
  };

  console.log(listPaymentMethod);

  useEffect(() => {
    dispatch(PaymentMethodGetList(setListPaymentMethod));
  }, [dispatch]);

  return (
    <Card
      className="margin-top-20"
      title={
        <Space>
          <CreditCardOutlined />
          Thanh toán
        </Space>
      }
    >
      <div className="padding-20">
        <Form.Item
          label={<i>Lựa chọn 1 hoặc nhiều hình thức thanh toán</i>}
          required
        >
          <Radio.Group
            value={props.paymentMethod}
            onChange={(e) => changePaymentMethod(e.target.value)}
          >
            <Space size={20}>
              <Radio value={1}>COD</Radio>
              <Radio value={2}>Thanh toán trước</Radio>
              <Radio value={3}>Thanh toán sau</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Row
          gutter={24}
          className="payment-cod-box"
          hidden={props.paymentMethod !== 1}
        >
          <Col xs={24} lg={6}>
            <Form.Item label="Tiền thu hộ">
              <InputNumber
                placeholder="Nhập số tiền"
                className="form-control text-right hide-handler-wrap w-100"
                style={{ width: "100%" }}
                min={0}
                max={999999999999}
                value={props.amount}
                formatter={(value) => formatCurrency(value ? value : "0")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24} hidden={props.paymentMethod !== 2}>
          <Col xs={24} lg={24}>
            <div className="form-group form-group-with-search">
              <i>Lựa chọn 1 hoặc nhiều phương thức thanh toán trước *</i>
            </div>
          </Col>
          <Col xs={24} lg={24}>
            <Row
              className="btn-list-method"
              gutter={5}
              align="middle"
              style={{ marginLeft: 0, marginRight: 0 }}
            >
              {ListMaymentMethods.map((method, index) => {
                let icon = null;
                switch (method.code) {
                  case PaymentMethodCode.CASH:
                    icon = <Cash />;
                    break;
                  case PaymentMethodCode.CARD:
                  case PaymentMethodCode.BANK_TRANSFER:
                    icon = <CreditCardOutlined />;
                    break;
                  case PaymentMethodCode.QR_CODE:
                    icon = <QrcodeOutlined />;
                    break;
                  case PaymentMethodCode.POINT:
                    icon = <YdCoin />;
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
                      size="large"
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

          <Col span={12}>
            <Row
              gutter={24}
              className="row-price"
              style={{ padding: "5px 0px" }}
            >
              <Col xs={13} lg={15} className="row-large-title">
                Khách cần trả
              </Col>
              <Col
                className="lbl-money"
                xs={11}
                lg={6}
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
                  gutter={24}
                  className="row-price"
                  style={{ padding: "5px 0" }}
                  key={index}
                >
                  <Col xs={24} lg={15}>
                    <Row align="middle">
                      {method.name}
                      {method.code === PaymentMethodCode.POINT ? (
                        <div>
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
                              width: 100,
                              marginLeft: 7,
                              fontSize: 17,
                              paddingTop: 4,
                              paddingBottom: 4,
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
                            max={99999}
                            onChange={(value) => {
                              handleInputPoint(index, value);
                            }}
                          />
                        </div>
                      ) : null}
                    </Row>
                  </Col>
                  <Col className="lbl-money" xs={22} lg={6}>
                    <InputNumber
                      size="middle"
                      min={0}
                      max={999999999999}
                      value={method.amount}
                      disabled={method.code === PaymentMethodCode.POINT}
                      className="yody-payment-input hide-number-handle"
                      formatter={(value) => formatCurrency(value ? value : "0")}
                      placeholder="Nhập tiền mặt"
                      style={{ textAlign: "right", width: "100%" }}
                      onChange={(value) => handleInputMoney(index, value)}
                      onFocus={(e) => e.target.select()}
                    />
                  </Col>
                  <Col span={2} style={{ paddingLeft: 0 }}>
                    <Button
                      type="text"
                      className="p-0 m-0"
                      onClick={() => {
                        handlePickPaymentMethod(method.code);
                      }}
                    >
                      <img src={deleteIcon} alt="" />
                    </Button>
                  </Col>
                </Row>
              );
            })}
            <Row
              gutter={24}
              className="row-price total-customer-pay"
              style={{ marginLeft: 0, marginRight: 0 }}
            >
              <Col
                xs={13}
                lg={15}
                className="row-large-title"
                style={{ paddingLeft: 0 }}
              >
                Tổng số tiền khách trả
              </Col>
              <Col
                className="lbl-money"
                xs={11}
                lg={6}
                style={{
                  textAlign: "right",
                  fontWeight: 500,
                  fontSize: "20px",
                  paddingRight: 3,
                }}
              >
                <span>{formatCurrency(totalAmountPaid)}</span>
              </Col>
            </Row>
            <Row gutter={24} className="row-price" style={{ padding: "5px 0" }}>
              <Col xs={12} lg={15} className="row-large-title">
                {moneyReturn > 0 ? "Tiền thiếu" : "Tiền thừa"}
              </Col>
              <Col
                className="lbl-money"
                xs={12}
                lg={6}
                style={{
                  textAlign: "right",
                  fontWeight: 500,
                  fontSize: "20px",
                }}
              >
                <span style={{ color: moneyReturn <= 0 ? "blue" : "red" }}>
                  {formatCurrency(Math.abs(moneyReturn))}
                </span>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default PaymentCard;
