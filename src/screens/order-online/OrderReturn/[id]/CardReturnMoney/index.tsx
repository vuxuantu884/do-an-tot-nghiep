import { Button, Card, Col, Collapse, Divider, Row, Switch } from "antd";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useState } from "react";
import { formatCurrency } from "utils/AppUtils";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
};
function CardReturnMoney(props: PropType) {
  const { listPaymentMethods } = props;

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
                      {/* <strong>{formatCurrency(props.amount)}</strong> */}
                    </div>
                  </Col>
                  <Col lg={10} xxl={7} className="margin-top-bottom-10">
                    <div>
                      <span style={{ paddingRight: "20px" }}>
                        Còn phải trả:{" "}
                      </span>
                      {/* <strong>{formatCurrency(Math.abs(moneyReturn))}</strong> */}
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
                      {listPaymentMethods.map((method, index) => {
                        // console.log("method", method);
                        // console.log("paymentData", paymentData);
                        let icon = null;
                        return (
                          <Col key={method.code} className="btn-payment-method">
                            <Button
                              style={{ display: "flex", padding: 10 }}
                              type="default"
                              value={method.id}
                              icon={icon}
                              onClick={() => {
                                // handlePickPaymentMethod(method.code);
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
                          {/* {formatCurrency(props.amount)} */}
                        </span>
                      </Col>
                    </Row>
                    {/* {paymentData.map((method, index) => {
                        // console.log("paymentData", paymentData);
                        // console.log("method", method);
                        return (
                          <Row
                            gutter={20}
                            className="row-price"
                            key={index}
                            style={{ margin: "10px 0" }}
                          >
                            <Col lg={15} xxl={9} style={{ padding: "0" }}>
                              <Row align="middle">
                                <b style={{ padding: "8px 0" }}>
                                  {method.name}:
                                </b>
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
                                      value={
                                        // method.point
                                        isCloneOrder
                                          ? method.amount / 1000
                                          : method.point
                                      }
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
                                        calculateMax(props.amount, index) / 1000
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
                                lg={6}
                                xxl={6}
                                style={{ marginLeft: 10 }}
                              >
                                <InputNumber
                                  size="middle"
                                  min={0}
                                  max={calculateMax(props.amount, index)}
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
                                lg={6}
                                xxl={6}
                                style={{
                                  padding: 8,
                                  textAlign: "right",
                                  marginLeft: 10,
                                }}
                              >
                                <span
                                  style={{ padding: "14px", lineHeight: 1 }}
                                >
                                  {formatCurrency(method.amount)}
                                </span>
                              </Col>
                            )}
                          </Row>
                        );
                      })} */}
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
                          {/* {formatCurrency(Math.abs(moneyReturn))} */}
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
