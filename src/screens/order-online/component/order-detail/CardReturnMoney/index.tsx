import { Button, Card, Col, Row, Tag, Timeline } from "antd";
import { OrderPaymentResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React from "react";
import ReturnMoneySelect from "screens/order-online/order-return/components/CardReturnMoney/ReturnMoneySelect";
import { formatCurrency } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { StyledComponent } from "./styles";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  payments: OrderPaymentResponse[];
  returnMoneyAmount: number;
  isShowPaymentMethod: boolean;
  handleReturnMoney: () => void;
  setIsShowPaymentMethod: (value: boolean) => void;
};

function CardReturnMoney(props: PropType) {
  const {
    payments,
    returnMoneyAmount,
    listPaymentMethods,
    isShowPaymentMethod,
    handleReturnMoney,
    setIsShowPaymentMethod,
  } = props;

  const renderCardTitle = () => {
    return (
      <React.Fragment>
        <span className="title-card">
          Hoàn tiền {" "}
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
                    <div className="timeline__colTitle 222">
                      <h3>{single.paid_amount < 0 ? "Hoàn tiền cho khách" : single.payment_method}</h3>
                    </div>
                  </Col>
                  <Col md={8} style={{ textAlign: "center" }}>
                    <strong className="po-payment-row-title">
                      {formatCurrency(Math.abs(single.paid_amount))}
                    </strong>
                  </Col>
                  <Col md={8} style={{ textAlign: "right" }}>
                    <span>{ConvertUtcToLocalDate(single.created_date, DATE_FORMAT.fullDate)}</span>
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
              Cần hoàn trả khách: {formatCurrency(returnMoneyAmount)} đ
              <Button
                onClick={() => {
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
      <Card className="margin-top-20" title={renderCardTitle()}>
        <div>
          {renderPayments()}
          {isShowPaymentMethod && (
            <ReturnMoneySelect
              listPaymentMethods={listPaymentMethods}
              totalAmountCustomerNeedToPay={returnMoneyAmount}
              handleReturnMoney={() => {
                handleReturnMoney();
              }}
              isShowButtonReturnMoney={true}
            />
          )}
        </div>
      </Card>
    </StyledComponent>
  );
}

export default CardReturnMoney;
