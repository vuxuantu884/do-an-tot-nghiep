// import { BugOutlined } from "@ant-design/icons";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Input, InputNumber, Row } from "antd";
// import Cash from "component/icon/Cash";
// import CreditCardOutlined from "component/icon/CreditCardOutlined";
// import QrcodeOutlined from "component/icon/QrcodeOutlined";
// import YdCoin from "component/icon/YdCoin";
import { OrderPaymentRequest } from "model/request/order.request";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useMemo } from "react";
import { formatCurrency, formatSuffixPoint, replaceFormat } from "utils/AppUtils";
import { PaymentMethodCode } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropType = {
  payments: OrderPaymentRequest[];
  totalAmountOrder: number;
  levelOrder?: number;
  loyaltyRate?: LoyaltyRateResponse | null;
  listPaymentMethod: PaymentMethodResponse[];
  setPayments: (value: Array<OrderPaymentRequest>) => void;
};

/**
 * payments: payment mặc định (vd trường hợp clone đơn hàng)
 *
 * listPaymentMethod: danh sách payment method
 *
 * setPayments: xử lý khi điền payment
 *
 * loyaltyRate:  loyalty
 *
 * totalAmountOrder: tiền đơn hàng
 *
 * levelOrder: phân quyền
 */
function OrderPayments(props: PropType): JSX.Element {
  const {
    totalAmountOrder,
    levelOrder = 0,
    payments,
    loyaltyRate,
    listPaymentMethod,
    setPayments,
  } = props;

  const ListPaymentMethods = useMemo(() => {
    return listPaymentMethod.filter((item) => item.code !== PaymentMethodCode.CARD);
  }, [listPaymentMethod]);

  // console.log("props222", props);

  const usageRate = useMemo(() => {
    let usageRate = loyaltyRate?.usage_rate ? loyaltyRate.usage_rate : 0;
    return usageRate;
  }, [loyaltyRate]);
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

  const handleInputPoint = (index: number, point: number) => {
    payments[index].point = point;
    payments[index].amount = point * usageRate;
    payments[index].paid_amount = point * usageRate;
    payments[index].payment_method_code = PaymentMethodCode.POINT;
    setPayments([...payments]);
  };

  const handlePickPaymentMethod = (payment_method_id?: number) => {
    let paymentMaster = ListPaymentMethods.find((p) => payment_method_id === p.id);
    if (!paymentMaster) return;
    let indexPayment = payments.findIndex((p) => p.payment_method_id === payment_method_id);
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

  const handleTransferReference = (index: number, value: string) => {
    const _paymentData = [...payments];
    _paymentData[index].reference = value;
    setPayments(_paymentData);
  };

  const handleInputMonney = (code?: string) => {
    if (code && code.length === 0) return;
    let paymentCopy: OrderPaymentRequest[] = payments;
    let indexPayment = paymentCopy.findIndex(x => x.code === code);

    if (indexPayment !== -1 && totalAmountCustomerNeedToPay >= 0) {

      if (paymentCopy[indexPayment].code === PaymentMethodCode.POINT) {

        let addPoint = Math.round(totalAmountCustomerNeedToPay / usageRate);
        let point = paymentCopy[indexPayment].point ? paymentCopy[indexPayment].point : 0 + addPoint;

        paymentCopy[indexPayment].point = point;

        let amount = paymentCopy[indexPayment].amount + (addPoint * usageRate);
        let paid_amount = paymentCopy[indexPayment].paid_amount + (addPoint * usageRate);

        paymentCopy[indexPayment].amount = amount;
        paymentCopy[indexPayment].paid_amount = paid_amount;

      }

      else {
        let amount = paymentCopy[indexPayment].amount + totalAmountCustomerNeedToPay;
        let paid_amount = paymentCopy[indexPayment].paid_amount + totalAmountCustomerNeedToPay;

        paymentCopy[indexPayment].amount = amount;
        paymentCopy[indexPayment].paid_amount = paid_amount;
      }

    }

    setPayments([...paymentCopy])
  }

  return (
    <StyledComponent>
      <Col span={24} style={{ padding: 0 }}>
        <div style={{ margin: "6px 12px" }}>
          <Divider />
        </div>
        <Row
          className="btn-list-method"
          gutter={5}
          align="middle"
          style={{ marginLeft: 0, marginRight: 0 }}>
          {ListPaymentMethods.map((method, index) => {
            // let icon = null;
            // switch (method.code) {
            //   case PaymentMethodCode.CASH:
            //     icon = <Cash paymentData={payments} method={method} />;
            //     break;
            //   case PaymentMethodCode.CARD:
            //   case PaymentMethodCode.BANK_TRANSFER:
            //     icon = <CreditCardOutlined paymentData={payments} method={method} />;
            //     break;
            //   case PaymentMethodCode.QR_CODE:
            //     icon = <QrcodeOutlined paymentData={payments} method={method} />;
            //     break;
            //   case PaymentMethodCode.POINT:
            //     icon = <YdCoin paymentData={payments} method={method} />;
            //     break;
            //   default:
            //     icon = <BugOutlined />;
            //     break;
            // }
            return (
              <Col key={method.code} className="btn-payment-method">
                <Button
                  type={
                    payments.some(
                      (p) =>
                        p.code === method.code ||
                        p.payment_method.toLowerCase() === method.code.toLowerCase() ||
                        p.payment_method_id === method.id
                    )
                      ? "primary"
                      : "default"
                  }
                  value={method.id}
                  // icon={icon}
                  onClick={() => {
                    handlePickPaymentMethod(method.id);
                  }}
                  disabled={levelOrder > 2}>
                  {method.name}
                </Button>
              </Col>
            );
          })}
        </Row>
      </Col>

      <Col span={24}>
        <Row gutter={24} style={{ margin: "8px 0", alignItems: "center" }}>
          <Col span={10} style={{ padding: "0" }}>
            <b>Khách cần trả:</b>
          </Col>
          <Col
            span={14}
            style={{
              textAlign: "right",
              fontWeight: 500,
              fontSize: "20px",
              padding: "0",
            }}>
            <span className="t-result-blue">{formatCurrency(totalAmountOrder)}</span>
          </Col>
        </Row>

        {/* {payments.map((method, index) => {
          return (
            <Row
              gutter={20}
              key={index}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                margin: "4px 0",
              }}>
              <Col span={16} style={{ display: "flex", alignItems: "center" }}>
                <Col span={10} style={{ padding: 0 }}>
                  <div style={{ fontWeight: 500, color: "#2a2a86" }}>{method.payment_method}:</div>
                  {method.code === PaymentMethodCode.POINT && (
                    <i
                      style={{
                        fontSize: 12,
                        color: "#2a2a86",
                      }}>
                      (1 điểm = {formatCurrency(usageRate)}₫)
                    </i>
                  )}
                </Col>
                {method.code === PaymentMethodCode.POINT ? (
                  <Col span={14}>
                    <InputNumber
                      value={method.point}
                      style={{
                        width: "100%",
                        borderRadius: 3,
                      }}
                      className="hide-number-handle"
                      onFocus={(e) => e.target.select()}
                      formatter={(value) => formatSuffixPoint(value ? value : "0")}
                      parser={(value) => replaceFormat(value ? value : "0")}
                      min={0}
                      max={totalAmountOrder / usageRate}
                      onChange={(value) => {
                        handleInputPoint(index, value);
                      }}
                      disabled={levelOrder > 2}
                    />
                  </Col>
                ) : null}

                {method.code === PaymentMethodCode.BANK_TRANSFER ? (
                  <Col span={14}>
                    <Input
                      placeholder="Tham chiếu"
                      onChange={(e: any) => handleTransferReference(index, e.target.value)}
                      disabled={levelOrder > 2}
                    />
                  </Col>
                ) : null}
              </Col>

              {method.code !== PaymentMethodCode.POINT ? (
                <Col span={8}>
                  <InputNumber
                    size="middle"
                    min={0}
                    max={totalAmountOrder}
                    value={method.amount}
                    disabled={method.code === PaymentMethodCode.POINT || levelOrder > 2}
                    className="yody-payment-input hide-number-handle"
                    formatter={(value) => formatCurrency(value ? value : "0")}
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
                  span={8}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}>
                  <div
                    style={{
                      padding: "0 11px",
                      width: "100%",
                      textAlign: "right",
                    }}>
                    {formatCurrency(method.amount)}
                  </div>
                </Col>
              )}
            </Row>
          );
        })} */}

        {payments.map((method, index) => {
          return (
            <Row
              gutter={20}
              className="row-price"
              key={index}
              style={{ justifyContent: "space-between", margin: "8px 0" }}>
              <Col lg={15} xxl={9} style={{ padding: "0" }}>
                <Row align="middle">
                  <b style={{ padding: "8px 0" }}>{method.payment_method}:</b>
                  {method.code === PaymentMethodCode.POINT ? (
                    <Col className="point-spending">
                      <span
                        style={{
                          fontSize: 14,
                          marginLeft: 5,
                          textAlign: "end",
                        }}>
                        {" "}
                        (1 điểm = {formatCurrency(usageRate)}₫)
                      </span>
                      <InputNumber
                        value={method.point}
                        style={{
                          width: 46,
                          marginLeft: 12,
                          borderRadius: 5,
                        }}
                        className="hide-number-handle"
                        onFocus={(e) => e.target.select()}
                        formatter={(value) => formatSuffixPoint(value ? value : "0")}
                        parser={(value) => replaceFormat(value ? value : "0")}
                        min={0}
                        max={totalAmountOrder / usageRate}
                        onChange={(value) => {
                          handleInputPoint(index, value);
                        }}
                        disabled={levelOrder > 2}
                      />
                    </Col>
                  ) : null}

                  {method.code === PaymentMethodCode.BANK_TRANSFER ? (
                    <Col className="point-spending" style={{ marginLeft: 12 }} lg={14} xxl={14}>
                      <Input
                        style={{ width: 114, height: 32 }}
                        placeholder="Tham chiếu"
                        onChange={(e: any) => handleTransferReference(index, e.target.value)}
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
                  style={{ padding: 0, marginLeft: 10, textAlign: "end" }}>
                  <Input.Group compact>
                    <InputNumber
                      size="middle"
                      min={0}
                      max={totalAmountOrder}
                      value={method.amount}
                      disabled={method.code === PaymentMethodCode.POINT || levelOrder > 2}
                      className="yody-payment-input hide-number-handle"
                      formatter={(value) => formatCurrency(value ? value : "0")}
                      placeholder="Nhập tiền mặt"
                      style={{
                        textAlign: "right",
                        width: 84,
                        height: 32,
                        borderRadius: 5,
                      }}
                      onChange={(value) => handleInputMoney(index, value)}
                      onFocus={(e) => e.target.select()}
                    />
                    <Button
                      style={{ width: 32, height: 32, lineHeight: "unset", margin: 0 }}
                      type="default"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => {
                        handleInputMonney(method.code)
                      }}
                    ></Button>
                  </Input.Group>
                </Col>
              ) : (
                <Col
                  className="lbl-money"
                  lg={6}
                  xxl={6}
                  style={{
                    padding: "8px 0",
                    textAlign: "right",
                    marginLeft: 10,
                  }}>
                  <span style={{ padding: "0px", lineHeight: 1 }}>
                    {formatCurrency(method.amount)}
                  </span>
                </Col>
              )}
            </Row>
          );
        })}

        <Row gutter={24} style={{ margin: "8px 0", alignItems: "center" }}>
          <Col span={10} style={{ padding: "0" }}>
            <b>{totalAmountCustomerNeedToPay >= 0 ? "Còn phải trả:" : "Tiền thừa:"}</b>
          </Col>
          <Col
            span={14}
            style={{
              textAlign: "right",
              fontWeight: 500,
              fontSize: "20px",
              padding: 0,
            }}>
            <span style={{ color: totalAmountCustomerNeedToPay < 0 ? "blue" : "red" }}>
              {formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
            </span>
          </Col>
        </Row>
      </Col>
    </StyledComponent>
  );
}

export default OrderPayments;
