import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Input,
  InputNumber,
  Row,
} from "antd";
import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useState } from "react";
import {
  formatCurrency,
  formatSuffixPoint,
  replaceFormat,
} from "utils/AppUtils";
import { PaymentMethodCode, PointConfig } from "utils/Constants";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  amountReturn: number;
  payments: OrderPaymentRequest[];
  handlePayments: (value: Array<OrderPaymentRequest>) => void;
};
function CardReturnMoney(props: PropType) {
  const { listPaymentMethods, amountReturn, payments, handlePayments } = props;

  const totalAmountReturn = () => {
    let total = 0;
    payments.forEach((p) => (total = total + p.amount));
    return total;
  };

  const calculateMoneyReturnLeft = () => {
    return amountReturn - totalAmountReturn();
  };

  const handlePickPaymentMethod = (code?: string) => {
    let paymentMaster = listPaymentMethods.find((p) => code === p.code);
    if (!paymentMaster) return;
    let indexPayment = payments.findIndex((p) => p.code === code);
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
    handlePayments([...payments]);
  };

  const handleInputPayment = (value: number, paymentIndex: number) => {
    console.log("payments", payments);
    if (paymentIndex >= 0) {
      if (payments[paymentIndex].code === PaymentMethodCode.POINT) {
        payments[paymentIndex].point = value;
        payments[paymentIndex].amount = value * PointConfig.VALUE;
        payments[paymentIndex].paid_amount = value * PointConfig.VALUE;
      } else {
        payments[paymentIndex].amount = value;
        payments[paymentIndex].paid_amount = value;
      }
      handlePayments([...payments]);
    }
  };

  const handleTransferReference = (index: number, value: string) => {
    const _paymentData = [...payments];
    _paymentData[index].reference = value;
    handlePayments(_paymentData);
  };

  const calculateMaxInputValue = (indexPayment: number) => {
    let totalReturnLeft = amountReturn;
    for (let i = 0; i < payments.length; i++) {
      if (i !== indexPayment) {
        totalReturnLeft = amountReturn - payments[i].amount;
      }
    }
    return totalReturnLeft;
  };

  const renderPaymentMethodsTitle = () => {
    return (
      <React.Fragment>
        {listPaymentMethods.map((method, index) => {
          let icon = null;
          return (
            <Col key={method.code} className="btn-payment-method">
              <Button
                style={{ display: "flex", padding: 10 }}
                type="default"
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
      </React.Fragment>
    );
  };

  const renderListPayments = () => {
    if (payments.length === 0) {
      return;
    }
    /**
     * index is index-number of list payments, using to calculate
     */
    const renderPaymentByUsingPoint = (
      method: OrderPaymentRequest,
      index: number
    ) => {
      if (method.code === PaymentMethodCode.POINT) {
        return (
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
              formatter={(value) => formatSuffixPoint(value ? value : "0")}
              parser={(value) => replaceFormat(value ? value : "0")}
              min={0}
              max={calculateMaxInputValue(index) / 1000}
              onChange={(value) => {
                handleInputPayment(value, index);
              }}
            />
          </Col>
        );
      }
    };
    return (
      <React.Fragment>
        {payments.map((method, index) => {
          return (
            <Row
              gutter={20}
              className="row-price"
              key={index}
              style={{ margin: "10px 0" }}
            >
              <Col lg={15} xxl={9} style={{ padding: "0" }}>
                <Row align="middle">
                  <b style={{ padding: "8px 0" }}>{method.name}:</b>
                  {renderPaymentByUsingPoint(method, index)}

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
                    max={calculateMaxInputValue(index)}
                    value={method.amount}
                    disabled={method.code === PaymentMethodCode.POINT}
                    className="yody-payment-input hide-number-handle"
                    formatter={(value) => formatCurrency(value ? value : "0")}
                    placeholder="Nhập tiền mặt"
                    style={{
                      textAlign: "right",
                      width: "100%",
                      borderRadius: 5,
                    }}
                    onChange={(value) => handleInputPayment(value, index)}
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
      </React.Fragment>
    );
  };

  return (
    <Card className="margin-top-20" title="Hoàn tiền">
      <Row gutter={24}>
        <div style={{ padding: "0 24px", maxWidth: "100%" }}>
          <Collapse className="orders-timeline" defaultActiveKey={["1"]} ghost>
            <Collapse.Panel
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
              <div style={{ width: "1200px", maxWidth: "100%" }}>
                <Row gutter={24}>
                  <Col lg={10} xxl={7} className="margin-top-bottom-10">
                    <div>
                      <span style={{ paddingRight: "20px" }}>
                        Tiền trả khách:
                      </span>
                      <strong>{formatCurrency(amountReturn)}</strong>
                    </div>
                  </Col>
                  <Col lg={10} xxl={7} className="margin-top-bottom-10">
                    <div>
                      <span style={{ paddingRight: "20px" }}>
                        Còn phải trả:{" "}
                      </span>
                      <strong>
                        {formatCurrency(Math.abs(calculateMoneyReturnLeft()))}
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
                      {renderPaymentMethodsTitle()}
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
                        <b>Tiền trả khách:</b>
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
                          {formatCurrency(amountReturn)}
                        </span>
                      </Col>
                    </Row>
                    {renderListPayments()}
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
                          {formatCurrency(Math.abs(calculateMoneyReturnLeft()))}
                        </span>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </Collapse.Panel>
          </Collapse>
        </div>
      </Row>
    </Card>
  );
}

export default CardReturnMoney;
