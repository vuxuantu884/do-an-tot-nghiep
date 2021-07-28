// @ts-ignore
import {
  Button,
  Card,
  Row,
  Col,
  Radio,
  InputNumber,
  Space,
  Divider,
} from "antd";

import {
  BugOutlined,
  CreditCardOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";

import Cash from "component/icon/Cash";
import YdCoin from "component/icon/YdCoin";
// @ts-ignore
import {
  PaymentMethodGetList,
  UpdatePaymentAction,
} from "domain/actions/order/order.action";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  PointConfig,
} from "utils/Constants";
import {
  formatCurrency,
  formatSuffixPoint,
  replaceFormat,
} from "utils/AppUtils";
import {
  UpdateFulFillmentRequest,
  UpdateOrderPaymentRequest,
  UpdatePaymentRequest,
} from "model/request/order.request";
import { showSuccess } from "utils/ToastUtils";
import { OrderResponse } from "model/response/order/order.response";
import ConfirmPaymentModal from "../modal/confirm-payment.modal";

type PaymentCardUpdateProps = {
  setSelectedPaymentMethod: (paymentType: number) => void;
  setPayments: (value: Array<UpdateOrderPaymentRequest>) => void;
  setTotalPaid: (value: number) => void;
  orderDetail: OrderResponse;
  paymentMethod: number;
  amount: any;
  order_id: number | null;
  showPartialPayment?: boolean;
};

const UpdatePaymentCard: React.FC<PaymentCardUpdateProps> = (
  props: PaymentCardUpdateProps
) => {
  const changePaymentMethod = (value: number) => {
    props.setSelectedPaymentMethod(value);
    if (value === PaymentMethodOption.PREPAYMENT) {
      handlePickPaymentMethod(PaymentMethodCode.CASH);
    }
  };

  const dispatch = useDispatch();
  const [isibleConfirmPayment, setVisibleConfirmPayment] = useState(false);
  const [textValue, settextValue] = useState<string>("");
  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);

  const [paymentData, setPaymentData] = useState<
    Array<UpdateOrderPaymentRequest>
  >([]);

  const [isVisibleUpdatePayment, setVisibleUpdatePayment] = useState(false);

  const ShowPayment = () => {
    setVisibleUpdatePayment(true);
  };

  const ListMaymentMethods = useMemo(() => {
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
  props.setTotalPaid(totalAmountPaid);
  const handlePickPaymentMethod = (code?: string) => {
    let paymentMaster = ListMaymentMethods.find((p) => code === p.code);
    if (!paymentMaster) return;
    let indexPayment = paymentData.findIndex((p) => p.code === code);
    if (indexPayment === -1) {
      paymentData.push({
        order_id: null,
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
        customer_id: props.orderDetail.customer_id,
        note: "",
        type: "",
      });
    } else {
      paymentData.splice(indexPayment, 1);
    }
    setPaymentData([...paymentData]);
  };

  const handleInputMoney = (index: number, amount: number) => {
    if (amount > props.amount) amount = props.amount;
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

  const onUpdateSuccess = useCallback((value: OrderResponse) => {
    showSuccess("Thanh toán thành công");
    window.location.reload();
  }, []);

  const ShowConfirmPayment = () => {
    if (props.orderDetail.status === OrderStatus.FINALIZED) {
      settextValue(
        "Bạn không thay đổi được thông tin thanh toán của đơn sau khi xác nhận?"
      );
    } else {
      if (props.orderDetail.status === OrderStatus.DRAFT) {
        settextValue(
          "Đơn hàng sẽ được duyệt khi xác nhận thanh toán. Bạn không thay đổi được thông tin thanh toán của đơn sau khi xác nhận?"
        );
      }
    }
    setVisibleConfirmPayment(true);
  };

  const CreateFulFillmentRequest = () => {
    let request: UpdateFulFillmentRequest = {
      id: null,
      order_id: null,
      store_id: props.orderDetail?.store_id,
      account_code: props.orderDetail?.account_code,
      assignee_code: props.orderDetail?.assignee_code,
      delivery_type: "",
      stock_location_id: null,
      payment_status: "",
      total: null,
      total_tax: null,
      total_discount: null,
      total_quantity: null,
      discount_rate: null,
      discount_value: null,
      discount_amount: null,
      total_line_amount_after_line_discount: null,
      shipment: null,
      items: props.orderDetail?.items,
      shipping_fee_informed_to_customer: null,
    };
    let listFullfillmentRequest = [];
    listFullfillmentRequest.push(request);
    return listFullfillmentRequest;
  };

  const onOkConfirm = () => {
    let fulfillment = CreateFulFillmentRequest();
    let request: UpdatePaymentRequest = {
      payments: paymentData,
      fulfillments: fulfillment,
    };
    dispatch(UpdatePaymentAction(request, props.order_id, onUpdateSuccess));
  };

  const caculateMax = (totalAmount: number, index: number) => {
    let total = totalAmount;
    for (let i = 0; i < index; i++) {
      if (paymentData[i].code === PaymentMethodCode.POINT) {
        total = total - paymentData[i].point! * 1000;
      } else {
        console.log("test", total);
        total = total - paymentData[i].amount;
      }
    }
    return total;
  };

  const onCancleConfirm = useCallback(() => {
    setVisibleConfirmPayment(false);
  }, []);

  const canclePayment = () => {
    setVisibleUpdatePayment(false);
  };

  useEffect(() => {
    dispatch(PaymentMethodGetList(setListPaymentMethod));
  }, [dispatch]);

  return (
    <div>
      <ConfirmPaymentModal
        onCancel={onCancleConfirm}
        onOk={onOkConfirm}
        visible={isibleConfirmPayment}
        order_id={props.order_id}
        text={textValue}
      />
      {props.showPartialPayment === false && (
        <Card
          className="margin-top-20"
          title={
            <div className="d-flex" style={{ marginTop: "5px" }}>
              <span className="title-card">THANH TOÁN</span>
            </div>
          }
        >
          {isVisibleUpdatePayment === true && (
            <div className="padding-20">
              <Radio.Group
                value={props.paymentMethod}
                onChange={(e) => changePaymentMethod(e.target.value)}
                style={{ margin: "20px 0 20px 0" }}
              >
                <Space size={24}>
                  <Radio value={PaymentMethodOption.COD}>COD</Radio>
                  <Radio value={PaymentMethodOption.PREPAYMENT}>
                    Thanh toán trước
                  </Radio>
                  <Radio value={PaymentMethodOption.POSTPAYMENT}>
                    Thanh toán sau
                  </Radio>
                </Space>
              </Radio.Group>
              <Row gutter={24} hidden={props.paymentMethod !== 2}>
                <Col xs={24} lg={24}>
                  <div className="form-group form-group-with-search">
                    <i>Lựa chọn 1 hoặc nhiều phương thức thanh toán trước *</i>
                  </div>
                </Col>
                <Col xs={24} lg={24}>
                  <Row
                    className="btn-list-method"
                    gutter={8}
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
                <Col span={24}>
                  <Row
                    gutter={14}
                    className="row-price"
                    style={{ padding: "5px 0px" }}
                  >
                    <Col xs={9} className="row-large-title">
                      Khách cần trả
                    </Col>
                    <Col
                      className="lbl-money"
                      xs={5}
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
                        gutter={14}
                        className="row-price"
                        style={{ padding: "5px 0" }}
                        key={index}
                      >
                        <Col xs={9}>
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
                                  size="middle"
                                  style={{
                                    textAlign: "right",
                                    borderRadius: 5,
                                    marginLeft: "5px",
                                  }}
                                  className="yody-payment-input hide-number-handle"
                                  onFocus={(e) => e.target.select()}
                                  formatter={(value) =>
                                    formatSuffixPoint(value ? value : "0")
                                  }
                                  parser={(value) =>
                                    replaceFormat(value ? value : "0")
                                  }
                                  min={0}
                                  max={caculateMax(props.amount, index) / 1000}
                                  onChange={(value) => {
                                    handleInputPoint(index, value);
                                  }}
                                />
                              </div>
                            ) : null}
                          </Row>
                        </Col>
                        <Col className="lbl-money" xs={5}>
                          <InputNumber
                            size="middle"
                            min={0}
                            max={caculateMax(props.amount, index)}
                            value={method.amount}
                            disabled={method.code === PaymentMethodCode.POINT}
                            className="yody-payment-input hide-number-handle"
                            formatter={(value) =>
                              formatCurrency(value ? value : "0")
                            }
                            placeholder="Nhập tiền mặt"
                            style={{ textAlign: "right", width: "100%" }}
                            onChange={(value) => handleInputMoney(index, value)}
                            onFocus={(e) => e.target.select()}
                          />
                        </Col>
                        {/* <Col span={2} style={{ paddingLeft: 0 }}>
                      <Button
                        type="text"
                        className="p-0 m-0"
                        onClick={() => {
                          handlePickPaymentMethod(method.code);
                        }}
                      >
                        <img src={deleteIcon} alt="" />
                      </Button>
                    </Col> */}
                      </Row>
                    );
                  })}

                  <Row
                    gutter={12}
                    className="row-price total-customer-pay"
                    style={{ marginLeft: 0, marginRight: 0 }}
                  >
                    <Col
                      xs={9}
                      className="row-large-title"
                      style={{ paddingLeft: 0 }}
                    >
                      Tổng số tiền khách trả
                    </Col>
                    <Col
                      className="lbl-money"
                      xs={5}
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
                  <Row
                    gutter={12}
                    className="row-price"
                    style={{ padding: "5px 0" }}
                  >
                    <Col xs={9} className="row-large-title">
                      {moneyReturn > 0 ? "Còn phải trả" : "Tiền thừa"}
                    </Col>
                    <Col
                      className="lbl-money"
                      xs={5}
                      style={{
                        textAlign: "right",
                        fontWeight: 500,
                        fontSize: "20px",
                      }}
                    >
                      <span
                        style={{ color: moneyReturn <= 0 ? "blue" : "red" }}
                      >
                        {formatCurrency(Math.abs(moneyReturn))}
                      </span>
                    </Col>
                  </Row>

                  <Row gutter={24} style={{ marginTop: "20px" }}>
                    <Col xs={24}>
                      <div>
                        <Button
                          type="primary"
                          className="ant-btn-outline fixed-button text-right"
                          style={{ float: "right" }}
                          htmlType="submit"
                          onClick={ShowConfirmPayment}
                        >
                          Tạo thanh toán trước
                        </Button>
                        <Button
                          type="default"
                          className="ant-btn-outline fixed-button text-right"
                          style={{ float: "right", marginRight: "10px" }}
                          onClick={canclePayment}
                        >
                          Hủy
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          )}

          {isVisibleUpdatePayment === false && (
            <div className="padding-lef-right" style={{ paddingTop: "20px" }}>
              <label
                className="text-left"
                style={{ marginTop: "20px", lineHeight: "40px" }}
              >
                <i>Chưa tạo thanh toán</i>{" "}
              </label>
              <Button
                type="primary"
                className="ant-btn-outline fixed-button text-right"
                style={{ float: "right", marginBottom: "20px" }}
                onClick={ShowPayment}
              >
                Thanh toán
              </Button>
            </div>
          )}
        </Card>
      )}

      {props.showPartialPayment && (
        <div>
          <Divider style={{ margin: "0 0 10px 0" }} />
          <div style={{ padding: "0 20px 20px 20px" }}>
            <Radio.Group
              value={props.paymentMethod}
              onChange={(e) => changePaymentMethod(e.target.value)}
              style={{ margin: "20px 0 20px 0" }}
            >
              <Space size={24}>
                <Radio value={PaymentMethodOption.COD}>COD</Radio>
                <Radio value={PaymentMethodOption.PREPAYMENT}>
                  Thanh toán trước
                </Radio>
              </Space>
            </Radio.Group>
            {props.paymentMethod === 2 && (
              <Row gutter={24} hidden={props.paymentMethod !== 2}>
                <Col xs={24} lg={24}>
                  <div className="form-group form-group-with-search">
                    <i>Lựa chọn 1 hoặc nhiều phương thức thanh toán *</i>
                  </div>
                </Col>
                <Col xs={24} lg={24}>
                  <Row
                    className="btn-list-method"
                    gutter={8}
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

                <Col span={24}>
                  <Row
                    gutter={14}
                    className="row-price"
                    style={{ padding: "5px 0px" }}
                  >
                    <Col xs={9} className="row-large-title">
                      Khách cần trả
                    </Col>
                    <Col
                      className="lbl-money"
                      xs={5}
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
                        gutter={14}
                        className="row-price"
                        style={{ padding: "5px 0" }}
                        key={index}
                      >
                        <Col xs={9}>
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
                                  size="middle"
                                  style={{
                                    textAlign: "right",
                                    borderRadius: 5,
                                    marginLeft: "5px",
                                  }}
                                  className="yody-payment-input hide-number-handle"
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
                        <Col className="lbl-money" xs={5}>
                          <InputNumber
                            size="middle"
                            min={0}
                            max={999999999999}
                            value={method.amount}
                            disabled={method.code === PaymentMethodCode.POINT}
                            className="yody-payment-input hide-number-handle"
                            formatter={(value) =>
                              formatCurrency(value ? value : "0")
                            }
                            placeholder="Nhập tiền mặt"
                            style={{ textAlign: "right", width: "100%" }}
                            onChange={(value) => handleInputMoney(index, value)}
                            onFocus={(e) => e.target.select()}
                          />
                        </Col>
                      </Row>
                    );
                  })}

                  <Row
                    gutter={12}
                    className="row-price total-customer-pay"
                    style={{ marginLeft: 0, marginRight: 0 }}
                  >
                    <Col
                      xs={9}
                      className="row-large-title"
                      style={{ paddingLeft: 0 }}
                    >
                      Tổng số tiền khách trả
                    </Col>
                    <Col
                      className="lbl-money"
                      xs={5}
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
                  <Row
                    gutter={12}
                    className="row-price"
                    style={{ padding: "5px 0" }}
                  >
                    <Col xs={9} className="row-large-title">
                      {moneyReturn > 0 ? "Còn phải trả" : "Tiền thừa"}
                    </Col>
                    <Col
                      className="lbl-money"
                      xs={5}
                      style={{
                        textAlign: "right",
                        fontWeight: 500,
                        fontSize: "20px",
                      }}
                    >
                      <span
                        style={{ color: moneyReturn <= 0 ? "blue" : "red" }}
                      >
                        {formatCurrency(Math.abs(moneyReturn))}
                      </span>
                    </Col>
                  </Row>

                  <Row gutter={24} style={{ marginTop: "20px" }}>
                    <Col xs={24}>
                      <div>
                        <Button
                          type="primary"
                          className="ant-btn-outline fixed-button text-right"
                          style={{ float: "right" }}
                          htmlType="submit"
                          onClick={ShowConfirmPayment}
                        >
                          Tạo thanh toán
                        </Button>
                        <Button
                          type="default"
                          className="ant-btn-outline fixed-button text-right"
                          style={{ float: "right", marginRight: "10px" }}
                          // onClick={canclePayment}
                        >
                          Hủy
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}

            {props.paymentMethod === 1 && (
              <Row>
                <i>Vui lòng chọn đóng gói và giao hàng</i>
              </Row>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePaymentCard;
