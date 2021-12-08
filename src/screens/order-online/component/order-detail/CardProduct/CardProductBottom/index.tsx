import { Col, Divider, Row, Space, Tag, Typography } from "antd";
import { OrderCreateContext } from "contexts/order-online/order-create-context";
import { OrderLineItemRequest } from "model/request/order.request";
import { useContext } from "react";
import { formatCurrency } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  levelOrder?: number;
  totalAmountOrder: number;
  items: OrderLineItemRequest[] | undefined;
  discountRate: number;
  discountValue: number;
  coupon: string;
  shippingFeeInformedToCustomer?: number | null;
  changeMoney: number;
  amount: number;
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
    // levelOrder = 0,
    totalAmountOrder,
    items,
    discountRate,
    discountValue,
    coupon,
    // changeMoney,
    amount,
    showDiscountModal,
    setDiscountRate,
    setDiscountValue,
    calculateChangeMoney,
  } = props;

  const createOrderContext = useContext(OrderCreateContext);
  const shippingFeeInformedToCustomer =
    createOrderContext?.price.shippingFeeInformedToCustomer ||
    props.shippingFeeInformedToCustomer ||
    0;
  const totalAmount =
    (amount ? amount : 0) +
    (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
    (discountValue ? discountValue : 0);
  const totalOrderAmountAfterDiscountAddShippingFee =
    createOrderContext?.price.totalOrderAmountAfterDiscountAddShippingFee ||
    (totalAmount ? totalAmount : 0);

  return (
    <StyledComponent>
      <Row gutter={24}>
        <Col xs={24} lg={11}>
          <div className="optionRow">
            {/* <Checkbox className="" style={{ fontWeight: 500 }} disabled={levelOrder > 3}>
              Bỏ chiết khấu tự động
            </Checkbox> */}
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <Row className="paymentRow" style={{ justifyContent: "space-between" }}>
            <div>Tổng tiền:</div>
            <div className="font-weight-500" style={{ fontWeight: 500 }}>
              {formatCurrency(totalAmountOrder)}
            </div>
          </Row>

          <Row className="paymentRow" justify="space-between" align="middle">
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
                  {discountRate !== 0 ? Math.round(discountRate*100)/100 : 0}%{" "}
                </Tag>
              )}
            </Space>
            <div className="font-weight-500 ">
              {discountValue ? formatCurrency(discountValue) : "-"}
            </div>
          </Row>

          <Row className="paymentRow" justify="space-between" align="middle">
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
                    items?.forEach(item => item.discount_items = [{
                      rate: 0,
                      value: 0,
                      amount: 0,
                      reason: '',
                    }])
                  }}
                >
                  {coupon}{" "}
                </Tag>
              )}
            </Space>
            <div className="font-weight-500 ">-</div>
          </Row>

          <Row className="paymentRow" justify="space-between">
            <div>Phí ship báo khách:</div>
            <div className="font-weight-500 paymentRow-money">
              {shippingFeeInformedToCustomer
                ? formatCurrency(shippingFeeInformedToCustomer)
                : "-"}
            </div>
          </Row>
          <Divider className="margin-top-5 margin-bottom-5" />
          <Row className="paymentRow" justify="space-between">
            <strong className="font-size-text">Khách cần phải trả:</strong>
            <strong className="text-success font-size-price">
              {formatCurrency(totalOrderAmountAfterDiscountAddShippingFee)}
            </strong>
          </Row>
        </Col>
      </Row>
    </StyledComponent>
  );
}

export default CardProductBottom;
