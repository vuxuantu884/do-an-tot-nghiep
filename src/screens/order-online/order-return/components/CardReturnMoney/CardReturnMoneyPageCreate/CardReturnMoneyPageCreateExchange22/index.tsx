import { BugOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Input,
  InputNumber,
  Radio,
  Row,
  Space,
} from "antd";
import Cash from "component/icon/Cash";
import YdCoin from "component/icon/YdCoin";
import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useMemo } from "react";
import {
  formatCurrency,
  formatSuffixPoint,
  replaceFormat,
} from "utils/AppUtils";
import { PaymentMethodCode, PointConfig } from "utils/Constants";
import { RETURN_MONEY_TYPE } from "utils/Order.constants";
import ReturnMoneySelect from "../../ReturnMoneySelect";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  payments: OrderPaymentRequest[];
  handlePayments: (value: Array<OrderPaymentRequest>) => void;
  totalAmountCustomerNeedToPay?: number;
  isExchange: boolean;
  isStepExchange: boolean;
  returnMoneyType?: string;
  setReturnMoneyType?: (value: string) => void;
  setReturnMoneyMethod: (value: PaymentMethodResponse) => void;
  setReturnMoneyNote: (value: string) => void;
  setReturnMoneyAmount?: (value: number) => void;
};

/**
 * input: listPaymentMethod, returnMoneyType
 * output: setReturnMoneyType
 */
function CardReturnMoneyPageCreate(props: PropType) {
  const {
    listPaymentMethods,
    payments,
    handlePayments,
    totalAmountCustomerNeedToPay,
    isExchange,
    isStepExchange,
    returnMoneyType,
    setReturnMoneyType,
    setReturnMoneyNote,
    setReturnMoneyMethod,
    setReturnMoneyAmount,
  } = props;

  const isReturnMoneyToCustomer =
    totalAmountCustomerNeedToPay !== undefined &&
    totalAmountCustomerNeedToPay <= 0;
  /**
   * payment method bỏ tiêu điểm và qr pay
   */
  const exceptMethods = [PaymentMethodCode.QR_CODE, PaymentMethodCode.POINT];

  let listPaymentMethodsFormatted = listPaymentMethods;
  if (isReturnMoneyToCustomer) {
    listPaymentMethodsFormatted = listPaymentMethods.filter((single) => {
      return !exceptMethods.includes(single.code);
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const totalAmountReturn = () => {
    let total = 0;
    payments.forEach((p) => (total = total + p.amount));
    return total;
  };

  const moneyReturnLeft = useMemo(() => {
    if (totalAmountCustomerNeedToPay === undefined) {
      return 0;
    }
    console.log("totalAmountCustomerNeedToPay", totalAmountCustomerNeedToPay);
    let result = 0;
    result =
      totalAmountCustomerNeedToPay > 0
        ? totalAmountCustomerNeedToPay - totalAmountReturn()
        : -totalAmountCustomerNeedToPay - totalAmountReturn();
    return result;
  }, [totalAmountCustomerNeedToPay, totalAmountReturn]);

  const handlePickPaymentMethod = (code?: string) => {
    if (isReturnMoneyToCustomer) {
      let paymentSelected = listPaymentMethodsFormatted.find(
        (p) => code === p.code
      );
      if (paymentSelected) {
        let abc = {
          payment_method_id: paymentSelected.id,
          amount: 0,
          paid_amount: 0,
          return_amount: 0,
          status: "paid",
          name: paymentSelected.name,
          code: paymentSelected.code,
          payment_method: paymentSelected.name,
          reference: "",
          source: "",
          customer_id: 1,
          note: "",
          type: "",
        };
        console.log("paymentSelected", paymentSelected);
        handlePayments([abc]);
      }
    } else {
      let paymentMaster = listPaymentMethodsFormatted.find(
        (p) => code === p.code
      );
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
    }
  };

  const handleInputPayment = (value: number, paymentIndex: number) => {
    if (paymentIndex >= 0) {
      if (payments[paymentIndex].code === PaymentMethodCode.POINT) {
        payments[paymentIndex].point = value;
        payments[paymentIndex].amount = value * PointConfig.VALUE;
        payments[paymentIndex].paid_amount = value * PointConfig.VALUE;
      } else {
        payments[paymentIndex].amount = value;
        payments[paymentIndex].paid_amount = value;
      }
      console.log("payments", payments);
      handlePayments([...payments]);
    }
  };

  const handleTransferReference = (index: number, value: string) => {
    const _paymentData = [...payments];
    _paymentData[index].reference = value;
    handlePayments(_paymentData);
  };

  const calculateMaxInputValue = (indexSelectedPayment: number) => {
    if (!totalAmountCustomerNeedToPay) return 0;
    let moneyReturnLeft =
      totalAmountCustomerNeedToPay > 0
        ? totalAmountCustomerNeedToPay
        : -totalAmountCustomerNeedToPay;
    let totalReturnLeft = moneyReturnLeft;
    for (let i = 0; i < payments.length; i++) {
      if (i !== indexSelectedPayment) {
        totalReturnLeft = moneyReturnLeft - payments[i].amount;
      }
    }
    return totalReturnLeft;
  };

  const renderPaymentMethodsTitle = () => {
    return (
      <React.Fragment>
        {listPaymentMethodsFormatted.map((method, index) => {
          let icon = null;
          switch (method.code) {
            case PaymentMethodCode.CASH:
              icon = <Cash paymentData={payments} method={method} />;
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
                  payments.some((p) => p.code === method.code)
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
                    // max={calculateMaxInputValue(index)}
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
    <Card
      className="margin-top-20"
      // title={<span className="title-card">Hoàn tiền</span>}
      title={
        <span className="title-card">
          {isReturnMoneyToCustomer ? "Hoàn tiền" : "Thanh toán"}
        </span>
      }
    >
      {isExchange && !isStepExchange && (
        <div className="padding-24">
          Đối với các đơn trả hàng để đổi hàng, bạn vui lòng thực hiện hoàn
          tiền/thanh toán trên đơn đổi hàng.
        </div>
      )}
      {isExchange && isStepExchange && (
        <div className="padding-24">
          <Row gutter={24}>
            <div style={{ padding: "0 24px", maxWidth: "100%" }}>
              <Collapse
                className="orders-timeline"
                defaultActiveKey={["1"]}
                ghost
              >
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
                      {isReturnMoneyToCustomer
                        ? `Lựa chọn phương thức hoàn tiền`
                        : `Lựa chọn 1 hoặc nhiều phương thức thanh toán`}
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
                            {isReturnMoneyToCustomer
                              ? " Tiền trả khách:"
                              : "Tổng tiền cần thanh toán 22"}
                          </span>
                          <strong>
                            {totalAmountCustomerNeedToPay &&
                              (totalAmountCustomerNeedToPay > 0
                                ? formatCurrency(totalAmountCustomerNeedToPay)
                                : formatCurrency(
                                    -totalAmountCustomerNeedToPay
                                  ))}
                          </strong>
                        </div>
                      </Col>
                      {!isReturnMoneyToCustomer && (
                        <Col lg={10} xxl={7} className="margin-top-bottom-10">
                          <div>
                            <span style={{ paddingRight: "20px" }}>
                              Còn lại
                            </span>
                            <strong>{formatCurrency(moneyReturnLeft)}</strong>
                          </div>
                        </Col>
                      )}
                      <Divider style={{ margin: "10px 0" }} />
                      <Col xs={24} lg={24}>
                        <div className="create-order-payment">
                          <Row
                            className="btn-list-method"
                            gutter={5}
                            align="middle"
                            style={{ marginLeft: 0, marginRight: 0 }}
                          >
                            {renderPaymentMethodsTitle()}
                          </Row>
                        </div>
                      </Col>

                      <Col span={20} xs={20}>
                        {!isReturnMoneyToCustomer && (
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
                              <b>
                                {isReturnMoneyToCustomer
                                  ? " Tiền trả khách:"
                                  : "Tổng tiền cần thanh toán:"}
                              </b>
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
                                {totalAmountCustomerNeedToPay &&
                                  (totalAmountCustomerNeedToPay > 0
                                    ? formatCurrency(
                                        totalAmountCustomerNeedToPay
                                      )
                                    : formatCurrency(
                                        -totalAmountCustomerNeedToPay
                                      ))}
                              </span>
                            </Col>
                          </Row>
                        )}
                        {!isReturnMoneyToCustomer && renderListPayments()}
                        {!isReturnMoneyToCustomer && (
                          <Row
                            gutter={20}
                            className="row-price"
                            style={{ height: 38, margin: "10px 0 0 0" }}
                          >
                            <Col lg={15} xxl={9} style={{ padding: "8px 0" }}>
                              <b>
                                {isReturnMoneyToCustomer
                                  ? "Còn phải trả khách:"
                                  : "Còn lại:"}
                              </b>
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
                                {formatCurrency(moneyReturnLeft)}
                              </span>
                            </Col>
                          </Row>
                        )}
                      </Col>
                    </Row>
                  </div>
                </Collapse.Panel>
              </Collapse>
            </div>
          </Row>
        </div>
      )}
      {!isExchange && (
        <div className="padding-20 create-order-payment">
          <Radio.Group
            value={returnMoneyType}
            onChange={(e) => {
              if (setReturnMoneyType) {
                setReturnMoneyType(e.target.value);
              }
            }}
            style={{ margin: "18px 0" }}
          >
            <Space size={20}>
              <Radio value={RETURN_MONEY_TYPE.return_now}>Hoàn tiền </Radio>
              <Radio value={RETURN_MONEY_TYPE.return_later}>
                Hoàn tiền sau 2
              </Radio>
            </Space>
          </Radio.Group>
          {returnMoneyType === RETURN_MONEY_TYPE.return_now && (
            <ReturnMoneySelect
              listPaymentMethods={listPaymentMethods}
              totalAmountCustomerNeedToPay={Math.round(moneyReturnLeft)}
              handleReturnMoney={() => {}}
              isShowButtonReturnMoney={false}
            />
          )}
        </div>
      )}
    </Card>
  );
}

export default CardReturnMoneyPageCreate;
