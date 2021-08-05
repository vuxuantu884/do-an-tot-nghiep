import {
  CheckCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Form, Progress, Row, Timeline } from "antd";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import React, { useCallback, useState } from "react";
import PaymentModal from "screens/purchase-order/modal/payment.modal";
import { formatCurrency } from "utils/AppUtils";
import { PoPaymentStatus } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { StyledComponent } from "./styles";
type POPaymentFormProps = {
  purchaseItem: PurchaseOrder;
};
const POPaymentForm: React.FC<POPaymentFormProps> = (
  props: POPaymentFormProps
) => {
  const [isVisiblePaymentModal, setVisiblePaymentModal] = useState(false);
  const { purchaseItem } = props;
  const CancelPaymentModal = useCallback(() => {
    setVisiblePaymentModal(false);
  }, []);
  const OkPaymentModal = useCallback(() => {}, []);
  const ShowPaymentModal = useCallback(() => {
    setVisiblePaymentModal(true);
  }, []);
  return (
    <StyledComponent>
      <Card
        className="po-form margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THANH TOÁN</span>
          </div>
        }
        extra={
          <Button onClick={ShowPaymentModal}>
            <PlusOutlined style={{ fontSize: "18px" }} />
            Tạo thanh toán
          </Button>
        }
      >
        <div className="padding-20">
          <div className="card__section shortInformation">
            <Row gutter={24} className="margin-bottom-40">
              <Col md={12}>
                {/* <Form.Item label="Điều khoản thanh toán"> Sau 15 ngày</Form.Item> */}
                <div className="shortInformation__column">
                  <span className="text-field margin-right-10">
                    Điều khoản thanh toán:
                  </span>
                  <span>
                    {" "}
                    <strong className="po-payment-row-title">
                      {purchaseItem.payment_condition_name}
                    </strong>
                  </span>
                </div>
              </Col>
              <Col md={12}>
                <div className="shortInformation__column">
                  <span className="text-field margin-right-10">Diễn giải:</span>
                  <span> {purchaseItem.payment_note}</span>
                </div>
              </Col>
            </Row>
          </div>
          <div className="card__section checkOut">
            <Row gutter={24}>
              <Col md={14}>
                {/* <Form.Item label="Điều khoản thanh toán"> Sau 15 ngày</Form.Item> */}
                <div className="checkOut__column checkOut__progress">
                  <div className="checkOut__progress-bar">
                    <Progress
                      type="line"
                      percent={Math.round(
                        (purchaseItem.total_paid / purchaseItem.total) * 100
                      )}
                      showInfo={false}
                      strokeWidth={21}
                      strokeColor="#5D5D8A"
                      trailColor="#ECEFFA"
                    />
                    <div className="checkOut__progress-bar__value">
                      <span>
                        {" "}
                        Thanh toán :{" "}
                        {Math.round(
                          (purchaseItem.total_paid / purchaseItem.total) * 100
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="checkOut__progress-text">
                    <CheckCircleOutlined
                      style={{ fontSize: "16px", color: "#27AE60" }}
                    />
                    Đã thanh toán:{" "}
                    <strong> {formatCurrency(purchaseItem.total_paid)}</strong>
                  </div>
                </div>
              </Col>
              <Col md={10}>
                <div className="checkOut__column">
                  <MinusCircleOutlined
                    style={{ fontSize: "16px", color: "#E24343" }}
                  />
                  Còn phải trả:{" "}
                  <strong style={{ color: "#E24343" }}>
                    {" "}
                    {formatCurrency(
                      purchaseItem.total - purchaseItem.total_paid
                    )}
                  </strong>
                </div>
              </Col>
            </Row>
          </div>
          <div className="card__section timeline">
            <Row gutter={24}>
              <Col md={24}>
                <Timeline>
                  {purchaseItem.payments.map((item) => (
                    <Timeline.Item
                      className={
                        item.status === PoPaymentStatus.CONFIRMED
                          ? "timeline__isFinished"
                          : ""
                      }
                    >
                      <Row gutter={24}>
                        <Col md={8}>
                          <div className="timeline__colTitle">
                            <h3 className="po-payment-row-title">Tiền mặt</h3>
                            <div>
                              Yêu cầu thanh toán: <br />
                              <strong>
                                {ConvertUtcToLocalDate(item.transaction_date)}{" "}
                              </strong>{" "}
                            </div>
                          </div>
                        </Col>
                        <Col md={8}>
                          {" "}
                          <strong className="po-payment-row-title">
                            {formatCurrency(item.amount)}
                          </strong>
                        </Col>
                        {item.status === PoPaymentStatus.CONFIRMED ? (
                          <Col md={8}>
                            <div className="timeline__status">
                              <CheckCircleOutlined
                                style={{ fontSize: "18px" }}
                              />{" "}
                              Đã duyệt
                            </div>
                            <div>
                              Duyệt thanh toán <br />
                              <strong>
                                {ConvertUtcToLocalDate(item.updated_date)}
                              </strong>
                            </div>
                          </Col>
                        ) : (
                          <Col md={8}>
                            <div className="timeline__groupButtons">
                              <Button>
                                <CheckCircleOutlined
                                  style={{ fontSize: "18px" }}
                                />{" "}
                                Sửa
                              </Button>
                              <Button>
                                <CheckCircleOutlined
                                  style={{ fontSize: "18px" }}
                                />{" "}
                                Duyệt
                              </Button>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Col>
            </Row>
          </div>
        </div>
        <div className="card__footer">
          <Button>Kết thúc thanh toán</Button>
        </div>
      </Card>
      <PaymentModal
        visible={isVisiblePaymentModal}
        onOk={OkPaymentModal}
        onCancel={CancelPaymentModal}
      />
    </StyledComponent>
  );
};

export default POPaymentForm;
