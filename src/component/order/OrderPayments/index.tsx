import {BugOutlined} from "@ant-design/icons";
import {Button, Col, Input, InputNumber, Row} from "antd";
import Cash from "component/icon/Cash";
import CreditCardOutlined from "component/icon/CreditCardOutlined";
import QrcodeOutlined from "component/icon/QrcodeOutlined";
import YdCoin from "component/icon/YdCoin";
import {OrderPaymentRequest} from "model/request/order.request";
import {LoyaltyRateResponse} from "model/response/loyalty/loyalty-rate.response";
import {PaymentMethodResponse} from "model/response/order/paymentmethod.response";
import {useMemo} from "react";
import {formatCurrency, formatSuffixPoint, replaceFormat} from "utils/AppUtils";
import {PaymentMethodCode} from "utils/Constants";
import {StyledComponent} from "./styles";

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
 * loyaltyRate: điểm loyalty
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

  console.log("props222", props);

  const usageRate = useMemo(() => {
    let usageRate =
      loyaltyRate === null || loyaltyRate === undefined ? 0 : loyaltyRate.usage_rate;
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
    console.log("payments", payments);
    setPayments([...payments]);
  };
  console.log("payments", payments);
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

  console.log("levelOrder", levelOrder);
  console.log("ListPaymentMethods", ListPaymentMethods);

  return (
    <StyledComponent>
      <Col xs={24} lg={24}>
        <Row
          className="btn-list-method"
          gutter={5}
          align="middle"
          style={{marginLeft: 0, marginRight: 0}}
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
                icon = <CreditCardOutlined paymentData={payments} method={method} />;
                break;
              case PaymentMethodCode.QR_CODE:
                icon = <QrcodeOutlined paymentData={payments} method={method} />;
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
                  style={{display: "flex", padding: 10}}
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
        <Row gutter={24} className="row-price" style={{height: 38, margin: "10px 0"}}>
          <Col
            lg={15}
            xxl={9}
            className="row-large-title"
            style={{padding: "8px 0", marginLeft: 2}}
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
            <span className="t-result-blue">{formatCurrency(totalAmountOrder)}</span>
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
              style={{margin: "10px 0"}}
            >
              <Col lg={15} xxl={9} style={{padding: "0"}}>
                <Row align="middle">
                  <b style={{padding: "8px 0"}}>{method.payment_method}:</b>
                  {method.code === PaymentMethodCode.POINT ? (
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
                        formatter={(value) => formatSuffixPoint(value ? value : "0")}
                        parser={(value) => replaceFormat(value ? value : "0")}
                        min={0}
                        max={
                          calculateMax(totalAmountCustomerNeedToPay, index) / usageRate
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
                      style={{marginLeft: 12}}
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
                <Col className="lbl-money" lg={6} xxl={6} style={{marginLeft: 10}}>
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
                  className="lbl-money"
                  lg={6}
                  xxl={6}
                  style={{
                    padding: 8,
                    textAlign: "right",
                    marginLeft: 10,
                  }}
                >
                  <span style={{padding: "14px", lineHeight: 1}}>
                    {formatCurrency(method.amount)}
                  </span>
                </Col>
              )}
            </Row>
          );
        })}
        <Row gutter={20} className="row-price" style={{height: 38, margin: "10px 0 0 0"}}>
          <Col lg={15} xxl={9} style={{padding: "8px 0"}}>
            <b>{totalAmountCustomerNeedToPay >= 0 ? "Còn phải trả:" : "Tiền thừa:"}</b>
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
            <span style={{color: totalAmountCustomerNeedToPay < 0 ? "blue" : "red"}}>
              {formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
            </span>
          </Col>
        </Row>
      </Col>
    </StyledComponent>
  );
}

export default OrderPayments;
