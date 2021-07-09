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
import {
  PaymentMethodGetList,
  UpdatePaymentAction,
} from "domain/actions/order/order.action";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { OrderStatus, PaymentMethodCode } from "utils/Constants";
import deleteIcon from "assets/icon/delete.svg";
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
import { useHistory } from "react-router-dom";
import ConfirmPaymentModal from "./modal/ConfirmPaymentModal";
import OrderDetail from "./order-detail";

type PaymentCardUpdateProps = {
  setSelectedPaymentMethod: (paymentType: number) => void;
  setPayments: (value: Array<UpdateOrderPaymentRequest>) => void;
  orderDetail: OrderResponse;
  paymentMethod: number;
  amount: number;
  order_id: number | null;
};

const UpdatePaymentCard: React.FC<PaymentCardUpdateProps> = (
  props: PaymentCardUpdateProps
) => {
  const history = useHistory();
  const changePaymentMethod = (value: number) => {
    props.setSelectedPaymentMethod(value);
    if (value === 2) {
      handlePickPaymentMethod("cash");
    }
  };

  const dispatch = useDispatch();
  const [isibleConfirmPayment, setVisibleConfirmPayment] = useState(false);
  const [textValue, settextValue] = useState<string>("")
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

  const onUpdateSuccess = useCallback(
    (value: OrderResponse) => {
      showSuccess("Thanh toán thành công");
      window.location.reload();
    },
    [history]
  );

  const ShowConfirmPayment = () => {
    if (props.orderDetail.status === OrderStatus.FINALIZED) {
      settextValue("Bạn không thay đổi được thông tin thanh toán của đơn sau khi xác nhận?");
    }
    else{
      if (props.orderDetail.status === OrderStatus.DRAFT) {
        settextValue("Đơn hàng sẽ được duyệt khi xác nhận thanh toán. Bạn không thay đổi được thông tin thanh toán của đơn sau khi xác nhận?");
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

  const onCancleConfirm = useCallback(() => {
    setVisibleConfirmPayment(false);
  }, []);

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
      {isVisibleUpdatePayment === true && (
        <div className="padding-20">
          <i>Lựa chọn một hoặc nhiều phương thức thanh toán</i> <br />
          <Radio.Group
            value={props.paymentMethod}
            onChange={(e) => changePaymentMethod(e.target.value)}
            style={{ margin: "20px 0 20px 0" }}
          >
            <Space size={24}>
              <Radio value={1}>COD</Radio>
              <Radio value={2}>Thanh toán trước</Radio>
              <Radio value={3}>Thanh toán sau</Radio>
            </Space>
          </Radio.Group>
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

            <Col span={24}>
              <Row
                gutter={12}
                className="row-price"
                style={{ padding: "5px 0px" }}
              >
                <Col xs={6} className="row-large-title">
                  Khách cần trả
                </Col>
                <Col
                  className="lbl-money"
                  xs={6}
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
                    gutter={6}
                    className="row-price"
                    style={{ padding: "5px 0" }}
                    key={index}
                  >
                    <Col xs={6}>
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
                    <Col className="lbl-money" xs={6}>
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
                gutter={12}
                className="row-price total-customer-pay"
                style={{ marginLeft: 0, marginRight: 0 }}
              >
                <Col
                  xs={6}
                  className="row-large-title"
                  style={{ paddingLeft: 0 }}
                >
                  Tổng số tiền khách trả
                </Col>
                <Col
                  className="lbl-money"
                  xs={6}
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
                <Col xs={6} className="row-large-title">
                  {moneyReturn > 0 ? "Tiền thiếu" : "Tiền thừa"}
                </Col>
                <Col
                  className="lbl-money"
                  xs={6}
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
                      style={{ float: "right" }}
                    >
                      Hủy thanh toán
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

      <ConfirmPaymentModal
        onCancel={onCancleConfirm}
        onOk={onOkConfirm}
        visible={isibleConfirmPayment}
        order_id={props.order_id}
        text={textValue}
      />
    </Card>
  );
};

export default UpdatePaymentCard;
