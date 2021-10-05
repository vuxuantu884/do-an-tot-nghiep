import { Checkbox, Col, Divider, Row, Space, Tag, Typography } from "antd";
import { OrderLineItemRequest } from "model/request/order.request";
import { formatCurrency } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  levelOrder?: number;
  totalAmountOrder: number;
  items: OrderLineItemRequest[] | undefined;
  discountRate: number;
  discountValue: number;
  coupon: string;
  shippingFeeCustomer?: number;
  changeMoney: number;
  amount: number;
  pointUsing?: {
    point: number;
    amount: number;
  } | null;
  showDiscountModal: () => void;
  setDiscountRate: (value: number) => void;
  setDiscountValue: (value: number) => void;
  calculateChangeMoney: (
    _items: Array<OrderLineItemRequest>,
    _amount: number,
    _discountRate: number,
    _discountValue: number
  ) => void;
};

function CardProductBottom(props: PropType) {
  const {
    levelOrder = 0,
    totalAmountOrder,
    items,
    discountRate,
    discountValue,
    coupon,
    changeMoney,
    shippingFeeCustomer,
    amount,
    pointUsing,
    showDiscountModal,
    setDiscountRate,
    setDiscountValue,
    calculateChangeMoney,
  } = props;
  return (
    <StyledComponent>
      <div className="padding-24" style={{ paddingTop: "30px" }}>
        <Row className="sale-product-box-payment" gutter={24}>
          <Col xs={24} lg={11}>
            <div className="payment-row">
              <Checkbox
                className=""
                style={{ fontWeight: 500 }}
                disabled={levelOrder > 3}
              >
                Bỏ chiết khấu tự động
              </Checkbox>
            </div>
            <div className="payment-row">
              <Checkbox
                className=""
                style={{ fontWeight: 500 }}
                disabled={levelOrder > 3}
              >
                Không tính thuế VAT
              </Checkbox>
            </div>
            <div className="payment-row">
              <Checkbox
                className=""
                style={{ fontWeight: 500 }}
                disabled={levelOrder > 3}
              >
                Bỏ tích điểm tự động
              </Checkbox>
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <Row className="payment-row padding-top-10" justify="space-between">
              <div className="font-weight-500">Tiêu điểm:</div>
              <div className="font-weight-500 payment-row-money">
                {pointUsing?.point ? <span>{pointUsing.point} điểm</span> : "-"}
                {pointUsing?.amount && (
                  <span>
                    {" "}
                    &nbsp; {`(${formatCurrency(pointUsing.amount)} đ)`}
                  </span>
                )}
              </div>
            </Row>
            <Row
              className="payment-row"
              style={{ justifyContent: "space-between" }}
            >
              <div className="font-weight-500">Tổng tiền:</div>
              <div className="font-weight-500" style={{ fontWeight: 500 }}>
                {formatCurrency(totalAmountOrder)}
              </div>
            </Row>

            <Row className="payment-row" justify="space-between" align="middle">
              <Space align="center">
                {items && items.length > 0 ? (
                  <Typography.Link
                    className="font-weight-400"
                    onClick={showDiscountModal}
                    style={{
                      textDecoration: "underline",
                      textDecorationColor: "#5D5D8A",
                      color: "#5D5D8A",
                    }}
                  >
                    Chiết khấu:
                  </Typography.Link>
                ) : (
                  <div>Chiết khấu</div>
                )}

                {discountRate !== 0 && items && (
                  <Tag
                    style={{
                      marginTop: 0,
                      color: "#E24343",
                      backgroundColor: "#F5F5F5",
                    }}
                    className="orders-tag orders-tag-danger"
                    closable
                    onClose={() => {
                      setDiscountRate(0);
                      setDiscountValue(0);
                      calculateChangeMoney(items, amount, 0, 0);
                    }}
                  >
                    {discountRate !== 0 ? discountRate : 0}%{" "}
                  </Tag>
                )}
              </Space>
              <div className="font-weight-500 ">
                {discountValue ? formatCurrency(discountValue) : "-"}
              </div>
            </Row>

            <Row className="payment-row" justify="space-between" align="middle">
              <Space align="center">
                {items && items.length > 0 ? (
                  <Typography.Link
                    className="font-weight-400"
                    onClick={showDiscountModal}
                    style={{
                      textDecoration: "underline",
                      textDecorationColor: "#5D5D8A",
                      color: "#5D5D8A",
                    }}
                  >
                    Mã giảm giá:
                  </Typography.Link>
                ) : (
                  <div>Mã giảm giá</div>
                )}

                {coupon !== "" && (
                  <Tag
                    style={{
                      margin: 0,
                      color: "#E24343",
                      backgroundColor: "#F5F5F5",
                    }}
                    className="orders-tag orders-tag-danger"
                    closable
                    onClose={() => {
                      setDiscountRate(0);
                      setDiscountValue(0);
                    }}
                  >
                    {coupon}{" "}
                  </Tag>
                )}
              </Space>
              <div className="font-weight-500 ">-</div>
            </Row>

            <Row className="payment-row padding-top-10" justify="space-between">
              <div className="font-weight-500">Phí ship báo khách:</div>
              <div className="font-weight-500 payment-row-money">
                {shippingFeeCustomer
                  ? formatCurrency(shippingFeeCustomer)
                  : "-"}
              </div>
            </Row>
            <Divider className="margin-top-5 margin-bottom-5" />
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Khách cần phải trả:</strong>
              <strong className="text-success font-size-price">
                {changeMoney
                  ? formatCurrency(
                      changeMoney +
                        (shippingFeeCustomer ? shippingFeeCustomer : 0) -
                        discountValue
                    )
                  : "-"}
              </strong>
            </Row>
          </Col>
        </Row>
      </div>
    </StyledComponent>
  );
}

export default CardProductBottom;
