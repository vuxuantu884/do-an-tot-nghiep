// @ts-ignore
import { Button, Card, Row, Col, Radio, InputNumber, Space, Input } from "antd";

import { BugOutlined } from "@ant-design/icons";

import WarningIcon from "assets/icon/ydWarningIcon.svg";
import Cash from "component/icon/Cash";
import YdCoin from "component/icon/YdCoin";
import Calculate from "assets/icon/caculate.svg";
import CreditCardOutlined from "component/icon/CreditCardOutlined";
import QrcodeOutlined from "component/icon/QrcodeOutlined";
// @ts-ignore
import {
  PaymentMethodGetList,
  UpdatePaymentAction,
} from "domain/actions/order/order.action";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  PointConfig,
  ShipmentMethodOption,
} from "utils/Constants";
import { formatCurrency, formatSuffixPoint, replaceFormat } from "utils/AppUtils";
import {
  UpdateFulFillmentRequest,
  UpdateOrderPaymentRequest,
  UpdatePaymentRequest,
} from "model/request/order.request";
import { showSuccess } from "utils/ToastUtils";
import { OrderResponse } from "model/response/order/order.response";
import SaveAndConfirmOrder from "../modal/save-confirm.modal";
import { OrderDetailContext } from "contexts/order-online/order-detail-context";
import { StyledComponent } from "./update-payment-card.styles";

type PaymentCardUpdateProps = {
  setSelectedPaymentMethod: (paymentType: number) => void;
  setVisibleUpdatePayment: (value: boolean) => void;
  setPayments: (value: Array<UpdateOrderPaymentRequest>) => void;
  setTotalPaid: (value: number) => void;
  reload?: () => void;
  disabledActions?: (type: string) => void;
  orderDetail: OrderResponse;
  paymentMethod: number;
  shipmentMethod: number;
  order_id: number | null;
  showPartialPayment?: boolean;
  isVisibleUpdatePayment: boolean;
  amount: any;
  disabled?: boolean;
};

const UpdatePaymentCard: React.FC<PaymentCardUpdateProps> = (
  props: PaymentCardUpdateProps
) => {
  const { disabledActions } = props;
  const dispatch = useDispatch();
  const [visibleConfirmPayment, setVisibleConfirmPayment] = useState(false);
  const [textValue, settextValue] = useState<string>("");
  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);
  const [paymentData, setPaymentData] = useState<Array<UpdateOrderPaymentRequest>>([]);

  const orderDetailContextData = useContext(OrderDetailContext);
  const setPayments = orderDetailContextData.payment.setPayments;

  const changePaymentMethod = (value: number) => {
    props.setSelectedPaymentMethod(value);
    if (value === PaymentMethodOption.PREPAYMENT) {
      handlePickPaymentMethod(PaymentMethodCode.CASH);
    }
    if (value === PaymentMethodOption.COD) {
    }
  };

  const handleTransferReference = (index: number, value: string) => {
    const _paymentData = [...paymentData];
    _paymentData[index].reference = value;
    setPaymentData(_paymentData);
  };

  const ShowPayment = () => {
    props.setVisibleUpdatePayment(true);
  };

  const ListMaymentMethods = useMemo(() => {
    return listPaymentMethod.filter((item) => item.code !== PaymentMethodCode.CARD);
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

  const onUpdateSuccess = useCallback(
    (value: OrderResponse) => {
      showSuccess("Thanh toán thành công");
      setCreatePayment(false);
      console.log("onUpdateSuccess payment");
      // window.location.reload();
      setVisibleConfirmPayment(false);
      setPaymentData([]);
      props.reload && props.reload();
    },
    [props]
  );

  const onError = (error: boolean) => {
    if (error) {
      setVisibleConfirmPayment(false);
      setCreatePayment(false);
    }
  };

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
  const [createPayment, setCreatePayment] = useState(false);

  const onOkConfirm = () => {
    let fulfillment = CreateFulFillmentRequest();
    let request: UpdatePaymentRequest = {
      payments: paymentData.filter((payment) => payment.amount > 0),
      fulfillments: fulfillment,
    };
    (async () => {
      setCreatePayment(true);
      try {
        await dispatch(
          UpdatePaymentAction(request, props.order_id, onUpdateSuccess, onError)
        );
      } catch {}
    })();
    // dispatch(UpdatePaymentAction(request, props.order_id, onUpdateSuccess));
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

  const onCancleConfirm = useCallback(() => {
    setVisibleConfirmPayment(false);
  }, []);

  const canclePayment = () => {
    props.setVisibleUpdatePayment(false);
  };

  useEffect(() => {
    if (createPayment) {
      console.log("createPayment createPayment payment");

      disabledActions && disabledActions("payment");
    } else {
      console.log("createPayment createPayment none");
      disabledActions && disabledActions("none");
    }
  }, [createPayment, disabledActions]);

  useEffect(() => {
    dispatch(PaymentMethodGetList(setListPaymentMethod));
  }, [dispatch]);
  useEffect(() => {
    props.setTotalPaid(totalAmountPaid);
  }, [props, totalAmountPaid]);
  return (
    <StyledComponent>
      <SaveAndConfirmOrder
        onCancel={onCancleConfirm}
        onOk={onOkConfirm}
        visible={visibleConfirmPayment}
        updateShipment={createPayment}
        icon={WarningIcon}
        okText="Đồng ý"
        cancelText="Hủy"
        title="Bạn muốn xác nhận thanh toán cho đơn hàng này?"
        text={textValue}
      />
      {props.showPartialPayment === false && (
        <Card
          className="margin-top-20 orders-update-payment"
          title={
            <div className="d-flex" style={{ marginTop: "5px", border: "none" }}>
              <span className="title-card">THANH TOÁN</span>
            </div>
          }
        >
          {props.isVisibleUpdatePayment === true && (
            <div className="create-order-payment">
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Radio.Group
                  value={props.paymentMethod}
                  onChange={(e) => changePaymentMethod(e.target.value)}
                  style={{ margin: "18px 0" }}
                  disabled={props.disabled}
                >
                  <Space size={20}>
                    <Radio value={PaymentMethodOption.COD}>COD</Radio>
                    <Radio value={PaymentMethodOption.PREPAYMENT}>Thanh toán trước</Radio>
                    <Radio value={PaymentMethodOption.POSTPAYMENT}>Thanh toán sau</Radio>
                  </Space>
                </Radio.Group>
                {props.paymentMethod === PaymentMethodOption.COD &&
                  props.shipmentMethod === ShipmentMethodOption.SELF_DELIVER && (
                    <div className="order-cod-payment-footer">
                      <span>
                        Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span> để có
                        thể nhập giá trị Tiền thu hộ
                      </span>
                    </div>
                  )}
                {props.paymentMethod === PaymentMethodOption.COD &&
                  props.shipmentMethod === ShipmentMethodOption.DELIVER_LATER && (
                    <div className="order-cod-payment-footer">
                      <span>
                        Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span> để có
                        thể nhập giá trị Tiền thu hộ
                      </span>
                    </div>
                  )}
                {props.paymentMethod === PaymentMethodOption.COD &&
                  props.shipmentMethod === ShipmentMethodOption.PICK_AT_STORE && (
                    <div className="order-cod-payment-footer" style={{ height: 83 }}>
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
              </div>

              <Row
                gutter={24}
                // hidden={props.paymentMethod !== 2}
              >
                {/* <Col xs={24} lg={24}>
                  <div className="form-group form-group-with-search">
                    <i>Lựa chọn 1 hoặc nhiều phương thức thanh toán trước *</i>
                  </div>
                </Col> */}
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
                          icon = <Cash paymentData={paymentData} method={method} />;
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
                            style={{ padding: 10, display: "flex" }}
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
                <Col span={24} xs={24}>
                  <Row
                    gutter={14}
                    className="row-price"
                    style={{ height: 38, margin: "10px 0" }}
                  >
                    <Col
                      lg={10}
                      xxl={7}
                      className="row-large-title"
                      style={{ padding: "8px 0" }}
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
                        <Col lg={13} xxl={9} style={{ padding: "0" }}>
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
                                    width: 140,
                                    marginLeft: 12,
                                    borderRadius: 5,
                                  }}
                                  className="hide-number-handle"
                                  onFocus={(e) => e.target.select()}
                                  formatter={(value) =>
                                    formatSuffixPoint(value ? value : "0")
                                  }
                                  parser={(value) => replaceFormat(value ? value : "0")}
                                  min={0}
                                  max={caculateMax(props.amount, index) / 1000}
                                  onChange={(value) => {
                                    handleInputPoint(index, value);
                                  }}
                                />
                              </Col>
                            ) : null}

                            {method.code === PaymentMethodCode.BANK_TRANSFER ? (
                              <Col
                                className="point-spending"
                                style={{ marginLeft: 6 }}
                                lg={14}
                                xxl={13}
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
                            xxl={4}
                            style={{ marginLeft: 10 }}
                          >
                            <InputNumber
                              size="middle"
                              min={0}
                              max={caculateMax(props.amount, index)}
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
                              onChange={(value) => handleInputMoney(index, value)}
                              onFocus={(e) => e.target.select()}
                            />
                          </Col>
                        ) : (
                          <Col
                            className="lbl-money"
                            lg={6}
                            xxl={4}
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

                  {/* <Row
                    gutter={20}
                    className="row-price total-customer-pay"
                    style={{ height: 38, margin: "10px 0" }}
                  >
                    <Col
                      lg={10}
                      xxl={7}
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
                    <Col lg={10} xxl={7} style={{ padding: "8px 0" }}>
                      <b>{true ? "Còn phải trả:" : "Tiền thừa:"}</b>
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
                      <span style={{ color: false ? "blue" : "red" }}>
                        {formatCurrency(Math.abs(moneyReturn))}
                      </span>
                    </Col>
                  </Row>

                  <Row gutter={24} style={{ marginTop: "20px" }}>
                    <Col xs={24} lg={24}>
                      <div>
                        <Button
                          type="primary"
                          className="ant-btn-outline fixed-button text-right"
                          style={{ float: "right", padding: "0 25px" }}
                          htmlType="submit"
                          onClick={ShowConfirmPayment}
                          loading={createPayment}
                        >
                          Tạo thanh toán
                        </Button>
                        <Button
                          type="default"
                          className="ant-btn-outline fixed-button text-right"
                          style={{
                            float: "right",
                            marginRight: "10px",
                            padding: "0 25px",
                          }}
                          onClick={canclePayment}
                          disabled={createPayment}
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

          {props.isVisibleUpdatePayment === false && (
            <div className="padding-lef-right" style={{ paddingTop: "20px" }}>
              <label
                className="text-left"
                style={{ marginTop: "20px", lineHeight: "40px" }}
              ></label>
              <Button
                type="primary"
                className="ant-btn-outline fixed-button text-right"
                style={{ float: "right", padding: "0 25px", marginBottom: 25 }}
                onClick={ShowPayment}
              >
                Thanh toán
              </Button>
            </div>
          )}
        </Card>
      )}

      {props.showPartialPayment && (
        <div className="create-order-payment">
          {/* <div style={{ display: "flex", flexDirection: "column" }}>
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
              </Space>
            </Radio.Group>
            {props.paymentMethod === PaymentMethodOption.COD &&
              props.shipmentMethod === ShipmentMethodOption.SELFDELIVER && (
                <div className="order-cod-payment-footer">
                  <span>
                    Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span>{" "}
                    để có thể nhập giá trị Tiền thu hộ
                  </span>
                </div>
              )}
            {props.paymentMethod === PaymentMethodOption.COD &&
              props.shipmentMethod === ShipmentMethodOption.DELIVERLATER && (
                <div className="order-cod-payment-footer">
                  <span>
                    Vui lòng chọn hình thức <span>Đóng gói và Giao hàng</span>{" "}
                    để có thể nhập giá trị Tiền thu hộ
                  </span>
                </div>
              )}
            {props.paymentMethod === PaymentMethodOption.COD &&
              props.shipmentMethod === ShipmentMethodOption.PICKATSTORE && (
                <div
                  className="order-cod-payment-footer"
                  style={{ height: 83 }}
                >
                  <div>
                    <div>
                      <div>
                        <img src={Calculate}></img>
                      </div>
                    </div>
                  </div>
                  <span>
                    <span>Khách hàng sẽ thanh toán tại quầy!</span>
                  </span>
                </div>
              )}
          </div> */}

          <Row
            gutter={24}
            // hidden={props.paymentMethod === 2}
          >
            {/* <Col xs={24} lg={24}>
              <div className="form-group form-group-with-search">
                <i>Lựa chọn 1 hoặc nhiều phương thức thanh toán trước *</i>
              </div>
            </Col> */}
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
                      icon = <Cash paymentData={paymentData} method={method} />;
                      break;
                    case PaymentMethodCode.CARD:
                    case PaymentMethodCode.BANK_TRANSFER:
                      icon = (
                        <CreditCardOutlined paymentData={paymentData} method={method} />
                      );
                      break;
                    case PaymentMethodCode.QR_CODE:
                      icon = <QrcodeOutlined paymentData={paymentData} method={method} />;
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
                        style={{ padding: 10, display: "flex" }}
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
            <Col span={24} xs={24}>
              <Row
                gutter={14}
                className="row-price"
                style={{ height: 38, margin: "10px 0" }}
              >
                <Col
                  lg={10}
                  xxl={7}
                  className="row-large-title"
                  style={{ padding: "8px 0" }}
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
                  <span className="t-result-blue">{formatCurrency(props.amount)}</span>
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
                    <Col lg={13} xxl={9} style={{ padding: "0" }}>
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
                                width: 140,
                                marginLeft: 12,
                                borderRadius: 5,
                              }}
                              className="hide-number-handle"
                              onFocus={(e) => e.target.select()}
                              formatter={(value) =>
                                formatSuffixPoint(value ? value : "0")
                              }
                              parser={(value) => replaceFormat(value ? value : "0")}
                              min={0}
                              max={caculateMax(props.amount, index) / 1000}
                              onChange={(value) => {
                                handleInputPoint(index, value);
                              }}
                            />
                          </Col>
                        ) : null}

                        {method.code === PaymentMethodCode.BANK_TRANSFER ? (
                          <Col
                            className="point-spending"
                            style={{ marginLeft: 6 }}
                            lg={14}
                            xxl={13}
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
                        xxl={4}
                        style={{ marginLeft: 10 }}
                      >
                        <InputNumber
                          size="middle"
                          min={0}
                          max={caculateMax(props.amount, index)}
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
                          onChange={(value) => handleInputMoney(index, value)}
                          onFocus={(e) => e.target.select()}
                        />
                      </Col>
                    ) : (
                      <Col
                        className="lbl-money"
                        lg={6}
                        xxl={4}
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
              <Row
                gutter={20}
                className="row-price"
                style={{ height: 38, margin: "10px 0 0 0" }}
              >
                <Col lg={10} xxl={7} style={{ padding: "8px 0" }}>
                  <b>{true ? "Còn phải trả:" : "Tiền thừa:"}</b>
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
                  <span style={{ color: false ? "blue" : "red" }}>
                    {formatCurrency(Math.abs(moneyReturn))}
                  </span>
                </Col>
              </Row>

              <Row gutter={24} style={{ marginTop: "20px" }}>
                <Col xs={24} lg={24}>
                  <div>
                    <Button
                      type="primary"
                      className="ant-btn-outline fixed-button text-right"
                      style={{ float: "right", padding: "0 25px" }}
                      htmlType="submit"
                      onClick={ShowConfirmPayment}
                      loading={createPayment}
                    >
                      Tạo thanh toán
                    </Button>

                    <Button
                      type="default"
                      className="ant-btn-outline fixed-button text-right"
                      style={{
                        float: "right",
                        marginRight: "10px",
                        padding: "0 25px",
                      }}
                      onClick={() => props.reload && props.reload()}
                      disabled={createPayment}
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
    </StyledComponent>
  );
};

export default UpdatePaymentCard;
