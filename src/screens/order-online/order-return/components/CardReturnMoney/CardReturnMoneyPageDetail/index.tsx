import { Button, Card, Col, Row, Tag, Timeline } from "antd";
import { OrderPaymentResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React from "react";
import { formatCurrency } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import ReturnMoneySelect from "../ReturnMoneySelect";
import { StyledComponent } from "./styles";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  payments: OrderPaymentResponse[];
  totalAmountReturnToCustomer: number | undefined;
  isShowPaymentMethod: boolean;
  handleReturnMoney: () => void;
  setIsShowPaymentMethod: (value: boolean) => void;
};

function CardReturnMoneyPageDetail(props: PropType) {
  const {
    payments,
    totalAmountReturnToCustomer = 0,
    listPaymentMethods,
    isShowPaymentMethod,
    handleReturnMoney,
    setIsShowPaymentMethod,
  } = props;

  console.log("totalAmountReturnToCustomer", totalAmountReturnToCustomer);

  const renderCardTitle = () => {
    return (
      <React.Fragment>
        <span className="title-card">
          Hoàn tiền
          {payments && payments.length > 0 && (
            <Tag
              className="orders-tag orders-tag-success"
              style={{
                backgroundColor: "rgba(39, 174, 96, 0.1)",
                color: "#27AE60",
              }}
            >
              Đã thanh toán
            </Tag>
          )}
        </span>
      </React.Fragment>
    );
  };

  const renderPayments = () => {
    if (payments && payments.length) {
      return (
        <Timeline>
          {payments.map((single, index) => {
            return (
              <Timeline.Item key={index} color="#27AE60">
                <Row gutter={24}>
                  <Col md={8}>
                    <div className="timeline__colTitle">
                      <h3>{single.payment_method}</h3>
                    </div>
                  </Col>
                  <Col md={8} style={{ textAlign: "center" }}>
                    <strong className="po-payment-row-title">
                      {formatCurrency(single.amount)}
                    </strong>
                  </Col>
                  <Col md={8} style={{ textAlign: "right" }}>
                    <span>{ConvertUtcToLocalDate(single.created_date)}</span>
                  </Col>
                </Row>
              </Timeline.Item>
            );
          })}
        </Timeline>
      );
    } else {
      if (!isShowPaymentMethod) {
        return (
          <React.Fragment>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
              }}
            >
              Cần hoàn trả khách: {formatCurrency(totalAmountReturnToCustomer)} đ
              <Button
                onClick={() => {
                  console.log("333");
                  setIsShowPaymentMethod(true);
                }}
              >
                Hoàn tiền
              </Button>
            </div>
          </React.Fragment>
        );
      }
    }
  };

  return (
    <StyledComponent>
      <Card title={renderCardTitle()}>
        {renderPayments()}
        {isShowPaymentMethod && (
          <ReturnMoneySelect
            listPaymentMethods={listPaymentMethods}
            totalAmountCustomerNeedToPay={-totalAmountReturnToCustomer}
            handleReturnMoney={() => {
              handleReturnMoney();
            }}
            isShowButtonReturnMoney={true}
          />
        )}
      </Card>
    </StyledComponent>
  );
}

export default CardReturnMoneyPageDetail;
