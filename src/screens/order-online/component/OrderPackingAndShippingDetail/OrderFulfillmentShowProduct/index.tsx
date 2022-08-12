import { Badge, Col, Collapse, Row, Typography } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import React from "react";
import { PRODUCT_TYPE } from "utils/Constants";
import { getQuantityWithTwoCharacter } from "utils/OrderUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  orderDetail?: OrderResponse | null;
};

function OrderFulfillmentShowProduct(props: PropTypes) {
  const { orderDetail } = props;

  return (
    <StyledComponent>
      <Row className="orders-shipment-item">
        <Collapse ghost>
          <Collapse.Panel
            header={
              <Row>
                <Col>
                  <b className="panelHeader">
                    {orderDetail?.items.reduce((a: any, b: any) => a + b.quantity, 0)} SẢN PHẨM
                  </b>
                </Col>
              </Row>
            }
            key="1"
          >
            {orderDetail?.items.map((item, index) => (
              <div className="orders-shipment-item-view" key={index}>
                <div className="orders-shipment-item-view-wrap">
                  <div className="orders-shipment-item-name">
                    <div>
                      <Typography.Link className="sku">{item.sku}</Typography.Link>
                    </div>
                    <Badge status="default" text={item.variant} />
                  </div>
                  <div className="shipmentItemRight">
                    {item.type === PRODUCT_TYPE.gift ? <span>Quà tặng</span> : <div></div>}
                    <span className="quantity">{getQuantityWithTwoCharacter(item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </Collapse.Panel>
        </Collapse>
      </Row>
    </StyledComponent>
  );
}

export default OrderFulfillmentShowProduct;
